import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext";
export default function CreateOrdonnance() {
  const { user, loading } = useAuth(); // ✅ récupère le user connecté
  const token = user?.token;

  const [medicaments, setMedicaments] = useState([{ nom: "", duree: "" }]);
  const [patient, setPatient] = useState({ name: "", diagnosis: "" });
  const [patients, setPatients] = useState([]);
  const [msg, setMsg] = useState("");

  // ➕ Ajouter un nouveau médicament
  const addMedicament = () => {
    setMedicaments([...medicaments, { nom: "", duree: "" }]);
  };

  // 🧹 Modifier un médicament
  const handleMedicamentChange = (index, field, value) => {
    const updated = [...medicaments];
    updated[index][field] = value;
    setMedicaments(updated);
  };

  // 🧑 Modifier les infos patient
  const handlePatientChange = (field, value) => {
    setPatient({ ...patient, [field]: value });
  };

  // 🚀 Charger les patients du dentiste connecté
  useEffect(() => {
    const fetchPatients = async () => {
      if (!token) {
        setMsg("❌ Vous devez vous reconnecter");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/dentistes/patients", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data) ? res.data : res.data.patients;
        setPatients(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des patients:", error);
        setMsg("Impossible de charger les patients ❌");
      }
    };

    fetchPatients();
  }, [token]);

  // 🖨️ Imprimer
  const handlePrint = () => {
    window.print();
  };

  // 💾 Générer le PDF
  const handlePDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString("fr-FR");
    const currentTime = new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });

    // Header
    doc.setFillColor(255, 255, 255); // White background
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFontSize(14);
    doc.text("Cabinet du dentiste " + (user.nom ) + " " + (user.prenom ), 20, 15);
    doc.setFontSize(10);
    doc.text(`Tél: ${user.numero }`, 20, 25);

    // Add logo to the top right
    const logoImg = new Image();
    logoImg.src = '/logo.jpg'; // Path relative to public folder
    doc.addImage(logoImg, 'JPEG', 160, 5, 40, 30); // Position: x=160, y=5, width=40, height=30

    // Title and Date (Centered)
    doc.setFillColor(230, 230, 250); // Light lavender background
    doc.rect(50, 40, 110, 20, "F");
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFontSize(16);
    doc.text("Ordonnance pour " + (patient.name || "MONSIEUR PRENOM NOM"), 105, 52, { align: "center" });
    doc.setFontSize(12);
    doc.text(` ${currentDate} ${currentTime}`, 105, 60, { align: "center" });
// Medications
doc.setFontSize(12);
doc.text("Médicaments :", 20, 70);
medicaments.forEach((m, i) => {
  const y = 80 + i * 10; // ligne de base
  doc.text(`${i + 1}. ${m.nom}`, 20, y);        // Nom du médicament
  doc.text(`Durée : ${m.duree}`, 120, y);       // ✅ plus à droite pour espacement
});

    // Diagnosis
    doc.setFontSize(10);

    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Dr. " + (user.nom || "Nom inconnu") + " " + (user.prenom ), 105, 270, { align: "center" });
    doc.line(90, 272, 120, 272); // Signature line
    doc.setFontSize(8);
    doc.text("Membre d'une association agréée - Règlement par chèque accepté", 105, 280, { align: "center" });
    doc.setDrawColor(0, 0, 0);
    doc.line(20, 285, 190, 285); // Decorative line

    doc.save(`ordonnance_${patient.name || "patient"}.pdf`);
  };

  // 🚫 Annuler
  const handleCancel = () => {
    setMedicaments([{ nom: "", duree: "" }]);
    setPatient({ name: "", diagnosis: "" });
  };

  if (loading) return <p className="text-center mt-6">Chargement...</p>;
  if (!user) return <p className="text-center text-red-600 mt-6">Vous devez être connecté pour créer une ordonnance.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto mt-6 bg-white shadow-xl p-8 rounded-xl">
        <div className="border-b-2 border-blue-500 pb-4 mb-6">
          <h2 className="text-3xl font-bold text-center text-blue-700">Créer une Ordonnance</h2>
        </div>

        {msg && (
          <div className="mb-6 p-3 rounded-md bg-yellow-50 text-yellow-800 text-sm font-medium">
            {msg}
          </div>
        )}

        {/* Section Patient */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Informations du Patient</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-600">Patient :</label>
              <select
                value={patient.name}
                onChange={(e) => handlePatientChange("name", e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choisir un patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={`${p.nom} ${p.prenom}`}>
                    {p.nom} {p.prenom}
                  </option>
                ))}
              </select>
            </div>

            

            
          </div>
        </div>

        {/* Section Médicaments */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Médicaments</h3>
          {medicaments.map((m, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="Nom du médicament"
                value={m.nom}
                onChange={(e) => handleMedicamentChange(index, "nom", e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Durée (ex: 5 jours)"
                value={m.duree}
                onChange={(e) => handleMedicamentChange(index, "duree", e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            onClick={addMedicament}
            className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-green-600 transition-colors"
          >
            ➕ Ajouter un médicament
          </button>
        </div>

        
        {/* Boutons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handlePDF}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            💾 Enregistrer en PDF
          </button>
          <button
            onClick={handlePrint}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            🖨️ Imprimer
          </button>
          <button
            onClick={handleCancel}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            🚫 Annuler
          </button>
        </div>
      </div>
    </div>
  );
}