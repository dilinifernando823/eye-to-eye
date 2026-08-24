# 👁️ Eye To Eye Opticians

### A Full-Stack Optical E-Commerce Platform with AI Features

![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Chatbot-8E75B2?logo=googlegemini&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Eye To Eye Opticians is a complete online optical store built for a Sri Lankan
optician. Customers can browse and purchase spectacles, sunglasses, and
contact lenses, upload their prescriptions to get personalised lens
recommendations, virtually try on frames using their camera, book eye test
appointments, and chat with an AI assistant. The store includes a full admin
panel for managing products, orders, customers, and appointments.

---

## 📑 Table of Contents

1. [Features](#-features)
2. [Technology Stack](#-technology-stack)
3. [System Requirements](#-system-requirements)
4. [Getting External API Keys and Accounts](#-getting-external-api-keys-and-accounts)
5. [Project Setup (Step by Step)](#-project-setup-step-by-step)
6. [Environment Variables Reference](#-environment-variables-reference)
7. [Running the Project](#-running-the-project)
8. [Project Structure](#-project-structure)
9. [Key Features Explained Simply](#-key-features-explained-simply)
10. [API Documentation](#-api-documentation)
11. [Database Schema Overview](#-database-schema-overview)
12. [Deployment](#-deployment)
13. [Troubleshooting](#-troubleshooting)
14. [Academic Information](#-academic-information)
15. [License](#-license)

---

## ✅ Features

### Customer Features

- Browse spectacles, sunglasses, and contact lenses by category
- Filter products by brand, price, colour, frame shape, and lens type
- Product search
- **Virtual Try-On** — use your camera to try frames on in real time, powered by MediaPipe face tracking and a Three.js 3D frame overlay
- **Prescription Upload** — upload a PDF or image and the system automatically reads the values with OCR and recommends the right lens type
- **Manual prescription entry** — type in prescription values by hand instead
- Personalised product recommendations based on purchase history
- Add to cart and manage quantities
- Wishlist — save products for later
- Checkout with Cash on Delivery, using your saved prescription automatically
- **Loyalty points** — earn points on every purchase and appointment, redeem them at checkout
- Book eye test appointments with live slot availability
- **AI Chatbot (Iris)** — powered by Google Gemini, answers questions about products, prescriptions, orders, and store information, personalised for logged-in customers
- Customer account — view orders, track status, manage saved prescriptions, appointments, wishlist, loyalty history, and profile settings

### Admin Panel Features

- Dashboard with revenue charts, order statistics, and popular products
- Full product management — add, edit, delete products with image upload
- Virtual Try-On image management — mark a specific product image as the try-on preview
- Order management — view all orders, update status (pending → processing → dispatched → delivered), see the customer's structured prescription values
- Appointment management — list view, confirm or cancel appointments
- Customer management — view profiles, adjust loyalty points manually
- Admin account management — create and manage admin users
- Site settings — featured products, homepage banners, store information, loyalty programme rates

---

## 🛠 Technology Stack

Explained in plain English — what each tool does and why it was chosen.

### Frontend

| Technology | Purpose | Why |
|---|---|---|
| Next.js 16 (React 19) | Builds the user interface and web pages | Fast, modern, used by major companies |
| TypeScript | Programming language for the frontend | Catches errors before they happen |
| Tailwind CSS 4 | Makes the website look good | Fast to write, consistent design |
| Zustand | Manages data shared across pages (cart, auth) | Simple and lightweight |
| TanStack React Query | Fetches data from the server | Handles loading, caching, and errors automatically |
| React Hook Form + Zod | Handles forms and validates input | Secure and reliable form handling |
| Axios | Sends requests to the backend | Industry standard HTTP client |
| Recharts | Displays charts on the admin dashboard | Easy to use charting library |
| date-fns | Formats dates and times | Lightweight and reliable |
| lucide-react | Icons used throughout the interface | Clean, consistent icon set |
| react-hot-toast | Shows notification pop-ups | Simple and attractive notifications |
| @mediapipe/tasks-vision | Detects face landmarks for Virtual Try-On | Google's open source AI vision tool |
| @imgly/background-removal | Removes the background from try-on photos | Runs entirely in the browser, no server needed |
| Three.js | Renders the 3D glasses frame on the camera feed | Industry standard 3D library |
| @dnd-kit | Drag-and-drop reordering in the admin panel | Accessible, modern drag-and-drop |
| react-dropzone | Drag-and-drop file uploads | Simple, accessible upload zones |

### Backend

| Technology | Purpose | Why |
|---|---|---|
| Python 3.11 | Programming language for the server | Readable, widely used |
| FastAPI | Builds the REST API | Modern, fast, automatic documentation |
| SQLAlchemy 2.0 | Talks to the database from Python | Reliable and well-established |
| Alembic | Manages database structure changes | Tracks and applies database updates safely |
| Pydantic v2 | Validates data coming into the API | Prevents bad data from causing errors |
| PyMySQL | Connects Python to MySQL | Lightweight MySQL driver |
| passlib + bcrypt | Hashes (encrypts) passwords | Industry standard password security |
| python-jose | Creates and verifies JWT tokens | Secure login tokens |
| pytesseract | OCR — reads text from prescription images | Wraps Google's Tesseract engine |
| Pillow | Processes and enhances images before OCR | Standard Python image library |
| pdf2image | Converts PDF prescriptions to images | Needed for PDF file support |
| google-genai | Calls Google Gemini AI for the chatbot | Powers the Iris assistant |
| cloudinary | Stores and serves images and files | Professional file storage |
| python-multipart | Handles file uploads | Required by FastAPI for file handling |

### Database

| Technology | Purpose | Why |
|---|---|---|
| MySQL 8 | Stores all application data | Reliable, widely used relational database |

### Infrastructure and Tools

| Technology | Purpose | Why |
|---|---|---|
| Vercel | Hosts the frontend website | Free tier, instant deployment |
| Railway | Hosts the backend API and MySQL | Simple deployment for Python apps |
| Cloudinary | Stores product images and prescriptions | Free tier, automatic optimisation |
| GitHub | Version control and code storage | Industry standard |
| Git | Tracks all code changes | Required for collaboration |

---

## 💻 System Requirements

What you need installed on your computer before running this project:

```
- Node.js version 18 or higher (runs the frontend)
  Download from: https://nodejs.org

- Python version 3.11 (runs the backend)
  Download from: https://python.org

- MySQL 8.0 (the database)
  Download from: https://dev.mysql.com/downloads/mysql/
  (Or use XAMPP, which bundles MySQL: https://www.apachefriends.org)

- Git (for downloading the code)
  Download from: https://git-scm.com

- Tesseract OCR (reads text from prescription images)
  Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
  Default install path: C:\Program Files\Tesseract-OCR\

- Poppler (converts PDF prescriptions to images)
  Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases
  Extract anywhere and note the path to its "Library\bin" folder
```

> ⚠️ Tesseract and Poppler are only needed if you want prescription
> file **upload with OCR** to work. The rest of the site (including
> manual prescription entry) works fine without them.

---

## 🔑 Getting External API Keys and Accounts

Step-by-step instructions for each external service the project needs.

### Cloudinary (for image storage)

```
1. Go to cloudinary.com and click "Sign Up Free"
2. Fill in your name, email, and password
3. After signing in, you will see your Dashboard
4. Find and copy these three values:
   - Cloud Name (example: dxy7abc12)
   - API Key (example: 123456789012345)
   - API Secret (example: abcdefghijk_lmno-pqrstuvwxyz)
5. You will paste these into the .env file later
```

### Google Gemini API Key (for the AI chatbot)

```
1. Go to aistudio.google.com
2. Sign in with your Google account
3. Click "Get API Key" in the top right corner
4. Click "Create API Key"
5. Select "Create API key in new project"
6. Copy the key (it starts with "AIza...")
7. This is FREE — no credit card needed
8. You will paste this into the .env file later
```

### Gmail App Password (for sending order confirmation emails)

```
Why do we need this?
The system sends automated emails when customers place orders or
book appointments. Gmail blocks regular passwords for automated
use — you need a special "App Password" instead.

Steps:
1. Log in to your Gmail account at gmail.com
2. Click your profile picture (top right) → "Manage your Google Account"
3. Click the "Security" tab on the left
4. Find "2-Step Verification" and make sure it is turned ON
   (If it is off, turn it on first — Google requires this)
5. Go back to Security and scroll down to find "App passwords"
   (It only appears after 2-Step Verification is enabled)
6. Click "App passwords"
7. In the "Select app" dropdown, choose "Mail"
8. In the "Select device" dropdown, choose "Windows Computer"
9. Click "Generate"
10. Google will show you a 16-character password like: abcd efgh ijkl mnop
11. Copy this password (remove the spaces: abcdefghijklmnop)
12. You will paste this into the .env file later

Note: Your normal Gmail password will NOT work here — only the App Password.
```

---

## 🚀 Project Setup (Step by Step)

### Step 1 — Download the Project

```
Open Command Prompt (press Windows key, type "cmd", press Enter)

cd C:\
git clone https://github.com/dilinifernando823/eye-to-eye.git
cd eye-to-eye
```

### Step 2 — Set Up the Database

```
1. Open MySQL Workbench (or phpMyAdmin if using XAMPP)
2. Connect to your MySQL server
3. Create a new database by running:

   CREATE DATABASE eyetoeye CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

4. Note down your MySQL username and password
   (Default XAMPP username is: root, with no password)
```

### Step 3 — Set Up the Backend

```
cd C:\eye-to-eye\backend

Create a virtual environment (keeps project packages separate):
python -m venv venv

Activate it:
venv\Scripts\activate
(You should see "(venv)" appear at the start of the line)

Install all required packages:
pip install -r requirements.txt

This installs FastAPI, SQLAlchemy, and all other backend libraries.
```

### Step 4 — Create the Backend Environment File

```
In the backend folder, create a new file named ".env"
Open it in Notepad and fill in your values.
See "Environment Variables Reference" below for exactly what to put
in each field.
```

### Step 5 — Set Up the Database Tables

```
In Command Prompt (with venv still activated, inside the backend folder):

alembic upgrade head

This creates all the database tables automatically. You should see
messages showing each migration being applied.
```

### Step 6 — Create Your First Admin Account

```
There is no separate admin-creation script — an admin account is
just a normal account with its role changed to "admin":

1. Start the backend and frontend (see "Running the Project" below)
2. Go to http://localhost:3000/register and create an account normally
3. In MySQL Workbench (or phpMyAdmin), run:

   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

4. Log out and log back in on the website
5. Visit http://localhost:3000/admin/dashboard
```

### Step 7 — Set Up the Frontend

```
Open a NEW Command Prompt window:

cd C:\eye-to-eye\frontend
npm install
```

### Step 8 — Create the Frontend Environment File

```
In the frontend folder, create a new file named ".env.local"
Open it in Notepad and add:

NEXT_PUBLIC_API_URL=http://localhost:8000

This tells the frontend where to find the backend.
```

---

## ⚙️ Environment Variables Reference

### Backend `.env` file (`backend/.env`)

```env
# ─── DATABASE ───────────────────────────────────────────────
# Your MySQL connection string
# Replace: your_username, your_password
DATABASE_URL=mysql+pymysql://your_username:your_password@localhost:3306/eyetoeye
# Example (XAMPP default): mysql+pymysql://root:@localhost:3306/eyetoeye

# ─── SECURITY ───────────────────────────────────────────────
# A long random string used to sign login tokens
# Generate one at: https://generate-secret.vercel.app/64
SECRET_KEY=paste-a-long-random-string-here-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ─── CLOUDINARY (Image Storage) ─────────────────────────────
# Get these from your Cloudinary dashboard at cloudinary.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ─── EMAIL (Gmail) ──────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-address@gmail.com
# The 16-character App Password from Gmail — NOT your regular password
SMTP_PASSWORD=your-16-character-app-password

# ─── FRONTEND URL (for CORS) ────────────────────────────────
FRONTEND_URL=http://localhost:3000

# ─── TESSERACT OCR (optional — needed for prescription upload) ─
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
POPPLER_PATH=C:\poppler\Library\bin

# ─── GOOGLE GEMINI AI (Chatbot) ─────────────────────────────
# Your Gemini API key from aistudio.google.com — this is FREE
GOOGLE_API_KEY=your-gemini-api-key-starting-with-AIza
```

### Frontend `.env.local` file (`frontend/.env.local`)

```env
# URL of the backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> ⚠️ Neither `.env` nor `.env.local` is committed to Git — both are
> listed in `.gitignore`. Never put real secrets in this README or
> commit them anywhere in the repository.

---

## ▶️ Running the Project

You need **two** Command Prompt windows open at the same time.

```
WINDOW 1 — Start the Backend:
cd C:\eye-to-eye\backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

Wait until you see: "Uvicorn running on http://127.0.0.1:8000"

WINDOW 2 — Start the Frontend:
cd C:\eye-to-eye\frontend
npm run dev

Wait until you see: "Ready" and a localhost:3000 URL
```

Now open your browser:

| URL | What it is |
|---|---|
| http://localhost:3000 | The website |
| http://localhost:8000/docs | Interactive API documentation (Swagger UI) |
| http://localhost:3000/admin/dashboard | Admin panel (after promoting a user to admin) |

---

## 📁 Project Structure

```
eye-to-eye/
│
├── backend/                    ← Python FastAPI backend
│   ├── app/
│   │   ├── core/                ← Configuration, security, dependencies
│   │   ├── models/               ← Database table definitions
│   │   ├── routers/              ← API endpoints (auth, products, orders...)
│   │   │   └── admin/             ← Admin-only endpoints
│   │   ├── schemas/               ← Data validation shapes
│   │   ├── services/              ← Business logic (OCR, AI, email, Cloudinary)
│   │   └── main.py                ← FastAPI application entry point
│   ├── alembic/                  ← Database migration files
│   ├── scripts/                  ← One-off helper scripts (seed data, etc.)
│   ├── requirements.txt          ← Python package list
│   └── .env                      ← Your secret configuration (not in Git)
│
├── frontend/                   ← Next.js React frontend
│   ├── src/
│   │   ├── app/                  ← Pages (App Router)
│   │   │   ├── account/            ← Customer account pages
│   │   │   ├── prescription/       ← Prescription upload / results flow
│   │   │   ├── product/            ← Product detail pages
│   │   │   └── admin/              ← Admin panel pages
│   │   ├── components/
│   │   │   ├── layout/              ← Header, Footer, SiteChrome, CartDrawer
│   │   │   ├── shop/                ← ProductCard and other shop UI
│   │   │   ├── admin/               ← Admin panel components
│   │   │   ├── ar/                  ← Virtual Try-On component
│   │   │   └── ai/                  ← Iris AI chatbot widget
│   │   ├── hooks/                  ← React Query data fetching hooks
│   │   ├── store/                  ← Zustand state stores (cart, auth)
│   │   ├── types/                  ← TypeScript type definitions
│   │   └── lib/                    ← Utilities (Axios instance, helpers)
│   ├── public/                   ← Static files (images, icons)
│   ├── package.json              ← Node.js package list
│   └── .env.local                ← Frontend configuration (not in Git)
│
├── README.md                   ← This file
└── .gitignore                  ← Files Git should not track
```

---

## 💡 Key Features Explained Simply

**Virtual Try-On**
Customers click "Virtual Try-On" on any frame and their device camera
activates. The system uses Google's MediaPipe technology to detect their
face in real time and overlays a 3D model of the glasses frame on their
face using Three.js. This lets them see how frames look before buying,
without visiting the store.

**Prescription Upload and Lens Recommendation**
Customers upload a photo or scan of their prescription from their
optometrist. The system uses Tesseract OCR (a text-reading engine) to
read the values (sphere, cylinder, axis, addition, pupillary distance).
It then applies a set of optical rules to work out which lens type the
customer needs — Single Vision, Bifocal, or Frame Only — and shows them
in-stock frames with that lens type. Customers can correct any misread
values by hand before shopping.

**AI Chatbot — Iris**
A chat window appears at the bottom right of every customer page.
Customers can ask Iris (the AI assistant) any question about products,
lens types, their prescription, order status, appointments, or the
store. Iris is powered by Google Gemini and is personalised — when a
customer is logged in, Iris knows their name, their active prescription,
their most recent order status, and their loyalty points balance.

**Collaborative Filtering Recommendations**
The system analyses purchase patterns across all customers to make
product recommendations. If many customers who bought the same product
as you also bought a different product, that product is recommended to
you. For new customers with no history, the most popular products
site-wide are shown instead. This works entirely with SQL database
queries — no external machine learning library needed.

**Loyalty Points**
Customers earn points automatically:
- 1 point for every LKR 100 spent on an order
- 5 points for booking an eye test appointment

Points can be redeemed at checkout — each point is worth LKR 0.10. The
full history of earned and redeemed points is visible in the customer
account.

---

## 📘 API Documentation

```
When the backend is running, visit:
http://localhost:8000/docs

This shows an interactive list of every API endpoint, what data it
accepts, and what it returns. You can test endpoints directly from
the browser — no extra tools needed.
```

A few key endpoint groups, all under `http://localhost:8000`:

| Prefix | Covers |
|---|---|
| `/api/auth` | Register, login, logout, refresh token, current user |
| `/api/products` | Browse, filter, and search products |
| `/api/cart` | Shopping cart |
| `/api/wishlist` | Saved products |
| `/api/orders` | Checkout and order history |
| `/api/prescriptions` | Upload, manual entry, list, and manage prescriptions |
| `/api/appointments` | Eye test booking and slot availability |
| `/api/loyalty` | Points balance and transaction history |
| `/api/recommendations` | Personalised and popular product suggestions |
| `/api/ai` | Chat with Iris |
| `/api/admin/*` | Admin-only product, order, appointment, and customer management |

---

## 🗄 Database Schema Overview

| Table | Stores |
|---|---|
| `users` | Customer and admin accounts |
| `products` | Spectacles, sunglasses, contact lens frames |
| `product_images` | Photos of each product (one can be the try-on preview) |
| `product_variants` | Each lens type option for a product (with price and stock) |
| `product_views` | Product view history, used for recommendations |
| `orders` | Customer purchases |
| `order_items` | Individual items within each order |
| `cart_items` | Items in a customer's shopping cart |
| `wishlist_items` | Products a customer has saved for later |
| `prescriptions` | Uploaded/manual prescriptions with extracted OCR values and lens recommendation |
| `appointments` | Eye test bookings |
| `loyalty_transactions` | Points earned and redeemed history |
| `site_settings` | Admin-configurable store settings |
| `banners` | Homepage promotional images |

---

## 🌍 Deployment

### Frontend — Deploy to Vercel

```
1. Go to vercel.com and sign up with your GitHub account
2. Click "Add New Project"
3. Select the eye-to-eye repository
4. Set Root Directory to: frontend
5. Add environment variables:
   NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
6. Click Deploy
```

### Backend — Deploy to Railway

```
1. Go to railway.app and sign up with your GitHub account
2. Click "New Project" → "Deploy from GitHub repo"
3. Select the eye-to-eye repository
4. Set the Root Directory to: backend
5. Add all environment variables from your .env file
6. Railway will detect Python and deploy automatically
   (the Procfile runs migrations before starting the server)
7. Copy the Railway URL (e.g. https://eye-to-eye-backend.railway.app)
8. Update NEXT_PUBLIC_API_URL in Vercel to this URL
```

---

## 🧯 Troubleshooting

```
Problem: "tesseract is not installed or it's not in your PATH"
Solution: Check that Tesseract is installed at
          C:\Program Files\Tesseract-OCR\tesseract.exe
          and that TESSERACT_CMD in .env points to this exact path.
          (Prescription file upload won't work without it, but the
          rest of the site — including manual prescription entry —
          will still run fine.)

Problem: "Can't connect to MySQL server"
Solution: Make sure MySQL is running (start it via XAMPP or your
          MySQL service). Verify DATABASE_URL in .env matches your
          MySQL username, password, and that the "eyetoeye" database
          exists.

Problem: "ModuleNotFoundError: No module named 'xxx'"
Solution: Make sure you activated the virtual environment:
          venv\Scripts\activate
          Then run: pip install -r requirements.txt

Problem: "[WinError 10013]" when starting uvicorn
Solution: Port 8000 is already in use by another process (often a
          leftover backend from a previous run). Find and stop it,
          or start uvicorn on a different port with --port 8001
          (and update NEXT_PUBLIC_API_URL to match).

Problem: CORS error in the browser console
Solution: The frontend URL is not in the backend's allowed origins.
          Check FRONTEND_URL in backend/.env matches the URL you're
          opening the site from (e.g. http://localhost:3000).

Problem: "GOOGLE_API_KEY not set" or Iris always replies with an
         error message
Solution: Check that GOOGLE_API_KEY in .env is correct and the
          backend was restarted after adding it. Get a new key from
          aistudio.google.com if needed.

Problem: Frontend shows "Network Error" / can't reach the API
Solution: Make sure the backend is running on port 8000, and that
          NEXT_PUBLIC_API_URL in .env.local is http://localhost:8000

Problem: Emails not sending
Solution: Check SMTP_PASSWORD is the 16-character Gmail App Password
          (NOT your regular Gmail password), and that 2-Step
          Verification is enabled on the Gmail account.
```

---

## 🎓 Academic Information

```
Module:       CIS6035 Final Year Project
University:   Cardiff Metropolitan University (through ICBT Campus)
Student:      Muthuthanthrige Dilini Subodha Fernando
Student ID:   CL/BSCSD/33/126 (st20306001)
Supervisor:   Dr. Gayan Galhena
Year:         2026
```

### Acknowledgements

- **Dr. Gayan Galhena** — Module Lecturer and Supervisor
- **Eye To Eye Opticians** — For providing business requirements and product information
- **Cardiff Metropolitan University / ICBT Campus** — For academic support
- **Google MediaPipe Team** — For the face-tracking library powering Virtual Try-On

---

## 📄 License

MIT License — free to use for academic and educational purposes.

---

<div align="center">

**Eye To Eye Opticians** — Developed by Muthuthanthrige Dilini Subodha Fernando

*CL/BSCSD/33/126 | Cardiff Metropolitan University | CIS6035 Final Year Project*

</div>
