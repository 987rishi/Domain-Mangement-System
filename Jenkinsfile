def services = [
  [name: 'WorkFlowIpVaptService', lang: 'java'],
  [name: 'ApiGateway', lang: 'java'],
  [name: 'NotificationMicroservice', lang: 'typescript'],
  [name: 'RenewalAndTransferMicroService', lang: 'typescript'],
  [name: 'UserManagementMicroservice', lang: 'typescript'],
  [name: 'ServiceRegistry', lang: 'java']
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
              int gitLeaksErrors = 0
              int eslintErrors = 0

              if (svc.lang == 'java') {
                // Execute Maven Checkstyle plugin
                bat 'mvn checkstyle:checkstyle'
                def checkstyleReport = readFile('target/checkstyle-result.xml')
                checkStyleErrors = (checkstyleReport =~ '<error ').count
                echo "Checkstyle Errors in ${svc.name}: ${checkStyleErrors}"

                // Execute GitLeaks
                bat 'gitleaks detect --source . --report-path leaks.json'
                def glReport = readFile('leaks.json')
                gitLeaksErrors = (glReport =~ '"Leaks":\\[').count
                echo "GitLeaks Errors in ${svc.name}: ${gitLeaksErrors}"

                // Prepare metrics in Prometheus format

                def metricsCheckStyle = """
                # HELP checkstyle_errors_total Total Checkstyle errors
                # TYPE checkstyle_errors_total counter
                checkstyle_errors_total{service="${svc.name}"} ${checkStyleErrors}
                
                # HELP gitleaks_errors_total Total GitLeaks errors
                # TYPE gitleaks_errors_total counter
                gitleaks_errors_total{service="${svc.name}"} ${gitLeaksErrors}
                """.trim()

                // Push metrics to Prometheus Pushgateway

                bat """
                echo ${metricsCheckStyle} | curl --data-binary @- http://<pushgateway_address>:9091/metrics/job/${env.JOB_NAME}/instance/${svc.name}
                """



              } else if (svc.lang == 'typescript') {
                // Execute ESLint for TypeScript services
                bat 'npx eslint ./src/**/*.ts --format json --output-file eslint-report.json'
                def eslintReport = readFile('eslint-report.json')
                eslintErrors = (eslintReport =~ '"errorCount":\\s*(\\d+)').findAll().sum { it[1].toInteger() }
                echo "ESLint Errors in ${svc.name}: ${eslintErrors}"

                bat 'gitleaks detect --source . --report-path leaks.json'
                def glReport = readFile('leaks.json')
                gitLeaksErrors = (glReport =~ '"Leaks":\\[').count
                echo "GitLeaks Errors in ${svc.name}: ${gitLeaksErrors}"

                // Prepare metrics in Prometheus format
                def metricsESLint = """
                # HELP eslint_errors_total Total ESLint errors
                # TYPE eslint_errors_total counter
                eslint_errors_total{service="${svc.name}"} ${eslintErrors}

                # HELP gitleaks_errors_total Total GitLeaks errors
                # TYPE gitleaks_errors_total counter
                gitleaks_errors_total{service="${svc.name}"} ${gitLeaksErrors}
                """.trim()

                // Push metrics to Prometheus Pushgateway
                bat """
                echo ${metricsESLint} | curl --data-binary @- http://<pushgateway_address>:9091/metrics/job/${env.JOB_NAME}/instance/${svc.name}
                """
              }
              checkStyleErrors = 0
              gitLeaksErrors = 0
              eslintErrors = 0        
            }
          }
        }
      }
    }
    stage("Build and Unit Tests"){
      steps {
        script {
          //Making dir for reports 
          mkdir(dir:"/reports/junit")
          services.each { svc ->
            dir(path: svc.name) {
              if(svc.lang == 'java') {
                catchError(message: 'Error occured while executing maven tests'){
                  bat(label: 'Building Java code', script: 'mvn clean install package -DskipTests')
                  bat(label: 'Unit Testing For SpringBoot Microservices',script: 'mvn test')
                }
              }
              else {
                //Using Jest for unit testing in nodejs
                catchError(message: 'Error occured while executing typescript test') {

                  bat(label: 'Setting environment for typescript tests',script: 'npm install')
                  bat(label: 'Compiling typescript',script: 'npx tsc')
                  bat(label: 'Running tests',script:'npx jest --coverage')
                }
              }
            } 
          }
        }
      }
      //Post action for displaying the test results post build
      post{
          always {
            junit(testResults: '/reports/junit/*.xml')
          }
      }
    }
    stage("SAST Analyis using Sonarqube") {
      environment{
        SONAR_TOKEN = credentials('cdac-project-sonar-token')
      }
      steps{
        script {
          services.each{svc ->
          dir(path: svc.name) {
            if(svc.lang == 'java') {
               catchError(message: 'Error occured while executing sonar tests'){
                  bat(label: 'Running Code Quality Test', script:  """
                mvn sonar:sonar \
                  -Dsonar.projectKey=${svc.name} \
                  -Dsonar.projectName=${svc.name} \
                  -Dsonar.host.url=${env.SONARQUBE_URL} \
                  -Dsonar.login=${env.SONAR_TOKEN}
            """)
                
            }
            }
            else {
              catchError(message: "Error occured while executing sonar tests in ${svc.name}"){
                bat(label: 'Installing sonar/scan for js', script: 'npm install -g @sonar/scan')
                  bat(label: 'Running Code Quality Test', script:  """
                sonar \
                  -Dsonar.host.url=${env.SONARQUBE_URL} \
                  -Dsonar.token=${env.SONAR_TOKEN}
            """)
                
              }
          }
          }
            String sonarDashboardUrl = "${env.SONARQUBE_URL}/dashboard?id=${projectKeyForSonar}"
            echo "SonarQube Dashboard for ${svc.name}: ${sonarDashboardUrl}" 
          }
        }
      }
    }
  }
}
