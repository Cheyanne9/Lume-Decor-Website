/* script.js
   Handles:
   - mobile nav toggle
   - cart management (localStorage)
   - register/login flow (localStorage)
   - checkout form validation
   - invoice generation and navigation
*/

/* --------- constants & helpers --------- */
const CART_KEY = 'lumecart_v1';
const USER_KEY = 'lume_user_v1';
const CURRENT_USER = 'lume_current_user_v1';
const INVOICE_KEY = 'lume_last_invoice_v1';

// Helper: format currency
function fmt(n){ return '$' + Number(n).toFixed(2); }
// Product Details Map
const PRODUCT_DETAILS = {
  "mirror-1": {
    desc: "Premium engraved acrylic mirror with warm LED lighting. Perfect gift and décor centerpiece.",
    specs: [
      "Acrylic mirror panel",
      "USB LED backlight",
      "Custom text engraving",
      "Wall-mount ready",
      "Modern frameless finish",
	  "China Origin"
    ],
    custom: true
  },
  "mirror-2": {
    desc:"Sleek LED Bathroom mirror with dimmable lighting for makeup and ambience.",
    specs:[
      "Tempered glass",
      "Adjustable brightness",
      "Touch dimmer",
      "Warm/white lighting",
      "Wall mount"
    ],
    custom: true
  },
  "mirror-3": {
    desc:"Asymmetrical designer mirror to elevate creative spaces.",
    specs:[
      "Premium acrylic",
      "Free-flow organic shape",
      "Wall mount hardware included",
      "Smooth polished edge"
    ],
    custom: true
  },
  "mirror-4": {
    desc:"Luxury arch gold-frame mirror for elegant interiors.",
    specs:[
      "Gold metal frame",
      "Crystal-polish finish",
      "Wall mount included",
      "Modern luxury style"
    ],
    custom: true
  },
  
  "led-1": {
    desc:"Programmable LED display panel for scrolling messages.",
    specs:[
      "RGB LED matrix",
      "Text animation modes",
      "USB or adapter power",
      "Remote control included"
    ],
    custom: false
  },
  "led-2": {
    desc:"Heart-shaped neon LED sign for romantic décor and events.",
    specs:[
      "Soft silicone neon",
      "12V safe power",
      "Bright warm glow",
      "Wall hook slots"
    ],
    custom: true
  },
  "led-3": {
    desc:"Neon LED name sign — personalize your space or business.",
    specs:[
      "Custom name text",
      "Acrylic backing",
      "High brightness neon",
      "12V adapter"
    ],
    custom: true
  },
  "led-4": {
    desc:"4-piece mini neon bundle — create your own wall layout.",
    specs:[
      "4 neon shapes",
      "USB powered",
      "Flexible placement",
      "Warm glow"
    ],
    custom: false
  },

  "wall-1": {
    desc:"Textured abstract canvas art with deep tone palette.",
    specs:[
      "High resolution print",
      "Premium canvas",
      "Ready to hang",
      "Eco-friendly inks"
    ],
    custom: false
  },
  "wall-2": {
    desc:"Minimal line-art print for clean styled interiors.",
    specs:[
      "Fine art paper",
      "Matte finish",
      "Frame ready"
    ],
    custom: false
  },
  "wall-3": {
    desc:"Warm sunset abstract poster with premium texture.",
    specs:[
      "Rich color finish",
      "Fade-resistant print",
      "Modern look"
    ],
    custom: false
  },
  "wall-4": {
    desc:"Blank canvas — create your own art masterpiece.",
    specs:[
      "Cotton stretched canvas",
      "Wood frame backing",
      "Paint ready"
    ],
    custom: true
  },

  "acc-1": {
    desc:"5m LED strip night light — create cozy ambient glow.",
    specs:[
      "USB LED strip",
      "Remote included",
      "Adhesive backing",
      "Multiple modes"
    ],
    custom: false
  },
  "acc-2": {
    desc:"Floating LED shelf — display items with ambient lighting.",
    specs:[
      "Wood shelf",
      "Integrated LEDs",
      "Wall hardware included",
      "Soft warm glow"
    ],
    custom: false
  },
  "acc-3": {
    desc:"Illuminated flower pot for modern decorative lighting.",
    specs:[
      "Frosted finish",
      "Rechargeable",
      "Warm LED",
      "Indoor/outdoor use"
    ],
    custom: false
  }
};


