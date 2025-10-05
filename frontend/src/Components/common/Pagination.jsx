export default function Pagination({ page, pageCount, onPrev, onNext, total }) {
    if (pageCount <= 1) return null;
    return (
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
      <span>
        {total} résultat{total > 1 ? "s" : ""} • Page {page}/{pageCount}
      </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={onPrev}
                    disabled={page === 1}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Précédent
                </button>
                <button
                    onClick={onNext}
                    disabled={page === pageCount}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Suivant
                </button>
            </div>
        </div>
    );
}
