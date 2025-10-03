import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import useDentistes from "../hooks/useDentistes.js";
import SearchInput from "../../../components/common/SearchInput";
import ErrorBanner from "../../../components/common/ErrorBanner";
import Pagination from "../../../components/common/Pagination";
import LoadingList from "../../../components/common/LoadingList";
import EmptyState from "../../../components/common/EmptyState";
import DentistRow from "../../../components/admin/rows/DentistRow.jsx";
import { api } from "../../../api.js" ;

export default function ListeDentistes() {
    const navigate = useNavigate();
    const { user, loading: authLoading, isAuthenticated, logout } = useAuth();

    const {
        rows,
        query, setQuery,
        setPage,
        pageCount, pageSafe,
        loading, errorMsg, setErrorMsg,
        updateDentiste, deleteDentiste,
    } = useDentistes({ pageSize: 10 });

    const handleLogout = () => {
        api.auth.logout();
        logout?.();
        window.location.href = "/login";
    };

    if (loading || authLoading) return <LoadingList />;

    if (!isAuthenticated || !user?.token) {
        return <p className="text-center text-red-500">Vous devez être connecté pour voir les dentistes.</p>;
    }

    const handleAddDentiste = () => navigate("/admin/add-dentiste");

    const handleSave = async (id, formData) => {
        const res = await updateDentiste(id, formData);
        if (!res.ok) setErrorMsg(res.message);
        return res;
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce dentiste ?")) return;
        const res = await deleteDentiste(id);
        if (!res.ok) setErrorMsg(res.message);
    };

    return (
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
            <div className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
                {/* Header */}
                <div className="flex flex-col gap-3 rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Liste des dentistes</h2>
                        <p className="text-xs text-slate-600">Rechercher, éditer, supprimer. Données liées à votre compte admin.</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher (nom, email, spécialité)…" />
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

                <ErrorBanner message={errorMsg} />

                <div className="px-3 py-5 sm:px-5">
                    {rows.length === 0 ? (
                        <EmptyState onPrimary={handleAddDentiste} />
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
                                {rows.map((d) => (
                                    <DentistRow
                                        key={d.id || d._id}
                                        dentist={d}
                                        onSave={handleSave}
                                        onDelete={handleDelete}
                                    />
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <Pagination
                    page={pageSafe}
                    pageCount={pageCount}
                    total={/* filtered length = pageCount*pageSize approx; on simplifie en recalculant */ (pageCount === 1 ? rows.length : pageCount * 10)}
                    onPrev={() => setPage((p) => Math.max(1, p - 1))}
                    onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
                />
            </div>
        </div>
    );
}
