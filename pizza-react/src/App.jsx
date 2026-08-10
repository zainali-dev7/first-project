import "./style.css";
import { useState } from "react";
import Menu from "./components/Menu";
import Cart from "./components/Cart";

function App() {
  const [cart, setCart] = useState([]);

  function handleAddToCart(pizza) {
    setCart([...cart, pizza]);
  }

  function handleClearCart() {
    setCart([]);
  }

  return (
    <div>
      <header>
        <h1>🍕 Zain's Pizza</h1>
        <p>Fresh pizzas, made with love.</p>
      </header>

      <section className="menu-section">
        <h2>Our Menu</h2>
        <Menu onAddToCart={handleAddToCart} />
      </section>

      <Cart cart={cart} onClearCart={handleClearCart} />
    </div>
  );
}

export default App;