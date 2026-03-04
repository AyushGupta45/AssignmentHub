# AssignmentHub v2

A full-stack assignment management platform where admins create assignments, students submit work, and admins evaluate submissions — with notifications, file uploads, and real-time dashboards.

## Tech Stack

| Layer    | Technology                                              |
| -------- | ------------------------------------------------------- |
| Frontend | React 19, Vite, Tailwind CSS v4, shadcn/ui, Redux      |
| Backend  | Node.js, Express, Mongoose (MongoDB), JWT, Cloudinary   |
| Auth     | httpOnly cookies, bcrypt, role-based (student / admin)   |
| Uploads  | Multer → Cloudinary (memory storage, 10 MB limit)       |

## Project Structure

```
version2/
├── client/          # React SPA
│   ├── src/
│   │   ├── components/   # UI components, layouts, guards
│   │   ├── hooks/        # useFileUpload
│   │   ├── lib/          # axios api client, utils
│   │   ├── pages/        # route pages
│   │   └── redux/        # Redux Toolkit + persist
│   └── index.html
├── server/          # Express REST API
│   ├── controllers/
│   ├── middleware/   # auth, upload, validation, rate limiting
│   ├── models/       # Mongoose schemas
│   ├── routes/
│   └── utils/
└── package.json     # root (concurrently dev script)
```

## Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Cloudinary account (free tier works)

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd version2
npm run install-all
```

This runs `npm install` in the root, `server/`, and `client/` folders.

### 2. Configure environment variables

Copy the example files and fill in your values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**Server `.env`:**

| Variable                 | Description                                  |
| ------------------------ | -------------------------------------------- |
| `MONGO_URI`              | MongoDB connection string                    |
| `JWT_SECRET`             | Random secret for signing JWTs               |
| `CLOUDINARY_CLOUD_NAME`  | Cloudinary cloud name                        |
| `CLOUDINARY_API_KEY`     | Cloudinary API key                           |
| `CLOUDINARY_API_SECRET`  | Cloudinary API secret                        |
| `CLIENT_URL`             | Frontend URL for CORS (default: `http://localhost:5173`) |
| `PORT`                   | Server port (default: `3000`)                |
| `NODE_ENV`               | `development` or `production`                |

### 3. Run in development

```bash
npm run dev
```

This starts both the backend (port 3000) and frontend (port 5173) concurrently. The Vite dev server proxies `/api` requests to the Express server.

### 4. Create an admin account

Admin accounts are created directly in the database (or via the seed script). Set a user's `role` field to `"admin"` in MongoDB. Admins log in through the same sign-in form as students — the app detects the role and redirects accordingly.

## Available Scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start both client & server in dev mode   |
| `npm run install-all`  | Install deps for root, server, and client |
| `cd client && npm run build` | Production build of the frontend   |
| `cd server && npm start`     | Start server in production mode    |

## Features

- **Authentication** — Email/password with JWT in httpOnly cookies, role-based access (student/admin)
- **Assignments** — Admin CRUD, due dates, max score, file attachments
- **Submissions** — Students upload files (Cloudinary), duplicate prevention, status tracking
- **Evaluation** — Admin scores submissions with feedback, notifications sent to students
- **Notifications** — Real-time bell with polling, mark read / mark all read
- **Dashboards** — Stats, upcoming deadlines, recent evaluations, progress overviews
- **Dark Mode** — Theme toggle (sun/moon), persisted in localStorage
- **Responsive** — Collapsible admin sidebar, horizontally scrollable tables, mobile-first grids
- **Security** — CORS whitelist, rate limiting on auth (5/min), input validation (express-validator), bcrypt

## API Endpoints

### Auth
- `POST /api/auth/signup` — Student registration
- `POST /api/auth/signin` — Student login
- `POST /api/auth/admin-login` — Admin login/registration
- `POST /api/auth/signout` — Clear cookie
- `GET  /api/auth/me` — Current user

### Assignments
- `POST   /api/assignments` — Create (admin)
- `GET    /api/assignments` — List with pagination
- `GET    /api/assignments/:id` — Single assignment
- `PUT    /api/assignments/:id` — Update (admin)
- `DELETE /api/assignments/:id` — Delete + cascade (admin)
- `PATCH  /api/assignments/:id/close` — Toggle active/closed (admin)

### Submissions
- `POST   /api/assignments/:id/submissions` — Submit (student)
- `GET    /api/assignments/:id/submissions` — List (admin)
- `GET    /api/assignments/:id/submissions/mine` — Student's own
- `PATCH  /api/assignments/:id/submissions/:sid/evaluate` — Evaluate (admin)
- `DELETE /api/assignments/:id/submissions/:sid` — Delete

### Notifications
- `GET   /api/notifications` — List with unread count
- `PATCH /api/notifications/read-all` — Mark all read
- `PATCH /api/notifications/:id/read` — Mark one read

### User
- `PUT    /api/user/profile` — Update name/avatar
- `PUT    /api/user/password` — Change password
- `GET    /api/user/students` — List students + stats (admin)
- `DELETE /api/user/account` — Delete own account
- `DELETE /api/user/:id` — Delete student (admin)

### Upload
- `POST /api/upload` — File upload → Cloudinary

## License

MIT
