// Configuration - auto-detect environment
const API_URL = (window.location.hostname === 'localhost' || window.location.protocol === 'file:')
    ? 'http://localhost:8080'
    : '';

// State
let products = [];
let cart = [];

// Authentication State
let currentUser = JSON.parse(localStorage.getItem('user'));
let userId = currentUser ? currentUser.id : null;

// DOM Elements
const productListEl = document.getElementById('product-list');
const cartItemsEl = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const cartSidebar = document.getElementById('cart-sidebar');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateNavUI();
    
    // Only fetch products if we are on the homepage
    if (productListEl) {
        fetchProducts();
    }

    // Only fetch cart if logged in
    if (userId) {
        fetchCart();
    }

    // Handle Forms
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        // Protect Admin Page
        if (!currentUser || currentUser.role !== 'ADMIN') {
            alert("Restricted Access. Please log in as Admin.");
            window.location.href = "admin-login.html";
            return;
        }
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
});

// === UI Functions ===
function toggleCart() {
    if (!userId) {
        alert("Please log in to view your cart");
        window.location.href = "pages/login.html";
        return;
    }
    if (cartSidebar.classList.contains('open')) {
        cartSidebar.classList.remove('open');
    } else {
        cartSidebar.classList.add('open');
        renderCart();
    }
}

function updateNavUI() {
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navUser = document.getElementById('nav-user');
    const navLogout = document.getElementById('nav-logout');

    if (currentUser) {
        if(navLogin) navLogin.style.display = 'none';
        if(navRegister) navRegister.style.display = 'none';
        if(navUser) {
            navUser.style.display = 'inline';
            navUser.textContent = `Hello, ${currentUser.name}`;
        }
        if(navLogout) navLogout.style.display = 'inline';
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = window.location.pathname.includes('pages') ? '../index.html' : 'index.html';
}

// === Authentication Logic ===
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (data && data.id) {
            localStorage.setItem('user', JSON.stringify(data));
            window.location.href = '../index.html';
        } else {
            errorEl.textContent = "Invalid email or password.";
        }
    } catch (err) {
        errorEl.textContent = "Could not connect to the server.";
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('register-error');

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        if (!response.ok) throw new Error("Registration failed");
        
        const data = await response.json();
        // Auto log in after register
        localStorage.setItem('user', JSON.stringify(data));
        window.location.href = '../index.html';
    } catch (err) {
        errorEl.textContent = "Error registering account. Email might be taken or server is down.";
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const errorEl = document.getElementById('admin-login-error');

    // Hardcoded simple admin check to avoid needing a DB migration right now
    if (email === "admin@simplestore.com" && password === "admin123") {
        const adminUser = {
            id: 0,
            name: "Administrator",
            email: email,
            role: "ADMIN"
        };
        localStorage.setItem('user', JSON.stringify(adminUser));
        window.location.href = "admin.html";
    } else {
        errorEl.textContent = "Invalid Admin Credentials.";
    }
}

// === Product Logic ===
async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Network error');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
        if(productListEl) {
            productListEl.innerHTML = `<p style="color:red; grid-column:1/-1; text-align:center;">Failed to load products. Ensure the Backend is running.</p>`;
        }
    }
}

async function handleAddProduct(e) {
    e.preventDefault();
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const description = document.getElementById('p-desc').value;
    const image = document.getElementById('p-image').value;
    const stock = document.getElementById('p-stock').value;
    const msgEl = document.getElementById('admin-message');

    msgEl.style.color = 'black';
    msgEl.textContent = "Saving product...";

    const newProduct = {
        name: name,
        price: parseFloat(price),
        description: description,
        image: image,
        stock: parseInt(stock, 10)
    };

    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });

        if (!response.ok) throw new Error("Failed to add product");

        msgEl.style.color = 'green';
        msgEl.textContent = "✅ Product successfully added to the database!";
        
        // Clear form
        document.getElementById('add-product-form').reset();
    } catch (err) {
        msgEl.style.color = 'red';
        msgEl.textContent = "Error saving product. Is the backend running?";
        console.error(err);
    }
}

function renderProducts() {
    if (!productListEl) return;
    if (products.length === 0) {
        productListEl.innerHTML = '<p style="grid-column:1/-1; text-align:center;">No products available.</p>';
        return;
    }

    productListEl.innerHTML = products.map((product, index) => {
        // Use image from database if available, else fallback to unsplash logic
        let imgUrl = "";
        
        if (product.image) {
            // Assume the image is a file name hosted locally or an absolute URL
            imgUrl = product.image.startsWith('http') ? product.image : `/images/${product.image}`;
            // If there's no images folder, they might just put it in static.
            // Let's use a fallback error event on the img tag if it fails to load the db image.
        } else {
            imgUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80";
            if(product.name.toLowerCase().includes('laptop')) imgUrl = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=400&fit=crop";
            else if(product.name.toLowerCase().includes('phone') || product.name.toLowerCase().includes('mobile')) imgUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=400&fit=crop";
            else if(product.name.toLowerCase().includes('headphone')) imgUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop";
            else if(product.name.toLowerCase().includes('watch')) imgUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=400&fit=crop";
        }

        return `
        <div class="card">
            <img src="${imgUrl}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80';" style="width:100%; height:200px; object-fit:cover; border-radius:4px; margin-bottom:1rem;">
            <h3>${product.name}</h3>
            <p>${product.description || 'Awesome product'}</p>
            <div class="price">₹${product.price.toLocaleString('en-IN')}</div>
            ${product.stock !== undefined ? `<p style="color:var(--text-muted); font-size: 0.8rem;">Stock: ${product.stock}</p>` : ''}
            <button class="btn btn-primary" onclick="addToCartLocal(${product.id})">Add to Cart</button>
        </div>
        `;
    }).join('');
}


// === Cart Logic ===
async function fetchCart() {
    if (!userId) return;
    try {
        const response = await fetch(`${API_URL}/cart/${userId}`);
        const data = await response.json();
        cart = Array.isArray(data) ? data : [];
        renderCart();
    } catch (e) {
        console.log("Error fetching cart:", e);
    }
}

async function addToCartLocal(productId) {
    if (!userId) {
        alert("Please log in to add items to the cart.");
        window.location.href = "pages/login.html";
        return;
    }

    try {
        const formData = new URLSearchParams();
        formData.append('userId', userId);
        formData.append('productId', productId);
        formData.append('quantity', 1);

        await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });
        
        await fetchCart();
        alert("Added to cart!");
    } catch (e) {
        console.log("Error adding to cart:", e);
    }
}

async function removeFromCartLocal(cartItemId) {
    try {
        await fetch(`${API_URL}/cart/remove/${cartItemId}`, {
            method: 'DELETE'
        });
        await fetchCart();
    } catch (e) {
        console.log("Error removing from cart:", e);
    }
}

function renderCart() {
    if(cartCountEl) {
        cartCountEl.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    if (!cartItemsEl) return;

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p>Your cart is empty.</p>';
        if(cartTotalEl) cartTotalEl.textContent = '0.00';
        return;
    }

    cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item-row">
            <div>
                <strong>${item.product.name}</strong> <br>
                <small>Qty: ${item.quantity}</small>
            </div>
            <div style="text-align: right;">
                ₹${(item.product.price * item.quantity).toLocaleString('en-IN')} <br>
                <button class="rm-btn" onclick="removeFromCartLocal(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    if(cartTotalEl) cartTotalEl.textContent = total.toFixed(2);
}
