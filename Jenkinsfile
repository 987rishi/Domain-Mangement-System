
def services = [
  [name: 'WorkFlowIpVaptService',      lang: 'java'],
  [name: 'ApiGateway',                 lang: 'java'],
  [name: 'NotificationMicroservice',   lang: 'typescript'],
  [name: 'RenewalAndTransferMicroService', lang: 'typescript'],
  [name: 'UserManagementMicroservice', lang: 'typescript'],
  [name: 'ServiceRegistry',            lang: 'java']
]

pipeline {
  agent any
   environment {
        // This ID matches the 'ID' you gave the Secret file in Jenkins
        ALL_SERVICES_ENV_FILE_CRED_ID = 'cdac-env-file'
        COMMIT_HASH = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
    }
  stages {
    stage('Load Environment Variables from Secret File') {
            steps {
                // Use withCredentials to access the secret file.
                // It will make the file available at a temporary path,
                // and the path is stored in an environment variable (e.g., MY_ENV_FILE).
                withCredentials([file(credentialsId: env.ALL_SERVICES_ENV_FILE_CRED_ID, variable: 'SECRET_ENV_FILE_PATH')]) {
                    script {
                        echo "Secret environment file is available at: ${env.SECRET_ENV_FILE_PATH}"
                        
                        // Read the file line by line and set environment variables
                        def envFileContent = readFile(env.SECRET_ENV_FILE_PATH).trim()

                        writeFile file: '.env', text: envFileContent
                        echo "Successfully created .env file in the workspace for Docker Compose."

                        envFileContent.eachLine { line ->
                            // Skip comments and empty lines
                            line = line.trim()
                            if (line && !line.startsWith('#')) {
                                def parts = line.split('=', 2) // Split only on the first '='
                                if (parts.size() == 2) {
                                    def key = parts[0].trim()
                                    def value = parts[1].trim()
                                    
                                    // Handle potential quotes around the value
                                    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                                        value = value.substring(1, value.length() - 1)
                                    }
                                    
                                    echo "Setting environment variable: ${key}" // Value will be masked if sensitive
                                    env."${key}" = value // Set it as a pipeline environment variable
                                } else {
                                    echo "Skipping malformed line: ${line}"
                                }
                            }
                        }
                        echo "Finished loading environment variables."

                        // Example: Set a specific NODE_ENV based on one of the loaded values
                        // Assuming you loaded NODE_ENV_DEVELOPMENT or NODE_ENV_PRODUCTION from the file
                        // You can then choose which one to assign to the generic NODE_ENV
                        if (env.NODE_ENV_DEVELOPMENT) { // Check if it was loaded
                           env.NODE_ENV = env.NODE_ENV_DEVELOPMENT // Or env.NODE_ENV_PRODUCTION
                        } else {
                           env.NODE_ENV = "development" // Default if not specified
                        }
                        echo "Effective NODE_ENV: ${env.NODE_ENV}"
                    }
                }
                // The env.SECRET_ENV_FILE_PATH is only valid inside the withCredentials block.
                // The individual env vars (env.WORKFLOW_SERVICE_DB_URL etc.) are now set for subsequent stages.
            }
        }




    stage('Checkout') {
      steps {
        echo 'Pulling source code from GitHub'
        checkout scm
      }
    }
    stage('Pre-commit Checks') {
            steps {
                script {
                    services.each { svc ->
                        dir(svc.name) {
                            echo "Running checks for ${svc.name}"
                            echo "Example from loaded env: EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE = ${env.EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE}"
                            echo "WORKFLOW_SERVICE_DB_PASSWORD is (masked): ${env.WORKFLOW_SERVICE_DB_PASSWORD}"
                            echo "NODE_ENV for this stage: ${env.NODE_ENV}"
                            // ... your check commands ...
                        }
                    }
                }
            }
        }

    
    stage('Check SonarQube Env') {
            steps {
                script {
                    // Attempt to use it in a very minimal way
                    try {
                        // Replace 'your-sonarqube-server-name' with the actual name
                        // configured in Manage Jenkins -> Configure System -> SonarQube servers
                        // e.g., 'cdac-project-sonar-server' from your logs
                        withSonarQubeEnv('cdac-project-sonar-server') {
                            echo "SUCCESS: withSonarQubeEnv('cdac-project-sonar-server') is available and the server name is recognized."
                            // You can also try to echo some environment variables it sets
                            echo "SONAR_HOST_URL: ${env.SONAR_HOST_URL}"
                            echo "SONAR_AUTH_TOKEN available: ${env.SONAR_AUTH_TOKEN != null}" // Don't echo the token itself for security
                        }
                    } catch (MissingMethodException e) {
                        echo "ERROR: withSonarQubeEnv step is NOT available. Is the SonarQube Scanner plugin installed and enabled?"
                        echo "Exception: ${e}"
                        currentBuild.result = 'FAILURE'
                        error("Halting build: SonarQube Scanner plugin step missing.")
                    } catch (Exception e) {
                        // This might catch issues if the server name is wrong or other config problems
                        echo "ERROR: Problem executing withSonarQubeEnv. Check SonarQube server configuration in Jenkins."
                        echo "Exception: ${e}"
                        // It's possible the error message "ERROR: cdac-project-sonar-server" comes from this block
                        // if Jenkins can't find the server configuration by that name.
                        currentBuild.result = 'FAILURE'
                        error("Halting build: Problem with SonarQube environment.")
                    }
                }
            }
        }

    stage('Build and Unit Tests') {
      steps {
        script {
          // Prepare reports directory
          // mkdir dir: '/reports/junit'

          services.each { svc ->
            dir(svc.name) {
              if (svc.lang == 'java') {
                catchError(message: "Error executing Maven tests for ${svc.name}", buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                  bat 'mvn clean verify'
                  // bat 'mvn test'
                }
              } else if (svc.name == 'UserManagementMicroservice') {
                dir('server') {
                  catchError(message: "Error executing TypeScript tests for ${svc.name}", buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    bat 'npm install'
                    bat 'npx prisma generate'
                    bat 'npx tsc'
                    bat 'npx jest'
                  }
                }
              }
              else {
                 catchError(message: "Error executing TypeScript tests for ${svc.name}", buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    bat 'npm install'
                    bat 'npx prisma generate'
                    bat 'npx tsc'
                    bat 'npx jest --coverage'
                }
              }
            }
          }
        }
      }
      post {
        always {
          junit testResults: '/reports/junit/*.xml'
        }
      }
    }
    stage('SAST Analysis using SonarQube') {
      steps {
        script {
          // Optional: Install @sonar/scan once if not a devDependency or globally on agent
          // sh 'npm install -g @sonar/scan' // Or handle via npx / devDependency

          services.each { svc ->
            dir(svc.name) {
              echo "--- Starting SonarQube Analysis for ${svc.name} ---"
              // Define projectKey either from svc map or derive it
              String projectKeyForSonar = svc.name // Example: using service name as key

              try {
                // 'cdac-project-sonar-server' must match the SonarQube server name in Jenkins Global Config
                withSonarQubeEnv('cdac-project-sonar-server') {
                  if (svc.lang == 'java') {
                    bat(label: "Sonar Scan for ${svc.name}", script: """
                      mvn sonar:sonar \
                        -Dsonar.projectKey=${projectKeyForSonar} \
                        -Dsonar.projectName=${svc.name} \
                        -Dsonar.host.url=${env.SONAR_HOST_URL} \
                    """)
                  } else { // TypeScript
                    // Assuming @sonar/scan is available (globally, via npx, or path)
                    // And sonar-project.properties defines sonar.sources, sonar.javascript.lcov.reportPaths etc.
                    // OR you pass them all via -D
                    bat(label: 'Installing sonar/scan', script: 'npm install -g @sonar/scan')
                    bat(label: "Sonar Scan for ${svc.name}", script: """
                      sonar \
                        -Dsonar.projectKey=${projectKeyForSonar} \
                        -Dsonar.projectName=${svc.name} \
                        -Dsonar.host.url=${env.SONAR_HOST_URL} \
                        -Dsonar.token=${env.SONAR_AUTH_TOKEN} \
                        -Dsonar.projectVersion=${env.BUILD_ID}
                    """)
                  }
                } // End withSonarQubeEnv

                // Quality Gate check, now correctly associated with the scan inside withSonarQubeEnv
                // echo "SonarQube analysis submitted for ${svc.name}. Waiting for Quality Gate..."
                // timeout(time: 4, unit: 'MINUTES') {
                //   def qg = waitForQualityGate abortPipeline: false // Don't abort pipeline yet
                //   if (qg.status != 'OK') {
                //     currentBuild.result = 'FAILURE' // Mark build as failure
                //     /* groovylint-disable-next-line LineLength */
                //     error "Quality Gate for ${svc.name} failed: ${qg.status}. Dashboard: ${env.SONARQUBE_HOST_URL}/dashboard?id=${projectKeyForSonar}"
                //   } else {
                //     /* groovylint-disable-next-line LineLength */
                //     echo "Quality Gate for ${svc.name} passed! Dashboard: ${env.SONARQUBE_HOST_URL}/dashboard?id=${projectKeyForSonar}"
                //   }
              // }
              } catch (e) {
                currentBuild.result = 'FAILURE' // Ensure any exception in the try block fails the build
                error "SonarQube analysis or Quality Gate processing failed for ${svc.name}: ${e.getMessage()}"
              }
              echo "--- SonarQube Analysis for ${svc.name} finished ---"
            }
          }
        }
      }
    }
    stage('Build Docker Images') {
      steps {
          script {
             
              services.each { svc ->
                      dir(svc.name) {
                        if(svc.name == 'UserManagementMicroservice') {
                          dir('server') {
                            if (fileExists('Dockerfile')) {
                            echo "Building Docker image for ${svc.name}"
                            bat "docker build -t weakpassword/${svc.name.toLowerCase()}:${COMMIT_HASH}"
                            }
                            else {
                              error(message: "${svc.name} does not contain a Dockerfile")
                            }
                          }
                        }
                        else if (fileExists('Dockerfile')) {
                            echo "Building Docker image for ${svc.name}"
                            bat "docker build -t weakpassword/${svc.name.toLowerCase()}:${COMMIT_HASH}"
                            // bat "docker push weakpassword/${svc.name.toLowerCase()}:latest"
                        }
                        else {
                          error(message: "${svc.name} does not contain a Dockerfile")
                        }
                      
                }
              }
          }
      }
    }
    stage('Dockerization of services and putting them in same network')
    {
      steps{
        bat(label: 'Clearing the existing compose containers', script: 'docker-compose down -v')
        bat(label: 'Running docker compose ', script: 'docker-compose up -d')
      }
    }
    stage('Stress and Load Testing using JMeter') {
      steps {
 
        sleep(time: 10, unit: 'SECONDS')
          
        
        // 1. Clean up the old JMeter report directory before the test.
        bat(label: 'Cleaning up previous JMeter report', script: 'if exist .\\reports\\jmeter (rmdir /s /q .\\reports\\jmeter)')

        // 2. Run the JMeter test. Target the API Gateway by its internal Docker network name.
        //    (Assuming your JMX file is configured to hit 'apigateway:8080' or a similar internal URL)
        bat(label: 'Running JMeter test script',
            script: 'jmeter -n -t ".\\Testing\\HTTP Request.jmx" -l results.jtl -e -o .\\reports\\jmeter')

      }
      post {
        always {
          // 3. Archive the report so it's saved with the build.
          archiveArtifacts artifacts: 'reports/jmeter/**', allowEmptyArchive: true
          echo('JMeter Stress and Load Testing finished. Check the archived report in the Jenkins build.')
        }
      }
    }

    stage('DAST Scanning using Zed ZAP') {
      steps {
        script {
          def composeNetwork = 'cdacpipelinescript_application-network'
          def targetUrl = 'http://host.docker.internal:8085'

          echo "Preparing for DAST scan..."

          // 1. Clean up the old ZAP report directory.
          bat(label: 'Cleaning up previous ZAP report', script: 'if exist .\\reports\\zap (rmdir /s /q .\\reports\\zap)')

          echo "Starting ZAP Baseline Scan against ${targetUrl} on network ${composeNetwork}"

          bat(label: 'Running ZAP Baseline scan',
              script: """
                docker run --rm --network ${composeNetwork} -v "%CD%/reports/zap:/zap/wrk/" zaproxy/zap-stable zap-baseline.py -t ${targetUrl} -r /zap
              """)
        }
      }
      post {
        always {
          // 4. Archive the ZAP report for easy access.
          archiveArtifacts artifacts: 'reports/zap/zap.html', allowEmptyArchive: true
          echo('OWASP ZAP DAST scan finished. Check the archived report "zap.html" in the Jenkins build.')
        }
      }
    }

    stage(name: 'Push to docker hub') {
      steps{
          script {
            services.each {
              svc -> bat(label: 'Pushing to docker hub', script: "docker push weakpassword/${svc.name.toLowerCase()}:latest")
            }
          }
      }
    }
  } // stages

  post {
    always {
      // Use -v to also remove volumes, ensuring a clean state for the next run.
      bat(label: 'Clearing docker containers and volumes', script: 'docker-compose down -v')
      
      // deleteDir() is the most robust way to clean the workspace.
      echo "Cleaning up the workspace for the next run."
      deleteDir()
    }
  }
}
