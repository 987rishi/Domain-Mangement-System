
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

  stages {
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
              int checkStyleErrors = 0
              int gitLeaksErrors   = 0
              int eslintErrors     = 0

              if (svc.lang == 'java') {
                // Maven Checkstyle
                bat 'mvn checkstyle:checkstyle'
                def csReport = readFile('target/checkstyle-result.xml')
                checkStyleErrors = (csReport =~ '<error ').count
                echo "Checkstyle Errors in ${svc.name}: ${checkStyleErrors}"

                // GitLeaks
                bat 'gitleaks detect --source . --report-path leaks.json'
                def glReport = readFile('leaks.json')
                gitLeaksErrors = (glReport =~ '"Leaks":\\[').count
                echo "GitLeaks Errors in ${svc.name}: ${gitLeaksErrors}"

                // Push metrics to Prometheus Pushgateway
                def metrics = """
                # HELP checkstyle_errors_total Total Checkstyle errors
                # TYPE checkstyle_errors_total counter
                checkstyle_errors_total{service="${svc.name}"} ${checkStyleErrors}

                # HELP gitleaks_errors_total Total GitLeaks errors
                # TYPE gitleaks_errors_total counter
                gitleaks_errors_total{service="${svc.name}"} ${gitLeaksErrors}
                """.trim()

                bat """
                  echo ${metrics} | curl --data-binary @- \
                    http://<pushgateway_address>:9091/metrics/job/${env.JOB_NAME}/instance/${svc.name}
                """
              }
              else if (svc.lang == 'typescript') {
                // ESLint
                bat 'npx eslint "./src/**/*.ts" --format json --output-file eslint-report.json'
                def esReport = readFile('eslint-report.json')
                eslintErrors = (esReport =~ '"errorCount":\\s*(\\d+)')
                              .findAll()
                              .sum { it[1].toInteger() }
                echo "ESLint Errors in ${svc.name}: ${eslintErrors}"

                // GitLeaks
                bat 'gitleaks detect --source . --report-path leaks.json'
                def glReport = readFile('leaks.json')
                gitLeaksErrors = (glReport =~ '"Leaks":\\[').count
                echo "GitLeaks Errors in ${svc.name}: ${gitLeaksErrors}"

                // Push metrics
                def metrics = """
                # HELP eslint_errors_total Total ESLint errors
                # TYPE eslint_errors_total counter
                eslint_errors_total{service="${svc.name}"} ${eslintErrors}

                # HELP gitleaks_errors_total Total GitLeaks errors
                # TYPE gitleaks_errors_total counter
                gitleaks_errors_total{service="${svc.name}"} ${gitLeaksErrors}
                """.trim()

                bat """
                  echo ${metrics} | curl --data-binary @- \
                    http://<pushgateway_address>:9091/metrics/job/${env.JOB_NAME}/instance/${svc.name}
                """
              }

              // Reset counters (if reused later)
              checkStyleErrors = 0
              gitLeaksErrors   = 0
              eslintErrors     = 0
            }
          }
        }
      }
    }

    stage('Build and Unit Tests') {
      steps {
        script {
          // Prepare reports directory
          mkdir dir: '/reports/junit'

          services.each { svc ->
            dir(svc.name) {
              if (svc.lang == 'java') {
                catchError('Error executing Maven tests') {
                  bat 'mvn clean install package -DskipTests'
                  bat 'mvn test'
                }
              } else {
                catchError('Error executing TypeScript tests') {
                  bat 'npm install'
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
      // environment {
      //   SONAR_TOKEN = credentials('cdac-project-sonar-token')
      // }
      steps {
        script {
          services.each { svc ->
            dir(svc.name) {
              withSonarQubeEnv('cdac-project-sonar-server') {
                if (svc.lang == 'java') {
                  catchError('Error running SonarQube Java analysis') {
                    bat """
                      mvn sonar:sonar \
                        -Dsonar.projectKey=${svc.name} \
                        -Dsonar.projectName=${svc.name} \
                        -Dsonar.host.url=${env.SONARQUBE_URL} \
                        -Dsonar.login=${env.SONAR_TOKEN}
                    """
                  }
                } else {
                  catchError("Error running SonarQube TS analysis for ${svc.name}") {
                    bat 'npm install -g @sonar/scan'
                    bat """
                      sonar \
                        -Dsonar.host.url=${env.SONARQUBE_URL} \
                        -Dsonar.token=${env.SONAR_TOKEN}
                    """
                  }
                }
              }

                // Quality Gate
                echo "SonarQube analysis submitted for ${svc.name}"
                timeout(time: 10, unit: 'MINUTES') {
                  def qg = waitForQualityGate abortPipeline: false
                  if (qg.status != 'OK') {
                    error "Quality Gate failed for ${svc.name}: ${qg.status}"
                  } else {
                    echo "Quality Gate passed for ${svc.name}"
                  }
                }
            }
          }
        }
      }
    }


  } // stages
}
