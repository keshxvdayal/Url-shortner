# 🧪 Micro-SaaS – Link Analytics Dashboard

A full-stack URL shortener and analytics dashboard built as a mini Bitly clone. This Micro-SaaS project allows users to create shortened URLs and track performance data such as total clicks, device types, and geographic locations.

## 🔗 Deployed Application

👉 **Live Site:** [https://url-shortner-alpha-orpin.vercel.app](https://url-shortner-alpha-orpin.vercel.app)

---

## 🧩 Project Overview

This project allows users to:
- Shorten long URLs with optional custom aliases and expiration dates
- View a dashboard with insights including:
  - Total clicks
  - Created/expiration dates
  - Browser/device breakdown
  - Clicks over time

---

## 🔐 Authentication

- JWT-based login system
- **Credentials:**
  - **Email:** `intern@dacoid.com`
  - **Password:** `Test123`
- Multi-user support (each link is associated with a user ID)

---

## ✨ Features

### 🔧 Core Functionality

- **Authentication:**
  - Secure login with hardcoded credentials
  - JWT token storage for protected routes

- **Create Short Link:**
  - Input: long URL, optional custom alias, and expiration date
  - Generates links like: `https://yourdomain.com/x9kQ2A`

- **Analytics Dashboard:**
  - Table displaying:
    - Original URL
    - Short URL
    - Total Clicks
    - Created Date
    - Expiration Status
  - Click analytics with charts:
    - Clicks over time (line/bar)
    - Device and browser breakdown

- **Async Link Click Logging:**
  - Redirects to original URL on short link click
  - Logs:
    - Device type
    - IP Address
    - Timestamp
  - Data stored asynchronously in MongoDB

### 🎁 Bonus Features

- ✅ **QR Code** generation for each short link
- ✅ **Search & Pagination** on dashboard for improved UX

---

## 💻 Tech Stack

| Frontend      | Backend       | Database  | Styling     | Charts      |
|---------------|---------------|-----------|-------------|-------------|
| React.js      | Node.js       | MongoDB   | TailwindCSS | Chart.js / Recharts |
| Redux Toolkit | Express.js    | Mongoose  |             |             |

---
