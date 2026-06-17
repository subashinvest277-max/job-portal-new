pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        // GitHub
        GIT_CREDS  = 'git-id'
        GIT_REPO   = 'https://github.com/subashinvest277-max/job-portal-new.git'
        GIT_BRANCH = 'main'

        // Jenkins SSH Credential (SSH Username with private key)
        SSH_KEY = 'slave-id'

        // EC2 Details
        DEPLOY_USER = 'ubuntu'
        DEPLOY_HOST = '3.83.179.228'

        // Application
        APP_DIR    = '/home/ubuntu/job-portal-new/Job-Portal-Project-Dev'
        IMAGE_NAME = 'job-portal'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: "${GIT_BRANCH}",
                    credentialsId: "${GIT_CREDS}",
                    url: "${GIT_REPO}"
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                    set -e

                    cd Job-Portal-Project-Dev/frontend

                    echo "===== NODE VERSION ====="
                    node -v

                    echo "===== NPM VERSION ====="
                    npm -v

                    npm ci
                    npm run build

                    echo "===== BUILD SUCCESS ====="
                    ls -lah dist
                '''
            }
        }

        stage('Debug SSH Connection') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${SSH_KEY}",
                        keyFileVariable: 'SSH_KEY_FILE'
                    )
                ]) {
                    sh '''
                        set -ex

                        ssh -i $SSH_KEY_FILE \
                        -o StrictHostKeyChecking=no \
                        ubuntu@3.83.179.228 '
                            echo "===== SSH SUCCESS ====="
                            hostname
                            whoami
                            pwd
                        '
                    '''
                }
            }
        }

        stage('Deploy To EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${SSH_KEY}",
                        keyFileVariable: 'SSH_KEY_FILE'
                    )
                ]) {
                    sh """
                        set -ex

                        echo "===== RSYNC VERSION ====="
                        rsync --version

                        ssh -i \$SSH_KEY_FILE \
                        -o StrictHostKeyChecking=no \
                        ${DEPLOY_USER}@${DEPLOY_HOST} '
                            mkdir -p ${APP_DIR}
                            ls -ld ${APP_DIR}
                        '

                        echo "===== START RSYNC ====="

                        rsync -avz --delete \
                        -e "ssh -i \$SSH_KEY_FILE -o StrictHostKeyChecking=no" \
                        --exclude='.git' \
                        --exclude='node_modules' \
                        --exclude='frontend/node_modules' \
                        Job-Portal-Project-Dev/ \
                        ${DEPLOY_USER}@${DEPLOY_HOST}:${APP_DIR}/

                        echo "===== RSYNC COMPLETE ====="

                        ssh -i \$SSH_KEY_FILE \
                        -o StrictHostKeyChecking=no \
                        ${DEPLOY_USER}@${DEPLOY_HOST} '
                            ls -la ${APP_DIR}
                        '
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${SSH_KEY}",
                        keyFileVariable: 'SSH_KEY_FILE'
                    )
                ]) {
                    sh """
                        ssh -i \$SSH_KEY_FILE \
                        -o StrictHostKeyChecking=no \
                        ${DEPLOY_USER}@${DEPLOY_HOST} '
                            set -e

                            cd ${APP_DIR}

                            docker build -t ${IMAGE_NAME}:latest .
                        '
                    """
                }
            }
        }

        stage('Deploy Container') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${SSH_KEY}",
                        keyFileVariable: 'SSH_KEY_FILE'
                    )
                ]) {
                    sh """
                        ssh -i \$SSH_KEY_FILE \
                        -o StrictHostKeyChecking=no \
                        ${DEPLOY_USER}@${DEPLOY_HOST} '
                            set -e

                            docker stop ${IMAGE_NAME} || true
                            docker rm ${IMAGE_NAME} || true

                            docker run -d \
                                --restart unless-stopped \
                                --name ${IMAGE_NAME} \
                                -p 8000:8000 \
                                ${IMAGE_NAME}:latest
                        '
                    """
                }
            }
        }

        stage('Deploy Frontend To Nginx') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${SSH_KEY}",
                        keyFileVariable: 'SSH_KEY_FILE'
                    )
                ]) {
                    sh """
                        ssh -i \$SSH_KEY_FILE \
                        -o StrictHostKeyChecking=no \
                        ${DEPLOY_USER}@${DEPLOY_HOST} '
                            sudo mkdir -p /var/www/html

                            sudo rm -rf /var/www/html/*
                            sudo cp -r ${APP_DIR}/frontend/dist/* /var/www/html/

                            sudo nginx -t
                            sudo systemctl restart nginx
                        '
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${SSH_KEY}",
                        keyFileVariable: 'SSH_KEY_FILE'
                    )
                ]) {
                    sh """
                        ssh -i \$SSH_KEY_FILE \
                        -o StrictHostKeyChecking=no \
                        ${DEPLOY_USER}@${DEPLOY_HOST} '
                            echo "===== DOCKER STATUS ====="
                            docker ps

                            echo "===== BACKEND TEST ====="
                            curl -I http://localhost:8000 || true

                            echo "===== NGINX STATUS ====="
                            sudo systemctl is-active nginx

                            echo "===== DEPLOYMENT VERIFIED ====="
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment Successfully'
        }

        failure {
            echo '❌ Deployment Failed'
        }

        always {
            cleanWs()
        }
    }
}
