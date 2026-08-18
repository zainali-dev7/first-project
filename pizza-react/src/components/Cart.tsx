import { useState } from "react";
import Checkout from "./Checkout";

interface CartItem {
  name: string;
  price: number;
}

interface CartProps {
  cart: CartItem[];
  onClearCart: () => void;
}

function Cart({ cart, onClearCart }: CartProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  async function saveOrder() {
    const order = {
      items: cart,
      total: total,
      date: new Date().toISOString(),
    };

    const response = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    const result = await response.json();
    alert(result.message);
    setShowCheckout(false);
    onClearCart();
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto mt-10">
      <h2 className="text-xl font-semibold text-red-600 border-b-4 border-orange-400 inline-block pb-1 mb-4">
        Your Cart
      </h2>
      <div>
        {cart.map((item, index) => (
          <p key={index} className="py-2 border-b border-gray-200">
            {item.name} - Rs. {item.price}
          </p>
        ))}
      </div>
      <p className="text-lg font-bold text-red-600 mt-4">Total: Rs. {total}</p>

      {cart.length > 0 && (
        <button
          onClick={() => setShowCheckout(true)}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md mr-3"
        >
          Checkout
        </button>
      )}

      <button
        onClick={onClearCart}
        className="mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
      >
        Clear Cart
      </button>

      {showCheckout && (
        <Checkout
          total={total}
          onPaymentSuccess={saveOrder}
          onCancel={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}

export default Cart;