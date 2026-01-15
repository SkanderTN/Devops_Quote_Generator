# ============================================
# Kubernetes Deployment Helper Script (PowerShell)
# ============================================

param(
    [string]$Command = "deploy"
)

# Colors
$GREEN = "`e[32m"
$YELLOW = "`e[33m"
$BLUE = "`e[34m"
$RED = "`e[31m"
$NC = "`e[0m"

# Functions
function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "$BLUE========================================$NC"
    Write-Host "$BLUE$Message$NC"
    Write-Host "$BLUE========================================$NC`n"
}

function Write-Success {
    param([string]$Message)
    Write-Host "$GREEN✅ $Message$NC"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "$YELLOW⚠️  $Message$NC"
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "$RED❌ $Message$NC"
}

# Check prerequisites
function Check-Prerequisites {
    Write-Header "Checking Prerequisites"
    
    # Check kubectl
    if (Get-Command kubectl -ErrorAction SilentlyContinue) {
        Write-Success "kubectl is installed"
    } else {
        Write-Error-Custom "kubectl not found. Please install kubectl."
        exit 1
    }
    
    # Check minikube
    if (Get-Command minikube -ErrorAction SilentlyContinue) {
        Write-Success "minikube is installed"
    } else {
        Write-Warning "minikube not found. Please install minikube."
        Write-Warning "You can still deploy to a real cluster."
    }
}

# Start minikube
function Start-Minikube {
    Write-Header "Starting Minikube"
    
    if (Get-Command minikube -ErrorAction SilentlyContinue) {
        $status = minikube status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Minikube is already running"
        } else {
            Write-Warning "Starting minikube cluster..."
            minikube start
            Write-Success "Minikube started successfully"
        }
    }
}

# Deploy to Kubernetes
function Deploy {
    Write-Header "Deploying to Kubernetes"
    
    if (-not (Test-Path "k8s/quote-api.yaml")) {
        Write-Error-Custom "k8s/quote-api.yaml not found!"
        exit 1
    }
    
    Write-Warning "Note: Update YOUR_DOCKERHUB_USERNAME in k8s/quote-api.yaml before deploying to production!"
    
    kubectl apply -f k8s/quote-api.yaml
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Deployment applied successfully"
    } else {
        Write-Error-Custom "Deployment failed"
        exit 1
    }
}

# Wait for deployment
function Wait-Deployment {
    Write-Header "Waiting for Deployment to be Ready"
    
    kubectl rollout status deployment/quote-api-deployment -n quote-api --timeout=5m
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Deployment is ready"
    } else {
        Write-Error-Custom "Deployment rollout timed out"
        exit 1
    }
}

# Verify deployment
function Verify-Deployment {
    Write-Header "Verifying Deployment"
    
    Write-Host "$YELLOW Namespace:$NC"
    kubectl get namespace quote-api
    
    Write-Host "`n$YELLOW Pods:$NC"
    kubectl get pods -n quote-api
    
    Write-Host "`n$YELLOW Service:$NC"
    kubectl get service -n quote-api
    
    Write-Host "`n$YELLOW Deployment:$NC"
    kubectl get deployment -n quote-api
    
    Write-Host "`n$YELLOW ConfigMap:$NC"
    kubectl get configmap -n quote-api
}

# Get service URL
function Get-ServiceUrl {
    Write-Header "Service Access Information"
    
    if (Get-Command minikube -ErrorAction SilentlyContinue) {
        $serviceUrl = minikube service quote-api-service -n quote-api --url 2>$null
        Write-Success "Service URL: $serviceUrl"
        Write-Host "`n$YELLOW Quick commands:$NC"
        Write-Host "curl $serviceUrl/"
        Write-Host "curl $serviceUrl/quote"
        Write-Host "curl $serviceUrl/metrics"
    } else {
        Write-Warning "Could not determine service URL"
        Write-Host "kubectl port-forward service/quote-api-service 3000:3000 -n quote-api"
    }
}

# Test endpoints
function Test-Endpoints {
    Write-Header "Testing Endpoints"
    
    if (Get-Command minikube -ErrorAction SilentlyContinue) {
        $serviceUrl = minikube service quote-api-service -n quote-api --url 2>$null
    } else {
        $serviceUrl = "http://localhost:3000"
    }
    
    Write-Host "$YELLOW Testing health check:$NC"
    curl -s "$serviceUrl/" | Select-Object -First 100
    Write-Host ""
    
    Write-Host "$YELLOW Testing random quote:$NC"
    curl -s "$serviceUrl/quote" | Select-Object -First 100
    Write-Host ""
    
    Write-Host "$YELLOW Testing metrics:$NC"
    curl -s "$serviceUrl/metrics" | Select-Object -First 100
    Write-Host ""
    
    Write-Success "Endpoint tests completed"
}

# View logs
function View-Logs {
    Write-Header "Application Logs"
    
    kubectl logs -f -l app=quote-api -n quote-api --all-containers=true --timestamps=true
}

# Main
switch ($Command) {
    "start" {
        Check-Prerequisites
        Start-Minikube
    }
    "deploy" {
        Check-Prerequisites
        Start-Minikube
        Deploy
        Wait-Deployment
        Verify-Deployment
        Get-ServiceUrl
    }
    "verify" {
        Verify-Deployment
        Get-ServiceUrl
    }
    "test" {
        Test-Endpoints
    }
    "logs" {
        View-Logs
    }
    default {
        Write-Host "$YELLOW Usage: .\scripts\deploy.ps1 [start|deploy|verify|test|logs]$NC"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  start   - Start Minikube cluster"
        Write-Host "  deploy  - Deploy to Kubernetes (default)"
        Write-Host "  verify  - Verify deployment status"
        Write-Host "  test    - Test application endpoints"
        Write-Host "  logs    - Stream application logs"
        exit 1
    }
}