// Load cart from localStorage
function loadCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }

// Update the small cart count in header
function updateCartCount(){
  const cntEl = document.getElementById('cart-count');
  const cart = loadCart();
  const totalQty = cart.reduce((s,i)=> s + (i.qty||0), 0);
  if(cntEl) cntEl.textContent = totalQty;
}

/* ---------- mobile nav ---------- */
document.addEventListener('DOMContentLoaded', ()=> {
  // nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navList = document.querySelector('.nav-list');
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navList.classList.toggle('show');
    });
  }

  /// add-to-cart buttons (product pages)
  document.body.addEventListener('click', (e) => {
    if (e.target.matches('.add-to-cart')) {
      const btn = e.target;
      const product = btn.closest('.product');

      const id = product.dataset.id;
      const name = product.dataset.name;
      const price = parseFloat(product.dataset.price);
      const img = product.querySelector('img')?.getAttribute('src') || '';

      const cart = loadCart();
      const existing = cart.find((i) => i.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id, name, price, qty: 1, img });
      }
      saveCart(cart);
      updateCartCount();

      btn.textContent = 'Added ✓';
      setTimeout(() => (btn.textContent = 'Add to Cart'), 1000);
    }
  });

  updateCartCount();

  // simple reveal for elements with fade-up
  const els = document.querySelectorAll('.fade-up');
  const io = new IntersectionObserver(entries => {
    entries.forEach(ent => { if(ent.isIntersecting) ent.target.classList.add('in'); });
  }, {threshold: 0.12});
  els.forEach(el => io.observe(el));

  /* ---------- Customization Modal ---------- */
  const modal = document.getElementById('customModal');
  const closeModal = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('modalCancelBtn');
  const modalImg = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const custText = document.getElementById('custText');
  const custColor = document.getElementById('custColor');
  const custSize = document.getElementById('custSizeSelect');
  const custQty = document.getElementById('custQty');
  const previewText = document.getElementById('previewText');
  const modalAddBtn = document.getElementById('modalAddBtn');
  const modalMsg = document.getElementById('modalMsg');
  const desc = document.getElementById('modalDescription');
  const specs = document.getElementById('modalSpecs');
  const custFont = document.getElementById('custFont');

  let activeProduct = null;

  // Open modal when "Customize" is clicked
  document.querySelectorAll('.customize-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const product = e.target.closest('.product');
      activeProduct = {
        id: product.dataset.id,
        name: product.dataset.name,
        price: parseFloat(product.dataset.price),
        img: product.dataset.img
      };

      modalImg.src = activeProduct.img;
      modalTitle.textContent = activeProduct.name;
      modalPrice.textContent = `JMD ${activeProduct.price.toLocaleString()}`;
      custText.value = '';
      previewText.textContent = 'Your Text';
      custColor.value = '#ff66cc';
      previewText.style.fontFamily = "Poppins, sans-serif";
      modal.style.display = 'flex';
      modal.scrollTop = 0;
      document.body.style.overflow = 'hidden';
	  
	  const custFont = document.getElementById('custFont');
      const custGlow = document.getElementById('custGlow');
      const custSpace = document.getElementById('custSpace');
      const textUp = document.getElementById('textUp');
      const textDown = document.getElementById('textDown');

    let textOffset = 0;

    custFont.addEventListener('change', () => {
    previewText.style.fontFamily = custFont.value;
});

    custGlow.addEventListener('input', () => {
    previewText.style.textShadow = `0 0 ${custGlow.value * 2}px rgba(255,255,255,0.9)`;
});

    custSpace.addEventListener('input', () => {
    previewText.style.letterSpacing = custSpace.value + 'px';
});

    textUp.addEventListener('click', (e) => {
    e.preventDefault();
    textOffset -= 5;
    previewText.style.top = `calc(50% + ${textOffset}px)`;
});

   textDown.addEventListener('click', (e) => {
   e.preventDefault();
   textOffset += 5;
   previewText.style.top = `calc(50% + ${textOffset}px)`;
});


      
     // Load product details from map
const info = PRODUCT_DETAILS[activeProduct.id];

if(info){
  desc.textContent = info.desc;
  specs.innerHTML = info.specs.map(s => `<li>${s}</li>`).join("");

  // Show or hide customization section
  const customizationFields = [
    'custText','custColor','custFont','custGlow','custSpace','textUp','textDown','custSizeSelect'
  ];

  customizationFields.forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.closest('.modal-row').style.display = info.custom ? "block" : "none";
  });

  if(!info.custom){
    previewText.style.display = "none";
  } else {
    previewText.style.display = "block";
  }
}

    });
  });

  // Live preview updates
  custText.addEventListener('input', () => {
    previewText.textContent = custText.value || 'Your Text';
  });

  custColor.addEventListener('input', () => {
    previewText.style.color = custColor.value;
  });

  // Writing style font preview
  if (custFont) {
    custFont.addEventListener("change", () => {
      const style = custFont.value;
      previewText.style.fontFamily =
        style === "cursive" ? "'Brush Script MT', cursive" :
        style === "serif" ? "'Playfair Display', serif" :
        style === "monospace" ? "monospace" :
        "Poppins, sans-serif";
    });
  }

  // Add customized product to cart
  modalAddBtn.addEventListener('click', () => {
    if (!activeProduct) return;
    const cart = loadCart();
    const item = {
      id: activeProduct.id + '-' + Date.now(),
      name: activeProduct.name + ' (' + custText.value + ')',
      price: activeProduct.price,
      qty: parseInt(custQty.value) || 1,
      img: activeProduct.img,
      color: custColor.value,
      size: custSize.value,
      customText: custText.value
    };
    cart.push(item);
    saveCart(cart);
    updateCartCount();
    modalMsg.style.color = 'lime';
    modalMsg.textContent = 'Added to cart ✓';
    setTimeout(() => {
      modalMsg.textContent = '';
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 1000);
  });

  // Close modal
  [closeModal, cancelBtn].forEach(btn =>
    btn.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    })
  );

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

});

