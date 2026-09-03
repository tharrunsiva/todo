 
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

        // ============================================================
        // 1. WORKSPACE CLEAN & CHECKOUT
        // ============================================================
        stage('Workspace Clean & Init') {
            steps {
                echo "========================================"
                echo " Starting CI/CD Pipeline"
                echo " Application: ${env.APP_NAME}"
                echo " Build: ${env.BUILD_NUMBER}"
                echo "========================================"

                deleteDir()

                checkout scm
            }
        }


        // ============================================================
        // 2. VERIFY TOOLS
        // ============================================================
        stage('Verify & Setup CLI Tools') {
            steps {
                echo "========================================"
                echo " VERIFYING CLI TOOLS"
                echo "========================================"

                sh '''
                    set -e

                    mkdir -p "${WORKSPACE}/bin"

                    # ------------------------------------------------
                    # Check Docker
                    # ------------------------------------------------
                    if command -v docker >/dev/null 2>&1; then
                        echo "Docker found:"
                        docker --version
                    else
                        echo "ERROR: Docker CLI not found."
                        exit 1
                    fi


                    # ------------------------------------------------
                    # Install kubectl if missing
                    # ------------------------------------------------
                    if ! command -v kubectl >/dev/null 2>&1; then

                        echo "kubectl not found."
                        echo "Downloading kubectl..."

                        if command -v curl >/dev/null 2>&1; then

                            curl -fsSL -o "${WORKSPACE}/bin/kubectl" \
                            "https://dl.k8s.io/release/v1.30.0/bin/linux/amd64/kubectl"

                        elif command -v wget >/dev/null 2>&1; then

                            wget -qO "${WORKSPACE}/bin/kubectl" \
                            "https://dl.k8s.io/release/v1.30.0/bin/linux/amd64/kubectl"

                        else

                            echo "ERROR: Neither curl nor wget is installed."
                            exit 1

                        fi

                        chmod +x "${WORKSPACE}/bin/kubectl"
                    fi


                    # ------------------------------------------------
                    # Kubernetes
                    # ------------------------------------------------
                    echo "kubectl version:"
                    kubectl version --client


                    # ------------------------------------------------
                    # Node / npm
                    # ------------------------------------------------
                    if command -v node >/dev/null 2>&1; then
                        echo "Node:"
                        node --version
                    else
                        echo "ERROR: Node.js not found."
                        exit 1
                    fi


                    if command -v npm >/dev/null 2>&1; then
                        echo "NPM:"
                        npm --version
                    else
                        echo "ERROR: npm not found."
                        exit 1
                    fi


                    # ------------------------------------------------
                    # Kubeconfig
                    # ------------------------------------------------
                    if [ -f "/var/jenkins_home/.kube/config" ]; then

                        echo "Kubeconfig found:"
                        echo "/var/jenkins_home/.kube/config"

                        export KUBECONFIG="/var/jenkins_home/.kube/config"

                    elif [ -f "$HOME/.kube/config" ]; then

                        echo "Kubeconfig found:"
                        echo "$HOME/.kube/config"

                        export KUBECONFIG="$HOME/.kube/config"

                    else

                        echo "WARNING: Kubernetes kubeconfig not found."

                    fi


                    echo "========================================"
                    echo " Working Directory"
                    echo "========================================"

                    pwd
                    ls -la
                '''
            }
        }


        // ============================================================
        // 3. CHECK PROJECT STRUCTURE
        // ============================================================
        stage('Verify Project Structure') {
            steps {
                sh '''
                    set -e

                    echo "Checking project directories..."

                    if [ ! -d "server" ]; then
                        echo "ERROR: server directory not found."
                        exit 1
                    fi

                    if [ ! -d "client" ]; then
                        echo "ERROR: client directory not found."
                        exit 1
                    fi

                    if [ ! -f "server/package.json" ]; then
                        echo "ERROR: server/package.json not found."
                        exit 1
                    fi

                    if [ ! -f "client/package.json" ]; then
                        echo "ERROR: client/package.json not found."
                        exit 1
                    fi

                    echo "Project structure verified."

                    echo ""
                    echo "Server:"
                    ls -la server

                    echo ""
                    echo "Client:"
                    ls -la client
                '''
            }
        }


        // ============================================================
        // 4. CODE QUALITY & TESTS
        // ============================================================
        stage('Code Quality & Tests') {

            parallel {

                // ----------------------------------------------------
                // BACKEND
                // ----------------------------------------------------
                stage('Backend Tests') {
                    steps {

                        dir('server') {

                            echo "========================================"
                            echo " BACKEND DEPENDENCIES"
                            echo "========================================"

                            sh '''
                                set -e

                                npm install --legacy-peer-deps

                                echo "Backend dependencies installed."

                                if node -e "let p=require('./package.json'); process.exit(p.scripts && p.scripts.test ? 0 : 1)"; then

                                    echo "Running backend tests..."
                                    npm test

                                else

                                    echo "No backend test script found."
                                    echo "Skipping backend tests."

                                fi
                            '''
                        }
                    }
                }


                // ----------------------------------------------------
                // FRONTEND
                // ----------------------------------------------------
                stage('Frontend Build Validation') {

                    steps {

                        dir('client') {

                            echo "========================================"
                            echo " FRONTEND BUILD"
                            echo "========================================"

                            sh '''
                                set -e

                                npm install --legacy-peer-deps

                                echo "Frontend dependencies installed."

                                npm run build

                                echo "Frontend build completed successfully."
                            '''
                        }
                    }
                }
            }
        }


        // ============================================================
        // 5. DOCKER BUILD
        // ============================================================
        stage('Docker Build') {

            steps {

                script {

                    echo "========================================"
                    echo " BUILDING DOCKER IMAGES"
                    echo "========================================"


                    // ------------------------------------------------
                    // Backend
                    // ------------------------------------------------
                    echo "Building Backend Image..."

                    sh """
                        docker build \
                        -t ${env.BACKEND_IMAGE}:latest \
                        -t ${env.BACKEND_IMAGE}:${env.IMAGE_TAG} \
                        ./server
                    """


                    // ------------------------------------------------
                    // Frontend
                    // ------------------------------------------------
                    echo "Building Frontend Image..."

                    sh """
                        docker build \
                        -t ${env.FRONTEND_IMAGE}:latest \
                        -t ${env.FRONTEND_IMAGE}:${env.IMAGE_TAG} \
                        ./client
                    """


                    echo "========================================"
                    echo " DOCKER IMAGES CREATED"
                    echo "========================================"

                    sh """
                        docker images | grep '${env.APP_NAME}' || true
                    """
                }
            }
        }


        // ============================================================
        // 6. KUBERNETES DEPLOYMENT
        // ============================================================
        stage('Deploy to Kubernetes') {

            steps {

                script {

                    sh '''
                        set -e

                        echo "========================================"
                        echo " KUBERNETES DEPLOYMENT"
                        echo "========================================"


                        # ------------------------------------------------
                        # Configure kubeconfig
                        # ------------------------------------------------
                        if [ -f "/var/jenkins_home/.kube/config" ]; then

                            export KUBECONFIG="/var/jenkins_home/.kube/config"

                        elif [ -f "$HOME/.kube/config" ]; then

                            export KUBECONFIG="$HOME/.kube/config"

                        else

                            echo "ERROR: Kubernetes kubeconfig not found."
                            exit 1

                        fi


                        # ------------------------------------------------
                        # Check cluster
                        # ------------------------------------------------
                        echo "Checking Kubernetes cluster..."

                        kubectl cluster-info


                        # ------------------------------------------------
                        # Create namespace
                        # ------------------------------------------------
                        echo "Applying namespace..."

                        kubectl apply -f k8s/00-namespace.yaml


                        # ------------------------------------------------
                        # Secrets / ConfigMap
                        # ------------------------------------------------
                        echo "Applying secrets and configmap..."

                        kubectl apply -f k8s/01-secrets-configmap.yaml


                        # ------------------------------------------------
                        # MongoDB
                        # ------------------------------------------------
                        echo "Deploying MongoDB..."

                        kubectl apply -f k8s/02-mongodb-deployment.yaml


                        # ------------------------------------------------
                        # Backend
                        # ------------------------------------------------
                        echo "Deploying Backend..."

                        kubectl apply -f k8s/03-backend-deployment.yaml


                        # ------------------------------------------------
                        # Frontend
                        # ------------------------------------------------
                        echo "Deploying Frontend..."

                        kubectl apply -f k8s/04-frontend-deployment.yaml


                        # ------------------------------------------------
                        # Ingress
                        # ------------------------------------------------
                        if [ -f "k8s/05-ingress.yaml" ]; then

                            echo "Deploying Ingress..."

                            kubectl apply -f k8s/05-ingress.yaml

                        else

                            echo "No ingress manifest found."

                        fi


                        echo "========================================"
                        echo " WAITING FOR DEPLOYMENTS"
                        echo "========================================"


                        # ------------------------------------------------
                        # Backend rollout
                        # ------------------------------------------------
                        kubectl rollout status \
                            deployment/backend-deployment \
                            -n mern-todo \
                            --timeout=180s


                        # ------------------------------------------------
                        # Frontend rollout
                        # ------------------------------------------------
                        kubectl rollout status \
                            deployment/frontend-deployment \
                            -n mern-todo \
                            --timeout=180s


                        echo "========================================"
                        echo " DEPLOYMENT COMPLETED"
                        echo "========================================"
                    '''
                }
            }
        }


        // ============================================================
        // 7. HEALTH CHECK
        // ============================================================
        stage('Post-Deploy Health Check') {

            steps {

                script {

                    sh '''
                        set -e

                        echo "========================================"
                        echo " POST DEPLOYMENT HEALTH CHECK"
                        echo "========================================"


                        # Configure kubeconfig
                        if [ -f "/var/jenkins_home/.kube/config" ]; then

                            export KUBECONFIG="/var/jenkins_home/.kube/config"

                        elif [ -f "$HOME/.kube/config" ]; then

                            export KUBECONFIG="$HOME/.kube/config"

                        else

                            echo "ERROR: Kubernetes kubeconfig not found."
                            exit 1

                        fi


                        echo ""
                        echo "========================================"
                        echo " PODS"
                        echo "========================================"

                        kubectl get pods -n mern-todo -o wide


                        echo ""
                        echo "========================================"
                        echo " SERVICES"
                        echo "========================================"

                        kubectl get services -n mern-todo


                        echo ""
                        echo "========================================"
                        echo " DEPLOYMENTS"
                        echo "========================================"

                        kubectl get deployments -n mern-todo


                        echo ""
                        echo "========================================"
                        echo " INGRESS"
                        echo "========================================"

                        kubectl get ingress -n mern-todo || true


                        echo ""
                        echo "========================================"
                        echo " HEALTH CHECK COMPLETED"
                        echo "========================================"
                    '''
                }
            }
        }
    }


    // ================================================================
    // POST ACTIONS
    // ================================================================
    post {

        always {

            echo "========================================"
            echo " CI/CD PIPELINE COMPLETED"
            echo " Build Number: ${env.BUILD_NUMBER}"
            echo "========================================"
        }


        success {

            echo "========================================================"
            echo "        FULL-STACK DEPLOYMENT SUCCEEDED"
            echo "========================================================"

            echo "Application: ${env.APP_NAME}"
            echo "Frontend Image: ${env.FRONTEND_IMAGE}:${env.IMAGE_TAG}"
            echo "Backend Image: ${env.BACKEND_IMAGE}:${env.IMAGE_TAG}"
        }


        failure {

            echo "========================================================"
            echo "        CI/CD PIPELINE FAILED"
            echo "========================================================"

            echo "Please check the Jenkins console output."
        }
    }
}
 
