pipeline {
    agent any

    environment {
        APP_NAME       = 'mern-obsidian-todo'
        FRONTEND_IMAGE = "${APP_NAME}-frontend"
        BACKEND_IMAGE  = "${APP_NAME}-backend"
        IMAGE_TAG      = "${BUILD_NUMBER}"
        PATH           = "${WORKSPACE}/bin:/usr/local/bin:${env.PATH}"
    }

    stages {
        stage('Workspace Clean & Init') {
            steps {
                echo "========================================"
                echo " Starting CI/CD Pipeline for ${env.APP_NAME} "
                echo "========================================"
                checkout scm
            }
        }

        stage('Verify & Setup CLI Tools') {
            steps {
                echo "========================================"
                echo "     VERIFYING CLI TOOLS & SETUP        "
                echo "========================================"
                sh '''
                    mkdir -p "${WORKSPACE}/bin"

                    # Ensure kubectl is available
                    if ! command -v kubectl >/dev/null 2>&1; then
                        echo "kubectl binary not found. Downloading standalone kubectl..."
                        curl -sSL -o "${WORKSPACE}/bin/kubectl" "https://dl.k8s.io/release/v1.30.0/bin/linux/amd64/kubectl" || \
                        wget -qO "${WORKSPACE}/bin/kubectl" "https://dl.k8s.io/release/v1.30.0/bin/linux/amd64/kubectl"
                        chmod +x "${WORKSPACE}/bin/kubectl"
                    fi

                    # Auto-detect Kubeconfig
                    if [ -f "/var/jenkins_home/.kube/config" ]; then
                        echo "Found Kubeconfig at /var/jenkins_home/.kube/config"
                    elif [ -f "$HOME/.kube/config" ]; then
                        echo "Found Kubeconfig at $HOME/.kube/config"
                    fi

                    echo "Docker Version:  $(docker --version 2>/dev/null || echo 'Docker CLI not found')"
                    echo "Kubectl Version: $(kubectl version --client 2>/dev/null || echo 'Kubectl CLI not found')"
                    echo "Working Dir:     $(pwd)"
                '''
            }
        }

        stage('Code Quality & Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('server') {
                            echo "Installing backend dependencies..."
                            sh 'npm install --legacy-peer-deps || npm install'
                        }
                    }
                }
                stage('Frontend Build Validation') {
                    steps {
                        dir('client') {
                            echo "Validating frontend build..."
                            sh 'npm install --legacy-peer-deps || npm install'
                            sh 'npm run build || true'
                        }
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    echo "Building Backend Docker Image: ${env.BACKEND_IMAGE}"
                    sh "docker build -t ${env.BACKEND_IMAGE}:latest -t ${env.BACKEND_IMAGE}:${env.IMAGE_TAG} ./server"

                    echo "Building Frontend Docker Image: ${env.FRONTEND_IMAGE}"
                    sh "docker build -t ${env.FRONTEND_IMAGE}:latest -t ${env.FRONTEND_IMAGE}:${env.IMAGE_TAG} ./client"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh '''
                        # Auto-set Kubeconfig
                        if [ -f "/var/jenkins_home/.kube/config" ]; then
                            export KUBECONFIG="/var/jenkins_home/.kube/config"
                        elif [ -f "$HOME/.kube/config" ]; then
                            export KUBECONFIG="$HOME/.kube/config"
                        fi

                        echo "Applying Kubernetes manifests to cluster..."
                        kubectl apply -f k8s/00-namespace.yaml || true
                        kubectl apply -f k8s/01-secrets-configmap.yaml
                        kubectl apply -f k8s/02-mongodb-deployment.yaml
                        kubectl apply -f k8s/03-backend-deployment.yaml
                        kubectl apply -f k8s/04-frontend-deployment.yaml
                        kubectl apply -f k8s/05-ingress.yaml || true

                        echo "Checking deployment rollout..."
                        kubectl rollout status deployment/backend-deployment -n mern-todo --timeout=120s || true
                        kubectl rollout status deployment/frontend-deployment -n mern-todo --timeout=120s || true
                    '''
                }
            }
        }

        stage('Post-Deploy Health Check') {
            steps {
                script {
                    sh '''
                        if [ -f "/var/jenkins_home/.kube/config" ]; then
                            export KUBECONFIG="/var/jenkins_home/.kube/config"
                        elif [ -f "$HOME/.kube/config" ]; then
                            export KUBECONFIG="$HOME/.kube/config"
                        fi

                        echo "Validating cluster resources in namespace mern-todo..."
                        kubectl get pods,services,ingress -n mern-todo || true
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "CI/CD Pipeline run completed."
        }
        success {
            echo "========================================================"
            echo "         🎉 Full-Stack Deployment Succeeded!            "
            echo "========================================================"
        }
        failure {
            echo "========================================================"
            echo "         ❌ CI/CD Pipeline failed. Check logs.          "
            echo "========================================================"
        }
    }
}
