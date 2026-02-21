# 🛡️ CyberSentinel AI – National Digital Defense Grid

> **"Securing the Nation's Digital Frontier"**

[![Classification](https://img.shields.io/badge/Classification-RESTRICTED-orange?style=flat-square)](.)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=flat-square)](docker-compose.yml)
[![ML](https://img.shields.io/badge/ML-Scikit--learn-yellow?style=flat-square)](services/ml-service)

A **defense-grade cyber intelligence platform** built with microservices architecture. Features real-time threat detection using ML, blockchain-based immutable alert ledger, and a military-grade SOC dashboard.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX API GATEWAY (:80)                      │
│              Rate Limiting • Security Headers                   │
├─────────┬──────────┬──────────┬──────────┬────────────────────┤
│         │          │          │          │                      │
│   ┌─────▼────┐ ┌───▼────┐ ┌──▼───┐ ┌───▼─────┐ ┌──────────┐ │
│   │   Auth   │ │   ML   │ │Alert │ │Reporting│ │ Frontend │ │
│   │ Service  │ │Service │ │Service│ │ Service │ │  (React) │ │
│   │  :4001   │ │ :8000  │ │:4002 │ │  :4003  │ │  :5173   │ │
│   │ Node.js  │ │FastAPI │ │Node.js│ │ Node.js │ │Vite+Tail │ │
│   └────┬─────┘ └────────┘ └──┬───┘ └────┬────┘ └──────────┘ │
│        │                     │           │                     │
│   ┌────▼─────────────────────▼───────────▼────┐               │
│   │            MongoDB (:27017)                │               │
│   └───────────────────────────────────────────┘               │
│   ┌───────────────────────────────────────────┐               │
│   │             Redis (:6379)                  │               │
│   └───────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Services

| Service | Technology | Port | Description |
|---------|-----------|------|-------------|
| **Auth** | Node.js + Express | 4001 | JWT auth, RBAC, bcrypt, audit logging |
| **ML** | Python + FastAPI | 8000 | Phishing detection, anomaly detection |
| **Alert** | Node.js + Socket.io | 4002 | Blockchain ledger, real-time alerts |
| **Reporting** | Node.js + PDFKit | 4003 | Intelligence PDF report generation |
| **Gateway** | Nginx | 80 | Reverse proxy, rate limiting, security headers |
| **Frontend** | React + Vite | 5173 | SOC dashboard with TailwindCSS |
| **MongoDB** | MongoDB 7 | 27017 | Primary database |
| **Redis** | Redis 7 | 6379 | Caching, rate limiting |

---

## 🧠 ML Models

### Phishing Detection
- **Algorithm**: TF-IDF Vectorizer + Random Forest Classifier
- **Training**: 80 labeled samples (phishing + legitimate)
- **Endpoint**: `POST /predict` → `{ risk_score, label, confidence }`

### Login Anomaly Detection
- **Algorithm**: Isolation Forest (unsupervised)
- **Features**: login_hour, ip_frequency, device_change, failed_attempts, session_duration
- **Endpoint**: `POST /anomaly` → `{ is_anomaly, risk_score, label }`

---

## 🔗 Blockchain Alert Ledger

Custom SHA-256 blockchain for immutable alert records:
- **Genesis block** created on initialization
- Every ML threat detection creates a new block
- Chain validation detects tampering
- Blocks persisted in MongoDB

---

## 🔐 Role System

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access, user management, role changes |
| **ANALYST** | Threat analysis, audit logs, report generation |
| **OPERATOR** | Dashboard viewing, basic operations |

### Classification Levels
`PUBLIC` → `RESTRICTED` → `CONFIDENTIAL` → `CLASSIFIED`

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd cyebersential

# Copy environment config
cp .env.example .env

# Build and start all services
docker compose up --build

# Access the platform
# Dashboard: http://localhost
# Direct frontend: http://localhost:5173
```

### First-time Setup

1. Open `http://localhost:5173` (or `http://localhost` via gateway)
2. Click "Create New Account"
3. Register with a strong password (min 8 chars, uppercase, lowercase, digit)
4. Login and explore the SOC dashboard

---

## 📡 API Endpoints

### Auth Service (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/profile` | Get user profile |

### ML Service (`/api/ml`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ml/predict` | Phishing detection |
| POST | `/api/ml/anomaly` | Login anomaly detection |
| GET | `/api/ml/health` | Service health check |

### Alert Service (`/api/alerts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/alerts` | Create new alert (blockchain) |
| GET | `/api/alerts` | List all alerts |
| GET | `/api/alerts/latest` | Get latest alerts |
| GET | `/api/alerts/chain/validate` | Validate blockchain |
| GET | `/api/alerts/chain/stats` | Chain statistics |

### Reporting Service (`/api/reports`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/generate` | Generate PDF report |

---

## 🎨 SOC Dashboard

The frontend is a Military-grade Security Operations Center dashboard featuring:

- 🔴 **Live Threat Feed** – Real-time alert stream via Socket.io
- 🌍 **World Map** – SVG attack visualization with animated trajectories
- 📊 **Severity Panel** – Recharts donut chart with severity breakdown
- 🔗 **Blockchain Status** – Chain integrity validation with animated indicator
- 🧠 **Threat Analyzer** – ML-powered phishing detection input
- 🔥 **Risk Heatmap** – 24-hour threat distribution chart
- 🔍 **Anomaly Tracker** – Login pattern anomaly detection
- 💚 **System Health** – Real-time service monitoring with radar animation
- 📋 **Analyst Logs** – Audit trail activity table

---

## 🛡️ Security Features

- **JWT Authentication** with 24h token expiry
- **bcrypt** password hashing (12 rounds)
- **Rate limiting** – 100 req/15min (general), 20 req/15min (auth)
- **Helmet.js** security headers
- **CORS** configuration
- **Input validation** with express-validator
- **Account locking** after 5 failed attempts
- **Audit logging** with Winston
- **Nginx security headers** (X-Frame-Options, CSP, XSS Protection)

---

## 🚢 Deployment Guide

### Docker (Recommended)
```bash
docker compose up --build -d
```

### AWS ECS
1. Push images to ECR
2. Create ECS task definitions per service
3. Set up ALB for routing
4. Configure RDS/DocumentDB for MongoDB

### Railway / Render
1. Connect repository
2. Set each service directory as build context
3. Configure environment variables
4. Deploy with Docker

---

## 🔮 Future Scope

- [ ] SIEM integration (Splunk, ELK Stack)
- [ ] Advanced ML models (LSTM for sequence analysis)
- [ ] MITRE ATT&CK framework mapping
- [ ] Automated incident response playbooks
- [ ] Multi-tenant support
- [ ] SAML/OAuth2 SSO integration
- [ ] Dark web monitoring
- [ ] Network traffic analysis (pcap)
- [ ] Mobile companion app
- [ ] Kubernetes orchestration (Helm charts)

---

## ⚠️ Security Disclaimer

This platform is built for **educational and demonstration purposes**. While it implements real security patterns:

- Do NOT use the default JWT secret in production
- The ML models are trained on synthetic data and need real-world training data
- The blockchain implementation is a simulation, not a distributed consensus
- Always conduct a security audit before deploying to production

---

## 📄 License

MIT License

Copyright (c) 2024 CyberSentinel AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