/* ---------- registration & login ---------- */
/* ==========================================================
   Lumé Décor | User Authentication & Cart Logic
   Handles registration, login, session, logout + homepage access protection
   ========================================================== */

// ----------------------- Registration -----------------------
const regForm = document.getElementById("registerForm");
if (regForm) {
  regForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get form values
    const fullname = document.getElementById("fullname").value.trim();
    const dob = document.getElementById("dob").value;
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const error = document.getElementById("regError");

    // Validation
    if (!fullname || !dob || !username || !email || !password || !confirmPassword) {
      error.textContent = "Please fill out all fields.";
      return;
    }
    if (password.length < 6) {
      error.textContent = "Password must be at least 6 characters.";
      return;
    }
    if (password !== confirmPassword) {
      error.textContent = "Passwords do not match.";
      return;
    }

    // Load existing users
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const existing = users.find(u => u.email === email);
    if (existing) {
      error.textContent = "An account with this email already exists.";
      return;
    }

    // Save new user
    users.push({ fullname, dob, username, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    // Success message
    error.style.color = "green";
    error.textContent = "Registration successful! You can now log in.";

    // Optional: redirect to login after 1.5s
    setTimeout(() => window.location.href = "login.html", 1500);
  });
}


// ----------------------- Login -----------------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const error = document.getElementById("loginError");

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      error.textContent = "Invalid email or password.";
      return;
    }

    // Save session
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Show welcome message instead of form
    document.getElementById("loginCard").style.display = "none";
    const welcomeCard = document.getElementById("welcomeCard");
    welcomeCard.style.display = "flex";
    document.getElementById("welcomeName").textContent = user.fullname.split(" ")[0];

    // Go Home button
    document.getElementById("goHomeBtn").addEventListener("click", () => {
      window.location.href = "index.html";
    });
  });
}

// ----------------------- Session Check / Logout -----------------------
const protectedPages = ["index.html", "products.html", "about.html", "cart.html", "checkout.html", "invoice.html"];
const currentFile = location.pathname.split("/").pop();

