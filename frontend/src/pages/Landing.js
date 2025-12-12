import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { Leaf, ChevronRight, Sparkles, Flower2 } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleDive = async () => {
    const token = localStorage.getItem("dryas_token");
    if (!token) return navigate("/login");

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 relative overflow-hidden">
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10">
          <Leaf size={80} />
        </div>
        <div className="absolute top-1/4 right-20">
          <Flower2 size={60} />
        </div>
        <div className="absolute bottom-20 left-1/4">
          <Leaf size={100} className="rotate-45" />
        </div>
        <div className="absolute bottom-40 right-40">
          <Flower2 size={70} className="rotate-12" />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center p-8">
        {/* Logo et titre */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <Leaf size={40} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles size={24} className="text-amber-400" />
              </div>
            </div>
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">
              Dryas
            </h1>
          </div>
          
          {/* Slogan */}
          <p className="text-xl md:text-2xl text-emerald-800 font-light max-w-2xl mx-auto leading-relaxed mt-6">
            L'endroit où vous serez impressionné par la beauté de la nature et la diversité des couleurs vivantes.
          </p>
        </div>

        {/* Points forts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto my-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="text-emerald-600" size={24} />
            </div>
            <h3 className="font-semibold text-emerald-800 mb-2">Plantes Rares</h3>
            <p className="text-emerald-700/80 text-sm">Découvrez des espèces végétales uniques et exceptionnelles</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flower2 className="text-teal-600" size={24} />
            </div>
            <h3 className="font-semibold text-emerald-800 mb-2">Expertise Botanique</h3>
            <p className="text-emerald-700/80 text-sm">Conseils d'experts pour l'entretien de vos plantes</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-amber-600" size={24} />
            </div>
            <h3 className="font-semibold text-emerald-800 mb-2">Qualité Premium</h3>
            <p className="text-emerald-700/80 text-sm">Des plantes saines cultivées avec soin et passion</p>
          </div>
        </div>

        {/* Bouton d'accès */}
        <button
          onClick={handleDive}
          disabled={isLoading}
          className="group relative mt-8 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-emerald-700 hover:to-teal-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Vérification...
              </>
            ) : (
              <>
                Plongez dans l'expérience
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
          {/* Effet de lueur */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/30 to-teal-500/30 blur-lg group-hover:blur-xl transition-all duration-300 -z-10"></div>
        </button>

        {/* Message d'accueil */}
        <p className="mt-6 text-emerald-700/70 text-sm">
          Déjà des milliers de passionnés nous font confiance
        </p>

        {/* Footer décoratif */}
        <div className="absolute bottom-8 text-emerald-800/40 text-sm">
          <p>Dryas • L'art de vivre avec la nature</p>
        </div>
      </div>

      {/* Animation de feuilles flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute text-emerald-300/20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${20 + Math.random() * 30}px`,
            }}
          >
            <Leaf />
          </div>
        ))}
      </div>
    </div>
  );
}