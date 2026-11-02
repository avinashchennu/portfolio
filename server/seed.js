import bcrypt from 'bcryptjs';
import { store } from './store.js';
import { sanitizePortfolio } from './utils.js';
import { DEMO_USER, ADMIN_USER } from './config.js';

export function seed() {
  if (!store.findUserByEmail(DEMO_USER.email)) {
    store.createUser({
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      passwordHash: bcrypt.hashSync(DEMO_USER.password, 10),
      portfolio: sanitizePortfolio({
        name: DEMO_USER.name,
        tagline: 'CSE student & frontend tinkerer',
        bio: 'I build small web apps and enjoy turning rough ideas into clean interfaces. Currently learning React and Node.',
        skills: ['React', 'JavaScript', 'Node.js', 'HTML', 'CSS', 'Git'],
        projects: [
          { title: 'Portfolio Maker', link: 'https://github.com', desc: 'Fill in a form and get a shareable portfolio page.' },
          { title: 'Task Tracker', link: 'https://github.com', desc: 'A small to-do app with filters and local persistence.' },
          { title: 'Weather Board', link: 'https://github.com', desc: 'Dashboard showing the forecast for saved cities.' },
        ],
        contactEmail: DEMO_USER.email,
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
      }),
    });
  }

  if (!store.findUserByEmail(ADMIN_USER.email)) {
    store.createUser({
      name: ADMIN_USER.name,
      email: ADMIN_USER.email,
      passwordHash: bcrypt.hashSync(ADMIN_USER.password, 10),
      role: 'admin',
      portfolio: sanitizePortfolio({ name: ADMIN_USER.name, contactEmail: ADMIN_USER.email }),
    });
  }
}
