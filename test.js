// test.js - Gym Shop frontend logic (loads API, cart, offcanvas)
let productsList = [];
let cartItem = [];

// API URL (gym shop JSON)
const API_URL = "https://leng404.github.io/fitness-gym-api/data.json";

// DOM refs
const showProductsEl = document.getElementById("show-products");
const tocartEl = document.getElementById("tocart");
const cartSummaryEl = document.getElementById("cart-sumary");
const cartCountEl = document.getElementById("cart-count");
const searchInput = document.getElementById("search-input");

// fetch products from API
fetch(API_URL)
  .then((res) => res.json())
  .then((data) => {
    // The gym API may return an array; keep it
    productsList = data;
    renderProducts(productsList);
  })
  .catch((err) => {
    console.error("Failed to load products:", err);
    showProductsEl.innerHTML = `<div class="w-100"><h2 class="text-center text-danger">Failed to load products.</h2></div>`;
  });

// render product cards
function renderProducts(items = []) {
  let html = "";
  items.forEach((item) => {
    // safe id and price
    const id = item.id ?? item.productId ?? Math.random().toString(36).slice(2, 9);
    const price = Number(item.price ?? item.amount ?? 0).toFixed(2);

    html += `<div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card pb-4 shadow-sm h-100 d-flex flex-column">
          <img style="height:230px;" class="object-fit-cover" src="${item.image || item.img || ''}" alt="${escapeHtml(item.name || 'Product')}" />
          <div class="w-100 px-2 py-2">
            <h5 class="card-title">${escapeHtml(item.name || 'Product')}</h5>
            <p class="card-text flex-grow-1">${escapeHtml((item.description || '').substring(0, 64))}...</p>
            <p class="text-success fw-semibold fs-5">${price} $</p>
          </div>
          <div class="w-100 px-2 mt-auto">
            <button type="button" onclick='AddtoCart("${id}")' class="btn btn-primary mt-2 w-100">Add to Cart</button>
          </div>
        </div>
      </div>`;
  });
  showProductsEl.innerHTML = html;
  Updatecart();
}

// safe text escape
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// search filter
searchInput?.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase().trim();
  if (!q) {
    renderProducts(productsList);
    return;
  }
  const filtered = productsList.filter((p) => (p.name || "").toLowerCase().includes(q));
  if (filtered.length > 0) {
    renderProducts(filtered);
  } else {
    showProductsEl.innerHTML = `<div class="w-100"><h2 class="text-center text-danger">Search Products Is Not Found....!</h2></div>`;
  }
});

// Add to cart by product id (works with id types)
function AddtoCart(productId) {
  // Try to find source product from productsList by loose equality
  const product = productsList.find((p) => String(p.id) === String(productId) || String(p.productId) === String(productId));
  if (!product) {
    Swal.fire({ icon: "error", title: "Error", text: "Product not found." });
    return;
  }

  const existing = cartItem.find((i) => String(i.id) === String(productId));
  if (existing) {
    existing.qty += 1;
  } else {
    // clone minimal fields
    cartItem.push({
      id: product.id ?? product.productId ?? productId,
      name: product.name ?? "Product",
      price: Number(product.price ?? product.amount ?? 0),
      image: product.image ?? product.img ?? ""
      , qty: 1
    });
  }

  Swal.fire({ icon: "success", title: "Added", text: `${product.name} added to cart.` , timer: 900, showConfirmButton: false});
  Updatecart();
}

// render cart & summary
function Updatecart() {
  // render items
  if (!tocartEl || !cartSummaryEl || !cartCountEl) return;

  cartCountEl.textContent = cartItem.reduce((s, it) => s + it.qty, 0);

  if (cartItem.length === 0) {
    tocartEl.innerHTML = `<h4 class="text-center mt-4">Your Cart Is Empty</h4>`;
    cartSummaryEl.innerHTML = `
      <div class="d-flex justify-content-between">
        <span>Subtotal</span><span class="fw-semibold">$0</span>
      </div>
      <div class="d-flex justify-content-between">
        <span>Delivery</span><span class="fw-semibold">$0</span>
      </div>
      <div class="d-flex justify-content-between fs-5 fw-bold mt-2">
        <span>Total</span><span>$0</span>
      </div>
      <button class="btn btn-success w-100 mt-3" disabled><i class="bi bi-credit-card me-2"></i>Proceed to Checkout</button>
    `;
    return;
  }

  // build cart items html
  let itemsHtml = "";
  cartItem.forEach((it) => {
    itemsHtml += `<div class="cart-item">
      <img src="${escapeHtml(it.image)}" alt="${escapeHtml(it.name)}" />
      <div class="ms-2 flex-grow-1">
        <h6 class="mb-1">${escapeHtml(it.name)}</h6>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" onclick='UpdateQty("${it.id}", -1)'>-</button>
          <span>${it.qty}</span>
          <button class="btn btn-sm btn-outline-secondary" onclick='UpdateQty("${it.id}", 1)'>+</button>
        </div>
      </div>
      <div class="text-end">
        <div class="text-success fw-semibold mb-1">$${(it.price).toFixed(2)}</div>
        <button class="btn btn-sm btn-outline-danger" onclick='RemoveCart("${it.id}")'><i class="bi bi-trash"></i></button>
      </div>
    </div>`;
  });

  tocartEl.innerHTML = itemsHtml;

  // totals
  const subtotal = cartItem.reduce((sum, p) => sum + p.qty * Number(p.price), 0);
  const delivery = subtotal > 0 ? 1 : 0;
  const total = subtotal + delivery;

  cartSummaryEl.innerHTML = `
    <div class="d-flex justify-content-between">
      <span>Subtotal</span><span class="fw-semibold">${subtotal.toFixed(2)} $</span>
    </div>
    <div class="d-flex justify-content-between">
      <span>Delivery</span><span class="fw-semibold">${delivery} $</span>
    </div>
    <div class="d-flex justify-content-between fs-5 fw-bold mt-2">
      <span>Total</span><span>${total.toFixed(2)} $</span>
    </div>
    <button onclick="checkout()" class="btn btn-success w-100 mt-3"><i class="bi bi-credit-card me-2"></i>Proceed to Checkout</button>
  `;
}

// remove from cart
function RemoveCart(productId) {
  cartItem = cartItem.filter((i) => String(i.id) !== String(productId));
  Updatecart();
}

// update qty (if result <1 remove)
function UpdateQty(productId, change) {
  const it = cartItem.find((i) => String(i.id) === String(productId));
  if (!it) return;
  it.qty += change;
  if (it.qty < 1) {
    // remove item
    cartItem = cartItem.filter((i) => String(i.id) !== String(productId));
  }
  Updatecart();
}

// checkout (demo only)
function checkout() {
  if (cartItem.length === 0) {
    Swal.fire({ icon: "error", title: "Oops...", text: "Your cart is empty." });
    return;
  }

  // Demo behavior: show order summary and clear cart
  const subtotal = cartItem.reduce((sum, p) => sum + p.qty * Number(p.price), 0);

  Swal.fire({
    title: "Place order?",
    html: `<p>Items: ${cartItem.length}</p><p>Subtotal: $${subtotal.toFixed(2)}</p>`,
    showCancelButton: true,
    confirmButtonText: "Place order",
  }).then((res) => {
    if (res.isConfirmed) {
      // Here you can POST to backend if you add Java backend later
      cartItem = [];
      Updatecart();
      Swal.fire({ icon: "success", title: "Order placed", text: "Thank you for your purchase!" });
    }
  });
}
