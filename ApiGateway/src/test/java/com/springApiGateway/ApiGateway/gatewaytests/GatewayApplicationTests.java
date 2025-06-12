package com.springApiGateway.ApiGateway.gatewaytests;
import jakarta.ws.rs.core.MediaType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.security.reactive.ReactiveSecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.reactive.ReactiveUserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.test.web.reactive.server.WebTestClient;

import static com.github.tomakehurst.wiremock.client.WireMock.*;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "httpbin=http://localhost:${wiremock.server.port}",
                "SECRET=a-very-secret-key-for-testing-only",
                "eureka.client.enabled=false"
        }
)
// Exclude Spring Security's auto-configuration
//@EnableAutoConfiguration(exclude = {
//        ReactiveSecurityAutoConfiguration.class,
//        ReactiveUserDetailsServiceAutoConfiguration.class
//})
//// Exclude your application's specific @Configuration for security
//@ComponentScan(excludeFilters = {
//        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, value =
//                Se.class)
//})
@AutoConfigureWireMock(port = 0)
public class GatewayApplicationTests {

  @Autowired
  private WebTestClient webTestClient;

  @MockBean
  private ReactiveAuthenticationManager reactiveAuthenticationManager;

  @Test
  public void testUserDrmRoute() {
    //Stub for downstream user-management-service
    stubFor(get(urlEqualTo("/api/users/DRM/1"))
            .willReturn(aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody("""
                            {
                            "emp_no": 1,
                            "drm_fname": "Alice",
                            "drm_lname": "Smith",
                            "email_id": "alice.smith@example.com",
                            "desig": "MANAGER",
                            "tele_no": "1234567890",
                            "mob_no": "9876543210",
                            "centre_id": 100,
                            "grp_id": 200,
                            "is_active": true
                            }
                            """)));
    stubFor(get(urlEqualTo("/api/users/list/DRM"))
            .willReturn(aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody("""
                            [
                              {
                                "emp_no": 1,
                                "drm_fname": "John",
                                "drm_lname": "Doe",
                                "email_id": "john.doe@example.com",
                                "desig": "ENGINEER",
                                "tele_no": "1234567890",
                                "mob_no": "0987654321",
                                "centre_id": 101,
                                "grp_id": 202,
                                "is_active": true
                              },
                              {
                                "emp_no": 2,
                                "drm_fname": "Jane",
                                "drm_lname": "Smith",
                                "email_id": "jane.smith@example.com",
                                "desig": "MANAGER",
                                "tele_no": "2345678901",
                                "mob_no": "9876543210",
                                "centre_id": 102,
                                "grp_id": 203,
                                "is_active": true
                              }
                            ]
                            """)));

    webTestClient.get().uri("/api/users/details/DRM/1")
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.emp_no").isEqualTo(1)
            .jsonPath("$.drm_fname").isEqualTo("Alice")
            .jsonPath("$.drm_lname").isEqualTo("Smith")
            .jsonPath("$.email_id").isEqualTo("alice.smith@example.com")
            .jsonPath("$.desig").isEqualTo("MANAGER")
            .jsonPath("$.tele_no").isEqualTo("1234567890")
            .jsonPath("$.mob_no").isEqualTo("9876543210")
            .jsonPath("$.centre_id").isEqualTo(100)
            .jsonPath("$.grp_id").isEqualTo(200)
            .jsonPath("$.is_active").isEqualTo(true);

    webTestClient.get().uri("/api/users/list/DRM")
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType("application/json")
            .expectBody()
            .jsonPath("$[0].emp_no").isEqualTo(1)
            .jsonPath("$[0].drm_fname").isEqualTo("John")
            .jsonPath("$[0].drm_lname").isEqualTo("Doe")
            .jsonPath("$[0].email_id").isEqualTo("john.doe@example.com")
            .jsonPath("$[0].desig").isEqualTo("ENGINEER")
            .jsonPath("$[1].emp_no").isEqualTo(2)
            .jsonPath("$[1].drm_fname").isEqualTo("Jane")
            .jsonPath("$[1].drm_lname").isEqualTo("Smith")
            .jsonPath("$[1].email_id").isEqualTo("jane.smith@example.com")
            .jsonPath("$[1].desig").isEqualTo("MANAGER");
  }

  @Test
  public void testCentreRoute() {
    stubFor(get(urlEqualTo("/api/users/centre/1"))
            .willReturn(aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody("""
                            {
                               "centre_id": 1,
                               "cn_name": "Main Centre",
                               "netops_red": 1
                            }
                            """)));

    webTestClient.get().uri("/api/users/centre/1")
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.centre_id").isEqualTo(1)
            .jsonPath("$.cn_name").isEqualTo("Main Centre")
            .jsonPath("$.netops_red").isEqualTo(1);
  }

  @Test
  public void testGroupRoute() {
    stubFor(get(urlEqualTo("/api/users/group/1"))
            .willReturn(aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody("""
                            {
                            "dept_id" : 1,
                            "d_name" : "HPC",
                            "centre_id" : 1
                            }
                            """)));

    webTestClient.get().uri("/api/users/group/1")
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.dept_id").isEqualTo(1)
            .jsonPath("$.d_name").isEqualTo("HPC")
            .jsonPath("$.centre_id").isEqualTo(1);
  }
}