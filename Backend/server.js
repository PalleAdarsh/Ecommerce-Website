const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PORT (Render automatically provides PORT)
const PORT = process.env.PORT || 5000;

// Root route
app.get("/", (req, res) => {
    res.send("Ecommerce Backend Running");
});

// ===============================
// In-memory data stores
// ===============================
let users = [];
let nextUserId = 1;

let products = [
    {
        id: 1,
        name: "Gaming Laptop",
        price: 55000,
        description: "High performance gaming laptop",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"
    },
    {
        id: 2,
        name: "Android Smartphone",
        price: 20000,
        description: "Latest Android smartphone",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"
    },
    {
        id: 3,
        name: "Wireless Headphones",
        price: 3500,
        description: "Noise cancelling headphones",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
    },
    {
        id: 4,
        name: "Smart Watch",
        price: 5000,
        description: "Track fitness and notifications",
        image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=500"
    }
];
let nextProductId = 5;

let cartItems = [];
let nextCartId = 1;

// ===============================
// Auth endpoints
// ===============================
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existing = users.find(u => u.email === email);
    if (existing) {
        return res.status(400).json({ error: "Email already taken" });
    }

    const newUser = {
        id: nextUserId++,
        name,
        email,
        password,
        role: "USER"
    };
    users.push(newUser);

    // Return user without password
    const { password: _, ...userResponse } = newUser;
    res.status(201).json(userResponse);
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const { password: _, ...userResponse } = user;
    res.json(userResponse);
});

// ===============================
// Product endpoints
// ===============================
app.get("/products", (req, res) => {
    res.json(products);
});

app.post("/products", (req, res) => {
    const { name, price, description, image, stock } = req.body;
    const newProduct = {
        id: nextProductId++,
        name,
        price,
        description,
        image: image || "",
        stock: stock || 0
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.delete("/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "Product not found" });
    }
    products.splice(index, 1);
    res.json({ message: "Product deleted" });
});

// ===============================
// Cart endpoints
// ===============================
app.get("/cart/:userId", (req, res) => {
    const userId = parseInt(req.params.userId);
    const userCart = cartItems.filter(item => item.userId === userId);

    // Include product details in each cart item
    const cartWithProducts = userCart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: products.find(p => p.id === item.productId) || { name: "Unknown", price: 0 }
    }));

    res.json(cartWithProducts);
});

app.post("/cart/add", (req, res) => {
    const userId = parseInt(req.body.userId);
    const productId = parseInt(req.body.productId);
    const quantity = parseInt(req.body.quantity) || 1;

    // Check if item already in cart
    const existing = cartItems.find(item => item.userId === userId && item.productId === productId);
    if (existing) {
        existing.quantity += quantity;
        return res.json(existing);
    }

    const newItem = {
        id: nextCartId++,
        userId,
        productId,
        quantity
    };
    cartItems.push(newItem);
    res.status(201).json(newItem);
});

app.delete("/cart/remove/:cartItemId", (req, res) => {
    const cartItemId = parseInt(req.params.cartItemId);
    cartItems = cartItems.filter(item => item.id !== cartItemId);
    res.json({ message: "Removed" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});