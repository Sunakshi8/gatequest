# 🎮 GATEQUEST — Setup Guide (Windows 10)

## Prerequisites

- **Node.js** (v18+): Download from https://nodejs.org/
- **Git** (optional): https://git-scm.com/
- **A free MongoDB Atlas account** (instructions below)

---

## Step 1: MongoDB Atlas Setup (5 minutes)

1. Go to **https://www.mongodb.com/atlas** and click **"Try Free"**
2. Sign up with Google or email
3. Choose **FREE Shared Cluster** (M0 Sandbox — completely free)
4. Select any cloud provider & region (e.g., AWS Mumbai)
5. Click **"Create Cluster"** (takes 1-3 min)

### Create Database User:

1. Go to **Security → Database Access → Add New Database User**
2. Username: `gatequest` | Password: `gatequest123` (or your own)
3. Click **"Add User"**

### Allow Network Access:

1. Go to **Security → Network Access → Add IP Address**
2. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
3. Click **"Confirm"**

### Get Connection String:

1. Go to **Database → Connect → Drivers**
2. Copy the connection string (looks like):
   ```
   mongodb+srv://gatequest:gatequest123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. **Add the database name** after `.net/`:
   ```
   mongodb+srv://gatequest:gatequest123@cluster0.xxxxx.mongodb.net/quizarena?retryWrites=true&w=majority
   ```

---

## Step 2: Project Setup (5 minutes)

1. Open the `gatequest` folder in **VS Code**

2. Open terminal (Ctrl+`) and run:

   ```bash
   npm install
   ```

   This installs root dependencies (concurrently).

3. Install backend & frontend dependencies:

   ```bash
   cd backend && npm install && cd ../frontend && npm install && cd ..
   ```

4. Edit `backend/.env` — paste YOUR MongoDB Atlas connection string:
   ```
   MONGO_URI=mongodb+srv://gatequest:gatequest123@cluster0.YOUR_CLUSTER.mongodb.net/quizarena?retryWrites=true&w=majority
   JWT_SECRET=quizarena_super_secret_key_2024
   PORT=5000
   ```

---

## Step 3: Seed Questions (1 minute)

```bash
npm run seed
```

This inserts 145+ GATE CSE questions into your database.
You should see: ✅ Seeded XXX GATE CSE questions!

---

## Step 4: Run the Project 🚀

```bash
npm run dev
```

This starts BOTH backend (port 5000) and frontend (port 5173).

Open **http://localhost:5173** in your browser!

---

## Step 5: Test It!

1. **Register** a new account
2. **Play Solo** — select a subject and start a quiz
3. Test **lifelines** (50-50, Skip, Extra Time)
4. Get a **5-streak** for confetti + badge!
5. Check **Dashboard** for stats
6. Check **Leaderboard** for rankings
7. **Multiplayer**: Open 2 browser tabs, register 2 accounts, create & join room

---

## Troubleshooting

| Problem                  | Solution                                                                 |
| ------------------------ | ------------------------------------------------------------------------ |
| MongoDB connection error | Check your MONGO_URI in .env, make sure IP whitelist is set to 0.0.0.0/0 |
| `npm run seed` fails     | Make sure MONGO_URI is correct and cluster is created                    |
| Port 5000 in use         | Change PORT in .env to 5001                                              |
| Frontend not loading     | Make sure you ran `npm install` in the frontend folder                   |
| No questions showing     | Run `npm run seed` first                                                 |

---

## Tech Stack

- **Frontend**: React 18 + Vite + Framer Motion + Canvas Confetti
- **Backend**: Node.js + Express + Socket.IO
- **Database**: MongoDB Atlas (cloud)
- **Auth**: JWT + bcryptjs

Enjoy your GATE Quest! 🎮⚡
