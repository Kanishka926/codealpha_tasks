let categories = [];
let products = [];
let currentUser = null;
let recentlyViewed = [];
let filteredProducts = [];
let cart = { items: [] };
let orders = [];
let currentOrderSteps = 1;
let currentCategorySlug = "";

// ==================== INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", function () {
    initApp();
});

async function initApp() {
    try {
        const [catData, prodResponse] = await Promise.all([
            apiRequest("/categories"),
            apiRequest("/products"),
        ]);
        categories = catData;
        products = prodResponse.products;

        if (isLoggedIn()) {
            try {
                currentUser = await apiRequest("/auth/profile");
                await loadCart();
            } catch (e) {
                clearToken();
                currentUser = null;
            }
        }

        updateNavAuthState();
        renderCategories();
        showPage("home");
    } catch (error) {
        console.error("Error loading data:", error);
        document.body.innerHTML =
            '<div style="text-align:center;margin-top:50px;"><h2>Error loading data. Please refresh the page.</h2></div>';
    }
}

// ==================== NAVIGATION ====================

function updateNavAuthState() {
    const accountBtn = document.getElementById("accountBtn");
    if (!accountBtn) return;

    if (isLoggedIn() && currentUser) {
        accountBtn.textContent = "👤 " + currentUser.name;
        accountBtn.onclick = function (e) {
            e.preventDefault();
            showPage("account");
        };
    } else {
        accountBtn.textContent = "👤 Account";
        accountBtn.onclick = function (e) {
            e.preventDefault();
            showPage("loginRegister");
        };
    }
}

function handleAccountClick() {
    if (isLoggedIn()) {
        showPage("account");
    } else {
        showPage("loginRegister");
    }
}

function showPage(pageId) {
    var pages = document.querySelectorAll(".page");
    pages.forEach(function (page) {
        page.classList.add("hidden");
    });

    var targetPage = document.getElementById(pageId + "Page");
    if (targetPage) {
        targetPage.classList.remove("hidden");
    }

    switch (pageId) {
        case "home":
            renderCategories();
            break;
        case "category":
            renderProducts();
            break;
        case "cart":
            if (isLoggedIn()) {
                loadCart().then(function () {
                    renderCart();
                });
            } else {
                renderCart();
            }
            break;
        case "orders":
            if (isLoggedIn()) {
                loadOrders().then(function () {
                    renderOrders();
                });
            } else {
                renderOrders();
            }
            break;
        case "order":
            renderOrderSteps();
            break;
        case "account":
            renderAccount();
            break;
        case "loginRegister":
            resetAuthForms();
            break;
        case "product":
            break;
    }

    window.scrollTo(0, 0);
}

// ==================== AUTH ====================

function toggleAuthForm(form) {
    var loginContainer = document.getElementById("loginFormContainer");
    var registerContainer = document.getElementById("registerFormContainer");

    if (form === "register") {
        loginContainer.style.display = "none";
        registerContainer.style.display = "block";
    } else {
        loginContainer.style.display = "block";
        registerContainer.style.display = "none";
    }

    var loginErr = document.getElementById("loginError");
    var regErr = document.getElementById("registerError");
    if (loginErr) loginErr.style.display = "none";
    if (regErr) regErr.style.display = "none";
}

function resetAuthForms() {
    toggleAuthForm("login");
    var loginEmail = document.getElementById("loginEmail");
    var loginPassword = document.getElementById("loginPassword");
    if (loginEmail) loginEmail.value = "";
    if (loginPassword) loginPassword.value = "";
    var registerName = document.getElementById("registerName");
    var registerEmail = document.getElementById("registerEmail");
    var registerPassword = document.getElementById("registerPassword");
    if (registerName) registerName.value = "";
    if (registerEmail) registerEmail.value = "";
    if (registerPassword) registerPassword.value = "";
}

function showAuthError(elementId, message) {
    var el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = "block";
    }
}

