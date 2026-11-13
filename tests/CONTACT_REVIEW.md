# Contact form review

The change is limited to the contact form, its API, inquiry helpers, notification templates, and database migration. Name/email/phone styling and lead capture remain intact. No other site sections or prices change.

## Before deployment

Apply `supabase/migrations/0008_inquiry_experiences.sql` to the existing Supabase project before deploying this branch. Existing records and partial leads remain valid. The existing Supabase and Resend environment variables and owner notification destination are unchanged.

No live database or email credentials were available in the development workspace, so live persistence and inbox delivery still need a staging check. API regression tests exercise the existing Supabase/Resend interfaces with mocked external services, including lead promotion, notification contents, and save failures. Existing behavior treats a successfully saved inquiry as received even if an email fails; email failures continue to be logged.

## Automated checks

- `node --test tests/contact.test.mjs`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

Browser checks at desktop (1440px) and mobile (390px) widths cover experience switching, all screening choices, exact duration options, date input activation, past-date validation, hidden-field removal, failed submission, successful confirmation, and horizontal overflow. Browser submission responses were mocked.

## Staging review

1. Select Virtual and submit a future date with each format. Confirm no screening is required, saved, or included in either email.
2. Select In Person and review all four screening methods. Government ID shows the note only and never requests a file or automatically sends ID instructions. Only the selected method's supporting field is required.
3. Confirm the date picker opens from the field and calendar control on your desktop and mobile devices. Past dates must not submit.
4. Submit each in-person screening method and confirm the saved inquiry and owner/client notifications contain the experience, duration, date, time, city/state, and relevant screening information.
5. Confirm a save failure retains the form and shows an error; a successful save shows the existing thank-you confirmation with the selected experience details.
