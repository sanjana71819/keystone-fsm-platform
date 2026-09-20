# Project KEYSTONE – Field Service Management Platform

An enterprise-grade, end-to-end Field Service Management (FSM) platform designed for dispatch automation, work order lifecycle tracking, customer self-service ticketing, SLA management, technician time tracking, and parts inventory.

---

## Tech Stack

- **Backend**: Java 17, Spring Boot 3.2.5, Spring Security 6, Spring Data JPA, JJWT 0.12.6, Springdoc OpenAPI 2.5 (Swagger UI)
- **Database**: PostgreSQL with Flyway database migrations (or H2 in-memory for zero-config dev mode)
- **Frontend**: React 18, TypeScript, Vite, React Router DOM 6, Axios, Lucide Icons, Glassmorphism CSS Design System
- **Architecture**: Stateless REST API with JWT Bearer Authentication and Role-Based Access Control (RBAC)

---

## Environment Variables Reference

### Backend (`backend/`)
| Environment Variable | Description | Default Value |
| :--- | :--- | :--- |
| `DB_URL` | JDBC Connection URL | `jdbc:postgresql://localhost:5432/keystone_db` |
| `DB_USERNAME` | Database User | `postgres` |
| `DB_PASSWORD` | Database Password | `postgres` |
| `JWT_SECRET` | 32+ character HMAC Secret Key | `S3cr3tK3yst0n3FSM_ChangeThisInProductionUseAtLeast32Chars!` |
| `JWT_EXPIRATION_MS` | Token Expiry in Milliseconds | `86400000` (24 Hours) |
| `PORT` | HTTP Server Port | `8080` |

### Frontend (`frontend/`)
| Environment Variable | Description | Default Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for REST API requests | `/api` (proxied to `http://localhost:8080`) |

---

## Core Features & Modules

1. **Authentication & RBAC**:
   - JWT token generation, parsing, validation, and claims extraction
   - 4 Role levels: `ADMIN`, `MANAGER`, `TECHNICIAN`, `CUSTOMER`
2. **Customer & Facility Management**:
   - Enterprise client profiles, billing contacts, and notes
   - Multi-site physical facility directory with addresses and site access protocols
3. **Technician Roster & Dispatch Board**:
   - Skills matrix and certifications catalog
   - Live availability tracking and work order assignment
4. **Service Requests & Ticketing**:
   - Ticket intake with dynamic SLA response deadlines (Critical: 4h, High: 12h, Medium: 24h, Low: 48h)
   - Real-time SLA overdue detection and status tracking
5. **Work Order Lifecycle Management**:
   - Full lifecycle transitions: `OPEN` -> `ASSIGNED` -> `IN_PROGRESS` -> `COMPLETED` / `ON_HOLD` / `CANCELLED`
   - Automated status syncing with linked service requests
6. **Parts & Warehouse Inventory**:
   - Real-time stock levels, SKU codes, unit costs, and reorder level thresholds
   - Automatic inventory deduction when parts are consumed on work orders
   - Inventory restoration on removal of parts
7. **Technician Time Tracking**:
   - Active punch clock with one-click Clock-In / Clock-Out
   - Duration calculations and labor hours aggregation
8. **Real-Time Operations Dashboard**:
   - Real DB aggregation (no hardcoded/fake stats)
   - Pipeline breakdown, technician workload, SLA risk metrics, and recent activity feed
9. **Customer Self-Service Portal**:
   - Dedicated portal for clients to submit maintenance requests and track live engineer status

---

## Seed Accounts & Default Credentials

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | **ADMIN** | Full system administrator access & user management |
| `manager` | `manager123` | **MANAGER** | Operations supervisor, dispatch board & SLA oversight |
| `tech1` | `tech123` | **TECHNICIAN** | Senior field engineer (HVAC, PLC, Refrigeration) |
| `tech2` | `tech123` | **TECHNICIAN** | Hydraulics & Pneumatics Specialist |
| `customer1` | `customer123` | **CUSTOMER** | Apex Logistics Hub Client Portal account |
| `customer2` | `customer123` | **CUSTOMER** | BioVanguard Labs Client Portal account |

---

## Git Repository Identity Setup

To ensure repository commits use a project-isolated identity (no personal developer accounts exposed):

```bash
git init
git config user.name "Project Keystone"
git config user.email "keystone-fsm@project.local"
```

---

## Quick Start & Running Locally

### 1. Database Setup (PostgreSQL or H2)

Option A: PostgreSQL
Create a database named `keystone_db`:
```sql
CREATE DATABASE keystone_db;
```

Option B: H2 Embedded Mode (Zero-Config)
```bash
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

### 2. Run the Spring Boot Backend

```bash
cd backend
mvn clean spring-boot:run
```
- API Endpoint: `http://localhost:8080`
- Swagger UI Documentation: `http://localhost:8080/swagger-ui.html`
- OpenAPI Specification: `http://localhost:8080/v3/api-docs`

### 3. Run the React + TypeScript Frontend

```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## REST API Endpoints Summary

### Auth (`/api/auth`)
- `POST /api/auth/login` – User authentication
- `POST /api/auth/register` – Self-service customer registration
- `GET /api/auth/me` – Current authenticated user profile

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats` – Aggregated live operational KPIs and pipeline stats

### Service Requests (`/api/service-requests`)
- `GET /api/service-requests` – List all requests
- `GET /api/service-requests/overdue` – Filter SLA overdue requests
- `GET /api/service-requests/customer/{id}` – Requests by customer
- `POST /api/service-requests` – Create request & auto-generate work order
- `PUT /api/service-requests/{id}` – Update request

### Work Orders (`/api/work-orders`)
- `GET /api/work-orders` – List all work orders
- `GET /api/work-orders/{id}` – Detail view with parts and labor logs
- `PATCH /api/work-orders/{id}/assign` – Dispatch technician
- `PATCH /api/work-orders/{id}/status` – Advance lifecycle status
- `POST /api/work-orders/{id}/parts` – Add parts used & deduct inventory
- `DELETE /api/work-orders/{id}/parts/{usageId}` – Remove part & restore stock

### Inventory & Parts (`/api/parts`)
- `GET /api/parts` – Catalog listing
- `GET /api/parts/low-stock` – Reorder alert items
- `POST /api/parts` – Add new SKU

### Time Tracking (`/api/time-entries`)
- `POST /api/time-entries/clock-in` – Technician clock-in
- `POST /api/time-entries/{id}/clock-out` – Technician clock-out
- `GET /api/time-entries/technician/{id}` – Technician shifts log
