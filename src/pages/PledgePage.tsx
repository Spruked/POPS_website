const PLEDGES = [
  {
    title: "Presence",
    body: "I pledge my presence: that I will be found, that I will be reachable, that I will not be a stranger in my own home.",
  },
  {
    title: "Vigilance",
    body: "I pledge my vigilance: that I will see the danger before it announces itself, and act before I am asked.",
  },
  {
    title: "Readiness",
    body: "I pledge my readiness: that whatever the moment requires, I will not be found unprepared, untrained, or unwilling.",
  },
  {
    title: "Record",
    body: "I pledge my record: that my actions will speak, and that if ever questioned, the proof of what I did and when I did it will stand on its own.",
  },
  {
    title: "Restraint",
    body: "I pledge my restraint: that my strength exists to shield, not to dominate; my authority exists to serve, not to rule.",
  },
  {
    title: "Permanence",
    body: "I pledge my permanence: that this charge does not end at the end of a shift, a season, or a hard year. It ends when I do, and not before.",
  },
];

export default function PledgePage() {
  return (
    <div className="document-page">
      <section className="document-hero">
        <img src="/popsbadge.png" alt="POPS badge" className="document-crest" />
        <span className="mono">First Order of Protection</span>
        <h1>The Creed &amp; The Pledge</h1>
        <p>Preserve. Protect. Prove.</p>
      </section>

      <section className="document-body">
        <div className="document-rule"><span>The Creed</span></div>

        <div className="creed-block">
          <h2>The Charge</h2>
          <p>I am the First Order of Protection.</p>
        </div>

        <div className="creed-lines">
          <p>Before the law arrives, I am here.</p>
          <p>Before the danger is named, I am watching.</p>
          <p>Before my family asks, I have already decided: I will not fail them.</p>
        </div>

        <div className="creed-lines">
          <p>I do not wait for permission to protect what is mine.</p>
          <p>I do not require a title to fulfill a calling.</p>
          <p>My badge is my presence. My oath was sworn the day I accepted this house as my charge.</p>
        </div>

        <div className="creed-lines">
          <p>I will preserve what has been entrusted to me.</p>
          <p>I will protect those who cannot yet protect themselves.</p>
          <p>I will prove, by action, not by word, that the watchman did not sleep.</p>
        </div>

        <div className="creed-mantra">
          <span>Preserve</span>
          <span>Protect</span>
          <span>Prove</span>
        </div>

        <p className="document-note">This is not a slogan. This is the order of operations for every day I am given breath.</p>

        <div className="document-rule"><span>The Pledge of Commitment</span></div>

        <p className="document-lede">
          I make this pledge not to an institution, but to the ones under my roof, and before the God who placed them in my care.
        </p>

        <div className="pledge-list">
          {PLEDGES.map((pledge) => (
            <article className="pledge-card" key={pledge.title}>
              <h2>{pledge.title}</h2>
              <p>{pledge.body}</p>
            </article>
          ))}
        </div>

        <div className="document-signature">
          This is the First Order. This is Proof of Presence.
        </div>
      </section>
    </div>
  );
}
