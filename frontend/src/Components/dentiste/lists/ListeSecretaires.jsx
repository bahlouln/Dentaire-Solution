import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // ← import du context

export default function ListeSecretaires() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ← récupère user et logout

  const [secretaires, setSecretaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nom: "", email: "" });
  const [busyRow, setBusyRow] = useState(null);

  // —— Fetch secrétaires —— //
  useEffect(() => {
    const abortController = new AbortController();
    let cancelled = false;

    const fetchSecretaires = async () => {
      try {
        if (!user?.token) return; // si user pas encore chargé, on attend

        const API_URL = "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/dentistes/secretaires`, {
          headers: { Authorization: `Bearer ${user.token}` },
          signal: abortController.signal,
        });

        if (!cancelled) setSecretaires(res?.data || []);
      } catch (e) {
        if (!cancelled && !axios.isCancel(e)) {
          let msg = "Impossible de récupérer les secrétaires.";
          if (e.response?.status === 401) {
            msg = "Session expirée. Veuillez vous reconnecter.";
            logout();
            navigate("/login");
          } else if (e.response?.data?.message) {
            msg = e.response.data.message;
          }
          setErrorMsg(msg);
          console.error("Erreur de chargement des secrétaires:", e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSecretaires();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [user, logout, navigate]);

 // Make sure secretaires is always an array
const secretairesList = useMemo(() => {
  if (Array.isArray(secretaires)) return secretaires;
  if (Array.isArray(secretaires?.data)) return secretaires.data;
  return [];
}, [secretaires]);

// —— Recherche & pagination —— //
const filtered = useMemo(() => {
  const q = (query || "").trim().toLowerCase();
  if (!q) return secretairesList;

  return secretairesList.filter((s) => {
    const u = s?.User ?? {};
    const nom = (u.nom ?? "").toLowerCase();
    const email = (u.email ?? "").toLowerCase();
    return nom.includes(q) || email.includes(q);
  });
}, [secretairesList, query]);

const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
const pageSafe = Math.min(page, pageCount);

const rows = useMemo(() => {
  const start = (pageSafe - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}, [filtered, pageSafe, pageSize]); // ← include pageSize

useEffect(() => {
  // Reset to first page if query changes or page exceeds new count
  if (page > pageCount) setPage(1);
}, [page, pageCount]);

useEffect(() => {
  setPage(1);
}, [query]);

  // —— Edit —— //
  const startEdit = (sec) => {
    const id = sec.id || sec._id;
    setEditingId(id);
    setFormData({
      nom: sec?.User?.nom || "",
      email: sec?.User?.email || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ nom: "", email: "" });
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
      await axios.put(`http://localhost:5000/api/dentistes/secretaires/${id}`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setSecretaires((list) =>
        list.map((s) => (s.id === id || s._id === id ? { ...s, User: { ...s.User, ...formData } } : s))
      );
      cancelEdit();
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      } else {
        setErrorMsg(err.response?.data?.message || "Erreur lors de la sauvegarde");
      }
    } finally {
      setBusyRow(null);
    }
  };

  // —— Delete —— //
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette secrétaire ?")) return;

    const prev = secretaires;
    setSecretaires((list) => list.filter((s) => (s.id || s._id) !== id)); // optimiste

    try {
      await axios.delete(`http://localhost:5000/api/dentistes/secretaires/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      } else {
        setErrorMsg(err.response?.data?.message || "Erreur lors de la suppression");
        setSecretaires(prev); // rollback
      }
    }
  };

  // —— Add —— //
  const handleAddSecretary = () => navigate("/add-secretary");

  // —— UI —— //
  if (!user) return <p className="text-center mt-10">Chargement utilisateur…</p>;
  if (loading) return <p className="text-center mt-10">Chargement des secrétaires…</p>;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
        {/* Header */}
        <div className="flex flex-col gap-3 rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Liste des secrétaires</h2>
            <p className="text-xs text-slate-600">Rechercher, éditer, supprimer. Données liées à votre compte.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (nom, email)…"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-9 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 sm:w-80"
            />
            <button
              onClick={handleAddSecretary}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              Ajouter secrétaire
            </button>
          </div>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Table */}
        <div className="px-3 py-5 sm:px-5">
          {secretaires.length === 0 ? (
            <div className="mx-auto grid max-w-xl place-items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
              <h3 className="text-base font-semibold text-slate-900">Aucune secrétaire</h3>
              <p className="text-sm text-slate-600">Ajoutez votre première secrétaire pour commencer.</p>
              <button
                onClick={handleAddSecretary}
                className="mt-1 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200"
              >
                Ajouter secrétaire
              </button>
            </div>
          ) : (
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  {["Nom", "Email", "Actions"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const id = s.id || s._id;
                  const isEditing = editingId === id;
                  const u = s.User || {};
                  return (
                    <tr key={id} className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                      <td className="px-3 py-2 align-middle">
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.nom}
                            onChange={(e) => setFormData((st) => ({ ...st, nom: e.target.value }))}
                            className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                          />
                        ) : u.nom ? (
                          <span className="text-sm text-slate-900">{u.nom}</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        {isEditing ? (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData((st) => ({ ...st, email: e.target.value }))}
                            className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                          />
                        ) : u.email ? (
                          <span className="text-sm text-slate-700">{u.email}</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <div className="flex flex-wrap items-center gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveRow(id)} disabled={busyRow === id} className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60">
                                {busyRow === id ? "Sauvegarde…" : "Sauvegarder"}
                              </button>
                              <button onClick={cancelEdit} className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100">
                                Annuler
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(s)} className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100">
                                Modifier
                              </button>
                              <button onClick={() => handleDelete(id)} className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-200">
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
          )}
        </div>

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
            <span>
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""} • Page {pageSafe}/{pageCount}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe === 1} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                Précédent
              </button>
              <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={pageSafe === pageCount} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
