import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Login automatique via Google (token en query)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("dryas_token", token);
      navigate("/home");
    }
  }, [navigate]);

  // Login normal
  const login = async () => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });

      if (res.data.msg === "MFA sent") {
        localStorage.setItem("dryas_email", email);
        navigate("/mfa");
      }
    } catch (err) {
      alert("Erreur login");
    }
  };

  // Google OAuth
  const googleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center mb-4">Login</h2>

        <input
          className="w-full border p-2 mb-3 rounded"
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-3 rounded"
          type="password"
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800"
        >
          Login
        </button>

        <button
          onClick={googleLogin}
          className="w-full bg-red-600 text-white py-2 rounded mt-3 hover:bg-red-700"
        >
          Login with Google
        </button>

        <p className="mt-4 text-center text-sm">
          Pas de compte ?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-green-700 font-bold cursor-pointer"
          >
            Créer un compte
          </span>
        </p>
      </div>
    </div>
  );
}
