import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * AjouterPatient (Tailwind, ergonomique & accessible)
 * - Validation côté client (champ par champ)
 * - Messages d'erreur au focus/blur
 * - Bouton avec état de chargement & disabled
 * - Layout responsive (1 col -> 2 cols)
 * - Respect accessibilité: labels, aria-*, focus rings visibles
 */
export default function AjouterPatient() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        dateNaissance: "",
        adresse: "",
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // —— Validation —— //
    const validators = {
        nom: (v) => (v?.trim().length >= 2 ? "" : "Le nom doit contenir au moins 2 caractères."),
        prenom: (v) => (v?.trim().length >= 2 ? "" : "Le prénom doit contenir au moins 2 caractères."),
        email: (v) => {
            if (!v) return ""; // email facultatif
            const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
            return ok ? "" : "Adresse e-mail invalide.";
        },
        telephone: (v) => {
            // Autorise +, espaces, tirets et 8–15 chiffres
            const ok = /^\+?[0-9\s\-]{8,17}$/.test(v || "");
            return ok ? "" : "Téléphone invalide (8 à 15 chiffres, espaces/tirets autorisés).";
        },
        dateNaissance: (v) => {
            if (!v) return ""; // facultatif
            try {
                const d = new Date(v);
                const today = new Date();
                if (d > today) return "La date de naissance ne peut pas être dans le futur.";
                return "";
            } catch (_) {
                return "Date invalide.";
            }
        },
        adresse: (_) => "", // facultatif
    };

    const validateField = (name, value) => {
        const fn = validators[name];
        if (!fn) return "";
        return fn(value);
    };

    const validateAll = (data) => {
        const next = {};
        Object.keys(data).forEach((k) => {
            const msg = validateField(k, data[k]);
            if (msg) next[k] = msg;
        });
        // Champs requis
        if (!data.nom?.trim()) next.nom = next.nom || "Le nom est requis.";
        if (!data.prenom?.trim()) next.prenom = next.prenom || "Le prénom est requis.";
        if (!data.telephone?.trim()) next.telephone = next.telephone || "Le téléphone est requis.";
        return next;
    };

    // —— Handlers —— //
    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData((s) => ({ ...s, [name]: value }));
        setServerError("");
        setSuccessMsg("");
    };

    const onBlur = (e) => {
        const { name, value } = e.target;
        const msg = validateField(name, value);
        setErrors((s) => ({ ...s, [name]: msg }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const found = validateAll(formData);
        setErrors(found);
        if (Object.keys(found).length) {
            // focus premier champ en erreur
            const first = Object.keys(found)[0];
            document.getElementById(first)?.focus();
            return;
        }

        setIsSubmitting(true);
        setServerError("");
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:5000/patients", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccessMsg("Patient ajouté avec succès !");
            setTimeout(() => navigate("/ListePatients"), 1200);
        } catch (err) {
            const msg = err?.response?.data?.message || "Erreur lors de l'ajout du patient";
            setServerError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // —— UI helpers —— //
    const Field = ({ id, label, type = "text", required = false, placeholder = "", autoComplete, max, min }) => (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium text-slate-700">
                {label} {required && <span className="text-rose-600">*</span>}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                value={formData[id]}
                onChange={onChange}
                onBlur={onBlur}
                aria-invalid={Boolean(errors[id])}
                aria-describedby={errors[id] ? `${id}-error` : undefined}
                placeholder={placeholder}
                autoComplete={autoComplete}
                max={max}
                min={min}
                className={[
                    "w-full rounded-xl border bg-white px-3 py-2 shadow-sm",
                    "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500",
                    errors[id] ? "border-rose-400" : "border-slate-300",
                    "placeholder:text-slate-400 text-slate-900",
                ].join(" ")}
            />
            {errors[id] && (
                <p id={`${id}-error`} className="text-xs text-rose-600">
                    {errors[id]}
                </p>
            )}
        </div>
    );

    return (
        <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
            {/* Carte */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm">
                {/* En-tête */}
                <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-5 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Ajouter un patient</h2>
                        <p className="text-sm text-slate-600">Veuillez renseigner les informations ci-dessous. Les champs marqués d'un * sont obligatoires.</p>
                    </div>
                </div>

                {/* Messages */}
                {successMsg && (
                    <div className="mx-5 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                        <p className="text-sm">{successMsg}</p>
                    </div>
                )}
                {serverError && (
                    <div className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
                        <p className="text-sm">{serverError}</p>
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={onSubmit} noValidate className="px-5 py-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                        <Field id="nom" label="Nom" required placeholder="Ex. Dupont" autoComplete="family-name" />
                        <Field id="prenom" label="Prénom" required placeholder="Ex. Marie" autoComplete="given-name" />
                        <Field id="email" label="Email" type="email" placeholder="exemple@mail.com" autoComplete="email" />
                        <Field id="telephone" label="Téléphone" required placeholder="Ex. +216 12 345 678" autoComplete="tel" />
                        <Field id="dateNaissance" label="Date de naissance" type="date" />
                        <Field id="adresse" label="Adresse" placeholder="Rue, ville…" autoComplete="street-address" />
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={[
                                "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm",
                                "bg-indigo-600 text-white hover:bg-indigo-500",
                                "focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60",
                            ].join(" ")}
                        >
                            {isSubmitting ? (
                                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Enregistrement…
                </span>
                            ) : (
                                "Ajouter"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}