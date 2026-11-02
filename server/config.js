export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-change-before-deploying';
export const TEMPLATES = ['workshop', 'editorial', 'minimal'];

// Accounts created automatically on first start (handy for a demo)
export const DEMO_USER = { name: 'Demo Student', email: 'demo@example.com', password: 'demo1234' };
export const ADMIN_USER = { name: 'Admin', email: 'admin@example.com', password: 'admin1234' };
