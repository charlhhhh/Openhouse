# 🏠 OpenHouse: A Researcher Matching Platform

**OpenHouse** is an AI-powered academic social platform designed to connect researchers and foster meaningful collaborations. It offers passwordless login, intelligent partner matching, real-time chat, content sharing, and a lightweight notification system.

🌐 **Demo**: [https://openhouse.horik.cn](https://openhouse.horik.cn)

## 📦 Tech Stack

| Layer     | Technology                      |
|-----------|----------------------------------|
| Frontend  | React + Vite + TailwindCSS       |
| Backend   | Go + Gin + GORM + MySQL          |
| Database  | MySQL 8.x                        |
| Auth      | Email, GitHub, Google OAuth2     |
| AI Match  | LLM API (OpenAI / TogetherAI)    |
| Storage   | Alibaba Cloud OSS (Image CDN)    |

## 🚀 Features

### 1. ✅ User Authentication
- Passwordless login via email verification code  
- OAuth2 login via GitHub & Google  
- JWT-based authentication & authorization  
- Support for multiple account bindings (e.g., Email + GitHub)  

### 2. 👤 User Profile
- Editable user profile (nickname, gender, avatar, intro)  
- Avatar uploaded to OSS  
- Track bound login methods (email/github/google)  

### 3. 📚 Posts & Social Feed
- Create, edit, and delete posts with text and images  
- Like, favorite, comment on posts  
- Public feed with follow-based filtering  
- Anonymous “Tree Hole” mode (optional)  
- **AI-based scoring to manage the community** *(future implementation)*  

### 4. 🔍 Researcher Matching
- Users submit tags, intro, and research area to join match pool  
- Daily LLM-powered intelligent matching  
- Matches scored with AI comments and reasons  
- Results revealed once per day  
- Matching statuses: `Not Applied`, `Matching`, `Matched`, `Revealed`  

### 5. 💬 Real-time Chat (Polling)
- One-on-one chat unlocked after successful match  
- Polling-based new message retrieval  
- Structured schema with sender/receiver UUID tracking  

### 6. 🔔 Notification System
- **System notifications**: match success, likes, comments, admin messages  
- **User messages**: one-on-one chat after match  

## 🛠 Project Structure

```
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
```

## 🔧 Setup & Run

### 🧩 Prerequisites
- Go 1.20+  
- MySQL 8.0+  
- Node.js 18+ (for frontend)  
- Docker *(optional for local deployment)*  

### 📦 Install Dependencies

**Backend**:
```bash
cd backend/
go mod tidy
```

**Frontend**:
```bash
cd frontend/
pnpm install
```

### 🗃️ Run MySQL (Optional):
```bash
docker run --name openhouse-mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=openhouse \
  -p 3306:3306 \
  -d mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci
```

### ⚙️ Start Backend
```bash
cd backend/
go run main.go
```

✅ Swagger Docs: [http://openhouse.horik.cn/swagger/index.html#/](http://openhouse.horik.cn/swagger/index.html#/)

### 🌐 Start Frontend
```bash
cd frontend/
pnpm dev
```

## 📝 License

This project is licensed under the **Apache-2.0 License**.  
See the `LICENSE` file for details.

## 📬 Contact & Contribution

We welcome contributions from researchers, developers, and designers.  
To contribute:
- Fork this repository  
- Open a pull request  
- Or reach out via GitHub Issues  

Let us build the world’s largest researcher community — together.




