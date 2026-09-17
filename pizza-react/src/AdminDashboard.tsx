import { useEffect, useState } from "react";

interface PizzaItem {
  name: string;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  customerName?: string;
  customerEmail?: string;
  items: PizzaItem[];
  total: number;
  date?: string;
}

function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("You must login as admin.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/orders",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.message || "Could not load orders"
          );
          return;
        }

        setOrders(data);
      } catch (error) {
        console.error("Admin orders error:", error);

        setMessage("Could not connect to server");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto my-10 px-4">
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto my-10 px-4">
      <div className="bg-white border rounded-xl shadow p-6">
        <h2 className="text-3xl font-bold text-red-600 mb-2">
          Admin Dashboard
        </h2>

        <p className="text-gray-600 mb-6">
          Manage and view customer orders.
        </p>

        {message && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-5">
            {message}
          </p>
        )}

        {!message && orders.length === 0 && (
          <p>No orders found.</p>
        )}

        {orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">
                    Customer
                  </th>

                  <th className="border p-3 text-left">
                    Items
                  </th>

                  <th className="border p-3 text-left">
                    Total
                  </th>

                  <th className="border p-3 text-left">
                    Date
                  </th>

                  <th className="border p-3 text-left">
                    Order ID
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="border p-3">
                      <p className="font-semibold">
                        {order.customerName ||
                          "Old Order"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {order.customerEmail ||
                          "No email"}
                      </p>
                    </td>

                    <td className="border p-3">
                      {order.items.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="mb-1"
                          >
                            {item.name} — Rs.{" "}
                            {item.price}
                          </div>
                        )
                      )}
                    </td>

                    <td className="border p-3 font-semibold">
                      Rs. {order.total}
                    </td>

                    <td className="border p-3">
                      {order.date
                        ? new Date(
                            order.date
                          ).toLocaleString()
                        : "No date"}
                    </td>

                    <td className="border p-3 text-sm">
                      {order._id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminDashboard;