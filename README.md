---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:
- Node.js 18+
- Python 3.11+
- MySQL 8.0
- Git

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/dilinifernando823/eye-to-eye.git
cd eye-to-eye/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and add your API URL
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run development server
npm run dev
```

Frontend runs at: **http://localhost:3000**

### Backend Setup

```bash
# Go to backend folder
cd eye-to-eye/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env and fill in all values (see Environment Variables section)

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**

API Documentation: **http://localhost:8000/docs**

---

## ⚙️ Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)

```env
# Database
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/eyetoeye

# JWT Authentication
SECRET_KEY=your-secret-key-generate-with-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Cloudinary (get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Anthropic Claude API (get from anthropic.com)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new customer |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/refresh | Refresh access token |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/me | Update profile |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products | Get all products with filters |
| GET | /api/products/{id} | Get product detail |
| GET | /api/products/featured | Get featured products |
| GET | /api/products/search | Search products |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/orders | Create new order |
| GET | /api/orders | Get my orders |
| GET | /api/orders/{id} | Get order detail |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/cart | Get cart |
| POST | /api/cart | Add to cart |
| PUT | /api/cart/{id} | Update quantity |
| DELETE | /api/cart/{id} | Remove item |
| DELETE | /api/cart | Clear cart |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/appointments/slots | Get available slots |
| POST | /api/appointments | Book appointment |
| GET | /api/appointments | Get my appointments |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/ai/chat | Chat with AI assistant |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/admin/products | Manage products |
| GET | /api/admin/orders | Manage orders |
| GET | /api/admin/appointments | Manage appointments |
| GET | /api/admin/customers | Manage customers |
| GET | /api/admin/analytics/summary | Dashboard stats |

---

## 🧪 Running Tests

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Linting

```bash
cd frontend
npm run lint
```

---

## 🌍 Deployment

### Frontend — Vercel
1. Connect GitHub repo to Vercel
2. Set Root Directory to `frontend`
3. Add environment variable `NEXT_PUBLIC_API_URL`
4. Deploy

### Backend — Railway
1. Connect GitHub repo to Railway
2. Add MySQL database service
3. Add all environment variables
4. Deploy (Procfile handles migrations automatically)

---

## 📸 Screenshots

> Screenshots will be added after full deployment

---

## 🔮 Future Enhancements

- PayHere payment gateway integration
- More GLTF glasses models for Virtual Try-On
- Push notifications for order status updates
- Mobile app version (React Native)
- Multi-branch support for multiple shop locations
- WhatsApp chatbot integration

---

## 📄 License

This project is developed for academic purposes as part of the 
BSc Computing and Software Development Final Year Project at 
Cardiff Metropolitan University.

---

## 🙏 Acknowledgements

- **Dr. Gayan Galhena** — Module Lecturer and Supervisor
- **Eye To Eye Opticians** — For providing business requirements 
  and product information
- **Cardiff Metropolitan University / ICBT Campus** — For academic support
- **Google MediaPipe Team** — For the FaceMesh library
- **Anthropic** — For the Claude AI API

---

<div align="center">

**Eye To Eye Opticians** — Developed by Muthuthanthrige Dilini Subodha Fernando

*CL/BSCSD/33/126 | Cardiff Metropolitan University | CIS6035 Final Project*

</div>