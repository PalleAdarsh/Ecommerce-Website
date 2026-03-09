package com.ecommerce.demo.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ecommerce.demo.model.CartItem;
import com.ecommerce.demo.model.User;
import com.ecommerce.demo.model.Product;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    List<CartItem> findByUser(User user);
    CartItem findByUserAndProduct(User user, Product product);
}
