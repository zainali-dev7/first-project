interface PizzaCardProps {
  name: string;
  price: number;
  image: string;
  onAddToCart: () => void;
}

function PizzaCard({ name, price, image, onAddToCart }: PizzaCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden text-center hover:-translate-y-1 transition-transform">
      <img src={image} alt={name} className="w-full h-40 object-cover" />
      <h3 className="mt-3 text-lg font-semibold">{name}</h3>
      <p className="text-orange-500 font-bold mb-3">Rs. {price}</p>
      <button
        onClick={onAddToCart}
        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md mb-4"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default PizzaCard;