import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Landing() {
  const navigate = useNavigate();

  const handleDive = async () => {
    const token = localStorage.getItem("dryas_token");
    if (!token) return navigate("/login");

    try {
      const res = await axios.get("http://localhost:5000/api/auth/check-token", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.user) {
        navigate("/home");
      } else {
        localStorage.removeItem("dryas_token");
        navigate("/login");
      }
    } catch (err) {
      localStorage.removeItem("dryas_token");
      navigate("/login");
    }
  };

  return (
    <div className="h-screen bg-green-100 flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold text-green-800">Dryas</h1>
      <p className="text-lg mt-4 text-gray-700 max-w-xl">
        L’endroit où vous serez impressionné par la beauté de la nature et la diversité des couleurs vivantes.
      </p>

      <button
        onClick={handleDive}
        className="mt-8 bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800 transition"
      >
        Dive In
      </button>
    </div>
  );
}




