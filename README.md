# MERN Stack ERP System

A full-featured, secure, and responsive Enterprise Resource Planning (ERP) web application built using the MERN stack (MongoDB, Express.js, React.js, and Node.js) with TailwindCSS/Vanilla styling. This project features robust Role-Based Access Control (RBAC), database-driven pagination/search querying, analytical charts, PDF billing invoice exports, centralized validation, and test coverage.

---

## 📁 Repository Structure

```text
├── backend/
│   ├── config/              # Database connections
│   ├── controllers/         # Query controllers & calculations
│   ├── middleware/          # Auth guards, role gates, Joi validation, error handler
│   ├── models/              # Mongoose DB Schemas
│   ├── routes/              # Express API routers
│   ├── tests/               # Jest backend unit test suites
│   ├── package.json         # Backend node configurations
│   └── server.js            # Node app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Shared components (Sidebar, ProtectedRoute, etc.)
│   │   ├── context/         # AuthContext provider
│   │   ├── pages/           # View panels (Dashboard, Products, SalesOrders, etc.)
│   │   ├── services/        # Axios API config
│   │   ├── App.jsx          # Route mapping & guards
│   │   └── main.jsx         # App entry mount
│   ├── package.json         # Frontend node configurations
│   └── vite.config.js       # Vite build configurations
│
├── postman_collection.json  # Complete API endpoint schema
├── README.md                # System documentation
└── .gitignore               # Ignored local files
```

---

## 🛠️ Main Features Implemented

1. **🛡️ Role-Based Access Control (RBAC):**
   * **Route Protection:** Handled via frontend routing guards and backend role-authorization middlewares (`Admin`, `Sales`, `Inventory`).
   * **Dynamic Sidebar:** Navigation links filter automatically based on the logged-in user's role to hide pages they lack permission to access.
2. **👥 User Management (Admin Dashboard):**
   * Built CRUD capabilities for user directory control, mapping roles, and deletions.
3. **📄 API Pagination & Querying:**
   * Dynamic skips, limits, and regex searching applied to Products, Customers, Suppliers, Sales, and Purchase Orders.
   * Leveraged a unpaginated bypass query (`?pagination=false`) to load full selectors in creation modals without truncating options.
4. **📊 Analytics Visualization:**
   * Implemented custom Recharts Area charts tracking sales revenues and Bar charts checking inventory safety thresholds against reorder lines.
5. **📄 PDF Billing Statement Export:**
   * Built inline client exports generating formatted PDFs with invoice details using `jsPDF`.
6. **🛡️ central Validation & Handling:**
   * Unified incoming request checks utilizing Joi schema middleware.
   * Centralized global express handlers formatting standard server responses.

---

## 🚀 Setup & Execution Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* MongoDB connection string (Local or MongoDB Atlas)

---

### 1. Backend Server Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `backend` directory and add:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signing_key_secret
   NODE_ENV=development
   ```
4. Start the backend in development (Hot reload) mode:
   ```bash
   npm run dev
   ```
   *The server runs by default on `http://localhost:5000`.*

5. **Run Backend Test Suites:**
   ```bash
   npm run test
   ```

---

### 2. Frontend Client Setup
1. Open another terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the client dev server:
   ```bash
   npm run dev
   ```
   *The client web page runs on the specified Vite local port (e.g. `http://localhost:5173`).*

---

## 🔑 Default Accounts for Testing

During signup, you can assign roles. Below are default testing templates:

| Role | Access Permissions |
| :--- | :--- |
| **Admin** | Full control over Users, Products, Customers, Suppliers, Orders, and Invoices. |
| **Sales** | Can manage Customers, draft Sales Orders, and issue/process Invoice billing. |
| **Inventory** | Can manage Products catalog, register Suppliers, draft Purchase Orders, and issue GRNs. |

---

## 📊 API Schema Documentation
For details regarding request bodies, HTTP methods, parameters, and response structures, import the [postman_collection.json](file:///c:/Users/Antony%20Prakash/Desktop/Fullstack/Intership/Project%201/postman_collection.json) file located at the root of this workspace directly into Postman.
