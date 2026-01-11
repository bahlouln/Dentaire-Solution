import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function PatientDiagnostiques() {
  const { user } = useAuth();
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [diagnostiques, setDiagnostiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [newDiag, setNewDiag] = useState({ description: "", date: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "descending" });

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Edit inline
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ description: "", date: "" });
  const [busyRow, setBusyRow] = useState(null);

  useEffect(() => {
    if (!user?.token) return;

    const fetchDiagnostiques = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/diagnostique/patient/${patientId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setDiagnostiques(res.data.diagnostiques || []);
      } catch (err) {
        console.error(err);
        setErrorMsg("Impossible de récupérer les diagnostiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostiques();
  }, [patientId, user]);

  const handleAddDiagnostique = async (e) => {
    e.preventDefault();
    if (!newDiag.description.trim()) {
      setErrorMsg("La description est obligatoire.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/diagnostique`,
        { patientId, description: newDiag.description, date: newDiag.date },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setDiagnostiques((prev) => [res.data.diagnostique, ...prev]);
      setNewDiag({ description: "", date: "" });
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur lors de l'ajout du diagnostique.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));
  };

  const startEdit = (d) => {
    setEditingId(d.id);
    setEditData({ description: d.description, date: d.date });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ description: "", date: "" });
  };

  const saveEdit = async (id) => {
    if (!editData.description.trim()) {
      setErrorMsg("La description est obligatoire.");
      return;
    }
    setBusyRow(id);
    setErrorMsg("");
    try {
      const res = await axios.put(
        `http://localhost:5000/api/diagnostique/${id}`,
        { description: editData.description, date: editData.date },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setDiagnostiques((prev) =>
        prev.map((d) => (d.id === id ? res.data.diagnostique : d))
      );
      cancelEdit();
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur lors de la mise à jour.");
    } finally {
      setBusyRow(null);
    }
  };

  const sortedDiagnostiques = useMemo(() => {
    let sortableDiagnostiques = [...diagnostiques];

    if (sortConfig.key) {
      sortableDiagnostiques.sort((a, b) => {
        if (sortConfig.key === "date") {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return sortConfig.direction === "ascending" ? dateA - dateB : dateB - dateA;
        } else {
          const valA = a[sortConfig.key].toLowerCase();
          const valB = b[sortConfig.key].toLowerCase();
          if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
          if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        }
      });
    }

    return sortableDiagnostiques.filter((d) =>
      d.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [diagnostiques, sortConfig, searchTerm]);

  const pageCount = Math.max(1, Math.ceil(sortedDiagnostiques.length / pageSize));
  const currentPageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedDiagnostiques.slice(start, start + pageSize);
  }, [sortedDiagnostiques, page]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-lg text-slate-600">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-slate-900 tracking-tight animate-in fade-in duration-500">
        Diagnostiques du patient
      </h2>

      {errorMsg && (
        <div className="mb-6 rounded-lg border border-rose-300 bg-rose-100 px-4 py-3 text-rose-800 shadow-md animate-in slide-in-from-top duration-300">
          {errorMsg}
        </div>
      )}

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un diagnostique..."
          className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Toggleable Form */}
      <div className="mb-8 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300">
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="w-full bg-indigo-100 text-indigo-800 font-semibold py-3 px-6 flex justify-between items-center hover:bg-indigo-200 transition-all duration-200 rounded-t-lg"
        >
          <span>{isFormOpen ? "Masquer le formulaire" : "Ajouter un diagnostique"}</span>
          <svg
            className={`h-5 w-5 transform ${isFormOpen ? "rotate-180" : ""} transition-transform duration-200`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isFormOpen && (
          <form
            onSubmit={handleAddDiagnostique}
            className="p-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4 bg-white rounded-b-lg border-t border-slate-200"
          >
            <textarea
              value={newDiag.description}
              onChange={(e) => {
                setNewDiag({ ...newDiag, description: e.target.value });
                if (!e.target.value.trim()) setErrorMsg("La description est obligatoire.");
                else setErrorMsg("");
              }}
              placeholder="Nouvelle description du diagnostique"
              className="flex-1 rounded-lg border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400 resize-none"
              rows={4}
              required
            />
            <input
              type="date"
              value={newDiag.date}
              onChange={(e) => setNewDiag({ ...newDiag, date: e.target.value })}
              className="w-48 rounded-lg border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm text-slate-800"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isSubmitting ? "Ajout…" : "Ajouter"}
            </button>
          </form>
        )}
      </div>

      {/* Table des diagnostiques */}
      {sortedDiagnostiques.length === 0 ? (
        <p className="text-center text-slate-600 text-lg animate-in fade-in duration-500">
          Aucun diagnostique trouvé pour ce patient.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-lg bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-indigo-100 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 tracking-wide cursor-pointer" onClick={() => handleSort("date")}>
                  Date {sortConfig.key === "date" && (sortConfig.direction === "ascending" ? " ↑" : " ↓")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 tracking-wide cursor-pointer" onClick={() => handleSort("description")}>
                  Diagnostique {sortConfig.key === "description" && (sortConfig.direction === "ascending" ? " ↑" : " ↓")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {currentPageData.map((d) => {
                const isEditing = editingId === d.id;
                return (
                  <tr key={d.id} className="hover:bg-indigo-50 transition-all duration-200 transform hover:scale-[1.01] cursor-pointer">
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editData.date}
                          onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                          className="w-32 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        d.description
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(d.id)}
                              disabled={busyRow === d.id}
                              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {busyRow === d.id ? "Sauvegarde…" : "Sauvegarder"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(d)}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                          >
                            Modifier
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-slate-200 text-sm text-slate-600 bg-slate-50">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105">Précédent</button>
              <span className="font-medium">Page {page} / {pageCount}</span>
              <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105">Suivant</button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-6 py-3 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
      >
        Retour
      </button>
    </div>
  );
}
