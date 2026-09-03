pipeline {
    agent any

    environment {
        APP_NAME = 'mern-obsidian-todo'

        ENVIRONMENT = 'development'

        DOCKER_REGISTRY = 'docker.io/tharrunsiva'

        IMAGE_TAG = 'latest'

        NAMESPACE = 'mern-todo'

        BACKEND_IMAGE = 'docker.io/tharrunsiva/mern-obsidian-todo-backend'

        FRONTEND_IMAGE = 'docker.io/tharrunsiva/mern-obsidian-todo-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '========================================'
                echo ' CHECKING OUT CODE FROM GITHUB'
                echo '========================================'

                deleteDir()

                checkout scm
            }
        }

        stage('Verify Project') {
            steps {
                sh '''
                    set -e

                    echo "Checking project structure..."

                    if [ ! -d "server" ]; then
                        echo "ERROR: server folder not found!"
                        exit 1
                    fi

                    if [ ! -d "client" ]; then
                        echo "ERROR: client folder not found!"
                        exit 1
                    fi

                    if [ ! -d "k8s" ]; then
                        echo "ERROR: k8s folder not found!"
                        exit 1
                    fi

                    if [ ! -f "server/package.json" ]; then
                        echo "ERROR: server/package.json not found!"
                        exit 1
                    fi

                    if [ ! -f "client/package.json" ]; then
                        echo "ERROR: client/package.json not found!"
                        exit 1
                    fi

                    echo ""
                    echo "Project structure verified successfully."
                '''
            }
        }

        stage('Verify Tools') {
            steps {
                sh '''
                    set -e

                    echo "========================================"
                    echo " VERIFYING TOOLS"
                    echo "========================================"

                    echo ""
                    echo "Docker:"
                    docker --version

                    echo ""
                    echo "Node:"
                    node --version

                    echo ""
                    echo "NPM:"
                    npm --version

                    echo ""
                    echo "Kubectl:"
                    kubectl version --client
                '''
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('server') {
                    sh '''
                        set -e

                        echo "========================================"
                        echo " BACKEND NPM INSTALL"
                        echo "========================================"

                        npm install --legacy-peer-deps

                        echo "Backend dependencies installed successfully."
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('client') {
                    sh '''
                        set -e

                        echo "========================================"
                        echo " FRONTEND NPM INSTALL"
                        echo "========================================"

                        npm install --legacy-peer-deps

                        echo ""
                        echo "Building frontend..."

                        npm run build

                        echo ""
                        echo "Frontend build completed successfully."
                    '''
                }
            }
        }

        stage('Docker Build Backend') {
            steps {
                sh '''
                    set -e

                    echo "========================================"
                    echo " BUILDING BACKEND DOCKER IMAGE"
                    echo "========================================"

                    echo "Image:"
                    echo "${BACKEND_IMAGE}:${IMAGE_TAG}"

                    docker build \
                        -t "${BACKEND_IMAGE}:${IMAGE_TAG}" \
                        -t "${BACKEND_IMAGE}:latest" \
                        ./server

                    echo ""
                    echo "Backend Docker image built successfully."
                '''
            }
        }

        stage('Docker Build Frontend') {
            steps {
                sh '''
                    set -e

                    echo "========================================"
                    echo " BUILDING FRONTEND DOCKER IMAGE"
                    echo "========================================"

                    echo "Image:"
                    echo "${FRONTEND_IMAGE}:${IMAGE_TAG}"

                    docker build \
                        -t "${FRONTEND_IMAGE}:${IMAGE_TAG}" \
                        -t "${FRONTEND_IMAGE}:latest" \
                        ./client

                    echo ""
                    echo "Frontend Docker image built successfully."
                '''
            }
        }

        stage('Docker Images') {
            steps {
                sh '''
                    echo "========================================"
                    echo " DOCKER IMAGES"
                    echo "========================================"

                    docker images | grep "mern-obsidian-todo" || true
                '''
            }
        }

        stage('Docker Push') {
            steps {
                sh '''
                    set -e

                    echo "========================================"
                    echo " PUSHING IMAGES TO DOCKER HUB"
                    echo "========================================"

                    echo "Pushing backend..."

                    docker push "${BACKEND_IMAGE}:${IMAGE_TAG}"

                    echo ""
                    echo "Pushing frontend..."

                    docker push "${FRONTEND_IMAGE}:${IMAGE_TAG}"

                    echo ""
                    echo "Docker images pushed successfully."
                '''
            }
        }

        stage('Kubernetes Connection') {
            steps {
                sh '''
                    set -e

                    echo "========================================"
                    echo " CHECKING KUBERNETES CONNECTION"
                    echo "========================================"

                    if [ -f "/var/jenkins_home/.kube/config" ]; then
                        export KUBECONFIG="/var/jenkins_home/.kube/config"
                        echo "Using Jenkins kubeconfig."

                    elif [ -f "$HOME/.kube/config" ]; then
                        export KUBECONFIG="$HOME/.kube/config"
                        echo "Using user kubeconfig."

                    else
                        echo "ERROR: Kubernetes kubeconfig not found!"
                        exit 1
                    fi

                    kubectl cluster-info

                    echo ""
                    echo "Kubernetes connection successful."
                '''
            }
        }

        stage('Deploy Kubernetes') {
            steps {
                sh '''
                    set -e

                    echo "========================================"
                    echo " DEPLOYING TO KUBERNETES"
                    echo "========================================"

                    if [ -f "/var/jenkins_home/.kube/config" ]; then
                        export KUBECONFIG="/var/jenkins_home/.kube/config"

                    elif [ -f "$HOME/.kube/config" ]; then
                        export KUBECONFIG="$HOME/.kube/config"
                    fi

                    echo ""
                    echo "Creating namespace..."

                    kubectl apply \
                        -f k8s/00-namespace.yaml

                    echo ""
                    echo "Applying ConfigMap and Secrets..."

                    kubectl apply \
                        -f k8s/01-secrets-configmap.yaml

                    echo ""
                    echo "Deploying MongoDB..."

                    kubectl apply \
                        -f k8s/02-mongodb-deployment.yaml

                    echo ""
                    echo "Deploying Backend..."

                    kubectl apply \
                        -f k8s/03-backend-deployment.yaml

                    echo ""
                    echo "Deploying Frontend..."

                    kubectl apply \
                        -f k8s/04-frontend-deployment.yaml

                    echo ""
                    echo "Deploying Ingress..."

                    if [ -f "k8s/05-ingress.yaml" ]; then
                        kubectl apply \
                            -f k8s/05-ingress.yaml
                    else
                        echo "Ingress file not found. Skipping..."
                    fi

                    echo ""
                    echo "Kubernetes manifests applied successfully."
                '''
            }
        }

        stage('Update Backend Image') {
            steps {
                sh '''
                    set -e

                    echo "========================================"
                    echo " UPDATING BACKEND IMAGE"
                    echo "========================================"

                    kubectl set image \
                        deployment/backend-deployment \
                        backend=${BACKEND_IMAGE}:${IMAGE_TAG} \
                        -n ${NAMESPACE}

                    echo "Backend image updated."
                '''
            }
        }

        stage('Update Frontend Image') {
            steps {
                sh '''
                    set -e

                    echo "========================================"
                    echo " UPDATING FRONTEND IMAGE"
                    echo "========================================"

                    kubectl set image \
                        deployment/frontend-deployment \
                        frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        -n ${NAMESPACE}

                    echo "Frontend image updated."
                '''
            }
        }

        stage('Backend Rollout') {
            steps {
                sh '''
                    set -e

                    echo "========================================"
                    echo " BACKEND ROLLOUT"
                    echo "========================================"

                    kubectl rollout status \
                        deployment/backend-deployment \
                        -n ${NAMESPACE} \
                        --timeout=180s

                    echo "Backend deployment successful."
                '''
            }
        }

        stage('Frontend Rollout') {
            steps {
                sh '''
                    set -e

                    echo "========================================"
                    echo " FRONTEND ROLLOUT"
                    echo "========================================"

                    kubectl rollout status \
                        deployment/frontend-deployment \
                        -n ${NAMESPACE} \
                        --timeout=180s

                    echo "Frontend deployment successful."
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    set -e

                    echo "========================================"
                    echo " KUBERNETES HEALTH CHECK"
                    echo "========================================"

                    echo ""
                    echo "PODS:"
                    kubectl get pods -n ${NAMESPACE}

                    echo ""
                    echo "SERVICES:"
                    kubectl get services -n ${NAMESPACE}

                    echo ""
                    echo "DEPLOYMENTS:"
                    kubectl get deployments -n ${NAMESPACE}

                    echo ""
                    echo "INGRESS:"
                    kubectl get ingress -n ${NAMESPACE} || true
                '''
            }
        }
    }

    post {

        success {
            echo ''
            echo '===================================================='
            echo '       FULL STACK DEPLOYMENT SUCCESSFUL'
            echo '===================================================='
            echo "Application : ${APP_NAME}"
            echo "Environment : ${ENVIRONMENT}"
            echo "Backend     : ${BACKEND_IMAGE}:${IMAGE_TAG}"
            echo "Frontend    : ${FRONTEND_IMAGE}:${IMAGE_TAG}"
            echo '===================================================='
        }

        failure {
            echo ''
            echo '===================================================='
            echo '          JENKINS PIPELINE FAILED'
            echo '===================================================='
            echo 'Check the Console Output for the exact error.'
            echo '===================================================='
        }

        always {
            echo ''
            echo 'CI/CD Pipeline execution completed.'
        }
    }
}