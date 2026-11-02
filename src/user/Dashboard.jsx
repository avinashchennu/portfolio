import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import AppHeader from '../components/AppHeader.jsx';
import { publicLink } from '../utils.js';

const withIds = (projects = []) => projects.map((p) => ({ ...p, key: crypto.randomUUID() }));

export default function Dashboard() {
  const [form, setForm] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [portfolioId, setPortfolioId] = useState(null);
  const [skillDraft, setSkillDraft] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getPortfolio()
      .then((data) => {
        const { skills: s, projects: p, id, ...fields } = data;
        delete fields.template;
        setForm(fields);
        setSkills(s || []);
        setProjects(withIds(p));
        setPortfolioId(id);
      })
      .catch((err) => setLoadError(err.message));
  }, []);

  if (loadError) return <p className="page-status">{loadError}</p>;
  if (!form) return <p className="page-status">Loading your portfolio…</p>;

  const updateField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const value = skillDraft.trim();
    if (value && !skills.includes(value)) setSkills([...skills, value]);
    setSkillDraft('');
  };

  const updateProject = (key, field, value) =>
    setProjects(projects.map((p) => (p.key === key ? { ...p, [field]: value } : p)));

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: '', text: '' });
    try {
      const payload = {
        ...form,
        skills,
        projects: projects.map(({ title, link, desc }) => ({ title, link, desc })),
      };
      await api.savePortfolio(payload);
      setStatus({ type: 'ok', text: 'Saved' });
      setTimeout(() => setStatus({ type: '', text: '' }), 2500);
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = publicLink(portfolioId);

  return (
    <>
      <AppHeader>
        <Link className="btn secondary" to="/templates">Choose template</Link>
        <Link className="btn secondary" to="/portfolio" target="_blank">View portfolio</Link>
      </AppHeader>

      <main className="dashboard-grid">
        <section className="panel">
          <h2>Your details</h2>
          <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
            <div className="field full">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" type="text" required value={form.name} onChange={updateField} />
            </div>

            <div className="field full">
              <label htmlFor="tagline">Tagline</label>
              <input id="tagline" name="tagline" type="text" maxLength={80} placeholder="e.g. CSE student & frontend tinkerer" value={form.tagline} onChange={updateField} />
            </div>

            <div className="field full">
              <label htmlFor="bio">About</label>
              <textarea id="bio" name="bio" maxLength={500} placeholder="A few lines about you" value={form.bio} onChange={updateField} />
            </div>

            <div className="field full">
              <label htmlFor="skill-input">Skills</label>
              <div className="chip-input">
                {skills.map((skill) => (
                  <span className="chip" key={skill}>
                    {skill}
                    <button type="button" aria-label={`Remove ${skill}`} onClick={() => setSkills(skills.filter((s) => s !== skill))}>&times;</button>
                  </span>
                ))}
                <input id="skill-input" type="text" placeholder="Type a skill and press Enter" value={skillDraft} onChange={(e) => setSkillDraft(e.target.value)} onKeyDown={addSkill} />
              </div>
            </div>

            <div className="field">
              <label htmlFor="github">GitHub URL</label>
              <input id="github" name="github" type="url" placeholder="https://github.com/..." value={form.github} onChange={updateField} />
            </div>

            <div className="field">
              <label htmlFor="linkedin">LinkedIn URL</label>
              <input id="linkedin" name="linkedin" type="url" placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={updateField} />
            </div>

            <div className="field full">
              <label htmlFor="contactEmail">Contact email</label>
              <input id="contactEmail" name="contactEmail" type="email" value={form.contactEmail} onChange={updateField} />
            </div>
          </form>
        </section>

        <section className="panel">
          <h2>Projects</h2>

          {projects.length === 0 && <p className="save-msg">No projects yet. Add your first one below.</p>}

          {projects.map((proj) => (
            <div className="project-row" key={proj.key}>
              <div className="field">
                <label>Title</label>
                <input type="text" value={proj.title} onChange={(e) => updateProject(proj.key, 'title', e.target.value)} />
              </div>
              <div className="field">
                <label>Link</label>
                <input type="url" value={proj.link} onChange={(e) => updateProject(proj.key, 'link', e.target.value)} />
              </div>
              <div className="field full">
                <label>Description</label>
                <textarea value={proj.desc} onChange={(e) => updateProject(proj.key, 'desc', e.target.value)} />
              </div>
              <button type="button" className="remove-btn" onClick={() => setProjects(projects.filter((p) => p.key !== proj.key))}>Remove</button>
            </div>
          ))}

          <button className="btn secondary" type="button" onClick={() => setProjects([...projects, { key: crypto.randomUUID(), title: '', link: '', desc: '' }])}>
            + Add project
          </button>

          <div className="save-bar">
            <button className="btn" type="button" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            {status.text && <span className={`save-msg ${status.type}`} role="status">{status.text}</span>}
          </div>

          <div className="share-box">
            <label htmlFor="share-link">Shareable link</label>
            <div className="share-row">
              <input id="share-link" type="text" readOnly value={publicUrl} onFocus={(e) => e.target.select()} />
              <button className="btn secondary" type="button" onClick={() => navigator.clipboard?.writeText(publicUrl)}>Copy</button>
            </div>
            <p className="save-msg">Anyone with this link can see your saved portfolio.</p>
          </div>
        </section>
      </main>
    </>
  );
}
