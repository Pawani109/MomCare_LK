# 🌸 MomCare LK

### A Digital Maternal Healthcare & Pregnancy Support Platform

**MomCare LK** is a full-stack web application designed to support mothers and expectant mothers throughout their pregnancy journey. The platform provides access to pregnancy information, wellbeing resources, healthcare services, appointments, location-based healthcare facilities, and personalized maternal-care features through a user-friendly digital platform.

---

## 📌 Table of Contents

* [About the Project](#-about-the-project)
* [Objectives](#-objectives)
* [Key Features](#-key-features)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [Project Structure](#-project-structure)
* [Prerequisites](#-prerequisites)
* [Installation & Setup](#-installation--setup)
* [Environment Variables](#-environment-variables)
* [Running the Application](#-running-the-application)
* [Database Setup](#-database-setup)
* [API & Integrations](#-api--integrations)
* [Security](#-security)
* [Future Enhancements](#-future-enhancements)
* [Contributing](#-contributing)
* [License](#-license)

---

## 🌷 About the Project

Pregnancy can be a challenging period where mothers need reliable health information, timely medical support, appointment management, and access to healthcare services.

**MomCare LK** aims to provide these services through a centralized web-based platform.

The application follows a client-server architecture:

* **Frontend** – React-based user interface
* **Backend** – Node.js and Express REST API
* **Database** – MySQL
* **Authentication** – JWT-based authentication
* **External Services** – Google Maps/Places, SMS and email services

The repository is organized into separate `frontend` and `backend` applications.

---

## 🎯 Objectives

The main objectives of MomCare LK are to:

* Provide accessible pregnancy and maternal-care information.
* Help users monitor their pregnancy journey.
* Provide weekly pregnancy-related information.
* Support healthcare appointment management.
* Help users find healthcare facilities and relevant locations.
* Provide maternal wellbeing and educational resources.
* Provide secure user authentication.
* Improve communication between users and healthcare-related services.
* Provide a centralized digital platform for maternal healthcare support.

---

## ✨ Key Features

### 👩‍🍼 Pregnancy Tracker

* Pregnancy week tracking
* Weekly pregnancy information
* Pregnancy development resources
* Visual content for different pregnancy stages
* Pregnancy-related educational materials

### 📅 Appointment Management

Users can manage healthcare appointments through the platform.

Features include:

* Creating appointments
* Viewing appointments
* Managing appointment information
* Appointment-related backend services

The backend includes a dedicated appointment migration and database structure.

### 🏥 Healthcare Services

The platform supports healthcare-related information and services, helping users access relevant maternal-care resources.

### 📍 Location & Healthcare Facility Search

Google Maps/Places integration can be used to help users locate relevant healthcare facilities and services.

### 💗 Wellbeing Resources

The application includes wellbeing-related educational video content and resources to support mothers during pregnancy.

### 🤖 Assistant / Support Feature

The project includes an assistant-bot video/resource component designed to support the user experience and provide guidance.

### 🔐 Authentication & Authorization

The backend uses:

* JSON Web Tokens (JWT)
* Password hashing with `bcryptjs`
* Protected backend functionality
* Environment-based secret configuration

### 📱 Notifications

The backend includes integrations for:

* SMS notifications using Text.lk
* SMS/communication functionality using Twilio
* Email-based forgot-password OTP functionality through EmailJS

### 🗄️ Database Management

The project uses MySQL and includes:

* Database schema
* Seed data
* Database migrations
* Reset scripts
* Connection pooling

---

## 🛠️ Technology Stack

### Frontend

| Technology     | Purpose                |
| -------------- | ---------------------- |
| React          | User interface         |
| Vite           | Development/build tool |
| React Router   | Client-side routing    |
| Axios          | API communication      |
| Tailwind CSS   | Styling                |
| Flowbite React | UI components          |
| React Toastify | Notifications          |
| Font Awesome   | Icons                  |

The frontend dependencies and scripts are defined in `frontend/package.json`.

### Backend

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Node.js    | Backend runtime           |
| Express.js | REST API framework        |
| MySQL      | Database                  |
| mysql2     | MySQL connectivity        |
| JWT        | Authentication            |
| bcryptjs   | Password hashing          |
| Multer     | File uploads              |
| CORS       | Cross-origin requests     |
| dotenv     | Environment configuration |
| Twilio     | Communication services    |
| Text.lk    | SMS services              |

These backend dependencies are defined in `backend/package.json`.

### External Services

* Google Maps / Google Places API
* EmailJS
* Text.lk
* Twilio

---

## 🏗️ System Architecture

```text
                   ┌─────────────────────────┐
                   │       MomCare LK        │
                   │       Web Platform      │
                   └────────────┬────────────┘
                                │
                                ▼
                   ┌─────────────────────────┐
                   │      React Frontend     │
                   │       + Vite            │
                   │       + Tailwind CSS    │
                   └────────────┬────────────┘
                                │
                         REST API / Axios
                                │
                                ▼
                   ┌─────────────────────────┐
                   │    Node.js + Express    │
                   │       REST API           │
                   └────────────┬────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌────────────┐   ┌─────────────┐  ┌──────────────┐
        │   MySQL    │   │   External  │  │    File      │
        │  Database  │   │   Services  │  │   Uploads    │
        └────────────┘   └─────────────┘  └──────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
                 Google    EmailJS   SMS APIs
                 Maps
```

---

## 📂 Project Structure

```text
MomCare_LK/
│
├── backend/
│   ├── migrations/
│   │   └── 001_appointments.sql
│   │
│   ├── uploads/
│   │   └── scan-reports/
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── create-admin.js
│   ├── db.js
│   ├── package.json
│   ├── reset.sql
│   ├── schema.sql
│   ├── seed.js
│   ├── server.js
│   └── store.js
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── api.js
│   │
│   ├── .env.example
│   ├── package.json
│   ├── index.html
│   ├── postcss.config.js
│   └── ...
│
└── README.md
```

The repository currently follows this frontend/backend separation, with database scripts and uploaded scan-report resources under the backend.

---

# ⚙️ Prerequisites

Before running MomCare LK, install:

* **Node.js** – preferably an LTS version
* **npm**
* **MySQL Server**
* **Git**

You will also need API credentials for the external services you intend to enable.

---

# 🚀 Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/Pawani109/MomCare_LK.git

cd MomCare_LK
```

---

## 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

On Windows, you can also manually copy:

```text
.env.example → .env
```

---

## 3. Frontend Setup

Open another terminal and navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the frontend environment file:

```text
.env.example → .env
```

---

# 🔐 Environment Variables

## Backend

The backend provides an `.env.example` file containing configuration for MySQL, JWT, Text.lk, Google Maps, and EmailJS.

Example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=momcare

DB_POOL_LIMIT=10

JWT_SECRET=your_secure_jwt_secret

TEXTLK_API_TOKEN=your_textlk_token
TEXTLK_SENDER_ID=MomCareLK

GOOGLE_MAPS_API_KEY=your_google_maps_key

EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
```

> **Important:** Never commit your real `.env` file, passwords, API keys, JWT secrets, or other credentials to GitHub.

---

## Frontend

The frontend environment configuration currently supports the Google Maps JavaScript API key.

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

# 🗄️ Database Setup

Create the MySQL database:

```sql
CREATE DATABASE momcare;
```

Then select the database:

```sql
USE momcare;
```

Import the database schema:

```bash
mysql -u your_username -p momcare < schema.sql
```

Alternatively, open:

```text
backend/schema.sql
```

in MySQL Workbench and execute the script.

The repository also contains:

```text
backend/migrations/
backend/seed.js
backend/reset.sql
```

which can be used for database initialization, sample data, migrations, and resetting development data.

---

# ▶️ Running the Application

## Start the Backend

From the `backend` directory:

```bash
npm start
```

The backend runs the Express server defined in `server.js`.

For development, the project also provides:

```bash
npm run dev
```

The available backend scripts are defined in the backend `package.json`.

---

## Start the Frontend

From the `frontend` directory:

```bash
npm run dev
```

The frontend Vite configuration currently uses port **3004** for the development server.

Then open the displayed local URL in your browser.

---

# 👤 Creating an Administrator

The backend contains an administrator creation script.

From the `backend` directory:

```bash
npm run create-admin
```

Follow the prompts/instructions provided by the script to create an administrator account.

---

# 🌱 Seeding Data

To populate the development database with seed data:

```bash
npm run seed
```

---

# 🔌 API & Integrations

MomCare LK uses a REST API architecture between the React frontend and Express backend.

The frontend communicates with the backend using **Axios**.

External services include:

### Google Maps / Places

Used for location and healthcare-facility-related functionality.

### EmailJS

Used for forgot-password OTP email functionality.

### Text.lk

Used for SMS-related functionality.

### Twilio

Used for communication/notification functionality.

---

# 🔒 Security

The application includes several security-related mechanisms:

* JWT-based authentication
* Password hashing with bcrypt
* Environment variables for sensitive configuration
* CORS configuration
* Protected API functionality
* Database connection pooling

For production deployment, use strong randomly generated secrets and restrict API keys to the required domains/services.

---

# 📱 Main Functional Areas

```text
MomCare LK
│
├── 👤 User Management
│   ├── Registration
│   ├── Login
│   └── Authentication
│
├── 🤰 Pregnancy Care
│   ├── Pregnancy Tracker
│   ├── Weekly Information
│   └── Educational Resources
│
├── 🏥 Healthcare
│   ├── Healthcare Information
│   ├── Facility Search
│   └── Location Services
│
├── 📅 Appointments
│   ├── Create Appointment
│   ├── View Appointments
│   └── Appointment Management
│
├── 💗 Wellbeing
│   ├── Wellbeing Resources
│   └── Educational Videos
│
├── 🤖 Assistant
│   └── Support Resources
│
└── 🔔 Notifications
    ├── SMS
    └── Email OTP
```

---

# 🔮 Future Enhancements

Potential future improvements include:

* 📱 Progressive Web App / mobile application
* 🔔 Push notifications
* 🩺 Integration with healthcare professionals
* 📊 Personalized maternal-health dashboards
* 🤖 AI-powered pregnancy assistant
* 🌐 Sinhala and Tamil language support
* 📈 Maternal health analytics
* 🏥 Expanded healthcare-provider management
* 📍 Improved location-based healthcare recommendations
* ☁️ Cloud deployment and scalable infrastructure

---

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

```bash
git fork https://github.com/Pawani109/MomCare_LK
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Commit your changes

```bash
git add .
git commit -m "Add: your feature"
```

### 4. Push the branch

```bash
git push origin feature/your-feature-name
```

### 5. Create a Pull Request

Open a Pull Request on GitHub describing your changes.

---

# 👩‍💻 Author

GitHub:
https://github.com/Pawani109

Project Repository:
https://github.com/Pawani109/MomCare_LK

---

# 📄 License

This project is currently intended for educational and development purposes.

If you plan to distribute or deploy the project publicly, add an appropriate open-source license such as MIT.

---

## 💗 MomCare LK

> **Supporting mothers. Empowering families. Building healthier futures.**

Made with ❤️ for better maternal healthcare.
