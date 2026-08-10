import { useEffect, useState } from "react";
import PizzaCard from "./PizzaCard";

function Menu({ onAddToCart }) {
  const [pizzas, setPizzas] = useState([]);

  useEffect(() => {
    fetch("/menu.json")
      .then((response) => response.json())
      .then((data) => setPizzas(data));
  }, []);

  return (
    <div className="menu-grid">
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