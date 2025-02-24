// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAVFvmsPSIuFPQS5XNIk05kM0ebwoMnbP0",
    authDomain: "catering-project-23856.firebaseapp.com",
    projectId: "catering-project-23856",
    storageBucket: "catering-project-23856.firebasestorage.app",
    messagingSenderId: "597332083727",
    appId: "1:597332083727:web:d3a0381e6e522e6ba04f7a",
    measurementId: "G-J3KTMCE28B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

let cart = [];
let wishlist = [];

// **User Registration**
export function register() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => alert("User registered!"))
        .catch(error => alert(error.message));
}

// **User Login**
export function login() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => alert("Logged in!"))
        .catch(error => alert(error.message));
}

// **User Logout**
export function logout() {
    signOut(auth)
        .then(() => alert("Logged out!"))
        .catch(error => alert(error.message));
}

// **Fetch Products from Firestore**
export function fetchProducts() {
    getDocs(collection(db, "products")).then(snapshot => {
        let productList = document.getElementById("product-list");
        productList.innerHTML = "";
        snapshot.forEach(doc => {
            let data = doc.data();
            let div = document.createElement("div");
            div.classList.add("product-card");
            div.innerHTML = `<h3>${data.name}</h3><p>Price: ${data.price}</p>
                             <button onclick="addToCart('${doc.id}', '${data.name}', ${data.price})">🛒 Add to Cart</button>
                             <button onclick="addToWishlist('${doc.id}', '${data.name}')">❤️ Save</button>`;
            productList.appendChild(div);
        });
    });
}

// **Add to Cart**
export function addToCart(id, name, price) {
    cart.push({ id, name, price });
    document.getElementById("cart-count").innerText = cart.length;
    alert(`${name} added to cart!`);
}

// **Place Order**
export function placeOrder() {
    let user = auth.currentUser;
    if (user) {
        addDoc(collection(db, "orders"), {
            userId: user.uid,
            items: cart,
            status: "Pending",
            timestamp: new Date()
        }).then(() => {
            alert("Order Placed!");
            cart = [];
            document.getElementById("cart-count").innerText = "0";
        });
    } else {
        alert("Please login to place an order.");
    }
}

// **Fetch Orders for User**
export function fetchOrders() {
    let user = auth.currentUser;
    if (user) {
        const q = query(collection(db, "orders"), where("userId", "==", user.uid));
        onSnapshot(q, snapshot => {
            let orderList = document.getElementById("order-list");
            orderList.innerHTML = "";
            snapshot.forEach(doc => {
                let data = doc.data();
                let div = document.createElement("div");
                div.classList.add("order-card");
                div.innerHTML = `<h3>Order ID: ${doc.id}</h3>
                                 <p>Status: ${data.status}</p>`;
                orderList.appendChild(div);
            });
        });
    }
}

// **Fetch Orders for Admin**
export function fetchAdminOrders() {
    onSnapshot(collection(db, "orders"), snapshot => {
        let adminOrders = document.getElementById("admin-orders");
        adminOrders.innerHTML = "";
        snapshot.forEach(doc => {
            let data = doc.data();
            let div = document.createElement("div");
            div.classList.add("order-card");
            div.innerHTML = `<h3>Order ID: ${doc.id}</h3>
                             <p>Status: ${data.status}</p>
                             <button onclick="updateOrderStatus('${doc.id}', 'Completed')">Mark as Completed</button>`;
            adminOrders.appendChild(div);
        });
    });
}

// **Update Order Status (Admin)**
export function updateOrderStatus(orderId, status) {
    updateDoc(doc(db, "orders", orderId), { status })
        .then(() => alert("Order status updated!"));
}

// **Search Products**
export function searchProducts() {
    let searchQuery = document.getElementById("search").value.toLowerCase();
    getDocs(collection(db, "products")).then(snapshot => {
        let productList = document.getElementById("product-list");
        productList.innerHTML = "";
        snapshot.forEach(doc => {
            let data = doc.data();
            if (data.name.toLowerCase().includes(searchQuery)) {
                let div = document.createElement("div");
                div.classList.add("product-card");
                div.innerHTML = `<h3>${data.name}</h3><p>Price: ${data.price}</p>
                                 <button onclick="addToCart('${doc.id}', '${data.name}', ${data.price})">🛒 Add to Cart</button>
                                 <button onclick="addToWishlist('${doc.id}', '${data.name}')">❤️ Save</button>`;
                productList.appendChild(div);
            }
        });
    });
}

// **Wishlist Functionality**
export function addToWishlist(id, name) {
    wishlist.push({ id, name });
    alert(`${name} saved to wishlist!`);
}

export function viewWishlist() {
    alert("Wishlist:\n" + wishlist.map(item => item.name).join("\n"));
}

// **Detect Auth State**
onAuthStateChanged(auth, user => {
    if (user) {
        fetchProducts();
        fetchOrders();
        fetchAdminOrders();
    }
});
