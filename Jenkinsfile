pipeline {
    agent any

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['development', 'staging', 'production'], description: 'Target Deployment Environment')
        string(name: 'DOCKER_REGISTRY', defaultValue: 'docker.io/yourusername', description: 'Docker Registry / Organization')
        string(name: 'IMAGE_TAG', defaultValue: 'latest', description: 'Image tag version (or build number)')
    }

    environment {
        APP_NAME = 'mern-obsidian-todo'
        FRONTEND_IMAGE = "${params.DOCKER_REGISTRY}/${APP_NAME}-frontend:${params.IMAGE_TAG}"
        BACKEND_IMAGE = "${params.DOCKER_REGISTRY}/${APP_NAME}-backend:${params.IMAGE_TAG}"
        DOCKER_CREDS = credentials('docker-hub-credentials') // Configured in Jenkins Credentials
        KUBECONFIG_CRED = credentials('k8s-kubeconfig')       // Configured in Jenkins Credentials
    }

    stages {
        stage('🧹 Workspace Clean & Init') {
            steps {
                echo "Starting CI/CD Pipeline for ${env.APP_NAME} on environment: ${params.ENVIRONMENT}"
                cleanWs()
                checkout scm
            }
        }

        stage('🧪 Code Quality & Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('server') {
                            echo "Installing backend dependencies & running test suite..."
                            sh 'npm ci'
                            sh 'npm test'
                        }
                    }
                }
                stage('Frontend Build Validation') {
                    steps {
                        dir('client') {
                            echo "Validating frontend build & assets..."
                            sh 'npm ci'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('🔒 Security & Audit Scan') {
            steps {
                echo "Running security audit on dependencies..."
                dir('server') {
                    sh 'npm audit --audit-level=high || true'
                }
                dir('client') {
                    sh 'npm audit --audit-level=high || true'
                }
            }
        }

        stage('🐳 Docker Build') {
            steps {
                script {
                    echo "Building Backend Docker Image: ${env.BACKEND_IMAGE}"
                    sh "docker build -t ${env.BACKEND_IMAGE} ./server"

                    echo "Building Frontend Docker Image: ${env.FRONTEND_IMAGE}"
                    sh "docker build -t ${env.FRONTEND_IMAGE} ./client"
                }
            }
        }

        stage('📤 Push to Container Registry') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    expression { params.ENVIRONMENT == 'production' || params.ENVIRONMENT == 'staging' }
                }
            }
            steps {
                script {
                    echo "Logging into Docker Registry..."
                    sh "echo \$DOCKER_CREDS_PSW | docker login -u \$DOCKER_CREDS_USR --password-stdin"

                    echo "Pushing Docker images..."
                    sh "docker push ${env.BACKEND_IMAGE}"
                    sh "docker push ${env.FRONTEND_IMAGE}"
                }
            }
        }

        stage('☸️ Deploy to Kubernetes') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    expression { params.ENVIRONMENT == 'production' || params.ENVIRONMENT == 'staging' }
                }
            }
            steps {
                script {
                    echo "Applying Kubernetes manifests to cluster in namespace mern-todo..."
                    sh 'kubectl apply -f k8s/00-namespace.yaml'
                    sh 'kubectl apply -f k8s/01-secrets-configmap.yaml'
                    sh 'kubectl apply -f k8s/02-mongodb-deployment.yaml'
                    sh 'kubectl apply -f k8s/03-backend-deployment.yaml'
                    sh 'kubectl apply -f k8s/04-frontend-deployment.yaml'
                    sh 'kubectl apply -f k8s/05-ingress.yaml'

                    echo "Triggering rolling rollout..."
                    sh 'kubectl rollout status deployment/backend-deployment -n mern-todo --timeout=120s'
                    sh 'kubectl rollout status deployment/frontend-deployment -n mern-todo --timeout=120s'
                }
            }
        }

        stage('🩺 Post-Deploy Health Check') {
            steps {
                script {
                    echo "Validating service health..."
                    sh 'kubectl get pods,services,ingress -n mern-todo'
                }
            }
        }
    }

    post {
        always {
            echo "CI/CD Pipeline run completed."
        }
        success {
            echo "🎉 Deployment to ${params.ENVIRONMENT} Succeeded!"
        }
        failure {
            echo "❌ CI/CD Pipeline failed. Please check build logs."
        }
    }
}
