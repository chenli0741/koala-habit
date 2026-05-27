const metrics = [
  ["Pending confirmations", "1"],
  ["Unlocked play time", "25 min"],
  ["Family streak", "5 days"]
];

export default function Page() {
  return (
    <main className="shell">
      <section className="intro">
        <p>Parent Console</p>
        <h1>Koala Habit</h1>
        <span>Plan goals, confirm outcomes, and keep rewards balanced.</span>
      </section>
      <section className="metrics">
        {metrics.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
