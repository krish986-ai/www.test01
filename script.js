let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(code, price) {
    let item = cart.find(i => i.code === code);
    if (item) {
        item.qty++;
    } else {
        cart.push({ code, price, qty: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Item added to cart!");
}

function loadCart() {
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    let cartContainer = document.getElementById("cartItemsContainer");

    cartContainer.innerHTML = "";

    if (cartItems.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    cartItems.forEach((item, index) => {
        let div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <p><strong>Item Code:</strong> ${item.code} | <strong>Price:</strong> ₹${item.price}</p>
            <button onclick="updateQuantity(${index}, -1)">➖</button> 
            <input type="number" id="qty-${index}" value="${item.qty}" min="1" onchange="manualUpdate(${index})" />
            <button onclick="updateQuantity(${index}, 1)">➕</button>
        `;
        cartContainer.appendChild(div);
    });

    updateOrderSummary();
}

// Load cart when the page is loaded
document.addEventListener("DOMContentLoaded", loadCart);

function updateQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart[index]) {
        cart[index].qty += change;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1); // Remove item if quantity is 0
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart(); // Refresh cart display
    }
}

function manualUpdate(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let inputElement = document.getElementById(`qty-${index}`);
    let newQty = parseInt(inputElement.value);

    if (isNaN(newQty) || newQty < 1) {
        alert("Quantity must be at least 1");
        inputElement.value = cart[index].qty; // Reset to original value
        return;
    }

    cart[index].qty = newQty;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateOrderSummary();
}

function viewCart() {
    window.location.href = "cart.html";  // Redirects to cart page
}

// Function to update order summary
function updateOrderSummary() {
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    let orderDetails = document.getElementById("orderDetailsDisplay");

    if (cartItems.length === 0) {
        orderDetails.innerHTML = "<p>No items in order.</p>";
        document.getElementById("copyOrderBtn").style.display = "none"; 
        document.getElementById("shareOrderBtn").style.display = "none";
        document.getElementById("generateOrderBtn").style.display = "none";
        
        // Hide input fields when cart is empty
        document.getElementById("customerName").style.display = "none";
        document.getElementById("customerPhone").style.display = "none";
        document.getElementById("customerAddress").style.display = "none";
        return;
    }

    let totalItems = 0;
    let totalPrice = 0;
    let orderText = "<strong>Order Details:</strong><br>";

    cartItems.forEach(item => {
        totalItems += item.qty;
        totalPrice += item.price * item.qty;
        orderText += `${item.code} x ${item.qty} = ₹${item.price * item.qty}<br>`;
    });

    orderText += `<hr><strong>Total Items:</strong> ${totalItems} <br>`;
    orderText += `<strong>Total Price:</strong> ₹${totalPrice} <br>`;

    orderDetails.innerHTML = orderText;

    // Show input fields when cart is not empty
    document.getElementById("customerName").style.display = "block";
    document.getElementById("customerPhone").style.display = "block";
    document.getElementById("customerAddress").style.display = "block";

    document.getElementById("generateOrderBtn").style.display = "block";

    // ✅ Hide "Copy" and "Share" buttons if order is updated (i.e., no order ID exists yet)
    let storedOrder = JSON.parse(localStorage.getItem("orderDetails"));
    if (!storedOrder || !storedOrder.orderID) {
        document.getElementById("copyOrderBtn").style.display = "none";
        document.getElementById("shareOrderBtn").style.display = "none";
    }
}


// Copy order details
function copyOrderDetails() {
    let orderData = JSON.parse(localStorage.getItem("orderDetails"));
    if (!orderData || !orderData.cartItems || orderData.cartItems.length === 0) {
        alert("No order details available to copy.");
        return;
    }

    let orderDetailsText = orderData.cartItems.map(item => 
        `• ${item.code} x ${item.qty} = ₹${item.price * item.qty}`
    ).join("\n");

    let totalAmount = orderData.cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

    let copyText = `🛒 *Order Details:*\n\n` +
                   `👤 *Name:* ${orderData.name}\n` +
                   `📞 *Phone:* ${orderData.phone}\n` +
                   `🏠 *Address:* ${orderData.address}\n` +
                   `🆔 *Order ID:* ${orderData.orderID}\n\n` +
                   `📦 *Items Ordered:*\n${orderDetailsText}\n\n` +
                   `💰 *Total Amount:* ₹${totalAmount}`;

    navigator.clipboard.writeText(copyText)
        .then(() => alert("Order details copied successfully!"))
        .catch(err => alert("Failed to copy order details."));
}

function displayCart() {
    let cartItemsDiv = document.getElementById("cartItemsContainer");

    if (!cartItemsDiv) return;

    cartItemsDiv.innerHTML = "";
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }
    cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.forEach(item => {
        cartItemsDiv.innerHTML += `
            <div class="cart-item">
                <p>Item Code: ${item.code} | Price: ₹${item.price} | Quantity: ${item.qty}</p>
                <button onclick="removeItem('${item.code}')">Remove</button>
            </div>
        `;
    });
}

function searchProducts() {
    let input = document.getElementById('searchBar').value.toLowerCase();
    let products = document.getElementsByClassName('product');

    for (let i = 0; i < products.length; i++) {
        let productName = products[i].getElementsByTagName('h2')[0].innerText.toLowerCase();
        if (productName.includes(input)) {
            products[i].style.display = '';
        } else {
            products[i].style.display = 'none';
        }
    }
}

function removeItem(code) {
    cart = cart.filter(item => item.code !== code);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

function goBack() {
    window.location.href = "index.html";  // Redirect to shop page
}

function generateOrderID() {
    let name = document.getElementById("customerName").value.trim();
    let phone = document.getElementById("customerPhone").value.trim();
    let address = document.getElementById("customerAddress").value.trim();
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    if (!name || !phone || !address) {
        alert("Please fill in all details before generating an order ID.");
        return;
    }

    if (cartItems.length === 0) {
        alert("Your cart is empty. Please add items before generating an order ID.");
        return;
    }

    let timestamp = new Date().getTime();
    let orderID = "ORD" + timestamp.toString().slice(-6);

    let orderDetails = { name, phone, address, orderID, cartItems };
    localStorage.setItem("orderDetails", JSON.stringify(orderDetails));

    updateOrderSummary();  // ✅ Updates UI after generating Order ID

    // ✅ Show "Copy" and "Share" buttons only when an Order ID is generated
    document.getElementById("copyOrderBtn").style.display = "block";
    document.getElementById("shareOrderBtn").style.display = "block";

    alert("Order ID generated successfully!");
}


function shareOnWhatsApp() {
    let orderData = JSON.parse(localStorage.getItem("orderDetails"));
    if (!orderData || !orderData.cartItems || orderData.cartItems.length === 0) {
        alert("Please generate an order ID first.");
        return;
    }

    let shopkeeperNumber = "919572978809"; // International format

    let orderDetailsText = orderData.cartItems.map(item => 
        `• ${item.code} x ${item.qty} = ₹${item.price * item.qty}`
    ).join("\n");

    let totalAmount = orderData.cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

    let message = `🛒 *Order Details:*\n\n` +
                  `👤 *Name:* ${orderData.name}\n` +
                  `📞 *Phone:* ${orderData.phone}\n` +
                  `🏠 *Address:* ${orderData.address}\n` +
                  `🆔 *Order ID:* ${orderData.orderID}\n\n` +
                  `📦 *Items Ordered:*\n${orderDetailsText}\n\n` +
                  `💰 *Total Amount:* ₹${totalAmount}`;

    let encodedMessage = encodeURIComponent(message);
    let whatsappURL = `https://wa.me/${shopkeeperNumber}?text=${encodedMessage}`;

    console.log("Opening WhatsApp with message:", whatsappURL);

    window.open(whatsappURL, "_blank");
}
