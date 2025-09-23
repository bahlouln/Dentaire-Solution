import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * AddAppointmentForm – Tailwind, JS, ergonomique & accessible
 * - Chargement patients/dentistes (skeletons + erreurs claires)
 * - Validation client: champs requis, début < fin, durée min 15min
 * - Aide à la saisie: valeurs par défaut si `:date` dans l'URL
 * - Bouton avec état de chargement + disabled
 * - Styles modernes: cartes, focus rings, messages contextualisés
 */
export default function AddAppointmentForm() {
    const { date } = useParams();
    const navigate = useNavigate();

    // Helpers pour date-time par défaut
    const defaultStart = useMemo(() => (date ? `${date}T08:00` : ""), [date]);
    const defaultEnd = useMemo(() => (date ? `${date}T09:00` : ""), [date]);

    const [formData, setFormData] = useState({
        patientId: "",
        dentisteId: "",
        dateDebut: defaultStart,
        dateFin: defaultEnd,
        note: "",
    });

    const [patients, setPatients] = useState([]);
    const [dentistes, setDentistes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // —— Load patients & dentistes —— //
    useEffect(() => {
        const abortController = new AbortController();
        let cancelled = false;

        (async () => {
            try {
                const API_URL = "http://localhost:5000";
                const [patientsRes, dentistesRes] = await Promise.all([
                    axios.get(`${API_URL}/patients`, { signal: abortController.signal }),
                    axios.get(`${API_URL}/dentistes`, { signal: abortController.signal }),
                ]);

                if (!cancelled) {
                    setPatients(patientsRes.data || []);
                    setDentistes(dentistesRes.data || []);
                }
            } catch (err) {
                if (!cancelled && !axios.isCancel(err)) {
                    const errorMsg = err.response?.data?.message || "Erreur lors du chargement des données.";
                    setFetchError(errorMsg);
                    console.error("Erreur de chargement:", err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
            abortController.abort();
        };
    }, []);
    // —— Validation —— //
    const validateAll = (data) => {
        const next = {};
        if (!data.patientId) next.patientId = "Sélectionnez un patient.";
        if (!data.dentisteId) next.dentisteId = "Sélectionnez un dentiste.";
        if (!data.dateDebut) next.dateDebut = "Indiquez une date/heure de début.";
        if (!data.dateFin) next.dateFin = "Indiquez une date/heure de fin.";

        if (data.dateDebut && data.dateFin) {
            const start = new Date(data.dateDebut);
            const end = new Date(data.dateFin);
            if (isNaN(start.getTime())) next.dateDebut = next.dateDebut || "Date/heure de début invalide.";
            if (isNaN(end.getTime())) next.dateFin = next.dateFin || "Date/heure de fin invalide.";
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                if (end <= start) next.dateFin = "L'heure de fin doit être après le début.";
                const minutes = (end - start) / (1000 * 60);
                if (minutes < 15) next.dateFin = "Durée minimale: 15 minutes.";
            }
        }
        return next;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((s) => ({ ...s, [name]: value }));
        setErrors((s) => ({ ...s, [name]: "" }));
        setServerError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const found = validateAll(formData);
        setErrors(found);
        if (Object.keys(found).length) {
            const first = Object.keys(found)[0];
            document.getElementById(first)?.focus();
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:5000/rendezvous", formData, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            navigate("/"); // retour au calendrier
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Erreur inconnue";
            setServerError(`Erreur lors de la création : ${msg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // —— UI Fields —— //
    const FieldError = ({ id }) =>
        errors[id] ? (
            <p id={`${id}-error`} className="text-xs text-rose-600">{errors[id]}</p>
        ) : null;

    const Select = ({ id, label, value, onChange, options, placeholder, required }) => (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium text-slate-700">
                {label} {required && <span className="text-rose-600">*</span>}
            </label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                aria-invalid={Boolean(errors[id])}
                aria-describedby={errors[id] ? `${id}-error` : undefined}
                className={[
                    "w-full rounded-xl border bg-white px-3 py-2 shadow-sm",
                    "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500",
                    errors[id] ? "border-rose-400" : "border-slate-300",
                    "text-slate-900",
                ].join(" ")}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((o) => (
                    <option key={o.id || o._id} value={o.id || o._id}>
                        {o.nom} {o.prenom}
                    </option>
                ))}
            </select>
            <FieldError id={id} />
        </div>
    );

    const Input = ({ id, label, type = "text", value, onChange, required, placeholder }) => (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium text-slate-700">
                {label} {required && <span className="text-rose-600">*</span>}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={onChange}
                aria-invalid={Boolean(errors[id])}
                aria-describedby={errors[id] ? `${id}-error` : undefined}
                placeholder={placeholder}
                className={[
                    "w-full rounded-xl border bg-white px-3 py-2 shadow-sm",
                    "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500",
                    errors[id] ? "border-rose-400" : "border-slate-300",
                    "placeholder:text-slate-400 text-slate-900",
                ].join(" ")}
            />
            <FieldError id={id} />
        </div>
    );

    const TextArea = ({ id, label, value, onChange, rows = 4, placeholder }) => (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
            <textarea
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                rows={rows}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
            />
        </div>
    );

    // —— States: loading & error —— //
    if (loading) {
        return (
            <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                    <p className="font-medium">Erreur</p>
                    <p className="text-sm">{fetchError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
            <div className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
                {/* Header */}
                <div className="rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-5 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">Nouveau rendez‑vous</h2>
                    <p className="text-sm text-slate-600">Renseignez les champs ci‑dessous. Les champs marqués d'un * sont obligatoires.</p>
                </div>

                {/* Server error */}
                {serverError && (
                    <div className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
                        <p className="text-sm">{serverError}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="px-5 py-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                        <Select
                            id="patientId"
                            label="Patient"
                            value={formData.patientId}
                            onChange={handleChange}
                            options={patients}
                            placeholder="— Choisir un patient —"
                            required
                        />
                        <Select
                            id="dentisteId"
                            label="Dentiste"
                            value={formData.dentisteId}
                            onChange={handleChange}
                            options={dentistes}
                            placeholder="— Choisir un dentiste —"
                            required
                        />
                        <Input
                            id="dateDebut"
                            label="Date & heure de début"
                            type="datetime-local"
                            value={formData.dateDebut}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            id="dateFin"
                            label="Date & heure de fin"
                            type="datetime-local"
                            value={formData.dateFin}
                            onChange={handleChange}
                            required
                        />
                        <div className="md:col-span-2">
                            <TextArea
                                id="note"
                                label="Note (optionnel)"
                                value={formData.note}
                                onChange={handleChange}
                                placeholder="Ajoutez une remarque, un motif, etc."
                            />
                        </div>
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
                  Création…
                </span>
                            ) : (
                                "Créer"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tips d'ergonomie (à retirer en prod) */}
            <div className="mt-6 text-xs text-slate-500">
                <ul className="list-disc space-y-1 pl-5">
                    <li>Validation: durée minimale 15 min, fin après début.</li>
                    <li>Focus visible clavier, messages d'erreur contextualisés.</li>
                    <li>Préremplissage si route contient une date (`/add-appointment/:date`).</li>
                </ul>
            </div>
        </div>
    );
}
