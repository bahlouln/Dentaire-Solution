import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx"; // 👈 importer le contexte

export default function LoginDentiste() {
    const navigate = useNavigate();
    const { login, error: authError, isAuthenticated, loading } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", motDePasse: "" });
    const [localError, setLocalError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setLocalError("");
    };

    const togglePassword = () => setShowPassword((s) => !s);

    const validate = () => {
        if (!formData.email?.trim()) return "Email requis";
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email);
        if (!ok) return "Adresse e-mail invalide";
        if (!formData.motDePasse?.trim()) return "Mot de passe requis";
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v = validate();
        if (v) return setLocalError(v);

        const result = await login(formData.email, formData.motDePasse, false); // false = pas admin
        if (result.success) {
            navigate("/Calendar");
        } else {
            setLocalError(result.error);
        }
    };

    return (
        <div className="relative min-h-screen bg-[url('/Login.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 grid min-h-screen place-items-center p-4">
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur">
                    <header className="mb-6 text-2xl font-semibold text-white">Login Dentiste</header>

                    {(localError || authError) && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-left text-sm text-rose-800"
                        >
                            {localError || authError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="text-left">
                        {/* EMAIL */}
                        <label htmlFor="email" className="sr-only">Email</label>
                        <div className="group relative mb-4 flex h-12 items-center overflow-hidden rounded-2xl border border-white/40 bg-white/90 shadow-sm focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
                            <span className="inline-flex items-center px-3 text-slate-700">
                                <FaUser className="h-4 w-4" aria-hidden />
                            </span>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Adresse e-mail"
                                autoComplete="email"
                                className="h-full flex-1 border-0 bg-transparent pr-3 text-slate-900 placeholder:text-slate-500 focus:outline-none"
                                required
                            />
                        </div>

                        {/* MOT DE PASSE */}
                        <label htmlFor="motDePasse" className="sr-only">Mot de passe</label>
                        <div className="group relative mb-3 flex h-12 items-stretch overflow-hidden rounded-2xl border border-white/40 bg-white/90 shadow-sm focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
                            <span className="inline-flex items-center px-3 text-slate-700">
                                <FaLock className="h-4 w-4" aria-hidden />
                            </span>
                            <input
                                id="motDePasse"
                                name="motDePasse"
                                type={showPassword ? "text" : "password"}
                                value={formData.motDePasse}
                                onChange={handleChange}
                                placeholder="Mot de passe"
                                autoComplete="current-password"
                                className="h-full flex-1 border-0 bg-transparent px-1 text-slate-900 placeholder:text-slate-500 focus:outline-none"
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePassword}
                                className="h-full border-l border-slate-300 bg-white/90 px-3 text-xs font-semibold text-slate-700 transition hover:bg-white focus:outline-none"
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {showPassword ? "Masquer" : "Afficher"}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:translate-y-[1px] hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Connexion..." : "LOGIN"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
