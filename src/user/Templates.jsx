import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import AppHeader from '../components/AppHeader.jsx';

const TEMPLATES = [
  {
    key: 'workshop',
    name: 'Workshop',
    text: 'Dark sidebar, amber accents, blueprint grid texture. Bold and technical.',
    mock: (
      <div className="tpl-mock tpl-mock-workshop">
        <div className="m-side" />
        <div className="m-main"><div className="m-hero" /><div className="m-body" /></div>
      </div>
    ),
  },
  {
    key: 'editorial',
    name: 'Editorial',
    text: 'Warm paper, maroon accent, single centered column. Calm and magazine-like.',
    mock: (
      <div className="tpl-mock tpl-mock-editorial">
        <div className="m-hero" />
        <div className="m-body">
          <div className="m-line" />
          <div className="m-line" style={{ width: '80%' }} />
          <div className="m-line" style={{ width: '60%' }} />
        </div>
      </div>
    ),
  },
  {
    key: 'minimal',
    name: 'Minimal',
    text: 'Stark black & white, electric-blue accent, visible grid lines. Sharp and structured.',
    mock: (
      <div className="tpl-mock tpl-mock-minimal">
        <div className="m-side" />
        <div className="m-main"><div className="m-accent" /><div /><div /><div /></div>
      </div>
    ),
  },
];

export default function Templates() {
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPortfolio().then((d) => setSelected(d.template)).catch((err) => setError(err.message));
  }, []);

  const choose = async (key) => {
    setError('');
    const previous = selected;
    setSelected(key);
    try {
      await api.setTemplate(key);
    } catch (err) {
      setSelected(previous);
      setError(err.message);
    }
  };

  return (
    <>
      <AppHeader>
        <Link className="btn secondary" to="/dashboard">← Back to editor</Link>
      </AppHeader>

      <main>
        <div className="page-intro">
          <h2>Choose a template</h2>
          <p>Pick a look for your portfolio. You can switch anytime. Your details stay the same.</p>
          {error && <p className="error-msg visible" role="alert">{error}</p>}
        </div>

        <section className="tpl-gallery">
          {TEMPLATES.map((t) => (
            <article key={t.key} className={`tpl-card${selected === t.key ? ' selected' : ''}`}>
              {t.mock}
              <div className="tpl-info">
                {selected === t.key && <span className="tpl-badge">Selected</span>}
                <h3>{t.name}</h3>
                <p>{t.text}</p>
                <button className="btn" type="button" disabled={selected === t.key} onClick={() => choose(t.key)}>
                  {selected === t.key ? 'In use' : 'Use this template'}
                </button>
              </div>
            </article>
          ))}
        </section>

        <div className="page-intro page-outro">
          <Link className="btn" to="/portfolio" target="_blank">View portfolio</Link>
        </div>
      </main>
    </>
  );
}