if (protectedPages.includes(currentFile)) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    // Not logged in → send to login
    window.location.href = "login.html";
  } else {
    // Update nav bar cart/logout display if present
    const nav = document.querySelector(".main-nav ul");
    if (nav && !document.getElementById("logoutLink")) {
      const li = document.createElement("li");
      li.innerHTML = `<a id="logoutLink" href="#">Logout</a>`;
      nav.appendChild(li);

      // Add logout functionality
      li.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
      });
    }
  }
}

// helper to show current user in header (if needed)
function showCurrentUser(){
  const cur = JSON.parse(localStorage.getItem(CURRENT_USER) || 'null');
  const el = document.getElementById('current-user');
  if(el){
    if(cur) el.textContent = `Hi, ${cur.fullname.split(' ')[0]}`; else el.textContent = 'Account';
  }
}

/* ---------- cart page logic (cart.html) ---------- */
function renderCartTable(){
  const tableBody = document.getElementById('cart-items-body');
  if(!tableBody) return;
  const cart = loadCart();
  if(cart.length === 0){
    tableBody.innerHTML = `<tr><td colspan="5">Your cart is empty. <a href="products.html">Shop now</a>.</td></tr>`; updateSummary(); return;
  }
  tableBody.innerHTML = '';
  cart.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="p-name"><div style="display:flex;gap:.6rem;align-items:center">
        ${ item.img ? `<img src="${item.img}" alt="${item.name}" style="width:64px;height:48px;object-fit:cover;border-radius:6px">` : '' }
        <div><strong>${item.name}</strong></div>
      </div></td>
      <td>${fmt(item.price)}</td>
      <td><input class="qty-input" type="number" min="1" value="${item.qty}" data-id="${item.id}"></td>
      <td class="line-total">${fmt(item.price * item.qty)}</td>
      <td><button class="btn remove-btn" data-id="${item.id}">Remove</button></td>
    `;
    tableBody.appendChild(tr);
  });
  attachCartEvents();
  updateSummary();
}

function attachCartEvents(){
  const qtyInputs = document.querySelectorAll('.qty-input');
  qtyInputs.forEach(inp => {
    inp.addEventListener('change', (e)=>{
      let v = parseInt(e.target.value,10);
      if(isNaN(v) || v < 1) v = 1;
      const id = e.target.dataset.id;
      const cart = loadCart();
      const item = cart.find(i => i.id === id);
      if(item){ item.qty = v; saveCart(cart); renderCartTable(); }
    });
  });

  const removeBtns = document.querySelectorAll('.remove-btn');
  removeBtns.forEach(b => {
    b.addEventListener('click', (e)=>{
      const id = e.target.dataset.id;
      let cart = loadCart();
      cart = cart.filter(i => i.id !== id);
      saveCart(cart);
      renderCartTable();
    });
  });
}

// summary: subtotal, discount, tax, total
function updateSummary(){
  const cart = loadCart();
  const subtotal = cart.reduce((s,i) => s + (i.qty * i.price), 0);
  // discount (if a promo exists) — demo: if subtotal > 100 apply 8% discount
  const discountVal = subtotal > 100 ? subtotal * 0.08 : 0;
  const tax = (subtotal - discountVal) * 0.10; // 10% tax
  const total = subtotal - discountVal + tax;

  // update DOM elements with these ids if present
  const elSub = document.getElementById('summary-subtotal');
  const elDisc = document.getElementById('summary-discount');
  const elTax = document.getElementById('summary-tax');
  const elTot = document.getElementById('summary-total');
  if(elSub) elSub.textContent = fmt(subtotal);
  if(elDisc) elDisc.textContent = discountVal > 0 ? `-${fmt(discountVal)}` : '-';
  if(elTax) elTax.textContent = fmt(tax);
  if(elTot) elTot.textContent = fmt(total);

  // store latest summary in localStorage for checkout use
  localStorage.setItem('lume_last_summary', JSON.stringify({subtotal,discountVal,tax,total}));
}

// clear cart function
function clearCart(){
  localStorage.removeItem(CART_KEY);
  renderCartTable();
}


/* ---------- checkout page ---------- */
function initCheckoutForm(){
  const form = document.getElementById('checkout-form');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();

    // Billing
    const name = form.querySelector('#ship-name')?.value.trim();
    const address = form.querySelector('#address')?.value.trim();
    const city = form.querySelector('#city')?.value.trim();
    const postal = form.querySelector('#postal')?.value.trim();
	
	
	
    // Shipping
    const shippingMethod = document.getElementById("shipping-method")?.value;
    const shippingPhone = document.getElementById("shipping-phone")?.value.trim();
    const shippingNotes = document.getElementById("shipping-notes")?.value.trim();

    let shippingCost = 0;
    if (shippingMethod === "Standard Delivery") shippingCost = 1500;
    if (shippingMethod === "Express Delivery") shippingCost = 2500;
    if (shippingMethod === "Local Pickup") shippingCost = 0;

    // Payment
    const cardName = form.querySelector('#card-name')?.value.trim();
    const cardNum = form.querySelector('#card-num')?.value.replace(/\s+/g,'');
    const cardExp = form.querySelector('#card-exp')?.value.trim();
    const cardCvc = form.querySelector('#card-cvc')?.value.trim();
	
	if (name.toLowerCase() !== cardName.toLowerCase()) {
  alert('The billing name must match the name on the card.');
  return;
}

    if(!name || !address || !city || !postal || !shippingPhone || !shippingMethod || !cardName || !cardNum || !cardExp || !cardCvc){
      alert('Please complete all required checkout fields.');
      return;
    }

    if(!/^\d{13,19}$/.test(cardNum) || !/^\d{3,4}$/.test(cardCvc)){
      alert('Card details invalid');
      return;
    }

    const cart = loadCart();
    if(cart.length === 0){ alert('Cart is empty.'); return; }

    const summary = JSON.parse(localStorage.getItem('lume_last_summary') || '{}');

    // Recalculate total with shipping
    const subtotal = summary.subtotal || cart.reduce((s,i)=> s + i.qty*i.price,0);
    const saleDiscount = summary.discountVal || 0;
    const tax = summary.tax || 0;
    const total = subtotal - saleDiscount + tax + shippingCost;

    const invoice = {
      invoiceId: 'INV-' + Date.now(),
      date: new Date().toISOString(),
      billing: {name, address, city, postal},
      shipping: {shippingMethod, shippingPhone, shippingNotes, shippingCost},
      items: cart,
      subtotal,
      discount: saleDiscount,
      tax,
      total,
      paidWith: {cardName: cardName, last4: cardNum.slice(-4), method: 'Card'}
    };

    localStorage.setItem(INVOICE_KEY, JSON.stringify(invoice));
    clearCart();
    window.location.href = 'invoice.html';
  });
}

/* ---------- invoice page render ---------- */
function renderInvoice(){
  const invEl = document.getElementById('invoice-root');
  if(!invEl) return;
  const invoice = JSON.parse(localStorage.getItem(INVOICE_KEY) || 'null');
  if(!invoice) { invEl.innerHTML = '<p>No invoice found. Please complete a purchase first.</p>'; return; }

  const date = new Date(invoice.date);
  const lines = invoice.items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td style="text-align:center">${i.qty}</td>
      <td style="text-align:right">${fmt(i.price)}</td>
      <td style="text-align:right">${fmt(i.price * i.qty)}</td>
    </tr>
  `).join('');

  invEl.innerHTML = `
    <section class="invoice">
      <div class="invoice-header">
        <div>
          <h2 style="margin:0;color:var(--accent)">Lumé Décor</h2>
          <div>Reflect your vibe — handcrafted décor for modern spaces.</div>
        </div>
        <div class="invoice-right">
          <div><strong>Invoice:</strong> ${invoice.invoiceId}</div>
          <div><strong>Date:</strong> ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
          <div><strong>Paid with:</strong> ${invoice.paidWith.method} • ${invoice.paidWith.last4}</div>
        </div>
      </div>

      <hr style="border:none;height:1px;background:rgba(255,255,255,0.04);margin:1rem 0">

      <h2>Shipping Information</h2>
      <div class="glass-card" style="padding:1rem; margin-bottom:1rem;">
        <p><strong>Name:</strong> ${invoice.billing.name}</p>
        <p><strong>Address:</strong> ${invoice.billing.address}, ${invoice.billing.city}, ${invoice.billing.postal}</p>
        <p><strong>Phone:</strong> ${invoice.shipping.shippingPhone}</p>
        <p><strong>Shipping Method:</strong> ${invoice.shipping.shippingMethod}</p>
        <p><strong>Delivery Notes:</strong> ${invoice.shipping.shippingNotes || "None"}</p>
        <p><strong>Shipping Fee:</strong> JMD ${invoice.shipping.shippingCost.toFixed(2)}</p>
      </div>

      <h2>Order Summary</h2>
      <table class="invoice-table" style="width:100%;margin-top:1rem">
        <thead><tr><th style="text-align:left">Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${lines}</tbody>
      </table>

      <div style="margin-top:1rem;display:flex;justify-content:flex-end">
        <div style="width:320px" class="summary">
          <div style="display:flex;justify-content:space-between"><div>Subtotal</div><div>${fmt(invoice.subtotal)}</div></div>
          <div style="display:flex;justify-content:space-between"><div>Discount</div><div>${invoice.discount ? '-' + fmt(invoice.discount) : '-'}</div></div>
          <div style="display:flex;justify-content:space-between"><div>Tax</div><div>${fmt(invoice.tax)}</div></div>
          <div style="display:flex;justify-content:space-between"><div>Shipping</div><div>JMD ${invoice.shipping.shippingCost.toFixed(2)}</div></div>
          <hr style="border:none;height:1px;background:rgba(255,255,255,0.04);margin:.6rem 0">
          <div style="display:flex;justify-content:space-between;font-weight:800"><div>Total</div><div>${fmt(invoice.total)}</div></div>
        </div>
      </div>

      <button class="btn glow-btn" onclick="window.print()">Print Invoice</button>
      <a class="btn ghost" href="index.html">Back to shop</a>
    </section>
  `;
}

