import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birth, setBirth] = useState(""); // date de naissance
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const register = async () => {
    // Validation front-end
    if (!name || !email || !password || !confirmPassword || !birth) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await axios.post("/api/auth/register", {
        name,
        email,
        password,
        birth
      });

      if (res.data.msg.includes("Check your email")) {
        localStorage.setItem("dryas_email", email);
        navigate("/mfa");
      }
    } catch (err) {
      if (err.response?.data?.msg) setError(err.response.data.msg);
      else setError("Erreur inscription");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center mb-4">Créer un compte</h2>

        {error && (
          <p className="text-red-600 text-sm mb-3 text-center">{error}</p>
        )}

        <input
          className="w-full border p-2 mb-3 rounded"
          type="text"
          placeholder="Nom complet"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-3 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-3 rounded"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-3 rounded"
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-3 rounded"
          type="date"
          placeholder="Date de naissance"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
        />

        <button
          onClick={register}
          className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800"
        >
          S’inscrire
        </button>

        <p className="mt-4 text-center text-sm">
          Vous avez déjà un compte ?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-700 font-bold cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
