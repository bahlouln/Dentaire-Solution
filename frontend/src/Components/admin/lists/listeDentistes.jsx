// src/Components/admin/lists/ListeDentistes.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function ListeDentistes() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();

  const [dentistes, setDentistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nom: "", email: "", specialite: "" });
  const [busyRow, setBusyRow] = useState(null);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  // —— Fetch dentistes —— //
  useEffect(() => {
    if (!isAuthenticated || !user?.token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/dentistes", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!cancelled) setDentistes(res?.data || []);
      } catch (e) {
        console.error("Erreur récupération dentistes:", e);
        if (!cancelled) setErrorMsg("Impossible de récupérer les dentistes.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, user]);

  // —— Recherche & pagination —— //
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dentistes;
    return dentistes.filter((d) => {
      const u = d.User || {};
      const nom = (u.nom || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const specialite = (d.specialite || "").toLowerCase();
      return nom.includes(q) || email.includes(q) || specialite.includes(q);
    });
  }, [dentistes, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, pageCount);
  const rows = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSafe]);

  useEffect(() => { if (page > pageCount) setPage(1); }, [page, pageCount]);

  // —— Edition —— //
  const startEdit = (d) => {
    const id = d.id || d._id;
    setEditingId(id);
    setFormData({
      nom: d?.User?.nom || "",
      email: d?.User?.email || "",
      specialite: d?.specialite || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ nom: "", email: "", specialite: "" });
  };

  const validateRow = (d) => {
    const errs = {};
    if (!d.nom?.trim()) errs.nom = "Nom requis";
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errs.email = "Email invalide";
    return errs;
  };

  const saveRow = async (id) => {
    const errs = validateRow(formData);
    if (Object.keys(errs).length) {
      setErrorMsg(Object.values(errs).join(" · "));
      return;
    }
    setBusyRow(id);
    setErrorMsg("");
    try {
      await axios.put(`http://localhost:5000/api/admin/dentistes/${id}`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDentistes((list) =>
        list.map((d) =>
          (d.id || d._id) === id
            ? { ...d, User: { ...d.User, nom: formData.nom, email: formData.email }, specialite: formData.specialite }
            : d
        )
      );
      cancelEdit();
    } catch (e) {
      console.error("Erreur mise à jour dentiste:", e);
      setErrorMsg("Impossible de mettre à jour le dentiste.");
    } finally {
      setBusyRow(null);
    }
  };

  // —— Suppression —— //
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce dentiste ?")) return;
    const prev = dentistes;
    setDentistes((list) => list.filter((d) => (d.id || d._id) !== id));
    try {
      await axios.delete(`http://localhost:5000/api/admin/dentistes/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
    } catch (e) {
      console.error("Erreur suppression dentiste:", e);
      setErrorMsg("Impossible de supprimer le dentiste.");
      setDentistes(prev);
    }
  };

  // —— Ajout —— //
  const handleAddDentiste = () => navigate("/admin/add-dentiste");

  // —— UI loading —— //
  if (loading || authLoading) {
    return (
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-52 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 grid gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.token) {
    return <p className="text-center text-red-500">Vous devez être connecté pour voir les dentistes.</p>;
  }

  // —— UI final —— //
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
        {/* Header + Recherche + Ajouter + Logout */}
        <div className="flex flex-col gap-3 rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Liste des dentistes</h2>
            <p className="text-xs text-slate-600">Rechercher, éditer, supprimer. Données liées à votre compte admin.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher (nom, email, spécialité)…"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-9 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 sm:w-80"
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 my-auto text-slate-400">⌘K</span>
            </div>
            <button
              onClick={handleAddDentiste}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              Ajouter dentiste
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Messages d’erreur */}
        {errorMsg && (
          <div className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Table des dentistes */}
        <div className="px-3 py-5 sm:px-5">
          {dentistes.length === 0 ? (
            <div className="mx-auto grid max-w-xl place-items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
              <h3 className="text-base font-semibold text-slate-900">Aucun dentiste</h3>
              <p className="text-sm text-slate-600">Ajoutez votre premier dentiste pour commencer.</p>
              <button
                onClick={handleAddDentiste}
                className="mt-1 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200"
              >
                Ajouter dentiste
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    {["Nom", "Email", "Spécialité", "Actions"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => {
                    const id = d.id || d._id;
                    const isEditing = editingId === id;
                    return (
                      <tr key={id} className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                        <td className="px-3 py-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.nom}
                              onChange={(e) => setFormData((s) => ({ ...s, nom: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                            />
                          ) : (<span className="text-sm text-slate-900">{d.User?.nom}</span>)}
                        </td>
                        <td className="px-3 py-2">
                          {isEditing ? (
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                            />
                          ) : (<span className="text-sm text-slate-700">{d.User?.email}</span>)}
                        </td>
                        <td className="px-3 py-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.specialite}
                              onChange={(e) => setFormData((s) => ({ ...s, specialite: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                            />
                          ) : (<span className="text-sm text-slate-700">{d.specialite}</span>)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveRow(id)}
                                  disabled={busyRow === id}
                                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {busyRow === id ? "Sauvegarde…" : "Sauvegarder"}
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                                >
                                  Annuler
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(d)}
                                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() => handleDelete(id)}
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
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
            <span>
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""} • Page {pageSafe}/{pageCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe === 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={pageSafe === pageCount}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
