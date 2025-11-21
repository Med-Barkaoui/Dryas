import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MFA() {
  const [code, setCode] = useState("");
  const email = localStorage.getItem("dryas_email");
  const navigate = useNavigate();

  const verify = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/mfa/verify", {
        email,
        code
      });

      if (res.data.token) {
        localStorage.removeItem("dryas_email");

        localStorage.setItem("dryas_token", res.data.token);

        navigate("/home");
      }
    } catch (err) {
      alert("Erreur MFA");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center mb-4">Verification Code</h2>

        <p className="text-center text-gray-600 mb-4">
          Un code a été envoyé à :  
          <span className="font-bold">{email}</span>
        </p>

        <input
          className="w-full border p-2 mb-3 rounded text-center text-xl"
          maxLength={6}
          placeholder="------"
          onChange={(e) => setCode(e.target.value)}
        />

        <button
          onClick={verify}
          className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800"
        >
          Confirmer
        </button>
      </div>
    </div>
  );
}
