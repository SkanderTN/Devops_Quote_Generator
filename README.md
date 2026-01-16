# DevOps Quote Generator

A production-ready Node.js REST API with full DevOps tooling: Docker, Kubernetes (Minikube), CI/CD, observability (metrics/logging/tracing), and security scanning.

## Overview
- **App**: Express API with health, quotes, metrics
- **Observability**: Prometheus metrics, structured logs, request tracing
- **Security**: Helmet headers, CodeQL (SAST), OWASP ZAP baseline (DAST)
- **Container & Orchestration**: Docker image, Kubernetes, probes, NetworkPolicy
- **CI/CD**: GitHub Actions for lint, test, audit, docker build, CodeQL, ZAP

## Features
- **Endpoints**: `/`, `/quote`, `/quotes`, `/quotes/:id`, `/metrics`
- **Metrics**: `http_requests_total`, `http_request_duration_seconds` histogram
- **Logging**: JSON logs for `request_start` and `request_complete`
- **Tracing**: `X-Request-ID` header using UUID per request
- **Security**: Helmet removes `X-Powered-By`, sets common secure headers

## Tech Stack
- **Runtime**: Node.js 18
- **Framework**: Express 4.18.x
- **Testing**: Jest + Supertest
- **Metrics**: prom-client
- **Container**: Docker (multi-stage, non-root)
- **Kubernetes**: Deployment (2 replicas), Service (NodePort), HPA, NetworkPolicy, ConfigMap

## Quick Start (Local)
```powershell
# Install deps
npm install

# Run locally
npm start

# Run tests
npm test

# Lint & fix
npm run lint
npm run lint:fix

# Security audit
npm run security:audit
```

## Run with Docker
```powershell
# Build
docker build -t quote-api:latest .

# Run
docker run -d -p 3000:3000 --name quote-api quote-api:latest

# Try it
curl.exe http://127.0.0.1:3000/
curl.exe http://127.0.0.1:3000/quote
curl.exe http://127.0.0.1:3000/metrics
```

## Docker Compose + Prometheus
```powershell
# Start API + Prometheus
docker-compose up -d

# Check API
curl.exe http://127.0.0.1:3000/quote

# Prometheus is available if mapped (see docker-compose.yml)
```

## Kubernetes (Minikube) Demo
### Prerequisites (Windows)
```powershell
# Install via Scoop (recommended)
scoop install minikube kubectl
```

### Start & Deploy
```powershell
# Start cluster
minikube start

# Apply manifests
kubectl apply -f k8s/quote-api.yaml

# Verify
kubectl get nodes
kubectl get all -n quote-api
kubectl get endpoints quote-api-service -n quote-api
```

### Access Methods
- **Port-forward (recommended)**: stable localhost, shows Service→Pod routing
  ```powershell
  kubectl port-forward -n quote-api svc/quote-api-service 3000:3000
  # New terminal
  curl.exe http://127.0.0.1:3000/
  curl.exe http://127.0.0.1:3000/quote
  curl.exe http://127.0.0.1:3000/metrics
  ```
- **minikube service --url**: convenience tunnel; keep the terminal open
  ```powershell
  minikube service quote-api-service -n quote-api --url
  # Use printed URL, e.g. http://127.0.0.1:56864
  curl.exe http://127.0.0.1:56864/quote
  ```
- **NodePort (30007) caveat on Windows**: with Docker driver, `http://<minikube-ip>:30007` may be unreachable due to NAT/firewall. Prefer port-forward or `minikube service --url`. Works reliably on Linux/WSL2/Hyper-V.

### Live Walkthrough Script
```powershell
minikube start
kubectl apply -f k8s/quote-api.yaml
kubectl get all -n quote-api
kubectl get endpoints quote-api-service -n quote-api
kubectl port-forward -n quote-api svc/quote-api-service 3000:3000
# New terminal
curl.exe http://127.0.0.1:3000/
curl.exe http://127.0.0.1:3000/quote
curl.exe http://127.0.0.1:3000/metrics
```

## Observability
- **Metrics endpoint**: `/metrics` (Prometheus format)
- **Histogram buckets**: `[0.01, 0.05, 0.1, 0.5, 1, 2, 5]` are cumulative; an observation increments all buckets with `le >= duration`.
- **Example PromQL**:
  - Average latency:
    ```
    rate(http_request_duration_seconds_sum{route="/quote",method="GET"}[5m])
    /
    rate(http_request_duration_seconds_count{route="/quote",method="GET"}[5m])
    ```
  - 95th percentile:
    ```
    histogram_quantile(0.95,
      sum by (le) (
        rate(http_request_duration_seconds_bucket{route="/quote",method="GET"}[5m])
      )
    )
    ```
- **Logs**: JSON events `request_start` and `request_complete` with `requestId`, method, url, status, durationMs.
- **Tracing**: `X-Request-ID` header attached to responses for correlation.
- **Favicon noise**: If `/favicon.ico` appears in metrics/logs, you can add a no-content handler and skip metrics for that path.

## Security
- **Runtime**: Helmet adds secure headers and removes `X-Powered-By`.
- **SAST**: CodeQL workflow scans repository (non-blocking in CI unless configured).
- **DAST**: OWASP ZAP baseline job runs; configured to continue-on-error to avoid pipeline flakes.
- **Dependencies**: `npm run security:audit` checks vulnerability advisories.

## CI/CD (GitHub Actions)
- **ci.yml**: lint, test (coverage), security audit, docker build/test
- **codeql.yml**: static analysis
- **dast.yml**: ZAP baseline with resilient settings

## API Reference
- **GET /**: Health with metadata and endpoints list
- **GET /quote**: Random quote
- **GET /quotes**: All quotes with count
- **GET /quotes/:id**: Quote by ID (404 if missing)
- **GET /metrics**: Prometheus metrics registry

## Scripts
- **scripts/deploy.ps1**: Windows deployment helper (start, deploy, verify, test, logs)
- **scripts/deploy.sh**: Bash equivalent
- **scripts/cleanup.sh**: Remove namespace and optionally stop Minikube

## Troubleshooting
- **NodePort unreachable on Windows (Docker driver)**: Use port-forward or `minikube service --url`. Consider WSL2/Hyper-V driver for NodePort exposure.
- **minikube service URL closes**: Keep the terminal printing the URL open; it runs a local tunnel.
- **Prometheus scrape**: Ensure `prometheus.yml` targets the API at `/metrics` (10s scrape). In Kubernetes, annotations enable scraping if you run Prometheus there.

## Project Structure
```
.
├── index.js
├── src/ (if added later)
├── tests/
│  └── api.test.js
├── k8s/
│  └── quote-api.yaml
├── scripts/
│  ├── deploy.ps1
│  ├── deploy.sh
│  └── cleanup.sh
├── Dockerfile
├── .dockerignore
├── docker-compose.yml
├── prometheus.yml
├── package.json
└── README.md
```

## Author
SkanderTN
