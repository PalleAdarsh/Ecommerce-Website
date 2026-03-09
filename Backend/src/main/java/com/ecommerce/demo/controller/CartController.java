package com.ecommerce.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.demo.model.CartItem;
import com.ecommerce.demo.model.Product;
import com.ecommerce.demo.model.User;
import com.ecommerce.demo.repository.CartItemRepository;
import com.ecommerce.demo.repository.ProductRepository;
import com.ecommerce.demo.repository.UserRepository;

@RestController
@CrossOrigin(origins="*")
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // Get cart items for a specific user
    @GetMapping("/{userId}")
    public List<CartItem> getCartItems(@PathVariable int userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return cartItemRepository.findByUser(user);
    }

    // Add product to cart
    @PostMapping("/add")
    public CartItem addToCart(@RequestParam int userId, @RequestParam int productId, @RequestParam int quantity) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem existingItem = cartItemRepository.findByUserAndProduct(user, product);
        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            return cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setUser(user);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            return cartItemRepository.save(newItem);
        }
    }

    // Remove from cart
    @DeleteMapping("/remove/{cartItemId}")
    public String removeFromCart(@PathVariable int cartItemId) {
        cartItemRepository.deleteById(cartItemId);
        return "Item removed from cart";
    }
}
