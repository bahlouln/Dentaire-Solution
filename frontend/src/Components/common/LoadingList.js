export default function LoadingList() {
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
