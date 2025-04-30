# 🏠 OpenHouse: A Researcher Matching Platform

OpenHouse is an AI-powered academic social platform designed to connect researchers and promote meaningful collaborations. It provides a passwordless login experience, intelligent partner matching, real-time chat, social content sharing, and a lightweight notification system.

🌐 Demo: https://openhouse.horik.cn

📦 Tech Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Frontend  | React + Vite + TailwindCSS    |
| Backend   | Go + Gin + GORM + MySQL       |
| Database  | MySQL 8.x                     |
| Auth      | Email, GitHub, Google OAuth2  |
| AI Match  | LLM API (OpenAI/TogetherAI)   |
| Storage   | Alibaba Cloud OSS (Image CDN) |

—

🚀 Features

1. ✅ User Authentication

- Passwordless login via email verification code
- OAuth2 login via GitHub & Google
- JWT-based authentication & authorization
- Multiple account bindings supported (e.g. Email + GitHub)

2. 👤 User Profile

- Editable user profile (nickname, gender, avatar, intro)
- Upload avatar to OSS
- Track authentication methods (email/github/google)

3. 📚 Posts & Social Feed

- Create, edit, delete posts with text and images
- Like, favorite, comment on posts
- Public feed with follow-based filtering
- Anonymous "Tree Hole" mode (optional)
- AI-based scoring to manage the community (future implementation)

4. 🔍 Researcher Matching

- Users submit tags + intro + research area to enter match pool
- Daily scheduled LLM-based intelligent matching
- Matches scored with AI comments & reason
- Results are revealed daily
- Matching status: Not Applied / Matching / Matched / Revealed

5. 💬 Real-time Chat (Polling)

- One-on-one chat after successful match
- Message history & polling-based new message pull
- Structured chat schema with sender/receiver UUID

6. 🔔 Notification System

- System notifications: match success, replies, likes, admin broadcast
- User notifications: private messages (after match)

—

🛠 Project Structure

.
├── backend/                # Go + Gin backend
│   ├── api/                # API layer
│   ├── model/              # request/response/database models
│   ├── service/            # business logic
│   ├── middleware/         # JWT auth, logging
│   ├── utils/              # helper functions
│   ├── global/             # global variables
│   ├── initialize/         # DB, OSS, config init
│   └── main.go             # project entrypoint
├── frontend/               # React + Vite frontend (optional)

—

🔧 Setup & Run

🧩 Prerequisites

- Go 1.20+
- MySQL 8.0+
- Node.js 18+ (for frontend)
- Docker (optional for deployment)

📦 Install Dependencies

Backend:

cd backend/
go mod tidy

Frontend:

cd frontend/
pnpm install

🗃️ Run MySQL (optional):

docker run --name openhouse-mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=openhouse \
  -p 3306:3306 \
  -d mysql:8.0 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

⚙️ Start Backend

cd backend/
go run main.go

✅ Swagger Docs: http://openhouse.horik.cn/swagger/index.html#/

🌐 Start Frontend

cd frontend/
pnpm dev

—

📝 License

This project is licensed under the Apache-2.0 license. See LICENSE for details.

—

📬 Contact / Contribution

We welcome contributions from researchers, developers and designers.

To contribute, fork the repository, open a pull request, or contact us via issues.

—

