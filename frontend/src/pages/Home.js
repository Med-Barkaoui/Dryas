import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("dryas_token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/check-token", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmail(res.data.user.email);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("dryas_token");
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("dryas_token");
    localStorage.removeItem("dryas_email");
    navigate("/");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-green-100">
      <h1 className="text-4xl font-bold text-green-800 mb-6">Bienvenue sur Dryas !</h1>
      <p className="text-lg text-gray-700 mb-6">
        Connecté en tant que : <span className="font-semibold">{email}</span>
      </p>

      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
}
