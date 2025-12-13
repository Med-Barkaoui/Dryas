import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Leaf, Shield, RefreshCw } from "lucide-react";

export default function MFA() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const email = localStorage.getItem("dryas_email");
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    // Démarrer le compte à rebours
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index, value) => {
    // N'accepter que les chiffres
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Si tous les champs sont remplis, soumettre automatiquement
    if (newCode.every(digit => digit !== "") && index === 5) {
      verify();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Si le champ est vide et qu'on appuie sur backspace, aller au champ précédent
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
    
    const newCode = [...code];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
      }
    });
    
    setCode(newCode);
    
    // Focus sur le dernier champ rempli ou le dernier champ
    const lastFilledIndex = digits.length - 1;
    if (lastFilledIndex < 5) {
      inputRefs.current[lastFilledIndex].focus();
    } else {
      inputRefs.current[5].focus();
    }
  };

  const verify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Veuillez entrer un code de 6 chiffres");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/mfa/verify", { 
        email, 
        code: fullCode 
      });

      if (res.data.token) {
        localStorage.removeItem("dryas_email");
        localStorage.setItem("dryas_token", res.data.token);
        navigate("/home");
      } else {
        setError(res.data.msg || "Code incorrect");
        // Réinitialiser le code en cas d'erreur
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0].focus();
      }
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.msg || "Erreur lors de la vérification");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:5000/api/mfa/resend", { email });
      setCanResend(false);
      setCountdown(60);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
      
      // Redémarrer le compte à rebours
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.msg || "Erreur lors de l'envoi du code");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verify();
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
        {/* Carte de vérification */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <Shield className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Vérification</h1>
            <p className="text-emerald-100">Sécurité supplémentaire</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Message d'information */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                <Mail className="text-emerald-600" size={24} />
              </div>
              <p className="text-emerald-800 mb-2">
                Un code de vérification a été envoyé à
              </p>
              <div className="inline-block bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                <p className="text-emerald-700 font-semibold break-all">
                  {email || "votre@email.com"}
                </p>
              </div>
              <p className="text-sm text-emerald-600 mt-3">
                Entrez le code à 6 chiffres reçu par email
              </p>
            </div>

            {/* Champ code à 6 chiffres */}
            <div className="mb-8">
              <div className="flex justify-center gap-2 mb-6">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>
              
              {/* Bouton renvoyer le code */}
              <div className="text-center mt-6">
                {canResend ? (
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={resendLoading}
                    className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-medium disabled:opacity-50"
                  >
                    {resendLoading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Renvoyer le code
                      </>
                    )}
                  </button>
                ) : (
                  <p className="text-sm text-emerald-600">
                    Vous pourrez renvoyer le code dans{" "}
                    <span className="font-bold text-emerald-700">{countdown}s</span>
                  </p>
                )}
              </div>
            </div>

            {/* Bouton de vérification */}
            <button
              type="submit"
              disabled={isLoading || code.some(digit => digit === "")}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-3.5 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Vérification...
                </>
              ) : (
                <>
                  Vérifier le code
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Message de sécurité */}
            <div className="mt-8 pt-6 border-t border-emerald-100 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg">
                <Shield size={16} />
                <span>Cette vérification protège votre compte</span>
              </div>
            </div>

            {/* Lien retour */}
            <div className="text-center mt-6">
              <Link 
                to="/login" 
                className="text-sm text-emerald-600 hover:text-emerald-800 hover:underline transition-colors"
              >
                ← Retour à la connexion
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-emerald-700/70">
            Le code de vérification expire après 1 minutes
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