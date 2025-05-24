FROM openjdk:21
WORKDIR /home/dev
# RUN mvn package -DskipTests
COPY ./target/workflow-service.jar .
EXPOSE 8080
CMD ["java","-jar","workflow-service.jar"]