# OdinSocial Backend

This is the **backend server** for [OdinSocial](https://github.com/devashishchakraborty/odinsocial), a full-featured Twitter-style social media application built as part of [The Odin Project](https://www.theodinproject.com/).  
It provides a **RESTful API** and **real-time WebSocket** communication for user management, posts, messaging, and social interactions.

> **Frontend repo:** [odinsocial](https://github.com/devashishchakraborty/odinsocial)

---

## Features

- User Authentication (JWT + Refresh Tokens)
- Profile management (bio, profile picture upload via Cloudinary)
- Create, read, delete Posts
- Comments & Replies on Posts
- Follow / Unfollow users
- Bookmark Posts
- Real-time Chat via Socket.IO
- Explore users and posts by keyword
- Secure route protection using middleware

---

## 🛠️ Tech Stack

| Layer | Tools Used |
| ----- | ---------- |
| **Runtime** | Node.js + Express.js |
| **Database** | PostgreSQL with Prisma ORM |
| **Authentication** | Access & Refresh Tokens (JWT) |
| **Real-time** | Socket.IO |
| **Storage** | Cloudinary (image uploads) |
| **Caching** | Redis (for refresh tokens & session data) |
| **File Uploads** | Multer |
| **Environment** | dotenv |

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/devashishchakraborty/odinsocial-backend.git
cd odinsocial-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add:

```env
DATABASE_URL=
REDIS_URL=
CLIENT_URL="http://localhost:5173"
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_EXPIRY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 4. Run the Server

```bash
node --watch .
```

The server will run on `http://localhost:3000` by default.