async function login() {
    var email = document.getElementById("loginEmail").value.trim();
    var password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showAuthError("loginError", "Please fill all fields");
        return;
    }

    try {
        var data = await apiRequest("/auth/login", "POST", {
            email: email,
            password: password,
        });
        setToken(data.token);
        currentUser = {
            _id: data._id,
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            address: data.address || "",
            role: data.role,
        };
        updateNavAuthState();
        await loadCart();
        updateCartCount();
        showPage("home");
    } catch (error) {
        showAuthError("loginError", error.message);
    }
}

async function register() {
    var name = document.getElementById("registerName").value.trim();
    var email = document.getElementById("registerEmail").value.trim();
    var password = document.getElementById("registerPassword").value;

    if (!name || !email || !password) {
        showAuthError("registerError", "Please fill all fields");
        return;
    }

    if (password.length < 6) {
        showAuthError("registerError", "Password must be at least 6 characters");
        return;
    }

    try {
        var data = await apiRequest("/auth/register", "POST", {
            name: name,
            email: email,
            password: password,
        });
        setToken(data.token);
        currentUser = {
            _id: data._id,
            name: data.name,
            email: data.email,
            phone: "",
            address: "",
            role: data.role,
        };
        updateNavAuthState();
        await loadCart();
        updateCartCount();
        showPage("home");
    } catch (error) {
        showAuthError("registerError", error.message);
    }
}

function logout() {
    clearToken();
    currentUser = null;
    cart = { items: [] };
    orders = [];
    updateCartCount();
    updateNavAuthState();
    showPage("home");
}

// ==================== CATEGORIES ====================

function renderCategories() {
    var categoryGrid = document.getElementById("categoryGrid");
    if (!categoryGrid) return;

    categoryGrid.innerHTML = "";

    categories.forEach(function (category) {
        var categoryCard = document.createElement("div");
        categoryCard.className = "category-card";
        categoryCard.onclick = function () {
            showCategory(category.slug);
        };

        var cardContent =
            '<img src="' + category.image + '" alt="' + category.name + '">' +
            '<div class="category-card-content">' +
            "<h3>" + category.name + "</h3>" +
            "<p>" + (category.description || "") + "</p>";

        if (category.isRecentlyViewed) {
            if (recentlyViewed.length === 0) {
                cardContent += "<p><em>No recently viewed products</em></p>";
            } else {
                cardContent +=
                    "<p>You have " + recentlyViewed.length + " recently viewed items</p>";
            }
        }

        cardContent +=
            '<a href="#" class="category-btn">View Products</a>' +
            "</div>";

        categoryCard.innerHTML = cardContent;
        categoryGrid.appendChild(categoryCard);
    });
}

function showCategory(categorySlug) {
    currentCategorySlug = categorySlug;
    var category = categories.find(function (c) {
        return c.slug === categorySlug;
    });

    if (!category) return;

    filteredProducts = products.filter(function (product) {
        return product.category === category.slug;
    });

    document.getElementById("categoryTitle").textContent = category.name;

    populateFilters();
    renderProducts();
    showPage("category");
}

// ==================== SEARCH ====================

function searchProducts() {
    var query = document.getElementById("searchInput").value.trim().toLowerCase();

    if (!query) {
        filteredProducts = products.slice();
    } else {
        filteredProducts = products.filter(function (product) {
            return (
                product.name.toLowerCase().indexOf(query) !== -1 ||
                product.brand.toLowerCase().indexOf(query) !== -1 ||
                product.description.toLowerCase().indexOf(query) !== -1 ||
                product.category.toLowerCase().indexOf(query) !== -1
            );
        });
    }

    document.getElementById("categoryTitle").textContent = query
        ? 'Search results for "' + query + '"'
        : "All Products";

    currentCategorySlug = "";
    populateFilters();
    renderProducts();
    showPage("category");
}

// ==================== FILTERS ====================

function populateFilters() {
    var brandFilter = document.getElementById("brandFilter");
    if (!brandFilter) return;

    var brandsSet = {};
    filteredProducts.forEach(function (product) {
        brandsSet[product.brand] = true;
    });
    var brands = Object.keys(brandsSet);

    brandFilter.innerHTML = '<option value="">All Brands</option>';

    brands.forEach(function (brand) {
        var option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });
}

