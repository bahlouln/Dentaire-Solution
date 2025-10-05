import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../../api.js";

const PAGE_SIZE_DEFAULT = 10;

export default function useDentistes(options = {}) {
    const pageSize = options.pageSize ?? PAGE_SIZE_DEFAULT;

    const [dentistes, setDentistes] = useState([]);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const abortRef = useRef(null);

    const fetchDentistes = useCallback(async () => {
        setLoading(true);
        setErrorMsg("");
        abortRef.current?.abort?.();
        abortRef.current = new AbortController();

        try {
            const data = await api.admin.dentistes.list(abortRef.current);
            setDentistes(Array.isArray(data) ? data : []);
        } catch (e) {
            if (e.name !== "CanceledError" && e.name !== "AbortError") {
                console.error("Erreur récupération dentistes:", e);
                setErrorMsg("Impossible de récupérer les dentistes.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDentistes();
        return () => abortRef.current?.abort?.();
    }, [fetchDentistes]);

    // Recherche
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

    // Pagination
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageSafe = Math.min(page, pageCount);
    const rows = useMemo(() => {
        const start = (pageSafe - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, pageSafe, pageSize]);

    useEffect(() => {
        if (page > pageCount) setPage(1);
    }, [page, pageCount]);

    // CRUD actions
    const updateDentiste = useCallback(async (id, payload) => {
        try {
            await api.admin.dentistes.update(id, payload);
            setDentistes((prev) =>
                prev.map((d) =>
                    (d.id || d._id) === id
                        ? { ...d, User: { ...d.User, nom: payload.nom, email: payload.email }, specialite: payload.specialite }
                        : d
                )
            );
            return { ok: true };
        } catch (e) {
            console.error("Erreur update:", e);
            return { ok: false, message: "Impossible de mettre à jour le dentiste." };
        }
    }, []);

    const deleteDentiste = useCallback(async (id) => {
        const prev = dentistes;
        setDentistes((list) => list.filter((d) => (d.id || d._id) !== id));
        try {
            await api.admin.dentistes.remove(id);
            return { ok: true };
        } catch (e) {
            console.error("Erreur suppression dentiste:", e);
            setDentistes(prev);
            return { ok: false, message: "Impossible de supprimer le dentiste." };
        }
    }, [dentistes]);

    return {
        // state
        dentistes,
        rows,
        query, setQuery,
        page, setPage,
        pageCount, pageSafe,
        loading, errorMsg, setErrorMsg,

        // actions
        refetch: fetchDentistes,
        updateDentiste,
        deleteDentiste,
    };
}
