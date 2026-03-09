package com.ecommerce.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.demo.model.User;
import com.ecommerce.demo.repository.UserRepository;

@RestController
@CrossOrigin(origins="*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Register API
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    // Login API
    @PostMapping("/login")
    public User loginUser(@RequestBody User user) {

        User foundUser = userRepository
                .findByEmailAndPassword(user.getEmail(), user.getPassword());

        if (foundUser == null) {
            throw new RuntimeException("Invalid credentials");
        }

        return foundUser;

    }
}