function applyFilters() {
    var sortBy = document.getElementById("sortBy").value;
    var maxPrice = parseInt(document.getElementById("priceRange").value);
    var selectedBrand = document.getElementById("brandFilter").value;
    document.getElementById("priceValue").textContent = "\u20B9" + maxPrice;

    var filtered = filteredProducts.filter(function (product) {
        if (product.price > maxPrice) return false;
        if (selectedBrand && product.brand !== selectedBrand) return false;
        return true;
    });

    switch (sortBy) {
        case "price-low":
            filtered.sort(function (a, b) {
                return a.price - b.price;
            });
            break;
        case "price-high":
            filtered.sort(function (a, b) {
                return b.price - a.price;
            });
            break;
        case "rating":
            filtered.sort(function (a, b) {
                return b.rating - a.rating;
            });
            break;
        default:
            break;
    }

    renderProducts(filtered);
}

// ==================== PRODUCTS ====================

function renderProducts(productList) {
    if (!productList) productList = filteredProducts;

    var productGrid = document.getElementById("productGrid");
    if (!productGrid) return;

    productGrid.innerHTML = "";

    if (productList.length === 0) {
        productGrid.innerHTML =
            '<p class="no-items-message">No products found matching your criteria.</p>';
        return;
    }

    productList.forEach(function (product) {
        var productCard = document.createElement("div");
        productCard.className = "product-card";
        productCard.onclick = function () {
            showProduct(product._id);
        };

        var stars = "";
        var fullStars = Math.floor(product.rating);
        for (var i = 0; i < fullStars; i++) stars += "\u2605";
        for (var j = fullStars; j < 5; j++) stars += "\u2606";

        productCard.innerHTML =
            '<img src="' + product.image + '" alt="' + product.name + '">' +
            '<div class="product-card-content">' +
            '<div class="product-brand">' + product.brand + "</div>" +
            "<h3>" + product.name + "</h3>" +
            '<div class="product-rating">' + stars + " " + product.rating + "</div>" +
            "</div>" +
            '<div class="product-price">' +
            '<span class="current-price">\u20B9' + product.price + "</span>" +
            '<span class="original-price">\u20B9' + product.originalPrice + "</span>" +
            '<span class="discount">' + product.discount + "% OFF</span>" +
            "</div>";

        productGrid.appendChild(productCard);
    });
}

