async function loadMenu() {
  let response = await fetch("menu.json");
  let pizzas = await response.json();

  let menuGrid = document.getElementById("menuGrid");
  menuGrid.innerHTML = "";

  for (let i = 0; i < pizzas.length; i++) {
    let pizza = pizzas[i];
    menuGrid.innerHTML += `
      <div class="pizza-card">
        <img src="${pizza.image}" alt="${pizza.name}">
        <h3>${pizza.name}</h3>
        <p class="price">Rs. ${pizza.price}</p>
        <button class="add-btn" onclick="addToCart('${pizza.name}', ${pizza.price}); updateCartDisplay();">Add to Cart</button>
      </div>
    `;
  }
}

let savedCart = localStorage.getItem("cart");
let cart = savedCart ? JSON.parse(savedCart) : [];

function addToCart(pizzaName, price) {
  let item = { name: pizzaName, price: price };
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
}

function getCartTotal() {
  let total = 0;
  for (let i = 0; i < cart.length; i++) {
    total = total + cart[i].price;
  }
  return total;
}

function updateCartDisplay() {
  let cartDiv = document.getElementById("cartDisplay");
  cartDiv.innerHTML = "";

  for (let i = 0; i < cart.length; i++) {
    cartDiv.innerHTML += "<p>" + cart[i].name + " - Rs. " + cart[i].price + "</p>";
  }

  document.getElementById("cartTotal").textContent = getCartTotal();
}

function clearCart() {
  cart = [];
  localStorage.removeItem("cart");
  updateCartDisplay();
}

document.getElementById("calculateBtn").addEventListener("click", function() {
  let totalBill = getCartTotal();
  let amountPaid = Number(document.getElementById("amountInput").value);
  let balance = totalBill - amountPaid;

  let resultText = "";
  if (balance > 0) {
    resultText = "Baaki hai: Rs. " + balance;
  } else if (balance < 0) {
    resultText = "Wapas dene hain: Rs. " + Math.abs(balance);
  } else {
    resultText = "Bill poora paid hai!";
  }

  document.getElementById("result").textContent = resultText;
});

loadMenu();
updateCartDisplay();