/* ---------- utility: products rendering (for products.html) ---------- */
const PRODUCTS = [
  {id:'m1',name:'Aerie Round Mirror',price:89.00,cat:'mirrors',img:'assets/custom-mirror.jpg'},
  {id:'m2',name:'Framed Engraved Mirror',price:129.00,cat:'mirrors',img:'assets/custom-mirror-2.jpg'},
  {id:'l1',name:'Neon Name LED Sign',price:79.00,cat:'leds',img:'assets/led-sign.jpg'},
  {id:'l2',name:'Custom Shape LED Sign',price:149.00,cat:'leds',img:'assets/led-sign-2.jpg'},
  {id:'w1',name:'Abstract Wall Print',price:45.00,cat:'wallart',img:'assets/wall-art.jpg'},
  {id:'a1',name:'LED Accent Strip',price:25.00,cat:'accessories',img:'assets/accessory.jpg'}
];

function renderProductsGrid(){
  const grid = document.getElementById('products-grid');
  if(!grid) return;
  grid.innerHTML = '';
  PRODUCTS.forEach(p => {
    const el = document.createElement('article');
    el.className = 'product-card fade-up';
    el.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3 style="color:#fff">${p.name}</h3>
      <div class="price">${fmt(p.price)}</div>
      <div style="margin-top:.6rem;display:flex;gap:.5rem">
        <button class="btn add-to-cart" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-img="${p.img}">Add to cart</button>
        <a class="btn ghost" href="#details_${p.id}" onclick="alert('Product details demo')">Details</a>
      </div>
    `;
    grid.appendChild(el);
  });

  // wire add-to-cart buttons to same logic as .add-to-cart -> item stored in localStorage
  document.querySelectorAll('.add-to-cart').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = btn.dataset.id; const name = btn.dataset.name; const price = parseFloat(btn.dataset.price); const img = btn.dataset.img;
      const cart = loadCart();
      const found = cart.find(i=>i.id===id);
      if(found){ found.qty += 1; } else { cart.push({id,name,price,qty:1,img}); }
      saveCart(cart);
      btn.textContent = 'Added ✓';
      setTimeout(()=> btn.textContent = 'Add to cart', 900);
	  
	  // Ensure cart count always refreshes on page load
document.addEventListener('DOMContentLoaded', updateCartCount);

    });
  });
}
