export default function SearchInput({ value, onChange, placeholder = "Rechercher…" }) {
    return (
        <div className="relative">
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-9 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 sm:w-80"
            />
            <span className="pointer-events-none absolute inset-y-0 right-2 my-auto text-slate-400">⌘K</span>
        </div>
    );
}
