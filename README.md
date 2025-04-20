```markdown
# 🏠 Openhouse

**Mission:** Become the world’s largest researcher community—an organization built to outlast centuries and fully deconstruct the frontiers of human science.

---

## 🚀 Project Overview

Openhouse is a full‑stack, multi‑platform community platform that connects researchers across disciplines. Key features include:

- **Password‑less Login** via email magic link  
- **AI Sage** — daily “coin” lottery, contribution scoring, and inspirational messages  
- **1:1 Researcher Matching** — tag‑based pairing with a 7‑day cooldown  
- **Real‑time Chat** between matched partners  
- **Public & Anonymous Posting** — community feed and “Treehole” anonymous wall  

We’re running the entire front‑end as a single Expo app (Web / iOS / Android) and the back‑end with FastAPI + PostgreSQL.

---

## 🔧 Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Front‑end  | Expo (React Native + React Native Web) |
| Back‑end   | FastAPI, Uvicorn, SQLAlchemy       |
| Database   | PostgreSQL                         |
| Dev & Build| Node.js (v20+), Python (3.8+), nvm, pip |
| Deployment | Vercel / Netlify (Web) + EAS (Mobile) / Cloud Run |

---

## 📦 Prerequisites

- **Node.js** (v20.x) & **npm** (via [nvm](https://github.com/nvm-sh/nvm))
- **Python** (>= 3.8) & **pip**
- **PostgreSQL** running locally (or remote) with a database named `openhouse`
- **Expo Go** (for mobile testing)

---

## 🔨 Installation & Setup

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-username/openhouse.git
   cd openhouse
   ```

2. **Back‑end**  
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate        # on Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
   - Copy `.env.example` → `.env` and fill in your `DATABASE_URL`  
   - Run migrations (if any) or let SQLAlchemy create tables  
   - Start the server:
     ```bash
     uvicorn app.main:app --reload
     ```
   - API docs live at: `http://localhost:8000/docs`

3. **Front‑end**  
   ```bash
   cd ../      # back to repo root
   npx create-expo-app .          # (run once when first setting up)
   npm install                    # install all JS/TS dependencies
   ```
   - Start in your browser:
     ```bash
     npm run web
     ```
     → opens `http://localhost:19006`
   - Or run in simulator / device:
     ```bash
     npx expo start
     ```
     → scan the QR code in **Expo Go**

---

## ⚡ Development Workflow

- **Front‑end**
  - Components in `components/`
  - Screens in `screens/` (add as you build Login, Feed, Chat, Sage…)
  - Expo commands: `npm run web`, `npx expo start ios`, `npx expo start android`

- **Back‑end**
  - Routers in `backend/app/routers/`
  - Models in `backend/app/models.py`
  - Database setup in `backend/app/database.py`
  - CRUD logic in `backend/app/crud.py`

---

## 📂 Folder Structure

```
openhouse/
├── App.tsx           # Expo entry (Web + iOS + Android)
├── app.json          # Expo config
├── assets/           # Images, fonts, icons
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── backend/          # FastAPI back‑end
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   ├── models.py
│   │   ├── crud.py
│   │   └── database.py
│   └── requirements.txt
├── .gitignore
└── README.md
```
---

## 📄 License

This project is licensed under the **Apache 2.0 License**. See [LICENSE](LICENSE) for details.

---
```
