const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PORT (Render automatically provides PORT)
const PORT = process.env.PORT || 5000;

// Root route
app.get("/", (req, res) => {
    res.send("Ecommerce Backend Running");
});

// In-memory products store
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
let nextId = 5;

// GET all products
app.get("/products", (req, res) => {
    res.json(products);
});

// POST new product (admin)
app.post("/products", (req, res) => {
    const { name, price, description, image, stock } = req.body;
    const newProduct = {
        id: nextId++,
        name,
        price,
        description,
        image: image || "",
        stock: stock || 0
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});