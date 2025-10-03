export default function EmptyState({ onPrimary }) {
    return (
        <div className="mx-auto grid max-w-xl place-items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <div className="h-14 w-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
            <h3 className="text-base font-semibold text-slate-900">Aucun dentiste</h3>
            <p className="text-sm text-slate-600">Ajoutez votre premier dentiste pour commencer.</p>
            <button
                onClick={onPrimary}
                className="mt-1 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
                Ajouter dentiste
            </button>
        </div>
    );
}
