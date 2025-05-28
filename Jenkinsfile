
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

    // stage('Pre-commit Checks') {
    //   steps {
    //     script {
    //       services.each { svc ->
    //         dir(svc.name) {
    //           int checkStyleErrors = 0
    //           int gitLeaksErrors   = 0
    //           int eslintErrors     = 0

    //           if (svc.lang == 'java') {
    //             // Maven Checkstyle
    //             bat 'mvn checkstyle:checkstyle'
    //             def csReport = readFile('target/checkstyle-result.xml')
    //             checkStyleErrors = (csReport =~ '<error ').count
    //             echo "Checkstyle Errors in ${svc.name}: ${checkStyleErrors}"

    //             // GitLeaks
    //             bat 'gitleaks detect --source . --report-path leaks.json'
    //             def glReport = readFile('leaks.json')
    //             gitLeaksErrors = (glReport =~ '"Leaks":\\[').count
    //             echo "GitLeaks Errors in ${svc.name}: ${gitLeaksErrors}"

    //             // Push metrics to Prometheus Pushgateway
    //             def metrics = """
    //             # HELP checkstyle_errors_total Total Checkstyle errors
    //             # TYPE checkstyle_errors_total counter
    //             checkstyle_errors_total{service="${svc.name}"} ${checkStyleErrors}

    //             # HELP gitleaks_errors_total Total GitLeaks errors
    //             # TYPE gitleaks_errors_total counter
    //             gitleaks_errors_total{service="${svc.name}"} ${gitLeaksErrors}
    //             """.trim()

    //             bat """
    //               echo ${metrics} | curl --data-binary @- \
    //                 http://<pushgateway_address>:9091/metrics/job/${env.JOB_NAME}/instance/${svc.name}
    //             """
    //           }
    //           else if (svc.lang == 'typescript') {
    //             // ESLint
    //             bat 'npx eslint "./src/**/*.ts" --format json --output-file eslint-report.json'
    //             def esReport = readFile('eslint-report.json')
    //             eslintErrors = (esReport =~ '"errorCount":\\s*(\\d+)')
    //                           .findAll()
    //                           .sum { it[1].toInteger() }
    //             echo "ESLint Errors in ${svc.name}: ${eslintErrors}"

    //             // GitLeaks
    //             bat 'gitleaks detect --source . --report-path leaks.json'
    //             def glReport = readFile('leaks.json')
    //             gitLeaksErrors = (glReport =~ '"Leaks":\\[').count
    //             echo "GitLeaks Errors in ${svc.name}: ${gitLeaksErrors}"

    //             // Push metrics
    //             def metrics = """
    //             # HELP eslint_errors_total Total ESLint errors
    //             # TYPE eslint_errors_total counter
    //             eslint_errors_total{service="${svc.name}"} ${eslintErrors}

    //             # HELP gitleaks_errors_total Total GitLeaks errors
    //             # TYPE gitleaks_errors_total counter
    //             gitleaks_errors_total{service="${svc.name}"} ${gitLeaksErrors}
    //             """.trim()

    //             bat """
    //               echo ${metrics} | curl --data-binary @- \
    //                 http://<pushgateway_address>:9091/metrics/job/${env.JOB_NAME}/instance/${svc.name}
    //             """
    //           }

    //           // Reset counters (if reused later)
    //           checkStyleErrors = 0
    //           gitLeaksErrors   = 0
    //           eslintErrors     = 0
    //         }
    //       }
    //     }
    //   }
    // }

    stage('Build and Unit Tests') {
      steps {
        script {
          // Prepare reports directory
          // mkdir dir: '/reports/junit'

          services.each { svc ->
            dir(svc.name) {
              if (svc.lang == 'java') {
                catchError(message: "Error executing Maven tests for ${svc.name}", buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                  bat 'mvn clean install package -DskipTests'
                  // bat 'mvn test'
                }
              } else if (svc.name == 'UserManagementMicroservice') {
                dir('server') {
                  catchError(message: "Error executing TypeScript tests for ${svc.name}", buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    bat 'npm install'
                    bat 'npx prisma generate'
                    bat 'npx tsc'
                    bat 'npx jest --coverage' || true
                  }
                }
              }
              else {
                 catchError(message: "Error executing TypeScript tests for ${svc.name}", buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    bat 'npm install'
                    bat 'npx prisma generate'
                    bat 'npx tsc'
                    bat 'npx jest --coverage' || true
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
      environment {
        // Define these at pipeline or stage level
        SONAR_TOKEN = credentials('cdac-project-sonar-token')
        SONARQUBE_URL = 'http://localhost:9000' // CHANGE_ME
      }
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
                        -Dsonar.host.url=${env.SONARQUBE_URL} \
                        -Dsonar.login=${env.SONAR_TOKEN}
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
                        -Dsonar.host.url=${env.SONARQUBE_URL} \
                        -Dsonar.token=${env.SONAR_TOKEN} \
                        -Dsonar.projectVersion=${env.BUILD_ID}
                    """)
                  }
                } // End withSonarQubeEnv

                // Quality Gate check, now correctly associated with the scan inside withSonarQubeEnv
                echo "SonarQube analysis submitted for ${svc.name}. Waiting for Quality Gate..."
                timeout(time: 10, unit: 'MINUTES') {
                  def qg = waitForQualityGate abortPipeline: false // Don't abort pipeline yet
                  if (qg.status != 'OK') {
                    currentBuild.result = 'FAILURE' // Mark build as failure
                    /* groovylint-disable-next-line LineLength */
                    error "Quality Gate for ${svc.name} failed: ${qg.status}. Dashboard: ${env.SONARQUBE_URL}/dashboard?id=${projectKeyForSonar}"
                  } else {
                    /* groovylint-disable-next-line LineLength */
                    echo "Quality Gate for ${svc.name} passed! Dashboard: ${env.SONARQUBE_URL}/dashboard?id=${projectKeyForSonar}"
                  }
                }
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
    stage('Dockerization of services and putting them in same network')
    {
      steps{
        bat(label: 'Clearing the existing compose containers',script: 'docker-compose down')
        bat(label: 'Running docker compose ',script: 'docker-compose up -d')
      }
    }
    stage('Stress and Load Testing using Jmeter')
    {
      steps{
        bat(label: 'Running jmeter test script',
        script: 'jmeter -n -t "./Testing/HTTP Request.jmx" -l results.jtl -e -o ./reports/jmeter ')
      }
      post{
          always {
            echo(message: 'Jmeter Stress and Load Testing finished, check the report at ./reports/jmeter')
          }
      }
    }

    stage('DAST Scanning using Zed ZAP'){
      steps{
        bat(label: 'Running ZAP Baseline scan',
        script: 'docker run -dt zaproxy/zap-stable zap-baseline.py -t http://localhost:5173 -r ./reports/zap.html')
      }
      post{
          always {
            echo(message: 'OWASP DAST Baseline scan finished please see the report at ./reports/zap/zap.html')
          }
      }
    }

  } // stages
}

//
