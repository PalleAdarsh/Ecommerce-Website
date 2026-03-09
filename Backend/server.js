const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/products", (req, res) => {
    res.json([
        { id: 1, name: "Gaming Laptop", price: 55000 },
        { id: 2, name: "Android Smartphone", price: 20000 }
    ]);
});

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});