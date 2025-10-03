export default function ErrorBanner({ message }) {
    if (!message) return null;
    return (
        <div className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
            <p className="text-sm">{message}</p>
        </div>
    );
}
