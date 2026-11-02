# Portfolio Maker (React + Vite + Express)

    npm install
    npm run demo

- App: http://localhost:5173
- API: http://localhost:5000 (health check: /api/health)
- User demo:  demo@example.com / demo1234
- Admin demo: admin@example.com / admin1234

## Structure
    server/
      index.js        entry, mounts the modules
      config.js       port, secret, templates, demo accounts
      store.js        JSON-file storage (server/data.json)
      seed.js         creates demo and admin accounts
      middleware.js   requireAuth, requireAdmin, error handlers
      utils.js        validation, link safety, tokens
      routes/auth.js  login module   (/api/auth/*)
      routes/user.js  user module    (/api/portfolio, /api/public/:id)
      routes/admin.js admin module   (/api/admin/*)
    src/
      main.jsx        React entry
      App.jsx         all routes
      api.js          API calls
      auth/           auth context, provider, route guards
      pages/          Login, Signup
      user/           Dashboard, Templates, Portfolio
      admin/          AdminDashboard
      components/     AppHeader, AuthShell