function showProduct(productId) {
    var product = products.find(function (p) {
        return p._id === productId;
    });
    if (!product) return;

    if (recentlyViewed.indexOf(productId) === -1) {
        recentlyViewed.unshift(productId);
        if (recentlyViewed.length > 10) {
            recentlyViewed.pop();
        }
    }

    var productDetail = document.getElementById("productDetail");
    if (!productDetail) return;

    var deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);

    var fullStars = Math.floor(product.rating);
    var stars = "";
    for (var i = 0; i < fullStars; i++) stars += "\u2605";
    for (var j = fullStars; j < 5; j++) stars += "\u2606";

    var html =
        "<div>" +
        '<img src="' + product.image + '" alt="' + product.name + '" class="product-image">' +
        "</div>" +
        '<div class="product-info">' +
        "<h1>" + product.name + "</h1>" +
        '<div class="brand">' + product.brand + "</div>" +
        '<div class="product-rating">' + stars + " " + product.rating + "/5</div>" +
        '<div class="product-price">' +
        '<span class="current-price">\u20B9' + product.price + "</span>" +
        '<span class="original-price">\u20B9' + product.originalPrice + "</span>" +
        '<span class="discount">' + product.discount + "% OFF</span>" +
        "</div>" +
        '<div class="description">' + product.description + "</div>" +
        '<div class="product-options">';

    if (product.colors && product.colors.length > 0) {
        html +=
            '<div class="option-group"><label>Color:</label>' +
            '<select id="selectedColor">';
        product.colors.forEach(function (color) {
            html += '<option value="' + color + '">' + color + "</option>";
        });
        html += "</select></div>";
    }

    if (product.sizes && product.sizes.length > 0) {
        html +=
            '<div class="option-group"><label>Size:</label>' +
            '<select id="selectedSize">';
        product.sizes.forEach(function (size) {
            html += '<option value="' + size + '">' + size + "</option>";
        });
        html += "</select></div>";
    }

    html += "</div>";

    html += '<div class="address-section"><h3>Delivery Address</h3>';
    if (currentUser && currentUser.address) {
        html +=
            "<p>" + currentUser.address + "</p>" +
            '<button class="btn-secondary" onclick="showPage(\'account\')">Change Address</button>';
    } else {
        html +=
            "<p>No address added</p>" +
            '<button class="btn-secondary" onclick="showPage(\'account\')">Add Address</button>';
    }
    html += "</div>";

    html +=
        '<div class="delivery-info">' +
        "<h4>Delivery Information</h4>" +
        "<p>\uD83D\uDE9A Delivery by " + deliveryDate.toLocaleDateString() + "</p>" +
        "<p>\u21A9 10 days return policy</p>" +
        "<p>\uD83D\uDCB0 Cash on delivery available</p>" +
        "</div>";

    html +=
        '<div class="product-actions">' +
        '<button class="btn-primary" onclick="addToCart(\'' + product._id + "')\">Add to Cart</button>" +
        '<button class="btn-secondary" onclick="buyNow(\'' + product._id + "')\">Buy Now</button>" +
        "</div>" +
        "</div>";

    productDetail.innerHTML = html;
    showPage("product");
}

// ==================== CART (BACKEND API) ====================

async function loadCart() {
    if (!isLoggedIn()) {
        cart = { items: [] };
        updateCartCount();
        return;
    }
    try {
        cart = await apiRequest("/cart");
        updateCartCount();
    } catch (error) {
        console.error("Error loading cart:", error);
        cart = { items: [] };
        updateCartCount();
    }
}

function updateCartCount() {
    var count = 0;
    if (cart && cart.items) {
        cart.items.forEach(function (item) {
            count += item.quantity;
        });
    }
    var cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
}

async function addToCart(productId) {
    if (!isLoggedIn()) {
        alert("Please login to add items to cart");
        showPage("loginRegister");
        return;
    }

    var selectedColor = "";
    var colorEl = document.getElementById("selectedColor");
    if (colorEl) selectedColor = colorEl.value;

    var selectedSize = "";
    var sizeEl = document.getElementById("selectedSize");
    if (sizeEl) selectedSize = sizeEl.value;

    try {
        cart = await apiRequest("/cart/add", "POST", {
            productId: productId,
            quantity: 1,
            color: selectedColor,
            size: selectedSize,
        });
        updateCartCount();
        alert("Product added to cart!");
    } catch (error) {
        alert("Error adding to cart: " + error.message);
    }
}

async function buyNow(productId) {
    if (!isLoggedIn()) {
        alert("Please login to continue");
        showPage("loginRegister");
        return;
    }

    var selectedColor = "";
    var colorEl = document.getElementById("selectedColor");
    if (colorEl) selectedColor = colorEl.value;

    var selectedSize = "";
    var sizeEl = document.getElementById("selectedSize");
    if (sizeEl) selectedSize = sizeEl.value;

    try {
        cart = await apiRequest("/cart/add", "POST", {
            productId: productId,
            quantity: 1,
            color: selectedColor,
            size: selectedSize,
        });
        updateCartCount();
        currentOrderSteps = 1;
        showPage("order");
    } catch (error) {
        alert("Error: " + error.message);
    }
}

