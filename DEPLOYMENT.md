# Deployment Guide: Vercel

This project is a monorepo containing a NestJS backend and a Vite frontend. Follow these steps to deploy to Vercel.

## 1. Backend Deployment

1.  **Create a New Project** in Vercel.
2.  **Link your Repository**.
3.  **Configure Project**:
    *   **Root Directory**: `backend`
    *   **Framework Preset**: `Other` (or `NestJS` if available, but we use a custom `vercel.json`)
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Environment Variables**:
    *   `MONGODB_URI`: Your MongoDB Atlas connection string.
    *   `JWT_SECRET`: A secure random string for JWT signing.
    *   `FRONTEND_URL`: The URL of your deployed frontend (e.g., `https://your-frontend.vercel.app`).
    *   `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`: For email notifications.
    *   `PORT`: `3000` (optional, default is 3000).

## 2. Frontend Deployment

1.  **Create a New Project** in Vercel.
2.  **Link your Repository**.
3.  **Configure Project**:
    *   **Root Directory**: `frontend`
    *   **Framework Preset**: `Vite`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed backend (e.g., `https://your-backend.vercel.app/api`).

## Important Notes

- **Puppeteer**: The backend is configured to use `@sparticuz/chromium` in production. The `vercel.json` ensures the function has enough memory (1024MB) for PDF generation.
- **CORS**: The backend is configured to allow requests from the `FRONTEND_URL`.
- **Database**: Ensure your MongoDB Atlas IP Whitelist allows requests from all IPs (`0.0.0.0/0`) as Vercel serverless IPs are dynamic.
- **Monorepo**: Vercel handles monorepos by treating each subdirectory as a separate project linked to the same repository.
