export default function AuthShell({ title, blurb, children }) {
  return (
    <div className="auth-shell">
      <section className="auth-brand">
        <div className="auth-mark">PM</div>
        <h1>{title}</h1>
        <p>{blurb}</p>
      </section>
      <section className="auth-form-panel">{children}</section>
    </div>
  );
}
