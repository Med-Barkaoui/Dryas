import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { User, Mail, Lock, Calendar, Eye, EyeOff, ArrowRight, Leaf, MapPin } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birth, setBirth] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const register = async (e) => {
    e?.preventDefault();
    setError("");

    // Validation front-end simplifiée
    if (!name || !email || !password || !confirmPassword || !birth || !address) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    // Vérification de l'âge seulement
    const birthDate = new Date(birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 13) {
      setError("Vous devez avoir au moins 13 ans pour créer un compte.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("/api/auth/register", {
        name,
        email,
        password,
        birth,
        address
      });

      if (res.data.msg.includes("Check your email")) {
        localStorage.setItem("dryas_email", email);
        navigate("/mfa");
      }
    } catch (err) {
      if (err.response?.data?.msg) setError(err.response.data.msg);
      else setError("Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      register();
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
        {/* Carte d'inscription */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <User className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
            <p className="text-emerald-100">Rejoignez la communauté Dryas</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={register} className="p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Champ Nom */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-emerald-800 mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>Nom complet</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Votre nom complet"
                  className="w-full px-4 py-3 pl-12 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
                <User className="absolute left-4 top-3.5 text-emerald-400" size={20} />
              </div>
            </div>

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

            {/* Champ Adresse */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-emerald-800 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>Adresse</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Votre adresse complète"
                  className="w-full px-4 py-3 pl-12 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
                <MapPin className="absolute left-4 top-3.5 text-emerald-400" size={20} />
              </div>
              <p className="mt-1 text-xs text-emerald-600">
                Cette adresse sera utilisée pour les livraisons
              </p>
            </div>

            {/* Champ Date de naissance */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-emerald-800 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Date de naissance</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 pl-12 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none"
                  required
                />
                <Calendar className="absolute left-4 top-3.5 text-emerald-400" size={20} />
              </div>
              <p className="mt-1 text-xs text-emerald-600">
                Vous devez avoir au moins 13 ans pour créer un compte
              </p>
            </div>

            {/* Champ Mot de passe */}
            <div className="mb-6">
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
                  placeholder="Créez votre mot de passe"
                  className="w-full px-4 py-3 pl-12 pr-12 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
                <Lock className="absolute left-4 top-3.5 text-emerald-400" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-emerald-400 hover:text-emerald-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Message d'aide simple pour le mot de passe */}
              <p className="mt-1 text-xs text-emerald-600">
                Choisissez un mot de passe que vous n'utilisez nulle part ailleurs
              </p>
            </div>

            {/* Champ Confirmation mot de passe */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-emerald-800 mb-2">
                <div className="flex items-center gap-2">
                  <Lock size={16} />
                  <span>Confirmer le mot de passe</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Retapez votre mot de passe"
                  className="w-full px-4 py-3 pl-12 pr-12 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
                <Lock className="absolute left-4 top-3.5 text-emerald-400" size={20} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-emerald-400 hover:text-emerald-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {/* Conditions */}
            <div className="mb-8">
              <label className="flex items-start gap-3 text-sm text-emerald-700">
                <input
                  type="checkbox"
                  className="mt-1"
                  required
                />
                <span>
                  J'accepte les{" "}
                  <Link to="/terms" className="text-emerald-600 hover:underline font-medium">
                    conditions d'utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link to="/privacy" className="text-emerald-600 hover:underline font-medium">
                    politique de confidentialité
                  </Link>{" "}
                  de Dryas
                </span>
              </label>
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-3.5 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Création du compte...
                </>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Lien vers login */}
            <div className="mt-8 pt-6 border-t border-emerald-100 text-center">
              <p className="text-emerald-700">
                Vous avez déjà un compte ?{" "}
                <Link 
                  to="/login" 
                  className="font-bold text-emerald-600 hover:text-emerald-800 hover:underline transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-emerald-700/70">
            En créant un compte, vous rejoignez une communauté de passionnés de plantes
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