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

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        onUserChange(null);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          onUserChange(null);
          return;
        }

        const userData = await response.json();

        setUser(userData);
        onUserChange(userData);

        localStorage.setItem(
          "user",
          JSON.stringify(userData)
        );
      } catch (error) {
        console.error(
          "Token verification error:",
          error
        );
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

      if (isLogin && data.token) {
        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    onUserChange(null);
    setMessage("");
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