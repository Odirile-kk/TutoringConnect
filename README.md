# Tutoring Connect

Tutoring Connect is a full-stack tutoring platform that connects students, tutors, and administrators in one app. The project uses a React frontend and a Node.js/Express API backed by MongoDB.

This README is focused on running the app on Windows 10/11 and reflects the structure and scripts used in this repository.

---

## Project overview

### Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt
- Styling/UI: React components and custom CSS

### Core functionality
- Student and tutor registration/login
- Tutor profiles and subject listings
- Subject catalogue and tutor matching
- Booking management
- Availability tracking
- Ratings and feedback
- Admin dashboard and user management

---

## Requirements

Install these before you start:
- Windows 10 or Windows 11
- Git for Windows
- Node.js LTS (recommended 18+ or 20+)
- npm (included with Node.js)
- MongoDB Community Server
- VS Code (recommended)

---

## 1. Install the required software

### Install Node.js
1. Download the LTS version from:
   https://nodejs.org/
2. Run the installer.
3. Make sure the option to add Node.js to PATH is enabled.
4. Open a new PowerShell window and verify:

```powershell
node -v
npm -v
```

If the commands work, Node.js is installed correctly.

### Install Git
Download and install Git for Windows from:
https://git-scm.com/download/win

Verify:

```powershell
git --version
```

### Install MongoDB Community Server
1. Download MongoDB Community Server from:
   https://www.mongodb.com/try/download/community
2. Run the installer with the default settings.
3. Make sure the MongoDB service is set to start automatically.
4. Verify the database shell works:

```powershell
mongosh
```

If MongoDB is running correctly, the shell will open without errors.

If MongoDB is not running, open Services and start the MongoDB service, or run:

```powershell
net start MongoDB
```

> If you prefer not to run MongoDB locally, you can use MongoDB Atlas instead and replace the local connection string in your environment file.

---

## 2. Clone the repository

Open PowerShell in the folder where you want to keep the project and run:

```powershell
git clone https://github.com/Odirile-kk/TutoringConnect
cd TutoringConnect
```

If the folder name differs, use that folder instead of `TutoringConnect`.

---

## 3. Install dependencies

This project has separate frontend and backend packages, so install dependencies in both folders.

### Backend
```powershell
cd server
npm install
```

### Frontend
Open a second PowerShell window or return to the project root and run:

```powershell
cd client
npm install
```

> Do not run `npm install` in the repo root unless you specifically want a root-level package setup. The app is configured to run from `client/` and `server/` separately.

---

## 4. Set up environment files

### Backend environment
Create a file named `.env` inside the `server` folder.

Example content:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/tutoring_connect
PORT=5002
JWT_SECRET=tutorconnectsecret (we are aware that this is a security risk, however its just for the purpose of being able to run our app)
CLIENT_URL=http://localhost:5174
```

### Frontend environment
Create a file named `.env` inside the `client` folder.

Example content:

```env
VITE_API_URL=http://localhost:5002/api
```

### MongoDB Atlas option
If you are using Atlas instead of local MongoDB, set your connection string like this:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster-name.mongodb.net/tutoring_connect
PORT=5002
JWT_SECRET=tutorconnectsecret
CLIENT_URL=http://localhost:5174
```

Important notes:
- Replace placeholders with your real database credentials.
- Use a strong random value for `JWT_SECRET`.
- Keep the database name consistent with the app.
- The backend listens on port `5002` by default, and the frontend runs on `5174`.

---

## 5. Start the backend

In PowerShell, run:

```powershell
cd server
npm run dev
```

You should see the API start and connect to MongoDB. The backend will listen on:

```text
http://localhost:5002
```

A health check endpoint is also available:

```text
http://localhost:5002/api/health
```

---

## 6. Start the frontend

Open a second PowerShell window and run:

```powershell
cd client
npm run dev
```

The frontend will start with Vite and open on:

```text
http://localhost:5174
```

Open that URL in your browser to use the app.

---

## 7. Optional demo data

The backend includes a demo data seeding script.

Run this while MongoDB is running:

```powershell
cd server
npm run seed:demo
```

This adds sample course and application data for testing the application.

---

## 8. Common troubleshooting

### Node or npm is not recognized
- Close and reopen PowerShell after installation.
- Confirm the install path is in your PATH.
- Run:

```powershell
where node
where npm
```

### MongoDB is not running
- Check the MongoDB service in Windows Services.
- Start it manually:

```powershell
net start MongoDB
```

- If the shell still fails, verify the installation and service name.

### MongoDB connection failed
- Check that your `.env` file has the correct `MONGODB_URI`.
- Ensure MongoDB is running before starting the backend.
- If using Atlas, verify the username, password, cluster name, and database are all correct.

### Port already in use
If `5002` or `5174` is already in use, stop the other process or change the port in the relevant environment file and app configuration.

### PowerShell blocks scripts
If Windows blocks local scripts, open PowerShell with the execution policy temporarily relaxed for the current session:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
```

---

## 9. Recommended Windows setup

For an easier local development setup, use:
- Windows 10 or Windows 11
- VS Code with JavaScript/React extensions installed
- Git for Windows
- Node.js LTS
- MongoDB Community Server running locally or MongoDB Atlas configured

---

## 10. Project structure

```text
TutoringConnect/
├── client/                 # React frontend
│   ├── src/                # App pages, components, context, styles
│   ├── package.json        # Frontend scripts and dependencies
│   ├── vite.config.js      # Vite config
│   └── .env.example        # Frontend environment example
├── server/                 # Express backend and MongoDB logic
│   ├── routes/             # API routes
│   ├── models/             # Mongoose schemas
│   ├── middleware/         # Auth and request middleware
│   ├── data/               # Catalog and seed data
│   ├── index.js            # Server entry point
│   ├── seedDemo.js         # Demo data script
│   ├── package.json        # Backend scripts and dependencies
│   └── .env                # Local environment config
├── README.md               # Project setup guide
├── .gitignore              # Git ignore rules
└── package-lock.json       # Root lock file (not used for app runtime)
```

---

## 11. Useful development commands

From the `server` folder:
```powershell
npm.cmd run dev
npm.cmd run start
npm.cmd run seed:demo
```

From the `client` folder:
```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run preview
```

---

## 14. Final note

This repo is designed to run as two separate applications in parallel:
- the backend API on `http://localhost:5002`
- the frontend app on `http://localhost:5174`

If both are running and MongoDB is connected, the app should work correctly on a Windows machine.
