function PizzaCard({ name, price, image, onAddToCart }) {
  return (
    <div className="pizza-card">
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p className="price">Rs. {price}</p>
      <button className="add-btn" onClick={onAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}

export default PizzaCard;