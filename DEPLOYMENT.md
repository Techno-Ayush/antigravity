# 🚀 Deployment Guide — Peer-to-Peer Skill Exchange

This guide outlines the step-by-step process for deploying the **Peer-to-Peer Skill Exchange** application to production hosts like **Render**, **Railway**, **DigitalOcean**, or via **Docker**.

---

## 🌟 Quickest Method: Single Web Service Deployment (Render / Railway)

The Express backend automatically serves the Vite React production frontend in `production` mode. This allows hosting the complete stack (API, WebSockets, & UI) on a **single Web Service domain** without CORS or WebSocket origin issues.

### 📍 Option A: Deploying on Render

1. Push your latest code to a Git repository (GitHub / GitLab / Bitbucket).
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** $\rightarrow$ **Blueprints**.
3. Connect your repository. Render will automatically detect `render.yaml`.
4. Configure your **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave blank; Render sets `$PORT` automatically)
   - `JWT_SECRET`: A secure random string (e.g., `supersecretkey_production_123!`)
   - `MONGO_URI`: *(Optional)* Your MongoDB Atlas connection URI string. *(Note: If omitted, the app will initialize with in-memory Mongo database).*
5. Click **Apply**. Render will automatically run `npm run build` and launch `npm start`.

---

### 📍 Option B: Deploying on Railway

1. Log in to [Railway.app](https://railway.app/).
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select your repository.
4. Railway will automatically pick up the `Procfile` and `package.json`.
5. In **Variables**, add:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your_strong_secret_key`
   - `MONGO_URI` = `mongodb+srv://user:pass@cluster.mongodb.net/skillexchange` *(Recommended for production persistence)*
6. Click **Deploy**.

---

### 📍 Option C: Containerized Deployment (Docker / GCP Cloud Run / Fly.io)

Using the included multi-stage `Dockerfile`:

```bash
# 1. Build the Docker Image
docker build -t peer-skill-exchange:latest .

# 2. Run the Container locally or on Cloud Hosts
docker run -d -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=production_secret_key \
  -e MONGO_URI="mongodb+srv://..." \
  peer-skill-exchange:latest
```

---

## 🔑 Environment Variables Reference

| Variable Name | Required | Default / Description |
| :--- | :--- | :--- |
| `NODE_ENV` | **Yes** | Set to `production` for static asset serving & security settings. |
| `PORT` | No | Defaults to `5000` (cloud providers usually override this automatically). |
| `JWT_SECRET` | **Yes** | Secret string used for signing user authentication tokens. |
| `MONGO_URI` | Recommended | MongoDB connection URI. If omitted, uses embedded `mongodb-memory-server`. |
| `VITE_API_URL` | Optional | Custom backend API URL if hosting frontend separately (e.g. Vercel + Render). |
| `VITE_SOCKET_URL` | Optional | Custom WebSocket URL if hosting backend on a distinct domain. |

---

## 🧪 Production Verification Checklist

1. Open your live deployment URL (e.g., `https://p2p-skill-exchange.onrender.com`).
2. Test Login using pre-seeded test accounts:
   * **Email**: `rahul@example.com` | **Password**: `password123`
3. Test Skill Search & Match recommendation algorithm.
4. Test Session booking & double-confirmation escrow credit transfer.
