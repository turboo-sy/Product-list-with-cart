// Load JSON data
fetch("./data.json")
  .then((response) => response.json())
  .then((data) => {
    const productList = document.getElementById("product-list");
    data.forEach((item) => {
      const productDiv = document.createElement("div");
      productDiv.classList.add("product");
      productDiv.innerHTML = `
        <div class="img">
          <img src="${item.image.desktop}" alt="${item.name}">
        </div>
        <button class="AddToCart">
          <img src="./assets/images/icon-add-to-cart.svg" alt="Add to Cart">
          Add to Cart
        </button>
        <div class="quantity-controls" style="display: none;">
          <button class="decrement">
            <img src="./assets/images/icon-decrement-quantity.svg" alt="">
          </button>
          <span class="quantity">1</span>
          <button class="increment">
            <img src="./assets/images/icon-increment-quantity.svg" alt="">
          </button>
        </div>
        <span>${item.category}</span>
        <h4>${item.name}</h4>
        <p>$${item.price.toFixed(2)}</p>
      `;
      productList.appendChild(productDiv);
    });

    // Event listeners for "Add to Cart" buttons
    document.querySelectorAll(".AddToCart").forEach((button) => {
      button.addEventListener("click", (e) => {
        const productDiv = e.target.closest(".product");
        const itemName = productDiv.querySelector("h4").textContent;
        const itemPrice = parseFloat(
          productDiv.querySelector("p").textContent.replace("$", "")
        );
        AddToCart(itemName, itemPrice);

        // Show quantity controls, hide "Add to Cart" button
        button.style.display = "none";
        const quantityControls = productDiv.querySelector(".quantity-controls");
        quantityControls.style.display = "flex";
        quantityControls.style.justifyContent = "space-around";
        quantityControls.style.alignItems = "center";
        quantityControls.classList.add("AddToCartPlus");
        const incrementButton = productDiv.querySelector(".increment");
        const decrementButton = productDiv.querySelector(".decrement");
        const quantitySpan = productDiv.querySelector(".quantity");

        incrementButton.addEventListener("click", () => {
          AddToCart(itemName, itemPrice);
          updateQuantityDisplay(itemName, productDiv);
        });
        decrementButton.addEventListener("click", () => {
          decrementQuantity(itemName, productDiv);
        });
        // Click on quantity to re-add item to cart
        quantitySpan.addEventListener("click", () => {
          AddToCart(itemName, itemPrice);
          updateQuantityDisplay(itemName, productDiv);
        });
      });
    });
  });

let cart = [];

let containerTitle = document.querySelector(".containerTitle");
let orderTitleImg = document.querySelector(".orderTitle img");
let productName = document.querySelector(".orderName>div");
let orderQuantity = document.querySelector(".orderQuantity");
let orderQuantitySpan = orderQuantity.querySelector(".orderQuantity span");
let orderPrice = document.querySelector(".orderPrice");
let orderTotal = document.querySelector(".orderConfiTotal div");
let orderConfi = document.querySelector(".orderConfi");

