package com.ecommerce.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.demo.model.User;

public interface UserRepository extends JpaRepository<User, Integer> {

    User findByEmailAndPassword(String email, String password);

}