# Tutoring Connect

This project is a full-stack tutoring app built with React on the front end and Node.js/Express with MongoDB on the back end.

This guide walks you through the full setup on both macOS and Windows so someone else can get the project running from a clean machine.

---

## 1. Install the required software

### Required tools
- Node.js LTS (18+ or 20+ recommended)
- npm (comes with Node.js)
- Git
- MongoDB Community Server or a MongoDB Atlas account
- VS Code (recommended)

### macOS
1. Install Homebrew if you do not already have it:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install Node.js and npm:
   ```bash
   brew install node
   ```

3. Verify the installs:
   ```bash
   node -v
   npm -v
   ```

4. Install MongoDB Community Edition:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community@7.0
   ```

5. Start MongoDB:
   ```bash
   brew services start mongodb/brew/mongodb-community
   ```

6. Check that MongoDB is running:
   ```bash
   mongosh
   ```

### Windows
1. Install Node.js LTS from:
   https://nodejs.org/

2. During installation, make sure the option to add Node.js to PATH is enabled.

3. Open a new PowerShell or Command Prompt and verify:
   ```powershell
   node -v
   npm -v
   ```

4. Install MongoDB Community Server from:
   https://www.mongodb.com/try/download/community

5. Use the default setup wizard and keep the default service settings so MongoDB starts automatically.

6. Verify MongoDB is running:
   ```powershell
   mongosh
   ```

If you do not want to run MongoDB locally, you can use MongoDB Atlas instead. In that case, skip the local MongoDB installation and use your Atlas connection string in the `.env` file.

---

## 2. Clone the project

Open a terminal and run:

```bash
git clone <your-repository-url>
cd TutoringConnect_Full_Commentated
```

If you already have the project folder, open it in VS Code and use the integrated terminal.

---

## 3. Install project dependencies

Open two terminals:

### Terminal 1: server
```bash
cd server
npm install
```

### Terminal 2: client
```bash
cd client
npm install
```

Do not install dependencies in the project root unless the project specifically requires it. This app uses separate dependencies for the client and the server.

---

## 4. Set up the environment file

Create a file named `.env` inside the `server` folder by copying `server/.env.example`, then update its values as needed.

Example content:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/tutoring_connect
PORT=5001
JWT_SECRET=your-strong-secret-key
```

### If using MongoDB Atlas
Use a connection string like this instead:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/tutoring_connect
PORT=5001
JWT_SECRET=your-strong-secret-key
```

Important:
- Replace `USERNAME` and `PASSWORD` with your actual Atlas credentials.
- Keep the database name consistent with the app.
- Use a secure random value for `JWT_SECRET`.

---

## 5. Start the backend

From the project root:

```bash
cd server
npm run dev
```

You should see output showing the server started and MongoDB connected.

The API should run on:
- http://localhost:5001

---

## 6. Start the frontend

Open a second terminal and run:

```bash
cd client
npm run dev
```

Then open the app in the browser:
- http://localhost:5173

---

## 7. Common setup checks

### Check if the backend is healthy
Open this URL in your browser:

```text
http://localhost:5001/api/health
```

The response should be JSON indicating the API is running.

### Check if Vite is serving the app
Open:

```text
http://localhost:5173
```

If the page loads, the frontend is running correctly.

---

## 8. Make yourself an admin user

After registering a normal account in the app:

1. Open MongoDB shell:
   ```bash
   mongosh
   ```

2. Connect to the database:
   ```javascript
   use tutoring_connect
   ```

3. Update your user to admin:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

This lets you access admin features in the application.

---

## 9. Troubleshooting

### Node or npm is not recognized
- Restart your terminal after installing Node.js.
- On macOS, check your PATH if `node` is still not recognized.
- On Windows, ensure Node.js was added to PATH during installation.

### MongoDB connection failed
- Make sure MongoDB is running.
- Check that the `.env` file contains the correct `MONGODB_URI`.
- If using Atlas, confirm the username, password, and cluster name are all correct.

### Port already in use
If port 5001 or 5173 is already occupied, stop the other process or change the port in the app config and environment variables.

---

## 10. Recommended machine setup

For a smooth local development setup, use:
- macOS or Windows 10/11
- VS Code with the JavaScript/React extensions
- Git installed and configured
- Node.js LTS installed
- MongoDB running locally or Atlas configured

---

## 11. Project structure overview

- `client/` - React frontend
- `server/` - Express API and MongoDB logic
- `README.md` - setup instructions

The code contains comments explaining how each part of the system is implemented and where the main tutoring features are handled.
