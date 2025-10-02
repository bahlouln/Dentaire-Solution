import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

// UI helper pour un champ
const Field = ({ id, label, type = "text", required = false, placeholder = "", autoComplete, max, min, formData, errors, onChange, onBlur }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-sm font-medium text-slate-700">
      {label} {required && <span className="text-rose-600">*</span>}
    </label>
    <input
      id={id}
      name={id}
      type={type}
      value={formData[id] || ""}
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

export default function AjouterPatients() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

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

  const validators = {
    nom: (v) => (v?.trim().length >= 2 ? "" : "Le nom doit contenir au moins 2 caractères."),
    prenom: (v) => (v?.trim().length >= 2 ? "" : "Le prénom doit contenir au moins 2 caractères."),
    email: (v) => (!v ? "" : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Adresse e-mail invalide."),
    telephone: (v) => (/^\+?[0-9\s\-]{8,17}$/.test(v || "") ? "" : "Téléphone invalide (8 à 15 chiffres)."),
    dateNaissance: (v) => {
      if (!v) return "";
      const d = new Date(v);
      return d > new Date() ? "La date de naissance ne peut pas être dans le futur." : "";
    },
    adresse: (_) => "",
  };

  const validateField = useCallback((name, value) => validators[name]?.(value) || "", []);
  const validateAll = useCallback((data) => {
    const next = {};
    Object.keys(data).forEach((k) => {
      const msg = validateField(k, data[k]);
      if (msg) next[k] = msg;
    });
    if (!data.nom?.trim()) next.nom = next.nom || "Le nom est requis.";
    if (!data.prenom?.trim()) next.prenom = next.prenom || "Le prénom est requis.";
    if (!data.telephone?.trim()) next.telephone = next.telephone || "Le téléphone est requis.";
    return next;
  }, [validateField]);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    setServerError("");
    setSuccessMsg("");
  }, []);

  const onBlur = useCallback((e) => {
    const { name, value } = e.target;
    setErrors((s) => ({ ...s, [name]: validateField(name, value) }));
  }, [validateField]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validateAll(formData);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    if (!user?.token) {
      setServerError("Vous devez être connecté pour ajouter un patient.");
      return;
    }

    setIsSubmitting(true);
    setServerError("");

    try {
      console.log("Token envoyé:", user.token);
      console.log("Données envoyées:", formData);

      await axios.post("http://localhost:5000/api/secretaires/patients", formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setSuccessMsg("Patient ajouté avec succès !");
      setTimeout(() => navigate("/ListePatients"), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de l'ajout du patient";
      setServerError(msg);
      console.error("Erreur serveur:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-4">Chargement…</p>;
  if (!user) return <p className="text-center mt-4 text-red-600">Vous devez être connecté pour ajouter un patient.</p>;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm">
        <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Ajouter un patient</h2>
            <p className="text-sm text-slate-600">Veuillez renseigner les informations ci-dessous. Les champs marqués d'un * sont obligatoires.</p>
          </div>
        </div>

        {successMsg && <div className="mx-5 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">{successMsg}</div>}
        {serverError && <div className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">{serverError}</div>}

        <form onSubmit={onSubmit} noValidate className="px-5 py-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <Field id="nom" label="Nom" required formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
            <Field id="prenom" label="Prénom" required formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
            <Field id="email" label="Email" type="email" formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
            <Field id="telephone" label="Téléphone" required formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
            <Field id="dateNaissance" label="Date de naissance" type="date" formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
            <Field id="adresse" label="Adresse" formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Enregistrement…" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
