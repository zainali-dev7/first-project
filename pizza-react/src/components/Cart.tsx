interface CartItem {
  name: string;
  price: number;
}

interface CartProps {
  cart: CartItem[];
  onClearCart: () => void;
}

function Cart({ cart, onClearCart }: CartProps) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

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
      <button
        onClick={onClearCart}
        className="mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
      >
        Clear Cart
      </button>
    </div>
  );
}

export default Cart;