async function updateQuantity(itemId, change, newValue) {
    var newItem;

    if (newValue !== undefined && newValue !== null) {
        newItem = Math.max(1, parseInt(newValue) || 1);
    } else {
        var currentItem = cart.items.find(function (item) {
            return item._id === itemId;
        });
        if (!currentItem) return;
        newItem = Math.max(1, currentItem.quantity + change);
    }

    try {
        cart = await apiRequest("/cart/update", "PUT", {
            itemId: itemId,
            quantity: newItem,
        });
        updateCartCount();
        renderCart();
    } catch (error) {
        alert("Error updating cart: " + error.message);
    }
}

async function removeFromCart(itemId) {
    try {
        cart = await apiRequest("/cart/remove/" + itemId, "DELETE");
        updateCartCount();
        renderCart();
    } catch (error) {
        alert("Error removing item: " + error.message);
    }
}

function renderCart() {
    var cartItemsEl = document.getElementById("cartItems");
    var cartSummaryEl = document.getElementById("cartSummary");

    if (!cartItemsEl || !cartSummaryEl) return;

    if (!cart || !cart.items || cart.items.length === 0) {
        cartItemsEl.innerHTML =
            '<p class="no-items-message">Your cart is empty. <a href="#" onclick="showPage(\'home\')">Continue Shopping</a></p>';
        cartSummaryEl.innerHTML = "";
        return;
    }

    cartItemsEl.innerHTML = "";
    var totalOriginal = 0;
    var totalDiscounted = 0;

    cart.items.forEach(function (item) {
        var itemTotal = item.price * item.quantity;
        var itemOriginalTotal = item.originalPrice * item.quantity;
        totalOriginal += itemOriginalTotal;
        totalDiscounted += itemTotal;

        var cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        var html =
            '<img src="' + item.image + '" alt="' + item.name + '">' +
            '<div class="cart-item-details">' +
            "<h3>" + item.name + "</h3>" +
            '<div class="product-brand">' + item.brand + "</div>";

        if (item.color) html += "<p>Color: " + item.color + "</p>";
        if (item.size) html += "<p>Size: " + item.size + "</p>";

        html +=
            '<div class="product-price">' +
            '<span class="current-price">\u20B9' + item.price + "</span>" +
            '<span class="original-price">\u20B9' + item.originalPrice + "</span>" +
            '<span class="discount">' + item.discount + "% OFF</span>" +
            "</div>" +
            '<div class="quantity-controls">' +
            '<button class="quantity-btn" onclick="updateQuantity(\'' + item._id + "', -1)\">\u2212</button>" +
            '<input type="number" class="quantity-input" value="' + item.quantity + '" min="1" ' +
            'onchange="updateQuantity(\'' + item._id + "', 0, this.value)\">" +
            '<button class="quantity-btn" onclick="updateQuantity(\'' + item._id + "', 1)\">+</button>" +
            "</div>" +
            "<p>Total: \u20B9" + itemTotal + "</p>" +
            "</div>" +
            '<button class="btn-secondary" onclick="removeFromCart(\'' + item._id + "')\">Remove</button>";

        cartItem.innerHTML = html;
        cartItemsEl.appendChild(cartItem);
    });

    var deliveryCharges = totalDiscounted > 500 ? 0 : 50;
    var finalTotal = totalDiscounted + deliveryCharges;

    cartSummaryEl.innerHTML =
        "<h3>Price Details</h3>" +
        '<div class="summary-row"><span>Total MRP:</span><span>\u20B9' + totalOriginal + "</span></div>" +
        '<div class="summary-row"><span>Discount:</span><span>\u20B9' + (totalOriginal - totalDiscounted) + "</span></div>" +
        '<div class="summary-row"><span>Delivery Charges:</span><span>' +
        (deliveryCharges === 0 ? "FREE" : "\u20B9" + deliveryCharges) +
        "</span></div>" +
        '<div class="summary-divider"></div>' +
        '<div class="summary-row summary-total"><span>Total Amount:</span><span>\u20B9' + finalTotal + "</span></div>" +
        '<button class="btn-primary" onclick="proceedToCheckout()" style="width:100%; margin-top:20px;">Place Order</button>';
}

