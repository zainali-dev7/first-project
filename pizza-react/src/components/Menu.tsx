import { useEffect, useState } from "react";
import PizzaCard from "./PizzaCard";
import { API_URL } from "../config";

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
    fetch(`${API_URL}/api/menu`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load menu");
        }

        return response.json();
      })
      .then((data) => {
        setPizzas(data);
      })
      .catch((error) => {
        console.error("Menu error:", error);
      });
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