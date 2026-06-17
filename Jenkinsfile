pipeline {

    agent any

    triggers {
        githubPush()
    }

    environment {

        GIT_CREDS  = 'git-id'
        GIT_REPO   = 'https://github.com/subashinvest277-max/job-portal-new.git'
        GIT_BRANCH = 'main'

        SSH_KEY = 'slave-id'

        DEPLOY_USER = 'ubuntu'
        DEPLOY_HOST = '3.83.179.228'

        APP_DIR = '/home/ubuntu/job-portal-new/Job-Portal-Project-Dev'

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

        stage('Verify SSH') {

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
                            hostname
                            whoami
                        '
                    """
                }
            }
        }

        stage('Deploy Source Code') {

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
                            mkdir -p ${APP_DIR}
                        '

                        rsync -avz --delete \
                        -e "ssh -i \$SSH_KEY_FILE -o StrictHostKeyChecking=no" \
                        --exclude='.git' \
                        --exclude='node_modules' \
                        --exclude='frontend/node_modules' \
                        Job-Portal-Project-Dev/ \
                        ${DEPLOY_USER}@${DEPLOY_HOST}:${APP_DIR}/
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

                            cd ${APP_DIR}

                            docker build \
                            -t ${IMAGE_NAME}:latest .
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

                            docker stop ${IMAGE_NAME} || true

                            docker rm ${IMAGE_NAME} || true

                            docker run -d \
                                --restart unless-stopped \
                                --name ${IMAGE_NAME} \
                                -p 80:80 \
                                ${IMAGE_NAME}:latest
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

                            docker ps

                            curl -I http://localhost
                        '
                    """
                }
            }
        }
    }

    post {

        success {
            echo 'Deployment Successful'
        }

        failure {
            echo 'Deployment Failed'
        }

        always {
            cleanWs()
        }
    }
}
