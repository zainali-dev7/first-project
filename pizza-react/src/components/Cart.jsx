function Cart({ cart, onClearCart }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="cart-section">
      <h2>Your Cart</h2>
      <div>
        {cart.map((item, index) => (
          <p key={index}>
            {item.name} - Rs. {item.price}
          </p>
        ))}
      </div>
      <p className="cart-total">Total: Rs. {total}</p>
      <button onClick={onClearCart}>Clear Cart</button>
    </div>
  );
}

export default Cart;