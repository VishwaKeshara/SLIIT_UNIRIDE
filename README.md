# 🚍 SLIIT-UniRide

### Smart Shuttle Management System for University Students

SLIIT-UniRide is a full-stack web application designed to manage university shuttle services efficiently. It allows students to view routes, book seats, and track shuttle schedules while providing administrators with full control over routes, stops, and operations.

---

## 🧠 Project Overview

This system is developed as a university project to solve real-world transportation issues within campus environments. It provides a digital solution for managing shuttle services, improving convenience, efficiency, and accessibility for students.

---

## 🛠️ Tech Stack

### 🔹 Frontend

* React (Vite)
* Tailwind CSS
* Axios
* React Router DOM

### 🔹 Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* dotenv
* CORS

---

## ⚡ What is Vite?

Vite is a modern frontend build tool used to create fast and optimized React applications. It provides instant server start, fast hot module replacement (HMR), and optimized production builds.

---

## 📁 Project Structure

```bash
UniRide
 ├── backend
 │    ├── models
 │    ├── routes
 │    ├── controllers
 │    ├── config
 │    ├── server.js
 │    └── .env
 │
 └── frontend
      ├── src
      │    ├── components
      │    ├── pages
      │    ├── services
      │    ├── layout
      │    └── App.jsx
      ├── index.html
      ├── vite.config.js
      ├── tailwind.config.js
      └── postcss.config.js
```

---

## 🚀 Installation Guide

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/SLIIT-UniRide.git
cd SLIIT-UniRide
```

---

# 🔧 Backend Setup

### Step 1: Navigate to Backend

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

Create a `.env` file inside backend folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/uniride
```

(Use MongoDB Atlas if needed)

### Step 4: Run Backend Server

```bash
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

# 🎨 Frontend Setup

### Step 1: Navigate to Frontend

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

---

### Step 3: Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

### Step 4: Configure Tailwind

#### tailwind.config.js

```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### Step 5: Run Frontend

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔗 API Integration

Create file: `frontend/src/services/api.js`

```js
import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:5000"
});
```

---

## ✨ Features

### 👨‍🎓 Student Features

* User Registration & Login
* View Shuttle Routes
* Seat Booking System
* View Shuttle Schedule

### 🛠️ Admin Features

* Manage Routes (CRUD)
* Manage Stops
* Manage Shuttle Schedules
* Monitor Bookings

---

## 🧪 API Testing

Use:

* Thunder Client (VS Code)
* Postman

---

## 📦 Build for Production

### Frontend

```bash
npm run build
```

---

## 📌 Requirements

* Node.js (v18 or higher)
* MongoDB (Local or Atlas)
* VS Code

---

## 🚀 Future Enhancements

* Real-time Shuttle Tracking (GPS)
* Notification System
* Mobile App Integration
* Payment Gateway Integration

---

## 👨‍💻 Author

Developed as a university project for academic purposes.

---

## 📜 License

This project is intended for educational use only.

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
