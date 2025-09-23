import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaUser, FaEnvelope, FaLock, FaUserTag } from "react-icons/fa";


export default function RegisterDentiste() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [formData, setFormData] = useState({
        nom: "",
        email: "",
        motDePasse: "",
        role: "dentiste",
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((s) => ({ ...s, [name]: value }));
        setErrors((s) => ({ ...s, [name]: "" }));
        setServerError("");
    };

    const togglePassword = () => setShowPassword((s) => !s);

    const validate = (d) => {
        const e = {};
        if (!d.nom?.trim() || d.nom.trim().length < 2) e.nom = "Nom trop court (≥ 2).";
        if (!d.email?.trim()) e.email = "Email requis.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) e.email = "Adresse e‑mail invalide.";
        if (!d.motDePasse?.trim()) e.motDePasse = "Mot de passe requis.";
        else {
            if (d.motDePasse.length < 8) e.motDePasse = "Au moins 8 caractères.";
            if (!/[a-z]/.test(d.motDePasse)) e.motDePasse = e.motDePasse || "Inclure une minuscule.";
            if (!/[A-Z]/.test(d.motDePasse)) e.motDePasse = e.motDePasse || "Inclure une majuscule.";
            if (!/[0-9]/.test(d.motDePasse)) e.motDePasse = e.motDePasse || "Inclure un chiffre.";
        }
        if (!["dentiste", "secretaire"].includes(d.role)) e.role = "Rôle invalide.";
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v = validate(formData);
        setErrors(v);
        if (Object.keys(v).length) return;

        setIsSubmitting(true);
        setServerError("");
        try {
            // ⚠️ motDePasse attendu par le backend
            await axios.post("http://localhost:5000/dentistes", {
                nom: formData.nom,
                email: formData.email,
                motDePasse: formData.motDePasse,
                role: formData.role || "dentiste",
            });
            setSuccessMsg("Inscription réussie !");
            setTimeout(() => navigate("/login-dentiste"), 1000);
        } catch (err) {
            const msg = err?.response?.data?.message || "Erreur serveur";
            setServerError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const FieldError = ({ id }) =>
        errors[id] ? (
            <p id={`${id}-error`} className="mt-1 text-xs text-rose-600">{errors[id]}</p>
        ) : null;

    return (
        <div className="relative min-h-screen bg-[url('/Login.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/60 to-slate-800/60" />
            <div className="relative z-10 grid min-h-screen place-items-center p-4">
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-6 sm:p-8 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] backdrop-blur-md">
                    <header className="mb-6 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Inscription Dentiste / Secrétaire</h1>
                    </header>

                    {successMsg && (
                        <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
                            {successMsg}
                        </div>
                    )}
                    {serverError && (
                        <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="text-left">
                        {/* Nom */}
                        <label htmlFor="nom" className="sr-only">Nom complet</label>
                        <div className={`group relative mb-2 flex h-12 items-center overflow-hidden rounded-2xl border bg-white/90 shadow-sm ${errors.nom ? "border-rose-300 ring-2 ring-rose-100" : "border-white/40 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100"}`}>
                            <span className="inline-flex items-center px-3 text-slate-700"><FaUser className="h-4 w-4" aria-hidden /></span>
                            <input
                                id="nom"
                                name="nom"
                                type="text"
                                value={formData.nom}
                                onChange={handleChange}
                                placeholder="Nom complet"
                                autoComplete="name"
                                aria-invalid={Boolean(errors.nom)}
                                aria-describedby={errors.nom ? "nom-error" : undefined}
                                className="h-full flex-1 border-0 bg-transparent pr-3 text-slate-900 placeholder:text-slate-500 focus:outline-none"
                                required
                            />
                        </div>
                        <FieldError id="nom" />

                        {/* Email */}
                        <label htmlFor="email" className="sr-only">Email</label>
                        <div className={`group relative mt-3 flex h-12 items-center overflow-hidden rounded-2xl border bg-white/90 shadow-sm ${errors.email ? "border-rose-300 ring-2 ring-rose-100" : "border-white/40 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100"}`}>
                            <span className="inline-flex items-center px-3 text-slate-700"><FaEnvelope className="h-4 w-4" aria-hidden /></span>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Adresse e‑mail"
                                autoComplete="email"
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? "email-error" : undefined}
                                className="h-full flex-1 border-0 bg-transparent pr-3 text-slate-900 placeholder:text-slate-500 focus:outline-none"
                                required
                            />
                        </div>
                        <FieldError id="email" />

                        {/* Mot de passe */}
                        <label htmlFor="motDePasse" className="sr-only">Mot de passe</label>
                        <div className={`group relative mt-3 flex h-12 items-stretch overflow-hidden rounded-2xl border bg-white/90 shadow-sm ${errors.motDePasse ? "border-rose-300 ring-2 ring-rose-100" : "border-white/40 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100"}`}>
                            <span className="inline-flex items-center px-3 text-slate-700"><FaLock className="h-4 w-4" aria-hidden /></span>
                            <input
                                id="motDePasse"
                                name="motDePasse"
                                type={showPassword ? "text" : "password"}
                                value={formData.motDePasse}
                                onChange={handleChange}
                                placeholder="Mot de passe (8+ avec maj/min/chiffre)"
                                autoComplete="new-password"
                                aria-invalid={Boolean(errors.motDePasse)}
                                aria-describedby={errors.motDePasse ? "motDePasse-error" : undefined}
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
                        <FieldError id="motDePasse" />

                        {/* Rôle */}
                        <label htmlFor="role" className="sr-only">Rôle</label>
                        <div className={`group relative mt-3 flex h-12 items-center overflow-hidden rounded-2xl border bg-white/90 shadow-sm ${errors.role ? "border-rose-300 ring-2 ring-rose-100" : "border-white/40 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100"}`}>
                            <span className="inline-flex items-center px-3 text-slate-700"><FaUserTag className="h-4 w-4" aria-hidden /></span>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="h-full flex-1 border-0 bg-transparent pr-3 text-slate-900 focus:outline-none"
                                aria-invalid={Boolean(errors.role)}
                            >
                                <option value="dentiste">Dentiste</option>
                                <option value="secretaire">Secrétaire</option>
                            </select>
                        </div>
                        <FieldError id="role" />

                        {/* Actions */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:translate-y-[1px] hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Création…
                </span>
                            ) : (
                                "REGISTER"
                            )}
                        </button>

                        <p className="mt-4 text-center text-sm text-white/90">
                            Déjà un compte ? <Link to="/login-dentiste" className="font-semibold underline-offset-2 hover:underline">Se connecter</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
