
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

    // stage('Pre-commit Checks') {
    //         steps {
    //             script {
    //                 services.each { svc ->
    //                     dir(svc.name) {
    //                         echo "Running checks for ${svc.name}"
    //                         echo "Example from loaded env: EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE = ${env.EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE}"
    //                         echo "WORKFLOW_SERVICE_DB_PASSWORD is (masked): ${env.WORKFLOW_SERVICE_DB_PASSWORD}"
    //                         echo "NODE_ENV for this stage: ${env.NODE_ENV}"
    //                         // ... your check commands ...
    //                     }
    //                 }
    //             }
    //         }
    //     }

    stage('Pre-commit Checks') {
      steps {
          script {
      boolean anyServiceFailedChecks = false

      services.each { svc ->
        echo "--- Running Pre-commit Checks for ${svc.name} ---"
        dir(svc.name) {
          int checkStyleErrors = 0
          int gitLeaksErrorsCount = 0
          int eslintErrorCount = 0
          String serviceWorkspacePath = pwd() // Path to the service's root directory

          // --- GitLeaks (Common for both Java and TypeScript) ---
          try {
            echo "Running GitLeaks for ${svc.name}..."
            bat script: 'gitleaks detect --source . --report-path gitleaks-report.json --report-format json --exit-code 0 --verbose', label: "GitLeaks for ${svc.name}"
            String gitleaksReportFilePath = "${serviceWorkspacePath}/gitleaks-report.json"
            if (fileExists(gitleaksReportFilePath)) {
              def glReportContent = readFile(gitleaksReportFilePath).trim()
              if (glReportContent) {
                def matcher = (glReportContent =~ /"RuleID":\s*"/)
                gitLeaksErrorsCount = 0
                while (matcher.find()) {
                    gitLeaksErrorsCount++
                }
              } else {
                gitLeaksErrorsCount = 0
              }
              echo "GitLeaks Found in ${svc.name}: ${gitLeaksErrorsCount}"
            } else {
              echo "WARN: GitLeaks report (gitleaks-report.json) not found for ${svc.name}."
            }
          } catch (e) {
            echo "ERROR running GitLeaks for ${svc.name}: ${e.getMessage()}"
            gitLeaksErrorsCount = 1 
            anyServiceFailedChecks = true
            currentBuild.result = 'FAILURE'
          }

          // --- Language-Specific Checks ---
          if (svc.lang == 'java') {
            try {
              echo "Running Checkstyle for ${svc.name}..."
              bat script: 'mvn checkstyle:checkstyle -Dcheckstyle.failOnViolation=false', label: "Checkstyle for ${svc.name}"
              String checkstyleReportFilePath = "${serviceWorkspacePath}/target/checkstyle-result.xml"
              if (fileExists(checkstyleReportFilePath)) {
                def csReport = readFile(checkstyleReportFilePath)
                def errorMatcher = (csReport =~ /<error /)
                checkStyleErrors = 0
                while (errorMatcher.find()) {
                    checkStyleErrors++
                }
                echo "Checkstyle Errors in ${svc.name}: ${checkStyleErrors}"
              } else {
                echo "WARN: Checkstyle report (target/checkstyle-result.xml) not found for ${svc.name}."
              }
            } catch (e) {
              echo "ERROR running Checkstyle for ${svc.name}: ${e.getMessage()}"
              checkStyleErrors = 1
              anyServiceFailedChecks = true
              currentBuild.result = 'FAILURE'
            }

            def metricsJava = """
            # HELP checkstyle_errors_total Total Checkstyle errors
            # TYPE checkstyle_errors_total gauge
            checkstyle_errors_total{service="${svc.name}",job="${env.JOB_NAME}"} ${checkStyleErrors}
            # HELP gitleaks_findings_total Total GitLeaks findings
            # TYPE gitleaks_findings_total gauge
            gitleaks_findings_total{service="${svc.name}",job="${env.JOB_NAME}"} ${gitLeaksErrorsCount}
            """.stripIndent().trim()
            def metricsFileJava = "${serviceWorkspacePath}/metrics_java_${svc.name}.prom" // Write in service dir
            writeFile file: metricsFileJava, text: metricsJava
            try {
                bat script: "curl --data-binary \"@${metricsFileJava}\" http://localhost:9091/metrics/job/jenkins_${env.JOB_NAME}/instance/${svc.name}", label: "Push Java Metrics for ${svc.name}"
            } catch (e) {
                echo "WARN: Failed to push Java metrics for ${svc.name} to Pushgateway: ${e.getMessage()}"
            } finally {
                bat script: "del /F /Q \"${metricsFileJava}\"", label: "Clean up Java metrics file for ${svc.name}"
            }

          } else if (svc.lang == 'typescript') {
            // ESLint
            try {
                echo "Running ESLint for ${svc.name}..."
                // Define paths relative to the service's root directory (current 'dir' context)
                String eslintOutputFile = "eslint-report.json" // Name of the output file
                String eslintCommand = "npx eslint \"./src/**/*.ts\" --format json --output-file \"${eslintOutputFile}\" || exit 0"
                String effectiveEslintReportPath = eslintOutputFile // Default path within current dir

                if (svc.name == 'UserManagementMicroservice') {
                    dir('server') {
                        echo "Running npm install in ${pwd()} for ${svc.name}"
                        bat 'npm install'
                        echo "Running ESLint in ${pwd()} for ${svc.name}"
                        bat script: eslintCommand, label: "ESLint for ${svc.name}"
                    }
                    // After dir('server'), pwd() is back to service root. Report is in 'server/eslint-report.json'
                    effectiveEslintReportPath = "server/${eslintOutputFile}"
                } else {
                    echo "Running npm install in ${pwd()} for ${svc.name}"
                    bat 'npm install'
                    echo "Running ESLint in ${pwd()} for ${svc.name}"
                    bat script: eslintCommand, label: "ESLint for ${svc.name}"
                    // effectiveEslintReportPath remains eslintOutputFile (relative to service root)
                }
                
                if (fileExists(effectiveEslintReportPath)) {
                    try {
                        def esReportJson = readJSON(file: effectiveEslintReportPath)
                        if (esReportJson instanceof List) {
                            eslintErrorCount = esReportJson.sum { fileResult ->
                                (fileResult != null && fileResult.errorCount != null) ? fileResult.errorCount.toInteger() : 0
                            }
                        } else if (esReportJson instanceof Map && esReportJson.errorCount != null) {
                             eslintErrorCount = esReportJson.errorCount.toInteger()
                        } else {
                            echo "WARN: ESLint report for ${svc.name} (${effectiveEslintReportPath}) has an unexpected format or no errorCount. Content: ${readFile(effectiveEslintReportPath)}"
                            eslintErrorCount = 0
                        }
                    } catch (jsonEx) {
                        echo "ERROR parsing ESLint report JSON for ${svc.name} from ${effectiveEslintReportPath}: ${jsonEx.getMessage()}"
                        def reportContentForDebug = readFile(file: effectiveEslintReportPath).trim()
                        echo "DEBUG: Content of ${effectiveEslintReportPath}: '${reportContentForDebug}'"
                        if (reportContentForDebug == "") {
                            echo "ESLint report file is empty."
                            eslintErrorCount = 0
                        } else {
                            eslintErrorCount = 1 // Indicate a parsing failure
                            anyServiceFailedChecks = true
                            // currentBuild.result = 'FAILURE' // Do not fail here, let the sum decide
                        }
                    }
                    echo "ESLint Errors in ${svc.name}: ${eslintErrorCount}"
                } else {
                    echo "WARN: ESLint report (${effectiveEslintReportPath}) not found for ${svc.name}. Check ESLint config, file paths, or if any .ts files exist in src."
                    eslintErrorCount = 0
                }
            } catch (e) {
                echo "ERROR during ESLint execution for ${svc.name}: ${e.getMessage()}"
                eslintErrorCount = 1 
                anyServiceFailedChecks = true
                // currentBuild.result = 'FAILURE'
            }

            // Prometheus Push for TypeScript
            def metricsTs = """
            # HELP eslint_errors_total Total ESLint errors
            # TYPE eslint_errors_total gauge
            eslint_errors_total{service="${svc.name}",job="${env.JOB_NAME}"} ${eslintErrorCount}
            # HELP gitleaks_findings_total Total GitLeaks findings
            # TYPE gitleaks_findings_total gauge
            gitleaks_findings_total{service="${svc.name}",job="${env.JOB_NAME}"} ${gitLeaksErrorsCount}
            """.stripIndent().trim()
            def metricsFileTs = "${serviceWorkspacePath}/metrics_ts_${svc.name}.prom"
            writeFile file: metricsFileTs, text: metricsTs
            try {
                bat script: "curl --data-binary \"@${metricsFileTs}\" http://localhost:9091/metrics/job/jenkins_${env.JOB_NAME}/instance/${svc.name}", label: "Push TS Metrics for ${svc.name}"
            } catch (e) {
                echo "WARN: Failed to push TypeScript metrics for ${svc.name} to Pushgateway: ${e.getMessage()}"
            } finally {
                bat script: "del /F /Q \"${metricsFileTs}\"", label: "Clean up TS metrics file for ${svc.name}"
            }
          }

          // Decision Point
          if (gitLeaksErrorsCount > 0) {
            echo "FAILURE: ${svc.name} has ${gitLeaksErrorsCount} GitLeaks findings."
            anyServiceFailedChecks = true
            // currentBuild.result = 'FAILURE'
          }
          if (svc.lang == 'java' && checkStyleErrors > 0) {
            echo "FAILURE: ${svc.name} has ${checkStyleErrors} Checkstyle errors."
            anyServiceFailedChecks = true
            // currentBuild.result = 'FAILURE'
          }
          if (svc.lang == 'typescript' && eslintErrorCount > 0) {
            echo "FAILURE: ${svc.name} has ${eslintErrorCount} ESLint errors."
            anyServiceFailedChecks = true
            // currentBuild.result = 'FAILURE'
          }
          echo "--- Pre-commit Checks for ${svc.name} Finished ---"
        } // End dir(svc.name)
      } // End services.each

      if (anyServiceFailedChecks) {
        error("One or more services failed pre-commit checks. See console output for details.")
      } else {
        echo "All services passed pre-commit checks."
      }
    }
      }
    }
    // stage('Check SonarQube Env') {
    //         steps {
    //             script {
    //                 // Attempt to use it in a very minimal way
    //                 try {
    //                     // Replace 'your-sonarqube-server-name' with the actual name
    //                     // configured in Manage Jenkins -> Configure System -> SonarQube servers
    //                     // e.g., 'cdac-project-sonar-server' from your logs
    //                     withSonarQubeEnv('cdac-project-sonar-server') {
    //                         echo "SUCCESS: withSonarQubeEnv('cdac-project-sonar-server') is available and the server name is recognized."
    //                         // You can also try to echo some environment variables it sets
    //                         echo "SONAR_HOST_URL: ${env.SONAR_HOST_URL}"
    //                         echo "SONAR_AUTH_TOKEN available: ${env.SONAR_AUTH_TOKEN != null}" // Don't echo the token itself for security
    //                     }
    //                 } catch (MissingMethodException e) {
    //                     echo "ERROR: withSonarQubeEnv step is NOT available. Is the SonarQube Scanner plugin installed and enabled?"
    //                     echo "Exception: ${e}"
    //                     currentBuild.result = 'FAILURE'
    //                     error("Halting build: SonarQube Scanner plugin step missing.")
    //                 } catch (Exception e) {
    //                     // This might catch issues if the server name is wrong or other config problems
    //                     echo "ERROR: Problem executing withSonarQubeEnv. Check SonarQube server configuration in Jenkins."
    //                     echo "Exception: ${e}"
    //                     // It's possible the error message "ERROR: cdac-project-sonar-server" comes from this block
    //                     // if Jenkins can't find the server configuration by that name.
    //                     currentBuild.result = 'FAILURE'
    //                     error("Halting build: Problem with SonarQube environment.")
    //                 }
    //             }
    //         }
    //     }

    // stage('Build and Unit Tests') {
    //   steps {
    //     script {
    //       // Prepare reports directory
    //       // mkdir dir: '/reports/junit'

    //       services.each { svc ->
    //         dir(svc.name) {
    //           if (svc.lang == 'java') {
    //             catchError(message: "Error executing Maven tests for ${svc.name}", buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
    //               bat 'mvn clean install package -DskipTests'
    //               // bat 'mvn test'
    //             }
    //           } else if (svc.name == 'UserManagementMicroservice') {
    //             dir('server') {
    //               catchError(message: "Error executing TypeScript tests for ${svc.name}", buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
    //                 bat 'npm install'
    //                 bat 'npx prisma generate'
    //                 bat 'npx tsc'
    //                 bat 'npx jest --coverage --passWithNoTests'
    //               }
    //             }
    //           }
    //           else {
    //              catchError(message: "Error executing TypeScript tests for ${svc.name}", buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
    //                 bat 'npm install'
    //                 bat 'npx prisma generate'
    //                 bat 'npx tsc'
    //                 bat 'npx jest --coverage --passWithNoTests'
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    //   post {
    //     always {
    //       junit testResults: '/reports/junit/*.xml'
    //     }
    //   }
    // }

    // stage('SAST Analysis using SonarQube') {
    //   // environment {
    //   //   // Define these at pipeline or stage level
    //   //   // SONAR_TOKEN = credentials('cdac-project-sonar-server')
    //   //   // SONARQUBE_URL = 'http://localhost:9000' // CHANGE_ME
    //   // }
    //   steps {
    //     script {
    //       // Optional: Install @sonar/scan once if not a devDependency or globally on agent
    //       // sh 'npm install -g @sonar/scan' // Or handle via npx / devDependency

    //       services.each { svc ->
    //         dir(svc.name) {
    //           echo "--- Starting SonarQube Analysis for ${svc.name} ---"
    //           // Define projectKey either from svc map or derive it
    //           String projectKeyForSonar = svc.name // Example: using service name as key

    //           try {
    //             // 'cdac-project-sonar-server' must match the SonarQube server name in Jenkins Global Config
    //             withSonarQubeEnv('cdac-project-sonar-server') {
    //               if (svc.lang == 'java') {
    //                 bat(label: "Sonar Scan for ${svc.name}", script: """
    //                   mvn clean install -DskipTests sonar:sonar \
    //                     -Dsonar.projectKey=${projectKeyForSonar} \
    //                     -Dsonar.projectName=${svc.name} \
    //                     -Dsonar.host.url=${env.SONAR_HOST_URL} \
    //                     -Dsonar.login=${env.SONAR_AUTH_TOKEN}
    //                 """)
    //               } else { // TypeScript
    //                 // Assuming @sonar/scan is available (globally, via npx, or path)
    //                 // And sonar-project.properties defines sonar.sources, sonar.javascript.lcov.reportPaths etc.
    //                 // OR you pass them all via -D
    //                 bat(label: 'Installing sonar/scan', script: 'npm install -g @sonar/scan')
    //                 bat(label: "Sonar Scan for ${svc.name}", script: """
    //                   sonar \
    //                     -Dsonar.projectKey=${projectKeyForSonar} \
    //                     -Dsonar.projectName=${svc.name} \
    //                     -Dsonar.host.url=${env.SONAR_HOST_URL} \
    //                     -Dsonar.token=${env.SONAR_AUTH_TOKEN} \
    //                     -Dsonar.projectVersion=${env.BUILD_ID}
    //                 """)
    //               }
    //             } // End withSonarQubeEnv

    //             // Quality Gate check, now correctly associated with the scan inside withSonarQubeEnv
    //             echo "SonarQube analysis submitted for ${svc.name}. Waiting for Quality Gate..."
    //             timeout(time: 4, unit: 'MINUTES') {
    //               def qg = waitForQualityGate abortPipeline: false // Don't abort pipeline yet
    //               if (qg.status != 'OK') {
    //                 currentBuild.result = 'FAILURE' // Mark build as failure
    //                 /* groovylint-disable-next-line LineLength */
    //                 error "Quality Gate for ${svc.name} failed: ${qg.status}. Dashboard: ${env.SONARQUBE_HOST_URL}/dashboard?id=${projectKeyForSonar}"
    //               } else {
    //                 /* groovylint-disable-next-line LineLength */
    //                 echo "Quality Gate for ${svc.name} passed! Dashboard: ${env.SONARQUBE_HOST_URL}/dashboard?id=${projectKeyForSonar}"
    //               }
    //             }
    //           } catch (e) {
    //             currentBuild.result = 'FAILURE' // Ensure any exception in the try block fails the build
    //             error "SonarQube analysis or Quality Gate processing failed for ${svc.name}: ${e.getMessage()}"
    //           }
    //           echo "--- SonarQube Analysis for ${svc.name} finished ---"
    //         }
    //       }
    //     }
    //   }
    // }

    // stage('Build and Push Docker Images') {
    //   steps {
    //       script {
    //           services.each { svc ->
                  
    //               // if (new File("${svc.name}/Dockerfile").exists()) { // Check if Dockerfile exists
                  
    //                   dir(svc.name) {
    //                     if(svc.name == 'UserManagementMicroservice') {
    //                       dir('server') {
    //                          echo "Building Docker image for ${svc.name}"
    //                       // Example: Replace 'your-docker-registry'
    //                       // Ensure you are logged into your Docker registry
    //                       // bat "docker build -t weakpassword/${svc.name.toLowerCase()}:${env.BUILD_NUMBER} ."
    //                       // bat "docker push weakpassword/${svc.name.toLowerCase()}:${env.BUILD_NUMBER}"
    //                       bat "docker build -t weakpassword/${svc.name.toLowerCase()}:latest ."
    //                       bat "docker push weakpassword/${svc.name.toLowerCase()}:latest"

    //                       }
    //                     }
    //                     else if (fileExists('Dockerfile')) {
    //                       echo "Building Docker image for ${svc.name}"
    //                       // Example: Replace 'your-docker-registry'
    //                       // Ensure you are logged into your Docker registry
    //                       // bat "docker build -t weakpassword/${svc.name.toLowerCase()}:${env.BUILD_NUMBER} ."
    //                       // bat "docker push weakpassword/${svc.name.toLowerCase()}:${env.BUILD_NUMBER}"
    //                        bat "docker build -t weakpassword/${svc.name.toLowerCase()}:latest ."
    //                       bat "docker push weakpassword/${svc.name.toLowerCase()}:latest"
    //                   }
    //               // }
    //             }
    //           }
    //       }
    //   }
    // }


    // stage('Dockerization of services and putting them in same network')
    // {
    //   steps{
    //     bat(label: 'Clearing the existing compose containers',script: 'docker-compose down')
    //     bat(label: 'Running docker compose ',script: 'docker-compose up -d')
    //   }
    // }
    // stage('Stress and Load Testing using Jmeter')
    // {
    //   steps{
    //     bat(label: 'Running jmeter test script',
    //     script: 'jmeter -n -t "./Testing/HTTP Request.jmx" -l results.jtl -e -o ./reports/jmeter ')
    //   }
    //   post{
    //       always {
    //         echo(message: 'Jmeter Stress and Load Testing finished, check the report at ./reports/jmeter')
    //       }
    //   }
    // }

  //   stage('DAST Scanning using Zed ZAP'){
  //     steps{
  //       bat(label: 'Running ZAP Baseline scan',
  //       script: 'docker run -dt zaproxy/zap-stable zap-baseline.py -t http://localhost:5173 -r ./reports/zap.html')
  //     }
  //     post{
  //         always {
  //           echo(message: 'OWASP DAST Baseline scan finished please see the report at ./reports/zap/zap.html')
  //         }
  //     }
  //   }

  } // stages
  post{
      always{
        bat(label: 'Clearing docker containers', script: 'docker-compose down')
      }
  }
}

//
