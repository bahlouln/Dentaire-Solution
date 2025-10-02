// src/Components/admin/forms/AddDentistes.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function Field({ name, label, type = "text", required = false, placeholder = "", formData, errors, onChange, onBlur }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      <input
        id={`field-${name}`}
        name={name}
        type={type}
        value={formData[name] ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        placeholder={placeholder}
        className={[
          "w-full rounded-xl border bg-white px-3 py-2 shadow-sm",
          "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500",
          errors[name] ? "border-rose-400" : "border-slate-300",
          "placeholder:text-slate-400 text-slate-900",
        ].join(" ")}
      />
      {errors[name] && <p id={`${name}-error`} className="text-xs text-rose-600">{errors[name]}</p>}
    </div>
  );
}

// —— Field mot de passe avec toggle —— //
function PasswordField({ formData, errors, onChange, onBlur, showPwd, setShowPwd }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="motDePasse" className="text-sm font-medium text-slate-700">
        Mot de passe <span className="text-rose-600">*</span>
      </label>
      <div className={[
          "flex items-stretch rounded-xl border bg-white shadow-sm",
          errors.motDePasse ? "border-rose-400" : "border-slate-300",
          "focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-500"
        ].join(" ")}>
        <input
          id="motDePasse"
          name="motDePasse"
          type={showPwd ? "text" : "password"}
          value={formData.motDePasse}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={Boolean(errors.motDePasse)}
          aria-describedby={errors.motDePasse ? "motDePasse-error" : "pwd-hint"}
          placeholder="Au moins 8 caractères, 1 maj, 1 min, 1 chiffre"
          autoComplete="new-password"
          className="min-w-0 flex-1 rounded-l-xl px-3 py-2 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPwd((s) => !s)}
          className="rounded-r-xl border-l border-slate-300 px-3 text-sm text-slate-600 hover:bg-slate-50 focus:outline-none"
        >
          {showPwd ? "Masquer" : "Afficher"}
        </button>
      </div>
      <p id="pwd-hint" className="text-xs text-slate-500">
        Doit inclure minuscule, majuscule et chiffre.
      </p>
      {errors.motDePasse && <p id="motDePasse-error" className="text-xs text-rose-600">{errors.motDePasse}</p>}
    </div>
  );
}

// —— Composant AddDentistes —— //
export default function AddDentistes() {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // ✅ récup token depuis le contexte

  const [formData, setFormData] = useState({ nom: "", email: "", motDePasse: "", specialite: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // —— Validation —— //
  const validators = {
    nom: (v) => (v?.trim().length >= 2 ? "" : "Le nom doit contenir au moins 2 caractères."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v || "") ? "" : "Adresse e-mail invalide."),
    motDePasse: (v) => {
      if (!v || v.length < 8) return "Au moins 8 caractères.";
      if (!/[a-z]/.test(v)) return "Inclure une minuscule.";
      if (!/[A-Z]/.test(v)) return "Inclure une majuscule.";
      if (!/[0-9]/.test(v)) return "Inclure un chiffre.";
      return "";
    },
    specialite: (_) => "", // facultatif
  };

  const validateField = (name, value) => validators[name]?.(value) || "";
  const validateAll = (data) => {
    const next = {};
    Object.keys(validators).forEach((k) => {
      const msg = validateField(k, data[k]);
      if (msg) next[k] = msg;
    });
    return next;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    setServerError("");
    setSuccessMsg("");
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    setErrors((s) => ({ ...s, [name]: validateField(name, value) }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validateAll(formData);
    setErrors(found);
    if (Object.keys(found).length) return;

    if (!user?.token) {
      setServerError("Vous devez être connecté pour ajouter un dentiste.");
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    try {
      await axios.post("http://localhost:5000/api/admin/dentistes", formData, {
        headers: { Authorization: `Bearer ${user.token}` }, // ✅ utilise le token du contexte
      });
      setSuccessMsg("Dentiste ajouté avec succès !");
      setTimeout(() => navigate("/admin/dentistes"), 1200);
    } catch (err) {
      setServerError(err?.response?.data?.message || "Erreur lors de l'ajout du dentiste");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-4">Chargement…</p>;
  if (!user) return <p className="text-center mt-4 text-red-600">Vous devez être connecté pour ajouter un dentiste.</p>;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm">
        <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Ajouter un dentiste</h2>
            <p className="text-sm text-slate-600">Renseignez les informations du nouveau dentiste.</p>
          </div>
        </div>

        {successMsg && <div className="mx-5 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">{successMsg}</div>}
        {serverError && <div className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">{serverError}</div>}

        <form onSubmit={onSubmit} noValidate className="px-5 py-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <Field name="nom" label="Nom" required placeholder="Ex. Ben Salah" formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
            <Field name="email" label="Email" type="email" required placeholder="exemple@mail.com" formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
            <PasswordField formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} showPwd={showPwd} setShowPwd={setShowPwd} />
            <Field name="specialite" label="Spécialité (facultatif)" placeholder="Ex. Orthodontie" formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Enregistrement…" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
