# ⚡ OBSIDIAN // Enterprise MERN Stack Todo & Task Management Platform

An enterprise-grade, full-stack **MERN (MongoDB, Express.js, React, Node.js)** task management and productivity cloud application styled in an obsidian/true-black luxury dark theme with **Bootstrap 5**, **Docker**, **Jenkins CI/CD Pipeline**, and **Kubernetes (K8s)** orchestrations.

---

## 🌟 Key Highlights & Features

- **🎨 Ultra-Modern Black Theme & Aesthetics**: Built with a sleek OLED true-black (`#000000`) colorway, glassmorphic floating cards, glowing accents, and Bootstrap 5 components.
- **🔐 JWT Authentication & User Accounts**: Secure Signup, Login, Password Hashing with `bcryptjs`, persistent session storage, and profile settings.
- **⚡ Full Todo CRUD & Productivity Engine**:
  - Create, view, update, delete tasks.
  - Interactive custom checkboxes with completion celebrations.
  - Priority levels (`Urgent`, `High`, `Medium`, `Low`) with dynamic glowing tags.
  - Task categories (`Work`, `Personal`, `Study`, `Finance`, `Health`, `General`).
  - Due date tracking with smart badge indicators (`Overdue`, `Today`, upcoming).
  - Real-time search by title, notes, and tags.
  - Status filters (`All`, `In Progress`, `Completed`), category filter, and sorting.
  - Productivity statistics dashboard with live completion progress bar.
- **🐳 Multi-Container Dockerization**: Containerized React frontend (multi-stage Nginx Alpine), Express API, and MongoDB with health checks.
- **🔄 Declarative Jenkins CI/CD Pipeline**: Automated checkout, linting, unit tests, security audits, Docker image builds, container registry pushes, and rolling updates to Kubernetes.
- **☸️ Production Kubernetes (K8s) Manifests**: Complete manifests covering Deployments, ClusterIP Services, ConfigMaps, Secrets, PersistentVolumeClaims, Horizontal Pod Autoscalers (HPA), and Ingress.

---

## 🏗️ System Architecture

```
                               ┌────────────────────────┐
                               │  Kubernetes / Ingress  │
                               └───────────┬────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
             / (Frontend)                                   /api (Backend)
                    │                                             │
      ┌─────────────▼─────────────┐                 ┌─────────────▼─────────────┐
      │  React 18 + Bootstrap 5   │                 │   Node.js + Express API   │
      │   (Nginx Alpine :80)      │                 │       (Port 5000)         │
      └───────────────────────────┘                 └─────────────┬─────────────┘
                                                                  │
                                                    ┌─────────────▼─────────────┐
                                                    │   MongoDB Database :27017 │
                                                    │  (Persistent Volume PVC)  │
                                                    └───────────────────────────┘
```

---

## 📁 Repository Structure

```
ToDo/
├── client/                     # React Frontend (Vite + Bootstrap 5 + Axios)
│   ├── src/
│   │   ├── api/                # Axios instance with JWT interceptors & endpoints
│   │   ├── context/            # AuthContext & user state
│   │   ├── components/         # Navbar, StatsHeader, TodoFilter, TodoItem, TodoModal, ProfileModal
│   │   ├── pages/              # Login, Signup, Dashboard
│   │   ├── styles/             # Obsidian black luxury design system
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile              # Multi-stage production build (Node -> Nginx Alpine)
│   ├── nginx.conf              # Reverse proxy configuration
│   └── package.json
│
├── server/                     # Express REST API (Node.js + Mongoose)
│   ├── config/                 # MongoDB connection logic
│   ├── controllers/            # Auth & Todo controllers
│   ├── middleware/             # JWT auth & global error middleware
│   ├── models/                 # User & Todo Mongoose schemas
│   ├── routes/                 # Express API routes
│   ├── server.js               # Entrypoint & healthchecks
│   ├── Dockerfile              # Node Alpine container
│   ├── .env.example
│   └── package.json
│
├── k8s/                        # Production Kubernetes Manifests
│   ├── 00-namespace.yaml       # Namespace: mern-todo
│   ├── 01-secrets-configmap.yaml # ConfigMap & Secrets
│   ├── 02-mongodb-deployment.yaml # MongoDB PVC + Deployment + Service
│   ├── 03-backend-deployment.yaml # Backend Deployment + Service + HPA
│   ├── 04-frontend-deployment.yaml # Frontend Deployment + Service
│   └── 05-ingress.yaml         # Ingress routing rules
│
├── jenkins/                    # Jenkins CI/CD Pipeline
│   ├── Jenkinsfile             # Multi-stage declarative pipeline
│   └── README.md               # Jenkins setup documentation
│
├── docker-compose.yml          # Local multi-container compose
├── docker-compose.prod.yml     # Production compose with authentication
└── README.md
```

