package com.keystone.fsm.dto;

import com.keystone.fsm.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

public class UserDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private Role role;
        private String firstName;
        private String lastName;
        private String phone;
        private Boolean enabled;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateUserRequest {
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50)
        private String username;

        @NotBlank(message = "Email is required")
        @Email
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6)
        private String password;

        @NotNull(message = "Role is required")
        private Role role;

        private String firstName;
        private String lastName;
        private String phone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateUserRequest {
        @Email
        private String email;
        private Role role;
        private String firstName;
        private String lastName;
        private String phone;
        private Boolean enabled;
        private String password; // optional new password
    }
}
