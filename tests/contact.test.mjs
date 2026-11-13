import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Compile the actual TypeScript modules, replacing only external services.
function loadModules(mocks = {}) {
  const cache = new Map();
  function load(id) {
    if (id in mocks) return mocks[id];
    if (!id.startsWith('@/')) return require(id);
    if (cache.has(id)) return cache.get(id).exports;
    const filename = path.join(__dirname, '..', `${id.slice(2)}.ts`);
    const loadedModule = { exports: {} };
    cache.set(id, loadedModule);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    new Function('require', 'module', 'exports', code)(load, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return load;
}
const load = loadModules();
const { EMPTY_DRAFT, validateInquiry, inquiryPayload, DURATION_OPTIONS, SCREENING_OPTIONS } = load('@/lib/inquiry');
const virtual = { ...EMPTY_DRAFT, name: 'Test Visitor', email: 'test@example.com', phone: '(301) 555-0142', experience: 'virtual', length: '30 minutes', virtualFormat: 'Video Call', date: '2099-12-12', preferredTime: '17:00' };
const inPerson = { ...virtual, experience: 'in-person', length: '90 minutes', cityState: 'New York, NY', screeningMethod: 'government-id', preferredTime: '5:00 PM – 7:00 PM' };

test('virtual validates without screening and filters hidden in-person fields', () => {
  assert.deepEqual(validateInquiry(virtual), {});
  const payload = inquiryPayload({ ...virtual, screeningMethod: 'website', screeningValue: 'private', cityState: 'hidden' });
  for (const key of ['screeningMethod', 'screeningValue', 'cityState']) assert.equal(key in payload, false);
});

test('all seven exact in-person durations and all screening methods validate independently', () => {
  assert.deepEqual(DURATION_OPTIONS, ['1 hour', '90 minutes', '2 hours', '3 hours', '4 hours', '6 hours', '14 hours']);
  for (const length of DURATION_OPTIONS) assert.deepEqual(validateInquiry({ ...inPerson, length }), {});
  for (const { value } of SCREENING_OPTIONS) {
    const screeningValue = value === 'professional-email' ? 'name@company.com' : 'https://example.com/profile';
    const draft = { ...inPerson, screeningMethod: value, screeningValue };
    assert.deepEqual(validateInquiry(draft), {});
    if (value !== 'government-id') assert.ok(validateInquiry({ ...draft, screeningValue: '' }).screeningValue);
  }
  assert.equal('virtualFormat' in inquiryPayload(inPerson), false);
  assert.equal('screeningValue' in inquiryPayload({ ...inPerson, screeningValue: 'stale' }), false);
});

test('rejects missing choices, wrong durations, past/impossible dates, and invalid active fields', () => {
  assert.ok(validateInquiry({ ...virtual, experience: '' }).experience);
  assert.ok(validateInquiry({ ...virtual, length: '1 hour' }).length);
  assert.ok(validateInquiry({ ...inPerson, length: 'Inquire' }).length);
  assert.ok(validateInquiry({ ...virtual, virtualFormat: '' }).virtualFormat);
  assert.ok(validateInquiry({ ...virtual, preferredTime: '25:00' }).preferredTime);
  assert.ok(validateInquiry({ ...inPerson, screeningMethod: '' }).screeningMethod);
  assert.ok(validateInquiry({ ...inPerson, cityState: '' }).cityState);
  for (const date of ['', '2000-01-01', '2099-02-30']) assert.ok(validateInquiry({ ...virtual, date }).date);
  assert.deepEqual(validateInquiry({ ...virtual, date: '2099-12-12' }, '2099-12-12'), {});
});

function api({ fail = false, lead = false } = {}) {
  const records = [], messages = [], operations = [];
  const query = {
    update(record) { records.push(record); operations.push('update'); return this; },
    eq() { return this; }, select() { return this; },
    async maybeSingle() { return { data: lead ? { id: 'lead-id' } : null, error: null }; },
    async insert(record) { records.push(record); operations.push('insert'); return { error: fail ? new Error('unavailable') : null }; },
  };
  const route = loadModules({
    'node:dns': { promises: { resolveMx: async () => [{ exchange: 'mail.example.com' }] } },
    '@/lib/supabase': { getServiceClient: () => ({ from: () => query }) },
    resend: { Resend: class { emails = { send: async message => { messages.push(message); return { data: { id: 'mail-id' }, error: null }; } }; } },
  })('@/app/api/contact/route');
  return { records, messages, operations, post: body => route.POST(new Request('http://localhost/api/contact', { method: 'POST', body: JSON.stringify(body) })) };
}

test('API saves virtual inquiry and sends both existing notifications without hidden screening', async () => {
  const service = api();
  assert.equal((await service.post({ ...virtual, screeningMethod: 'website', screeningValue: 'SECRET', cityState: 'SECRET' })).status, 200);
  assert.equal(service.records[0].experience, 'virtual');
  assert.equal(service.records[0].screening_value, null);
  assert.equal(service.records[0].city, null);
  assert.equal(service.messages.length, 2);
  assert.match(service.messages[0].subject, /VIRTUAL/);
  for (const message of service.messages) {
    assert.match(message.text, /Virtual format: Video Call/);
    assert.match(message.text, /Preferred date: 2099-12-12/);
    assert.doesNotMatch(message.text, /SECRET|Screening/);
  }
});

test('API promotes existing lead and includes in-person screening in notifications', async () => {
  const service = api({ lead: true });
  assert.equal((await service.post({ ...inPerson, screeningMethod: 'linkedin', screeningValue: 'https://linkedin.com/in/test', leadId: 'lead-id' })).status, 200);
  assert.deepEqual(service.operations, ['update']);
  assert.equal(service.records[0].virtual_format, null);
  assert.match(service.messages[0].subject, /IN PERSON/);
  assert.match(service.messages[0].text, /Employment Verification via LinkedIn/);
  assert.match(service.messages[0].text, /https:\/\/linkedin.com\/in\/test/);
});

test('API rejects invalid bodies and validation before persistence; failed saves never succeed or email', async () => {
  const service = api();
  for (const body of [null, [], { ...virtual, date: '2000-01-01' }, { ...inPerson, screeningMethod: 'website', screeningValue: 'javascript:alert(1)' }]) {
    assert.equal((await service.post(body)).status, 400);
  }
  assert.equal(service.records.length, 0);
  assert.equal(service.messages.length, 0);
  const failed = api({ fail: true });
  assert.equal((await failed.post(virtual)).status, 500);
  assert.equal(failed.messages.length, 0);
});

test('notification HTML escapes submitted values', () => {
  const { buildOwnerEmail } = load('@/lib/emails');
  const result = buildOwnerEmail({ ...inPerson, name: '<script>bad</script>', note: '<img src=x>', emailStatus: 'ok' });
  assert.ok(result.html.includes('&lt;script&gt;'));
  assert.ok(!result.html.includes('<img src=x>'));
});
