import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

// —— Champ générique —— //
function Field({ name, label, type = "text", required = false, placeholder = "", autoComplete, formData, errors, onChange, onBlur }) {
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
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={[
          "w-full rounded-xl border bg-white px-3 py-2 shadow-sm",
          "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500",
          errors[name] ? "border-rose-400" : "border-slate-300",
          "placeholder:text-slate-400 text-slate-900",
        ].join(" ")}
      />
      {errors[name] && <p className="text-xs text-rose-600">{errors[name]}</p>}
    </div>
  );
}

// —— Champ mot de passe avec toggle —— //
function PasswordField({ formData, errors, onChange, onBlur, showPwd, setShowPwd }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="motDePasse" className="text-sm font-medium text-slate-700">
        Mot de passe <span className="text-rose-600">*</span>
      </label>
      <div
        className={[
          "flex items-stretch rounded-xl border bg-white shadow-sm",
          errors.motDePasse ? "border-rose-400" : "border-slate-300",
          "focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-500",
        ].join(" ")}
      >
        <input
          id="motDePasse"
          name="motDePasse"
          type={showPwd ? "text" : "password"}
          value={formData.motDePasse}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Au moins 8 caractères, 1 maj, 1 min, 1 chiffre"
          autoComplete="new-password"
          className="min-w-0 flex-1 rounded-l-xl px-3 py-2 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPwd(!showPwd)}
          className="rounded-r-xl border-l border-slate-300 px-3 text-sm text-slate-600 hover:bg-slate-50 focus:outline-none"
        >
          {showPwd ? "Masquer" : "Afficher"}
        </button>
      </div>
      {errors.motDePasse && <p className="text-xs text-rose-600">{errors.motDePasse}</p>}
    </div>
  );
}

// —— Composant principal —— //
export default function AjouterSecretaire() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    adresse: "",
    numero: "",
    bureau: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // —— Validators —— //
  const validators = {
    nom: (v) => (v?.trim().length >= 2 ? "" : "Le nom doit contenir au moins 2 caractères."),
    prenom: (v) => (v?.trim().length >= 2 ? "" : "Le prénom doit contenir au moins 2 caractères."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v || "") ? "" : "Adresse e-mail invalide."),
    motDePasse: (v) => {
      if (!v || v.length < 8) return "Au moins 8 caractères.";
      if (!/[a-z]/.test(v)) return "Inclure une minuscule.";
      if (!/[A-Z]/.test(v)) return "Inclure une majuscule.";
      if (!/[0-9]/.test(v)) return "Inclure un chiffre.";
      return "";
    },
    adresse: (v) => (v?.trim().length >= 5 ? "" : "Adresse invalide."),
    numero: (v) => (/^[0-9]{8}$/.test(v || "") ? "" : "Le numéro doit contenir 8 chiffres."),
    bureau: (_) => "",
  };

  const validateField = (name, value) => validators[name]?.(value) || "";
  const validateAll = (data) =>
    Object.keys(validators).reduce((acc, k) => {
      const msg = validateField(k, data[k]);
      if (msg) acc[k] = msg;
      return acc;
    }, {});

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setServerError("");
    setSuccessMsg("");
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  // —— Submit —— //
  const onSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const found = validateAll(formData);
    setErrors(found);
    if (Object.keys(found).length) return;

    if (!user?.token) {
      setServerError("Vous devez être connecté");
      return;
    }

    setIsSubmitting(true);
    setServerError("");

    try {
      // Nettoyage du payload pour éviter null
      const payload = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim(),
        motDePasse: formData.motDePasse,
        adresse: formData.adresse.trim(),
        numero: formData.numero.trim(),
        bureau: formData.bureau?.trim() || null,
      };

      const response = await axios.post(
        "http://localhost:5000/api/dentistes/secretaires",
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setSuccessMsg("Secrétaire ajoutée avec succès !");
      setTimeout(() => navigate("/ListeSecretaires"), 1200);
    } catch (err) {
      console.error("Erreur backend createSecretaire:", err.response || err);
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      } else {
        setServerError(err.response?.data?.message || "Erreur serveur lors de la création de la secrétaire");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm">
        <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Ajouter une secrétaire</h2>
            <p className="text-sm text-slate-600">Renseignez les informations de la nouvelle secrétaire.</p>
          </div>
        </div>

        {successMsg && <div className="mx-5 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">{successMsg}</div>}
        {serverError && <div className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">{serverError}</div>}

        <form onSubmit={onSubmit} noValidate className="px-5 py-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <Field name="nom" label="Nom" required autoComplete="name" formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
            <Field name="prenom" label="Prénom" required autoComplete="given-name" formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
            <Field name="email" label="Email" type="email" required autoComplete="email" formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
            <Field name="adresse" label="Adresse" required placeholder="Rue, Ville" formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
            <Field name="numero" label="Numéro de téléphone" required placeholder="Ex. 50123456" autoComplete="tel" formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
            <PasswordField formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} showPwd={showPwd} setShowPwd={setShowPwd} />
            <Field name="bureau" label="Bureau (facultatif)" placeholder="Ex. B-203" autoComplete="off" formData={formData} errors={errors} onChange={onChange} onBlur={onBlur} />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Enregistrement…" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
