# Devops_Quote_Generator

A production-ready Node.js REST API with complete DevOps infrastructure, including Docker containerization, Kubernetes deployment, comprehensive testing, and security scanning.

## Features

### Application
- ✅ Express.js REST API with 5 endpoints
- ✅ Prometheus metrics for monitoring
- ✅ Structured JSON logging
- ✅ UUID-based request tracing
- ✅ Security headers with helmet

### Testing & Quality
- ✅ 14 comprehensive test cases (Jest)
- ✅ ESLint code quality checks
- ✅ Test coverage reporting
- ✅ Security audit (npm audit)

### Deployment
- ✅ Docker multi-stage builds
- ✅ Kubernetes manifests (Namespace, Deployment, Service, HPA, NetworkPolicy)
- ✅ Docker Compose for local development
- ✅ Prometheus monitoring configuration

### CI/CD
- ✅ GitHub Actions CI pipeline
- ✅ Automated linting & testing
- ✅ CodeQL static analysis
- ✅ OWASP ZAP dynamic security scanning

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server with auto-reload
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Run security audit
npm run security:audit
```

### Docker

```bash
# Build image
docker build -t quote-api:1.0.0 .

# Run container
docker run -d -p 3000:3000 quote-api:1.0.0

# Or use docker-compose
docker-compose up -d
```

### Kubernetes

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy to Kubernetes
./scripts/deploy.sh deploy

# Verify deployment
./scripts/deploy.sh verify

# Test endpoints
./scripts/deploy.sh test

# View logs
./scripts/deploy.sh logs

# Cleanup
./scripts/cleanup.sh
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/quote` | Random quote |
| GET | `/quotes` | All quotes |
| GET | `/quotes/:id` | Quote by ID |
| GET | `/metrics` | Prometheus metrics |

### Health Check

```bash
curl http://localhost:3000/
```

### Random Quote

```bash
curl http://localhost:3000/quote
```

### Prometheus Metrics

```bash
curl http://localhost:3000/metrics
```

## Project Structure

```
.
├── index.js                    # Main application
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yml          # Local development setup
├── k8s/
│   └── quote-api.yaml         # All K8s manifests
├── scripts/
│   ├── deploy.sh              # K8s deployment helper
│   └── cleanup.sh             # K8s cleanup helper
├── jest.config.js             # Jest configuration
├── babel.config.js            # Babel configuration
├── eslint.config.js           # ESLint configuration
├── .github/workflows/
│   ├── ci.yml                 # CI/CD pipeline
│   ├── codeql.yml             # SAST scanning
│   └── dast.yml               # Dynamic security scanning
├── tests/
│   └── api.test.js            # API test suite
└── prometheus.yml             # Prometheus config
```

## Technology Stack

- **Runtime**: Node.js 18 (LTS)
- **Framework**: Express.js 4.18.2
- **Testing**: Jest 29.7.0, Supertest 6.3.3
- **Monitoring**: Prometheus (prom-client)
- **Security**: Helmet, npm audit, CodeQL, OWASP ZAP
- **Container**: Docker with multi-stage builds
- **Orchestration**: Kubernetes (Minikube compatible)

## Kubernetes Deployment

### Prerequisites
- Minikube installed
- kubectl installed
- Docker Hub account (for production)

### Quick Deploy

```bash
# Update YOUR_DOCKERHUB_USERNAME in k8s/quote-api.yaml
chmod +x scripts/deploy.sh
./scripts/deploy.sh deploy
```

### Resources Created

- **Namespace**: `quote-api`
- **Deployment**: 2 replicas with health checks
- **Service**: NodePort on 30007
- **HorizontalPodAutoscaler**: 2-5 replicas
- **NetworkPolicy**: Traffic restrictions
- **ConfigMap**: Application config

## CI/CD Pipeline

Automatic on every push/PR to `main`:

1. **Lint** - ESLint checks
2. **Test** - Jest test suite
3. **Security Audit** - npm dependencies
4. **Build** - Docker image
5. **SAST** - CodeQL analysis
6. **DAST** - OWASP ZAP scanning

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Development server
npm test             # Run tests
npm run test:coverage # Test with coverage
npm run lint         # Lint code
npm run lint:fix     # Fix linting errors
npm run security:audit # Check vulnerabilities
```

## Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Lint: `npm run lint`
5. Push and create PR
6. Wait for CI to pass

## License

MIT

## Author

SkanderTN