function proceedToCheckout() {
    if (!isLoggedIn()) {
        alert("Please login to place an order");
        showPage("loginRegister");
        return;
    }
    currentOrderSteps = 1;
    showPage("order");
}

// ==================== ORDERS (BACKEND API) ====================

async function loadOrders() {
    if (!isLoggedIn()) {
        orders = [];
        return;
    }
    try {
        var response = await apiRequest("/orders");
        orders = response.orders || [];
    } catch (error) {
        console.error("Error loading orders:", error);
        orders = [];
    }
}

function renderOrderSteps() {
    var orderSteps = document.getElementById("orderSteps");
    if (!orderSteps) return;

    if (!isLoggedIn()) {
        orderSteps.innerHTML =
            '<p class="no-items-message">Please <a href="#" onclick="showPage(\'loginRegister\')">login</a> to place an order.</p>';
        return;
    }

    if (currentOrderSteps === 1) {
        var hasDetails =
            currentUser &&
            currentUser.name &&
            currentUser.phone &&
            currentUser.address;

        if (!hasDetails) {
            orderSteps.innerHTML =
                '<div class="order-form">' +
                "<h2>Step 1: Enter Your Details</h2>" +
                '<div class="form-group"><label for="orderName">Name</label>' +
                '<input type="text" id="orderName" value="' + (currentUser ? currentUser.name : "") + '" placeholder="Enter your name"></div>' +
                '<div class="form-group"><label for="orderPhone">Phone Number</label>' +
                '<input type="tel" id="orderPhone" value="' + (currentUser ? currentUser.phone : "") + '" placeholder="Enter your phone number"></div>' +
                '<div class="form-group"><label for="orderAddress">Address</label>' +
                '<textarea id="orderAddress" placeholder="Enter your complete address">' + (currentUser ? currentUser.address : "") + "</textarea></div>" +
                '<button class="btn-primary" onclick="saveOrderDetails()">Continue to Summary</button>' +
                "</div>";
        } else {
            currentOrderSteps = 2;
            renderOrderSteps();
        }
    } else if (currentOrderSteps === 2) {
        if (!cart || !cart.items || cart.items.length === 0) {
            orderSteps.innerHTML =
                '<p class="no-items-message">Your cart is empty. <a href="#" onclick="showPage(\'home\')">Continue Shopping</a></p>';
            return;
        }

        var cartTotal = 0;
        cart.items.forEach(function (item) {
            cartTotal += item.price * item.quantity;
        });

        var deliveryCharges = cartTotal > 500 ? 0 : 50;
        var finalTotal = cartTotal + deliveryCharges;

        var cartItemsHtml = "";
        cart.items.forEach(function (item) {
            cartItemsHtml +=
                '<div class="cart-item">' +
                '<img src="' + item.image + '" alt="' + item.name + '">' +
                '<div class="cart-item-details">' +
                "<h3>" + item.name + "</h3>" +
                '<div class="product-brand">' + item.brand + "</div>";
            if (item.color) cartItemsHtml += "<p>Color: " + item.color + "</p>";
            if (item.size) cartItemsHtml += "<p>Size: " + item.size + "</p>";
            cartItemsHtml +=
                "<p>Quantity: " + item.quantity + "</p>" +
                "<p>Price: \u20B9" + item.price * item.quantity + "</p>" +
                "</div></div>";
        });

        orderSteps.innerHTML =
            '<div class="order-form">' +
            "<h2>Step 2: Order Summary</h2>" +
            '<div class="address-section"><h3>Delivery Address</h3>' +
            "<p><strong>" + currentUser.name + "</strong></p>" +
            "<p>" + currentUser.phone + "</p>" +
            "<p>" + currentUser.address + "</p></div>" +
            "<h3>Order Items</h3>" +
            cartItemsHtml +
            '<div class="cart-summary">' +
            '<div class="summary-row"><span>Items Total:</span><span>\u20B9' + cartTotal + "</span></div>" +
            '<div class="summary-row"><span>Delivery Charges:</span><span>' +
            (deliveryCharges === 0 ? "FREE" : "\u20B9" + deliveryCharges) +
            "</span></div>" +
            '<div class="summary-divider"></div>' +
            '<div class="summary-row summary-total"><span>Total Amount:</span><span>\u20B9' + finalTotal + "</span></div>" +
            "</div>" +
            '<button class="btn-primary" onclick="proceedToPayment()">Proceed to Payment</button>' +
            "</div>";
    } else if (currentOrderSteps === 3) {
        orderSteps.innerHTML =
            '<div class="order-form">' +
            "<h2>Step 3: Payment</h2>" +
            '<div class="payment-options">' +
            '<div class="payment-option"><input type="radio" id="upi" name="payment" value="upi"><label for="upi">UPI Payment</label></div>' +
            '<div class="payment-option"><input type="radio" id="card" name="payment" value="card"><label for="card">Credit/Debit Card</label></div>' +
            '<div class="payment-option"><input type="radio" id="cod" name="payment" value="cod" checked><label for="cod">Cash on Delivery</label></div>' +
            "</div>" +
            '<button class="btn-primary" onclick="placeOrder()">Place Order</button>' +
            "</div>";
    }
}

