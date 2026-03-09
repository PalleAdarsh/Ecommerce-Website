// ===============================
// Configuration - Backend API URL
// ===============================
const API_URL = "https://ecommerce-website-1-jk2i.onrender.com";// replace with your real backend URL if different

// ===============================
// State
// ===============================
let products = [];
let cart = [];

// Authentication State
let currentUser = JSON.parse(localStorage.getItem("user"));
let userId = currentUser ? currentUser.id : null;

// DOM Elements
const productListEl = document.getElementById("product-list");
const cartItemsEl = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const cartSidebar = document.getElementById("cart-sidebar");

// ===============================
// Initialize
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    updateNavUI();

    if (productListEl) {
        fetchProducts();
    }

    if (userId) {
        fetchCart();
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }

    const addProductForm = document.getElementById("add-product-form");
    if (addProductForm) {
        if (!currentUser || currentUser.role !== "ADMIN") {
            alert("Restricted Access. Please log in as Admin.");
            window.location.href = "admin-login.html";
            return;
        }
        addProductForm.addEventListener("submit", handleAddProduct);
        fetchAdminProducts();
    }

    const adminLoginForm = document.getElementById("admin-login-form");
    if (adminLoginForm) {
        adminLoginForm.addEventListener("submit", handleAdminLogin);
    }
});

// ===============================
// UI Functions
// ===============================
function toggleCart() {
    if (!userId) {
        alert("Please log in to view your cart");
        window.location.href = "pages/login.html";
        return;
    }

    cartSidebar.classList.toggle("open");
    renderCart();
}

function updateNavUI() {
    const navLogin = document.getElementById("nav-login");
    const navRegister = document.getElementById("nav-register");
    const navUser = document.getElementById("nav-user");
    const navLogout = document.getElementById("nav-logout");

    if (currentUser) {
        if (navLogin) navLogin.style.display = "none";
        if (navRegister) navRegister.style.display = "none";

        if (navUser) {
            navUser.style.display = "inline";
            navUser.textContent = `Hello, ${currentUser.name}`;
        }

        if (navLogout) navLogout.style.display = "inline";
    }
}

function logout() {
    localStorage.removeItem("user");
    window.location.href =
        window.location.pathname.includes("pages")
            ? "../index.html"
            : "index.html";
}

// ===============================
// Authentication
// ===============================
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("login-error");

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data && data.id) {
            localStorage.setItem("user", JSON.stringify(data));
            window.location.href = "../index.html";
        } else {
            errorEl.textContent = "Invalid email or password.";
        }
    } catch {
        errorEl.textContent = "Could not connect to the server.";
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("register-error");

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) throw new Error("Registration failed");

        const data = await response.json();

        localStorage.setItem("user", JSON.stringify(data));
        window.location.href = "../index.html";
    } catch {
        errorEl.textContent =
            "Error registering account. Email might be taken or server is down.";
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();

    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;
    const errorEl = document.getElementById("admin-login-error");

    if (email === "admin@simplestore.com" && password === "admin123") {
        const adminUser = {
            id: 0,
            name: "Administrator",
            email: email,
            role: "ADMIN",
        };

        localStorage.setItem("user", JSON.stringify(adminUser));
        window.location.href = "admin.html";
    } else {
        errorEl.textContent = "Invalid Admin Credentials.";
    }
}

// ===============================
// Product Logic
// ===============================
async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error("Error fetching products:", error);

        if (productListEl) {
            productListEl.innerHTML =
                "<p style='color:red;text-align:center;'>Failed to load products.</p>";
        }
    }
}

async function handleAddProduct(e) {
    e.preventDefault();

    const name = document.getElementById("p-name").value;
    const price = document.getElementById("p-price").value;
    const description = document.getElementById("p-desc").value;
    const image = document.getElementById("p-image").value;
    const stock = document.getElementById("p-stock").value;

    const msgEl = document.getElementById("admin-message");

    const newProduct = {
        name,
        price: parseFloat(price),
        description,
        image,
        stock: parseInt(stock),
    };

    try {
        const response = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProduct),
        });

        if (!response.ok) throw new Error();

        msgEl.style.color = "green";
        msgEl.textContent = "Product successfully added!";
        document.getElementById("add-product-form").reset();
        fetchAdminProducts();
    } catch {
        msgEl.style.color = "red";
        msgEl.textContent = "Error saving product.";
    }
}

async function fetchAdminProducts() {
    const listEl = document.getElementById("admin-product-list");
    if (!listEl) return;

    try {
        const response = await fetch(`${API_URL}/products`);
        const prods = await response.json();

        if (prods.length === 0) {
            listEl.innerHTML = "<p>No products yet.</p>";
            return;
        }

        listEl.innerHTML = prods.map(p => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; margin-bottom:0.5rem; background:#f9f9f9; border-radius:6px;">
                <div>
                    <strong>${p.name}</strong> — ₹${p.price}
                </div>
                <button onclick="deleteProduct(${p.id})" style="background:#e74c3c; color:white; border:none; padding:0.4rem 0.8rem; border-radius:4px; cursor:pointer;">Delete</button>
            </div>
        `).join("");
    } catch {
        listEl.innerHTML = "<p style='color:red;'>Failed to load products.</p>";
    }
}

async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
        fetchAdminProducts();
    } catch {
        alert("Error deleting product.");
    }
}

function renderProducts() {
    if (!productListEl) return;

    productListEl.innerHTML = products
        .map(
            (product) => `
    <div class="card">
      <img src="${product.image ||
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8"
                }"
      style="width:100%;height:200px;object-fit:cover">

      <h3>${product.name}</h3>
      <p>${product.description || "Awesome product"}</p>

      <div class="price">₹${product.price}</div>

      <button onclick="addToCartLocal(${product.id})">
        Add to Cart
      </button>
    </div>
  `
        )
        .join("");
}

// ===============================
// Cart Logic
// ===============================
async function fetchCart() {
    if (!userId) return;

    try {
        const response = await fetch(`${API_URL}/cart/${userId}`);
        cart = await response.json();
        renderCart();
    } catch {
        console.log("Error fetching cart");
    }
}

async function addToCartLocal(productId) {
    if (!userId) {
        alert("Please login first");
        window.location.href = "pages/login.html";
        return;
    }

    const formData = new URLSearchParams();
    formData.append("userId", userId);
    formData.append("productId", productId);
    formData.append("quantity", 1);

    await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
    });

    fetchCart();
}

async function removeFromCartLocal(id) {
    await fetch(`${API_URL}/cart/remove/${id}`, {
        method: "DELETE",
    });

    fetchCart();
}

function renderCart() {
    if (!cartItemsEl) return;

    cartItemsEl.innerHTML = cart
        .map(
            (item) => `
    <div class="cart-item-row">
      <strong>${item.product.name}</strong>
      <span>Qty: ${item.quantity}</span>
      <button onclick="removeFromCartLocal(${item.id})">
        Remove
      </button>
    </div>
  `
        )
        .join("");

    const total = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    if (cartTotalEl) cartTotalEl.textContent = total.toFixed(2);

    if (cartCountEl)
        cartCountEl.textContent = cart.reduce(
            (t, item) => t + item.quantity,
            0
        );
}