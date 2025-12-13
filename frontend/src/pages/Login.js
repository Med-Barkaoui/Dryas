import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, LogIn, Leaf, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
  const login = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });

      if (res.data.msg === "MFA sent") {
        localStorage.setItem("dryas_email", email);
        navigate("/mfa");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth
  const googleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center gap-2 text-emerald-800 hover:text-emerald-900">
          <Leaf size={28} />
          <span className="text-2xl font-bold">Dryas</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Carte de connexion */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <LogIn className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Bienvenue</h1>
            <p className="text-emerald-100">Connectez-vous à votre compte Dryas</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={login} className="p-8">
            {/* Champ Email */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-emerald-800 mb-2">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>Adresse email</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 pl-12 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
                <Mail className="absolute left-4 top-3.5 text-emerald-400" size={20} />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-emerald-800 mb-2">
                <div className="flex items-center gap-2">
                  <Lock size={16} />
                  <span>Mot de passe</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Votre mot de passe"
                  className="w-full px-4 py-3 pl-12 pr-12 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
                <Lock className="absolute left-4 top-3.5 text-emerald-400" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4  text-emerald-400 hover:text-emerald-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-3.5 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Séparateur */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-emerald-200"></div>
              <span className="mx-4 text-sm text-emerald-600">Ou continuer avec</span>
              <div className="flex-1 border-t border-emerald-200"></div>
            </div>

            {/* Bouton Google */}
            <button
              type="button"
              onClick={googleLogin}
              disabled={isGoogleLoading}
              className="w-full bg-white border-2 border-emerald-200 text-emerald-800 py-3.5 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </>
              )}
            </button>

            

            {/* Lien d'inscription */}
            <div className="mt-8 pt-6 border-t border-emerald-100 text-center">
              <p className="text-emerald-700">
                Pas encore de compte ?{" "}
                <Link 
                  to="/signup" 
                  className="font-bold text-emerald-600 hover:text-emerald-800 hover:underline transition-colors"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-emerald-700/70">
            En vous connectant, vous acceptez nos{" "}
            <Link to="/terms" className="text-emerald-600 hover:underline">
              Conditions d'utilisation
            </Link>{" "}
            et notre{" "}
            <Link to="/privacy" className="text-emerald-600 hover:underline">
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </div>

      {/* Éléments décoratifs */}
      <div className="absolute bottom-8 right-8 text-emerald-800/30">
        <Leaf size={100} className="rotate-12" />
      </div>
      <div className="absolute top-8 right-8 text-emerald-800/20">
        <Leaf size={80} className="rotate-45" />
      </div>
    </div>
  );
}