function saveOrderDetails() {
    var name = document.getElementById("orderName").value.trim();
    var phone = document.getElementById("orderPhone").value.trim();
    var address = document.getElementById("orderAddress").value.trim();

    if (!name || !phone || !address) {
        alert("Please fill all required fields");
        return;
    }

    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.address = address;

    currentOrderSteps = 2;
    renderOrderSteps();
}

function proceedToPayment() {
    currentOrderSteps = 3;
    renderOrderSteps();
}

async function placeOrder() {
    var paymentRadio = document.querySelector('input[name="payment"]:checked');
    if (!paymentRadio) {
        alert("Please select a payment method.");
        return;
    }

    var paymentMethod = paymentRadio.value;

    try {
        var order = await apiRequest("/orders", "POST", {
            name: currentUser.name,
            phone: currentUser.phone,
            address: currentUser.address,
            paymentMethod: paymentMethod,
        });

        cart = { items: [] };
        updateCartCount();

        var deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 7);

        document.getElementById("orderSteps").innerHTML =
            '<div class="order-success">' +
            "<h1>\uD83C\uDF89 Order Placed Successfully!</h1>" +
            "<p>Your Order ID is: <strong>" + order._id + "</strong></p>" +
            "<p>Expected Delivery: " + deliveryDate.toLocaleDateString() + "</p>" +
            '<button class="btn-primary" onclick="showPage(\'orders\')">View My Orders</button>' +
            '<button class="btn-secondary" onclick="showPage(\'home\')">Continue Shopping</button>' +
            "</div>";
    } catch (error) {
        alert("Error placing order: " + error.message);
    }
}

