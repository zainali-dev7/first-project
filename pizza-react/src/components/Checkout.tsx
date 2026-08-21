import { useState } from "react";

interface CheckoutProps {
  total: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

function Checkout({ total, onPaymentSuccess, onCancel }: CheckoutProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    setLoading(true);
    setError("");

    // Step 1: Create a checkout session (mirrors Stripe's flow)
    const sessionRes = await fetch("https://first-project-production-2d14.up.railway.app/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total }),
    });
    const session = await sessionRes.json();

    // Step 2: Confirm payment with card details
    const confirmRes = await fetch("https://first-project-production-2d14.up.railway.app/api/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id, cardNumber }),
    });
    const result = await confirmRes.json();

    setLoading(false);

    if (result.status === "succeeded") {
      onPaymentSuccess();
    } else {
      setError("Payment failed. Please check your card details.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Payment Details</h2>

        <p className="text-gray-600 mb-4">Total: Rs. {total}</p>

        <input
  type="text"
  placeholder="Card Number (16 digits)"
  value={cardNumber}
  maxLength={16}
  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
  className="w-full border border-gray-300 rounded-md p-2 mb-3"
/>

<div className="flex gap-3 mb-3">
  <input
    type="text"
    placeholder="MM/YY"
    value={expiry}
    maxLength={5}
    onChange={(e) => setExpiry(e.target.value)}
    className="w-1/2 border border-gray-300 rounded-md p-2"
  />
  <input
    type="text"
    placeholder="CVV"
    value={cvv}
    maxLength={3}
    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
    className="w-1/2 border border-gray-300 rounded-md p-2"
  />
</div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md mb-2"
        >
          {loading ? "Processing..." : `Pay Rs. ${total}`}
        </button>

        <button
          onClick={onCancel}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default Checkout;