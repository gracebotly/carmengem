export default function Footer() {
  return (
    <footer className="border-t border-line bg-shell">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-body text-lg tracking-[0.08em] text-ink">
            Carmen Rose
          </p>
          <p className="eyebrow mt-3 text-sand">
            Bowie, Maryland &nbsp;·&nbsp; By appointment
          </p>
        </div>
        <p className="eyebrow text-sand">
          © {new Date().getFullYear()} Carmen Rose
        </p>
      </div>
    </footer>
  );
}
