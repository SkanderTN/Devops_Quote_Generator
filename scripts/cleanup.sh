#!/bin/bash

# ============================================
# Kubernetes Cleanup Helper Script
# ============================================
# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Confirm deletion
confirm_delete() {
    read -p "Are you sure you want to delete the quote-api namespace and all resources? (yes/no): " response
    if [ "$response" != "yes" ]; then
        print_warning "Deletion cancelled"
        exit 0
    fi
}

# Delete namespace and all resources
delete_namespace() {
    print_header "Deleting Kubernetes Resources"
    
    print_warning "Deleting namespace: quote-api"
    kubectl delete namespace quote-api
    
    if [ $? -eq 0 ]; then
        print_success "Namespace deleted successfully"
    else
        print_error "Failed to delete namespace"
        exit 1
    fi
}

# Verify deletion
verify_deletion() {
    print_header "Verifying Deletion"
    
    sleep 2
    
    if kubectl get namespace quote-api &> /dev/null; then
        print_error "Namespace still exists"
        exit 1
    else
        print_success "Namespace successfully deleted"
    fi
}

# Stop minikube (optional)
stop_minikube() {
    if command -v minikube &> /dev/null; then
        read -p "Stop Minikube cluster? (yes/no): " response
        if [ "$response" = "yes" ]; then
            print_warning "Stopping Minikube..."
            minikube stop
            print_success "Minikube stopped"
        fi
    fi
}

# Main
main() {
    print_header "Kubernetes Resource Cleanup"
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl not found. Please install kubectl."
        exit 1
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace quote-api &> /dev/null; then
        print_warning "Namespace 'quote-api' does not exist"
        exit 0
    fi
    
    # Confirm deletion
    confirm_delete
    
    # Delete resources
    delete_namespace
    
    # Verify deletion
    verify_deletion
    
    # Optionally stop minikube
    stop_minikube
    
    print_header "Cleanup Complete"
}

main
