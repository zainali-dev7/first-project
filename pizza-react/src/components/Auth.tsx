import { useEffect, useState } from "react";
import { API_URL } from "../config";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthProps {
  onUserChange: (user: User | null) => void;
}

function Auth({ onUserChange }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // User ab localStorage se load nahi hoga.
  // Backend HttpOnly cookie verify karke user batayega.
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/profile`,
          {
            method: "GET",

            // HttpOnly cookie backend ko bhejo
            credentials: "include",
          }
        );

        if (!response.ok) {
          setUser(null);
          onUserChange(null);
          return;
        }

        const userData = await response.json();

        setUser(userData);
        onUserChange(userData);
      } catch (error) {
        console.error(
          "Cookie verification error:",
          error
        );

        setUser(null);
        onUserChange(null);
      }
    };

    verifyUser();
  }, [onUserChange]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const url = isLogin
      ? `${API_URL}/api/login`
      : `${API_URL}/api/signup`;

    const body = isLogin
      ? { email, password }
      : { name, email, password };

    try {
      const response = await fetch(url, {
        method: "POST",

        // Login cookie browser receive karega
        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Something went wrong"
        );
        return;
      }

      setMessage(data.message);

      if (isLogin && data.user) {
        // Token localStorage mein save nahi karna.
        // JWT HttpOnly cookie mein backend ne save kiya hai.
        setUser(data.user);
        onUserChange(data.user);
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Could not connect to server"
      );
    }
  };

  const handleLogout = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/logout`,
      {
        method: "POST",

        // HttpOnly cookie backend ko bhejna zaroori hai
        credentials: "include",
      }
    );

    if (!response.ok) {
      setMessage("Logout failed");
      return;
    }

    // Backend cookie delete kar chuka hai.
    // Ab frontend se bhi logged-in user hata do.
    setUser(null);
    onUserChange(null);
    setMessage("");
  } catch (error) {
    console.error("Logout error:", error);
    setMessage("Could not connect to server");
  }
};

  if (user) {
    return (
      <div className="max-w-md mx-auto my-10 p-6 border rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold mb-2">
          Welcome, {user.name}! 🍕
        </h2>

        <p>{user.email}</p>

        <p className="mb-5 text-gray-600">
          Role: {user.role}
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2 rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-10 p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-5">
        {isLogin ? "Login" : "Sign Up"}
      </h2>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full border p-2 mb-3 rounded"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full border p-2 mb-3 rounded"
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          setIsLogin(!isLogin);
          setMessage("");
        }}
        className="w-full mt-4 underline"
      >
        {isLogin
          ? "Don't have an account? Sign Up"
          : "Already have an account? Login"}
      </button>
    </div>
  );
}

export default Auth;