function renderOrders() {
    var ordersList = document.getElementById("ordersList");
    if (!ordersList) return;

    if (!isLoggedIn()) {
        ordersList.innerHTML =
            '<p class="no-items-message">Please <a href="#" onclick="showPage(\'loginRegister\')">login</a> to view your orders.</p>';
        return;
    }

    if (!orders || orders.length === 0) {
        ordersList.innerHTML =
            '<p class="no-items-message">No orders found. <a href="#" onclick="showPage(\'home\')">Start shopping</a></p>';
        return;
    }

    ordersList.innerHTML = "";

    var sortedOrders = orders.slice().sort(function (a, b) {
        return new Date(b.orderDate) - new Date(a.orderDate);
    });

    sortedOrders.forEach(function (order) {
        var orderDiv = document.createElement("div");
        orderDiv.className = "order-card";

        var orderDate = new Date(order.orderDate);
        var deliveryDate = order.deliveryDate ? new Date(order.deliveryDate) : null;
        var statusText = order.status === "delivered" ? "Delivered" : order.status === "cancelled" ? "Cancelled" : "On the way";
        var statusClass = order.status === "delivered" ? "delivered" : "on-way";

        var orderItemsHtml = "";
        order.items.forEach(function (item) {
            orderItemsHtml +=
                '<div class="cart-item">' +
                '<img src="' + item.image + '" alt="' + item.name + '">' +
                '<div class="cart-item-details">' +
                "<h3>" + item.name + "</h3>" +
                '<div class="product-brand">' + item.brand + "</div>";
            if (item.color) orderItemsHtml += "<p>Color: " + item.color + "</p>";
            if (item.size) orderItemsHtml += "<p>Size: " + item.size + "</p>";
            orderItemsHtml +=
                "<p>Quantity: " + item.quantity + "</p>" +
                "<p>Price: \u20B9" + item.price * item.quantity + "</p>" +
                "</div></div>";
        });

        orderDiv.innerHTML =
            '<div class="order-header">' +
            '<div class="order-summary">' +
            "<h3>Order ID: " + order._id + "</h3>" +
            '<span class="status-badge ' + statusClass + '">' + statusText + "</span>" +
            "</div>" +
            '<div class="order-meta">' +
            "<p><strong>Order Date:</strong> " + orderDate.toLocaleDateString() + "</p>" +
            "<p><strong>Total:</strong> \u20B9" + (order.total + (order.deliveryCharges || 0)) + "</p>" +
            "<p><strong>Items:</strong> " + order.items.length + "</p>" +
            "</div></div>" +
            '<div class="order-details">' +
            '<div class="order-info">' +
            "<p><strong>Customer:</strong> " + order.name + "</p>" +
            "<p><strong>Phone:</strong> " + order.phone + "</p>" +
            "<p><strong>Address:</strong> " + order.address + "</p>" +
            "<p><strong>Payment:</strong> " + order.paymentMethod.toUpperCase() + "</p>" +
            "<p><strong>Delivery Date:</strong> " +
            (deliveryDate ? deliveryDate.toLocaleDateString() : "N/A") + "</p>" +
            "</div>" +
            "<h3>Items</h3>" +
            orderItemsHtml +
            "</div>";

        ordersList.appendChild(orderDiv);
    });
}

// ==================== ACCOUNT / PROFILE ====================

async function renderAccount() {
    var accountContent = document.getElementById("accountContent");
    if (!accountContent) return;

    if (!isLoggedIn()) {
        accountContent.innerHTML =
            '<p class="no-items-message">Please <a href="#" onclick="showPage(\'loginRegister\')">login</a> to view your account.</p>';
        return;
    }

    try {
        currentUser = await apiRequest("/auth/profile");
    } catch (error) {
        accountContent.innerHTML =
            '<p class="no-items-message">Error loading profile. Please try again.</p>';
        return;
    }

    accountContent.innerHTML =
        "<h1>My Account</h1>" +
        '<div class="form-group"><label>Name</label>' +
        '<input id="userName" value="' + (currentUser.name || "") + '"></div>' +
        '<div class="form-group"><label>Email</label>' +
        '<input id="userEmail" value="' + (currentUser.email || "") + '" disabled></div>' +
        '<div class="form-group"><label>Phone</label>' +
        '<input id="userPhone" value="' + (currentUser.phone || "") + '"></div>' +
        '<div class="form-group"><label>Address</label>' +
        '<textarea id="userAddress">' + (currentUser.address || "") + "</textarea></div>" +
        '<div class="account-actions">' +
        '<button class="btn-primary" onclick="saveAccount()">Save Details</button>' +
        '<button class="btn-secondary" onclick="logout()">Logout</button>' +
        "</div>";
}

async function saveAccount() {
    var name = document.getElementById("userName").value.trim();
    var phone = document.getElementById("userPhone").value.trim();
    var address = document.getElementById("userAddress").value.trim();

    if (!name) {
        alert("Name is required");
        return;
    }

    try {
        currentUser = await apiRequest("/auth/profile", "PUT", {
            name: name,
            phone: phone,
            address: address,
        });
        updateNavAuthState();
        alert("Account details saved!");
    } catch (error) {
        alert("Error saving account: " + error.message);
    }
}
