import { useState } from "react";

export default function DentistRow({ dentist, onSave, onDelete, saving }) {
    const id = dentist.id || dentist._id;
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        nom: dentist?.User?.nom || "",
        email: dentist?.User?.email || "",
        specialite: dentist?.specialite || "",
    });

    const validate = () => {
        const errs = {};
        if (!form.nom.trim()) errs.nom = "Nom requis";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) errs.email = "Email invalide";
        return errs;
    };

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length) {
            alert(Object.values(errs).join(" · "));
            return;
        }
        const res = await onSave(id, form);
        if (res?.ok) setEditing(false);
    };

    return (
        <tr className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <td className="px-3 py-2">
                {editing ? (
                    <input
                        type="text"
                        value={form.nom}
                        onChange={(e) => setForm((s) => ({ ...s, nom: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                    />
                ) : (
                    <span className="text-sm text-slate-900">{dentist.User?.nom}</span>
                )}
            </td>
            <td className="px-3 py-2">
                {editing ? (
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                    />
                ) : (
                    <span className="text-sm text-slate-700">{dentist.User?.email}</span>
                )}
            </td>
            <td className="px-3 py-2">
                {editing ? (
                    <input
                        type="text"
                        value={form.specialite}
                        onChange={(e) => setForm((s) => ({ ...s, specialite: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                    />
                ) : (
                    <span className="text-sm text-slate-700">{dentist.specialite}</span>
                )}
            </td>
            <td className="px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                    {editing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={!!saving}
                                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? "Sauvegarde…" : "Sauvegarder"}
                            </button>
                            <button
                                onClick={() => setEditing(false)}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                            >
                                Annuler
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setEditing(true)}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                            >
                                Modifier
                            </button>
                            <button
                                onClick={() => onDelete(id)}
                                className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-200"
                            >
                                Supprimer
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}
