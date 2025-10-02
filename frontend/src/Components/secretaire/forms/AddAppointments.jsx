import { useState, useEffect } from "react"; 
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function AddAppointments() {
  const navigate = useNavigate();
  const { dateStr } = useParams();
  const { user, loading } = useAuth();
  const token = user?.token;

  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    dateDebut: dateStr ? new Date(dateStr).toISOString().slice(0, 16) : "",
    note: ""
  });
  const [msg, setMsg] = useState("");

  // ⚡ Charger les patients seulement si l'utilisateur est secrétaire et token existant
  useEffect(() => {
    const fetchPatients = async () => {
      if (!token) {
        setMsg("❌ Vous devez vous reconnecter");
        return;
      }

      if (user.role !== "secretaire") {
        setMsg("❌ Accès réservé aux secrétaires");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/secretaires/patients", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = Array.isArray(res.data) ? res.data : res.data.patients;
        setPatients(data || []);
      } catch (err) {
        console.error("Erreur patients:", err);
        setMsg("Impossible de charger les patients ❌");
        setPatients([]);
      }
    };

    fetchPatients();
  }, [token, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!token) {
      setMsg("❌ Vous devez vous reconnecter");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/agenda/rendezvous", form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMsg("Rendez-vous créé avec succès ✅");
      setTimeout(() => navigate("/calendar"), 1200);
    } catch (error) {
      console.error(error);
      setMsg(error.response?.data?.message || "Erreur lors de la création");
    }
  };

  if (loading) return <p className="text-center mt-4">Chargement…</p>;
  if (!user) return <p className="text-center mt-4 text-red-600">Vous devez être connecté pour créer un rendez-vous.</p>;
  if (user.role !== "secretaire") return <p className="text-center mt-4 text-red-600">Accès réservé aux secrétaires.</p>;

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">Nouveau rendez-vous</h2>
          <button
            type="button"
            onClick={() => navigate("/add-patient")}
            className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition duration-200"
          >
            Nouveau patient ?
          </button>
        </div>

        {msg && (
          <div className="mb-6 p-3 rounded-md bg-yellow-50 text-yellow-800 text-sm font-medium">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select
              name="patientId"
              value={form.patientId}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choisir un patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} {p.prenom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
            <input
              type="datetime-local"
              name="dateDebut"
              value={form.dateDebut}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}
