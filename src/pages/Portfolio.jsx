import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth-context.js';
import { safeUrl } from '../utils.js';

export default function Portfolio() {
  const { id } = useParams(); // present on the public /p/:id route
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = id ? api.getPublic(id) : api.getPortfolio();
    load.then(setData).catch((err) => setError(err.message));
  }, [id]);

  // the template styles are scoped by a class on <body>
  useEffect(() => {
    if (!data) return undefined;
    const cls = `tpl-${data.template || 'workshop'}`;
    document.body.classList.add(cls);
    return () => document.body.classList.remove(cls);
  }, [data]);

  if (error) return <p className="page-status">{error}</p>;
  if (!data) return <p className="page-status">Loading…</p>;

  const github = safeUrl(data.github);
  const linkedin = safeUrl(data.linkedin);
  const isOwner = Boolean(user) && !id;

  return (
    <>
      {isOwner && (
        <div className="pf-footer-links">
          <Link className="btn secondary" to="/dashboard">Edit</Link>
          <Link className="btn secondary" to="/templates">Change template</Link>
          <button className="btn danger" type="button" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
        </div>
      )}

      <div className="pf-shell">
        <aside className="pf-sidebar">
          <div className="pf-avatar">{(data.name || '?').trim().charAt(0).toUpperCase()}</div>

          <div>
            <h3>Skills</h3>
            <div className="pf-skill-grid">
              {data.skills?.length
                ? data.skills.map((s) => <span className="pf-skill" key={s}>{s}</span>)
                : <span className="pf-skill">No skills added</span>}
            </div>
          </div>

          <div>
            <h3>Contact</h3>
            <div className="pf-contact">
              {data.contactEmail && <a href={`mailto:${data.contactEmail}`}>{data.contactEmail}</a>}
              {github && <a href={github} target="_blank" rel="noopener noreferrer">GitHub</a>}
              {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
              {!data.contactEmail && !github && !linkedin && <span>No contact links yet</span>}
            </div>
          </div>
        </aside>

        <section className="pf-hero">
          <p className="eyebrow">{data.tagline}</p>
          <h1>{data.name || 'Your name'}</h1>
          <p>{data.bio || 'Add a short bio from the editor.'}</p>
        </section>

        <section className="pf-main">
          <h2>Projects</h2>
          <div className="project-grid">
            {data.projects?.length ? (
              data.projects.map((proj, i) => {
                const link = safeUrl(proj.link);
                return (
                  <article className="project-card" key={`${proj.title}-${i}`}>
                    <h3>{proj.title || 'Untitled project'}</h3>
                    <p>{proj.desc}</p>
                    {link && <a href={link} target="_blank" rel="noopener noreferrer">View project</a>}
                  </article>
                );
              })
            ) : (
              <div className="empty-state">No projects added yet.</div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
