import { useEffect, useState } from "react";
import PizzaCard from "./PizzaCard";

interface Pizza {
  name: string;
  price: number;
  image: string;
}

interface MenuProps {
  onAddToCart: (pizza: Pizza) => void;
}

function Menu({ onAddToCart }: MenuProps) {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);

  useEffect(() => {
    fetch("https://first-project-production-2d14.up.railway.app/api/menu")
      .then((response) => response.json())
      .then((data) => setPizzas(data));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {pizzas.map((pizza) => (
        <PizzaCard
          key={pizza.name}
          name={pizza.name}
          price={pizza.price}
          image={pizza.image}
          onAddToCart={() => onAddToCart(pizza)}
        />
      ))}
    </div>
  );
}

export default Menu;