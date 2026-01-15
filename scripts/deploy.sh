#!/bin/bash

# ============================================
# Kubernetes Deployment Helper Script
# ============================================
# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl not found. Please install kubectl."
        exit 1
    fi
    print_success "kubectl is installed"
    
    # Check minikube
    if ! command -v minikube &> /dev/null; then
        print_warning "minikube not found. Please install minikube for local testing."
        print_warning "You can still deploy to a real cluster."
    else
        print_success "minikube is installed"
    fi
}

# Start minikube
start_minikube() {
    print_header "Starting Minikube"
    
    if command -v minikube &> /dev/null; then
        minikube status &> /dev/null
        if [ $? -eq 0 ]; then
            print_success "Minikube is already running"
        else
            print_warning "Starting minikube cluster..."
            minikube start
            print_success "Minikube started successfully"
        fi
    fi
}

# Deploy to Kubernetes
deploy() {
    print_header "Deploying to Kubernetes"
    
    if [ ! -f "k8s/quote-api.yaml" ]; then
        print_error "k8s/quote-api.yaml not found!"
        exit 1
    fi
    
    print_warning "Note: Update YOUR_DOCKERHUB_USERNAME in k8s/quote-api.yaml before deploying to production!"
    
    kubectl apply -f k8s/quote-api.yaml
    
    if [ $? -eq 0 ]; then
        print_success "Deployment applied successfully"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Wait for deployment
wait_for_deployment() {
    print_header "Waiting for Deployment to be Ready"
    
    kubectl rollout status deployment/quote-api-deployment -n quote-api --timeout=5m
    
    if [ $? -eq 0 ]; then
        print_success "Deployment is ready"
    else
        print_error "Deployment rollout timed out"
        exit 1
    fi
}

# Verify deployment
verify_deployment() {
    print_header "Verifying Deployment"
    
    echo -e "${YELLOW}Namespace:${NC}"
    kubectl get namespace quote-api
    
    echo -e "\n${YELLOW}Pods:${NC}"
    kubectl get pods -n quote-api
    
    echo -e "\n${YELLOW}Service:${NC}"
    kubectl get service -n quote-api
    
    echo -e "\n${YELLOW}Deployment:${NC}"
    kubectl get deployment -n quote-api
    
    echo -e "\n${YELLOW}ConfigMap:${NC}"
    kubectl get configmap -n quote-api
}

# Get service URL
get_service_url() {
    print_header "Service Access Information"
    
    if command -v minikube &> /dev/null; then
        SERVICE_URL=$(minikube service quote-api-service -n quote-api --url)
        print_success "Service URL: $SERVICE_URL"
        echo -e "\n${YELLOW}Quick commands:${NC}"
        echo "curl $SERVICE_URL/"
        echo "curl $SERVICE_URL/quote"
        echo "curl $SERVICE_URL/metrics"
    else
        MINIKUBE_IP=$(kubectl get node minikube -o jsonpath='{.status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null)
        if [ -z "$MINIKUBE_IP" ]; then
            print_warning "Could not determine Minikube IP. Using NodePort 30007"
            echo "kubectl port-forward service/quote-api-service 3000:3000 -n quote-api"
        else
            print_success "Service IP: $MINIKUBE_IP:30007"
        fi
    fi
}

# Test endpoints
test_endpoints() {
    print_header "Testing Endpoints"
    
    if command -v minikube &> /dev/null; then
        SERVICE_URL=$(minikube service quote-api-service -n quote-api --url)
    else
        SERVICE_URL="http://localhost:3000"
    fi
    
    echo -e "${YELLOW}Testing health check:${NC}"
    curl -s "$SERVICE_URL/" | head -c 100
    echo -e "\n"
    
    echo -e "${YELLOW}Testing random quote:${NC}"
    curl -s "$SERVICE_URL/quote" | head -c 100
    echo -e "\n"
    
    echo -e "${YELLOW}Testing metrics:${NC}"
    curl -s "$SERVICE_URL/metrics" | head -c 100
    echo -e "\n"
    
    print_success "Endpoint tests completed"
}

# View logs
view_logs() {
    print_header "Application Logs"
    
    kubectl logs -f -l app=quote-api -n quote-api --all-containers=true --timestamps=true
}

# Main
main() {
    case "${1:-deploy}" in
        start)
            check_prerequisites
            start_minikube
            ;;
        deploy)
            check_prerequisites
            start_minikube
            deploy
            wait_for_deployment
            verify_deployment
            get_service_url
            ;;
        verify)
            verify_deployment
            get_service_url
            ;;
        test)
            test_endpoints
            ;;
        logs)
            view_logs
            ;;
        *)
            echo -e "${YELLOW}Usage: $0 [start|deploy|verify|test|logs]${NC}"
            echo ""
            echo "Commands:"
            echo "  start   - Start Minikube cluster"
            echo "  deploy  - Deploy to Kubernetes (default)"
            echo "  verify  - Verify deployment status"
            echo "  test    - Test application endpoints"
            echo "  logs    - Stream application logs"
            exit 1
            ;;
    esac
}

main "$@"