// Function to add items to the cart
function AddToCart(ProductName, ProductPrice) {
  let existingItem = cart.find((item) => item.name === ProductName);
  const productDiv = Array.from(document.querySelectorAll(".product")).find(
    (div) => div.querySelector("h4").textContent === ProductName
  );
  const imgDiv = productDiv ? productDiv.querySelector(".img") : null;

  if (existingItem) {
    // Increment the quantity if item already exists in cart
    existingItem.quantity++;
  } else {
    // Add new item to cart with a quantity of 1
    cart.push({ name: ProductName, price: ProductPrice, quantity: 1 });
    if (imgDiv) {
      imgDiv.classList.add("img-added");
    }
  }

  // Reset the displayed quantity to 1 for a fresh addition
  updateQuantityDisplay(ProductName, productDiv);
  updateCartDisplay();
  CalculateTotal();
}
// Function to decrement item quantity
function decrementQuantity(ProductName, productDiv) {
  let item = cart.find((product) => product.name === ProductName);
  if (item) {
    item.quantity--;
    if (item.quantity <= 0) {
      RemoveFromCart(ProductName, productDiv);
    } else {
      updateQuantityDisplay(ProductName, productDiv);
      updateCartDisplay();
      CalculateTotal();
    }
  }
}
// Function to update the quantity display in the product section
function updateQuantityDisplay(ProductName, productDiv) {
  let item = cart.find((product) => product.name === ProductName);
  if (item) {
    // Update the displayed quantity in the product section
    productDiv.querySelector(".quantity").textContent = item.quantity;
  }
}
// Function to remove items from the cart
function RemoveFromCart(ProductName, productDiv) {
  const index = cart.findIndex((item) => item.name === ProductName);
  const imgDiv = productDiv ? productDiv.querySelector(".img") : null;
  const quantityControls = productDiv.querySelector(".quantity-controls");
  const addToCartButton = productDiv.querySelector(".AddToCart");

  if (index !== -1) {
    // Remove item from cart array
    cart.splice(index, 1);
    if (imgDiv) imgDiv.classList.remove("img-added");
    quantityControls.style.display = "none";
    addToCartButton.style.display = "flex";
    productDiv.querySelector(".quantity").textContent = 1;
  }
  const incrementButton = productDiv.querySelector(".increment");
  const decrementButton = productDiv.querySelector(".decrement");
  incrementButton.replaceWith(incrementButton.cloneNode(true));
  decrementButton.replaceWith(decrementButton.cloneNode(true));
  updateCartDisplay();
  CalculateTotal();
}
// Update the display of the cart
function updateCartDisplay() {
  document.querySelector(".cart-count").textContent = `(${cart.length})`;
  const cartElement = document.querySelector(".cart");
  cartElement.innerHTML = "";

  cart.forEach((item) => {
    cartElement.innerHTML += `
      <div class="DisplayCart">
          <h5>${item.name}</h5>
          <div class="price">
            <div class="flex">
              <p>${item.quantity}x</p>
              <p>@${(item.price * item.quantity).toFixed(2)}</p>
              <p>$${item.price.toFixed(2)}</p>
            </div>
            <button class="remove" data-item-name="${item.name}">
              <img src="./assets/images/icon-remove-item.svg" alt="remove icon">
            </button>
          </div>
      </div>
    `;
  });

  if (cart.length > 0) {
    cartElement.innerHTML += `
    <div class="orderTotal">
      <p>Order Total</p>
      <p></p>
    </div>
    <div class="ads">
      <img src="./assets/images/icon-carbon-neutral.svg" alt="" />
      <p>This is a <strong>Carbon-neutral</strong> delivery</p>
    </div>
    <div class="confirm"><button>Confirm Order</button></div>
  `;
    CalculateTotal();
  }

  document.querySelectorAll(".remove").forEach((button) => {
    button.addEventListener("click", (e) => {
      const productName = e.currentTarget.getAttribute("data-item-name");
      const productDiv = Array.from(document.querySelectorAll(".product")).find(
        (div) => div.querySelector("h4").textContent === productName
      );
      RemoveFromCart(productName, productDiv);
    });
  });

  // Reset quantities if cart is empty
  if (cart.length === 0) {
    document.querySelectorAll(".quantity").forEach((quantitySpan) => {
      quantitySpan.textContent = 1;
    });
    const CartImage = document.querySelector(".cart");
    CartImage.innerHTML = "";
    let img = document.createElement("img");
    img.src = "./assets/images/illustration-empty-cart.svg";
    img.alt = "Empty Cart";
    CartImage.appendChild(img);
    let emptyCartMessage = document.createElement("p");
    emptyCartMessage.classList.add("p-CartSection");
    emptyCartMessage.textContent = "Your added items will appear here";
    CartImage.appendChild(emptyCartMessage);
  }
  // Set up the confirm button's click event after it's added to the DOM
  const confirmButton = document.querySelector(".confirm button");
  const sectionOrderConfi = document.querySelector("section");
  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      sectionOrderConfi.style.visibility = "visible";
      containerTitle.innerHTML = ""; // Clear existing content
      // Loop through each cart item to display them in the confirmation section
      cart.forEach((item) => {
        const itemHTML = `
          <div class="ordertitle">
            <img src="${item.thumbnail}" alt="${item.name}" />
            <div class="orderName">
              <div>${item.name}</div>
              <div class="orderQuantity">
                ${item.quantity}x
                <span>@ $${item.price.toFixed(2)}</span>
              </div>
            </div>
            <div class="orderPrice">$${(item.price * item.quantity).toFixed(
              2
            )}</div>
          </div>
          <hr/>
        `;
        containerTitle.innerHTML += itemHTML;
      });
    });
  }
}
document
  .querySelector(".startNewOrderButton")
  .addEventListener("click", resetOrder);

// Calculate the total cost in the cart
function CalculateTotal() {
  let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderTotalElement = document.querySelector(".orderTotal p:last-child");
  if (orderTotalElement) {
    orderTotalElement.innerHTML = `$${total.toFixed(2)}`;
    orderTotal.innerHTML = `$${total.toFixed(2)}`;
  }
}
// Function to reset everything for a new order
function resetOrder() {
  // Clear the cart array
  cart = [];
  // Reset each product's UI
  document.querySelectorAll(".product").forEach((productDiv) => {
    const addToCartButton = productDiv.querySelector(".AddToCart");
    addToCartButton.style.display = "flex";
    const quantityControls = productDiv.querySelector(".quantity-controls");
    quantityControls.style.display = "none";
    productDiv.querySelector(".quantity").textContent = 1;
    const imgDiv = productDiv.querySelector(".img");
    if (imgDiv.classList.contains("img-added")) {
      imgDiv.classList.remove("img-added");
    }
  });
  const cartElement = document.querySelector(".cart");
  cartElement.innerHTML = ""; // Clear the cart section
  let img = document.createElement("img");
  img.src = "./assets/images/illustration-empty-cart.svg";
  img.alt = "Empty Cart";
  cartElement.appendChild(img);

  let emptyCartMessage = document.createElement("p");
  emptyCartMessage.classList.add("p-CartSection");
  emptyCartMessage.textContent = "Your added items will appear here";
  cartElement.appendChild(emptyCartMessage);
  document.querySelector(".cart-count").textContent = "(0)";
  const orderTotalElement = document.querySelector(".orderTotal p:last-child");
  if (orderTotalElement) {
    orderTotalElement.innerHTML = `$0.00`;
  }
  const orderSection = document.querySelector("section");
  if (orderSection) {
    orderSection.style.visibility = "hidden";
  }
  const containerTitle = document.querySelector(".containerTitle");
  if (containerTitle) {
    containerTitle.innerHTML = ""; 
  }
}
