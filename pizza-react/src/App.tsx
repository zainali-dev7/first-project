import { useState } from "react";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import "./style.css";

interface Pizza {
  name: string;
  price: number;
  image: string;
}

function App() {
  const [cart, setCart] = useState<Pizza[]>([]);

  function handleAddToCart(pizza: Pizza) {
    setCart([...cart, pizza]);
  }

  function handleClearCart() {
    setCart([]);
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <header className="bg-red-600 text-white text-center py-10">
        <h1 className="text-4xl font-bold">🍕 Zain's Pizza</h1>
        <p className="mt-2">Fresh pizzas, made with love.</p>
      </header>

      <section className="max-w-4xl mx-auto mt-10 px-4">
        <h2 className="text-xl font-semibold text-red-600 border-b-4 border-orange-400 inline-block pb-1 mb-6">
          Our Menu
        </h2>
        <Menu onAddToCart={handleAddToCart} />
      </section>

      <Cart cart={cart} onClearCart={handleClearCart} />
    </div>
  );
}

export default App;