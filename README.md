# FlavorFleet 🍕🚀

FlavorFleet is a full-stack **Food Ordering Application** built with a **Microservice Architecture**. It enables customers to browse restaurants, place orders, make payments, and track deliveries in real time.

---

## 📐 Architecture Overview

```
┌─────────────┐      ┌──────────────────────────────────────────────────┐
│   Frontend  │ ───► │                API Gateway (:5004)                │
│  React/Vite │      └────┬────────┬──────────┬──────────────┬──────────┘
│   (:3000)   │           │        │          │              │
└─────────────┘           │        │          │              │
                          ▼        ▼          ▼              ▼
               ┌──────────────┐ ┌──────┐ ┌─────────┐ ┌──────────────┐
               │  Restaurant  │ │Order │ │ Payment │ │   Delivery   │
               │  Service     │ │Svc   │ │ Service │ │   Service    │
               │   (:5003)    │ │(:5005│ │  (:5002)│ │   (:5001)    │
               └──────────────┘ └──────┘ └─────────┘ └──────────────┘
                       │           │          │              │
                       └───────────┴──────────┴──────────────┘
                                         │
                                    Separate Databases

┌──────────────────────────────────┐
│ MongoDB for each service         │
├──────────────────────────────────┤
│ restaurant_db (restaurant svc)   │
│ order_db (order svc)             │
│ payment_db (payment svc)         │
│ delivery_db (delivery svc)       │
└──────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer         | Technology                                      |
|---------------|-------------------------------------------------|
| Frontend      | React 19, Vite, Tailwind CSS, MUI, Ant Design   |
| Backend       | Node.js, Express.js                             |
| Database      | MongoDB (Mongoose ODM)                          |
| Auth          | JSON Web Tokens (JWT)                           |
| Payments      | Stripe                                          |
| Real-time     | Socket.IO (delivery tracking)                   |
| Containerization | Docker, Docker Compose                       |
| Orchestration | Kubernetes                                      |

---

## 📦 Microservices

| Service              | Port  | Responsibilities                                      |
|----------------------|-------|-------------------------------------------------------|
| **API Gateway**      | 5004  | Single entry point, authentication, request routing   |
| **Restaurant Service** | 5003 | Manage restaurants, menus, and menu items            |
| **Order Service**    | 5005  | Create and manage customer orders                     |
| **Payment Service**  | 5002  | Handle payments via Stripe                            |
| **Delivery Service** | 5001  | Assign drivers, real-time delivery tracking (WebSocket) |
| **Frontend**         | 3000  | React SPA served by Vite dev server                   |

---

## ✅ Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) v18+ (for local development)
- [Make](https://www.gnu.org/software/make/) (optional, for Makefile shortcuts)
- MongoDB Atlas account (connection strings go in each service's `.env` file)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Miyuri15/FlavorFleet.git
cd FlavorFleet
```

### 2. Configure environment variables

Each microservice requires a `.env` file. Copy the example files and fill in your values:

```bash
cp backend/microservices/delivery-service/.env.example  backend/microservices/delivery-service/.env
cp backend/microservices/order-service/.env.example     backend/microservices/order-service/.env
cp backend/microservices/payment-service/.env.example   backend/microservices/payment-service/.env
cp backend/microservices/restaurant-service/.env.example backend/microservices/restaurant-service/.env
cp backend/gateway/.env.example                         backend/gateway/.env
cp frontend/".env example"                              frontend/.env
```

Typical variables per service:

| Variable      | Description                            |
|---------------|----------------------------------------|
| `MONGO_URI`   | MongoDB connection string              |
| `JWT_SECRET`  | Secret key used to sign JWTs           |
| `PORT`        | Port the service listens on            |
| `STRIPE_SECRET_KEY` | Stripe secret key (payment-service) |

### 3. Run with Docker Compose

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down
```

To start a single service only:

```bash
docker compose up -d delivery-service
```

### 4. Run locally (without Docker)

Install dependencies and start each service individually:

```bash
# Backend microservices (run each in its own terminal)
cd backend/microservices/delivery-service  && npm install && npm run dev
cd backend/microservices/order-service     && npm install && npm run dev
cd backend/microservices/payment-service   && npm install && npm run dev
cd backend/microservices/restaurant-service && npm install && npm run dev
cd backend/gateway                         && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

---

## 🔧 Makefile Commands

A `Makefile` is provided for convenience:

| Command                     | Description                                |
|-----------------------------|--------------------------------------------|
| `make build`                | Build all Docker images                    |
| `make up`                   | Start all containers in detached mode      |
| `make down`                 | Stop and remove all containers             |
| `make restart`              | Restart all containers                     |
| `make logs`                 | Stream logs from all containers            |
| `make clean`                | Remove containers, volumes, and networks   |
| `make shell-<service-name>` | Open a shell in a specific container       |
| `make help`                 | Display available commands                 |

Example:

```bash
make up
make shell-delivery-service
```

---

## ☸️ Kubernetes Deployment

Kubernetes manifests are located in the `k8s/` directory. See [`k8s/README.md`](k8s/README.md) for full instructions.

Quick start:

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Verify deployments
kubectl get deployments
kubectl get services
kubectl get pods
```

---

## 📁 Project Structure

```
FlavorFleet/
├── backend/
│   ├── gateway/                  # API Gateway (port 5004)
│   ├── microservices/
│   │   ├── delivery-service/     # Delivery & driver tracking (port 5001)
│   │   ├── order-service/        # Order management (port 5005)
│   │   ├── payment-service/      # Payment processing via Stripe (port 5002)
│   │   └── restaurant-service/   # Restaurant & menu management (port 5003)
│   └── shared/                   # Shared utilities
├── frontend/                     # React + Vite SPA (port 3000)
├── k8s/                          # Kubernetes manifests
├── docker-compose.yml
├── Makefile
└── README.md
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

