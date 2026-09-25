# Peer-to-Peer Skill Exchange
> *"Your Knowledge Becomes Currency"* — A Free Time-Bank & Credit-Economy Knowledge Platform

---

## 🎯 The Core Philosophy: Knowledge Currency

The platform operates on a **Time-Bank Knowledge Economy**:
* **1 hour of teaching = 1 credit earned (+1 Cr)**
* **1 credit spent = 1 hour of learning (-1 Cr)**
* **Zero real money transactions** — Knowledge is the only currency.
* **The Barter Problem Solved:** If User A wants to learn Guitar from User B, but User B doesn't want User A's Excel skill:
  - User A teaches Excel to User C $\rightarrow$ User A earns +1 credit.
  - User A spends that credit to learn Guitar from User B.

---

## 🚀 Live Demo & Accounts (Pre-Seeded)

The database automatically seeds on startup with **24 skills**, **21 realistic community users**, **active sessions**, **ledger history**, and **verified reviews**.

| Account | Email | Password | Role & Expertise |
| :--- | :--- | :--- | :--- |
| **Rahul Sharma** | `rahul@example.com` | `password123` | Teaches: JavaScript, React, Excel. Wants: Guitar, Spanish |
| **Priya Patel** | `priya@example.com` | `password123` | Teaches: Guitar, UI/UX Design. Wants: Python, Excel |
| **Amit Verma** | `amit@example.com` | `password123` | Teaches: Spanish, English. Wants: Resume Writing, React |
| **Sneha Iyer** | `sneha@example.com` | `password123` | Teaches: Excel Dashboards, SQL. Wants: Cooking, Photography |
| **System Admin** | `admin@skillexchange.in` | `admin123` | Platform Moderator, Dispute Arbitration & Stats |

*(Every new account registered receives **+3 Starter Knowledge Credits** automatically.)*

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router 6, Axios, Context API
- **Backend**: Node.js, Express.js, MongoDB / Mongoose, JWT Auth, Bcrypt, Socket.io
- **Real-Time Layer**: Socket.io (instant session updates, chat messaging, live credit notifications)
- **Zero-Setup Database**: Automatic embedded `MongoMemoryServer` fallback if no local or Atlas MongoDB is running, plus full support for `MONGO_URI` in `.env`.

---

## 🔑 Core Features & Highlights

1. **Deterministic Rule-Based Matching Engine**:
   - Strictly 100% explainable matching without black-box AI.
   - Computes score across 5 factors: Skill overlap (+50), Availability overlap (+20), Session mode (+10), Community rating (+10), Experience (+10).
   - Shows users exact match reasons (e.g., *"✓ Teaches Guitar which is on your wishlist"*, *"✓ Shared weekend availability"*).

2. **Immutable Credit Ledger**:
   - Double-entry bookkeeping: every credit movement creates a permanent `CreditTransaction` record.
   - Types: `BONUS`, `HOLD`, `RELEASE`, `EARN`, `SPEND`, `REFUND`.
   - Dynamic balance calculation: $\text{Spendable} = \text{Total} - \text{Reserved} \ge 0$.

3. **Double-Confirmation Trust Protocol**:
   - When a session concludes, the teacher clicks *"Mark Session Complete"* and the learner clicks *"Confirm Completion"*.
   - Only when **both** have confirmed are credits settled from escrow.

4. **1-on-1 Real-time Peer Chat**:
   - Active WebSocket coordination between booked session participants.

5. **Admin Control Console**:
   - Real-time platform statistics (circulating credits, active sessions, popular skills).
   - User moderation (suspend/reactivate).
   - Dispute arbitration with ledger-backed refund or payout actions.

---

## 💻 Running the Application

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Quick Start
From the project root directory:

```bash
# Start backend server (port 5000)
cd server
npm start

# In a second terminal, start Vite frontend (port 5173)
cd client
npm run dev
```

Open `http://localhost:5173/` in your browser.
