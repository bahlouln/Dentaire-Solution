import { useState } from "react";

export default function DentistRow({ dentist, onSave, onDelete, saving }) {
  const id = dentist.id || dentist._id;
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    nom: dentist?.User?.nom || "",
    prenom: dentist?.User?.prenom || "",
    email: dentist?.User?.email || "",
    adresse: dentist?.User?.adresse || "",
    numero: dentist?.User?.numero || "",
    specialite: dentist?.specialite || "",
  });

  const validate = () => {
    const errs = {};
    if (!form.nom.trim()) errs.nom = "Nom requis";
    if (!form.prenom.trim()) errs.prenom = "Prénom requis";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      errs.email = "Email invalide";
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
    <tr className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200">
      {/* NOM */}
      <td className="px-3 py-2">
        {editing ? (
          <input
            value={form.nom}
            onChange={(e) => setForm((s) => ({ ...s, nom: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
          />
        ) : (
          <span>{dentist.User?.nom}</span>
        )}
      </td>

      {/* PRÉNOM */}
      <td className="px-3 py-2">
        {editing ? (
          <input
            value={form.prenom}
            onChange={(e) => setForm((s) => ({ ...s, prenom: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
          />
        ) : (
          <span>{dentist.User?.prenom}</span>
        )}
      </td>

      {/* EMAIL */}
      <td className="px-3 py-2">
        {editing ? (
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
          />
        ) : (
          <span>{dentist.User?.email}</span>
        )}
      </td>

      {/* ADRESSE */}
      <td className="px-3 py-2">
        {editing ? (
          <input
            value={form.adresse}
            onChange={(e) => setForm((s) => ({ ...s, adresse: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
          />
        ) : (
          <span>{dentist.User?.adresse}</span>
        )}
      </td>

      {/* NUMÉRO */}
      <td className="px-3 py-2">
        {editing ? (
          <input
            value={form.numero}
            onChange={(e) => setForm((s) => ({ ...s, numero: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
          />
        ) : (
          <span>{dentist.User?.numero}</span>
        )}
      </td>

      {/* SPÉCIALITÉ */}
      <td className="px-3 py-2">
        {editing ? (
          <input
            value={form.specialite}
            onChange={(e) =>
              setForm((s) => ({ ...s, specialite: e.target.value }))
            }
            className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
          />
        ) : (
          <span>{dentist.specialite}</span>
        )}
      </td>

      {/* ACTIONS */}
      <td className="px-3 py-2">
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!!saving}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Sauvegarde…" : "Sauvegarder"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
            >
              Annuler
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
            >
              Modifier
            </button>
            <button
              onClick={() => onDelete(id)}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-200"
            >
              Supprimer
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
