package com.keystone.fsm.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI keystoneOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Keystone FSM API")
                        .description("Field Service Management Platform REST API")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Keystone Team")
                                .email("support@keystone.com")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