---

## 🚀 Getting Started

### 1. Local Development Setup (Manual)

#### Backend:
```bash
cd server
npm install
npm run dev
```
*Server starts on `http://localhost:5000`*

#### Frontend:
```bash
cd client
npm install
npm run dev
```
*Client starts on `http://localhost:3000`*

---

### 2. Running with Docker Compose (Recommended)

Run the entire full-stack application (Frontend + Backend + MongoDB) with a single command:

```bash
docker compose up --build
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API & Health**: `http://localhost:5000/api/health`
- **MongoDB**: `localhost:27017`

To stop and remove containers:
```bash
docker compose down -v
```

---

### 3. Deploying to Kubernetes (K8s)

Apply the Kubernetes manifests in sequence:

```bash
# 1. Create Namespace
kubectl apply -f k8s/00-namespace.yaml

# 2. Apply ConfigMap and Secrets
kubectl apply -f k8s/01-secrets-configmap.yaml

# 3. Deploy MongoDB
kubectl apply -f k8s/02-mongodb-deployment.yaml

# 4. Deploy Backend API & Autoscaler
kubectl apply -f k8s/03-backend-deployment.yaml

# 5. Deploy Frontend Client
kubectl apply -f k8s/04-frontend-deployment.yaml

# 6. Apply Ingress
kubectl apply -f k8s/05-ingress.yaml
```

Check pod status:
```bash
kubectl get pods,services,ingress -n mern-todo
```

---

### 4. Jenkins CI/CD Pipeline

The declarative pipeline in [`jenkins/Jenkinsfile`](./jenkins/Jenkinsfile) automates:
1. **Lint & Test**: Runs backend test suite and builds the frontend bundle in parallel.
2. **Security Audit**: Audits dependencies for vulnerabilities (`npm audit`).
3. **Docker Build**: Builds tagged container images.
4. **Push to Registry**: Pushes images to Docker Hub / Container Registry.
5. **Deploy to K8s**: Executes rolling rollout to Kubernetes cluster.
6. **Health Verification**: Validates live deployment health.

*See [`jenkins/README.md`](./jenkins/README.md) for full setup instructions.*

---

## 📡 API Reference

### Authentication Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Log in and receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch logged in user profile | Private |
| `PUT` | `/api/auth/profile` | Update profile / change password | Private |

### Todo Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/todos` | List user's todos (supports search, filter, sort) | Private |
| `GET` | `/api/todos/stats` | Retrieve workspace productivity stats | Private |
| `POST` | `/api/todos` | Create a new task | Private |
| `GET` | `/api/todos/:id` | Get single task details | Private |
| `PUT` | `/api/todos/:id` | Update task details | Private |
| `PATCH` | `/api/todos/:id/toggle` | Toggle task completion status | Private |
| `DELETE` | `/api/todos/:id` | Delete a task | Private |
| `DELETE` | `/api/todos/clear-completed`| Clear all completed tasks | Private |

### System Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Healthcheck for Docker & K8s probes | Public |
| `GET` | `/` | API status and route directory | Public |

---

## 🔒 Security Best Practices Implemented

- **Password Hashing**: Bcrypt with salted rounds.
- **JWT Protection**: Tokens verified via middleware on all private routes.
- **Input Sanitization**: Mongoose schema validation and trimming.
- **Error Handling**: Non-leaking global error responses in production mode.
- **Container Hardening**: Multi-stage Docker builds using Alpine Linux and unprivileged Nginx user.

---

## 📄 License
MIT © Antigravity
#   t o d o  
 