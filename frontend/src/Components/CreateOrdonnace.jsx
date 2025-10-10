import React, { useState } from "react";
import jsPDF from "jspdf";

export default function CreateOrdonnance() {
  const [medicaments, setMedicaments] = useState([{ nom: "", duree: "" }]);
  const [patient, setPatient] = useState({ name: "", address: "", age: "", diagnosis: "" });
  const [showForm, setShowForm] = useState(false);

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

  // 🧑 Modifier les informations du patient
  const handlePatientChange = (field, value) => {
    setPatient({ ...patient, [field]: value });
  };

  // 🖨️ Imprimer
  const handlePrint = () => {
    window.print();
  };

  // 💾 Générer le PDF
  const handlePDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString("fr-FR");

    // Header
    doc.setFillColor(0, 173, 239); // Light blue background
    doc.rect(0, 0, 210, 50, "F");
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(20);
    doc.text("Dr. Doctor Name", 70, 20);
    doc.setFontSize(12);
    doc.text("HOSPITAL", 170, 10);
    doc.text("Certification: xyz-abc", 170, 20);

    // Patient Details
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFontSize(12);
    doc.text("Patient Name:", 20, 60);
    doc.line(20, 62, 190, 62);
    doc.text("Address:", 20, 70);
    doc.line(20, 72, 190, 72);
    doc.text("Age:", 20, 80);
    doc.line(20, 82, 190, 82);
    doc.text("Date:", 20, 90);
    doc.line(20, 92, 190, 92);
    doc.text("Diagnosis:", 20, 100);
    doc.line(20, 102, 190, 102);

    // Fill in data
    doc.text(patient.name, 70, 60);
    doc.text(patient.address, 70, 70);
    doc.text(patient.age, 70, 80);
    doc.text(currentDate, 70, 90);
    doc.text(patient.diagnosis, 70, 100);

    // Rx Section
    doc.setFillColor(0, 0, 255); // Blue for Rx
    doc.rect(20, 110, 20, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("Rx", 25, 125);

    // Medications
    doc.setTextColor(0, 0, 0);
    medicaments.forEach((m, i) => {
      doc.text(`${i + 1}. ${m.nom}`, 50, 140 + i * 20);
      doc.text(`Durée: ${m.duree}`, 50, 148 + i * 20);
    });

    // Footer
    doc.setTextColor(0, 173, 239); // Light blue text
    doc.text("Tel: 95-77-93-45-16", 20, 270);
    doc.text("email: here@gmail.com", 20, 280);
    doc.text("www.webpage.com", 20, 290);

    doc.save(`ordonnance_${patient.name || "patient"}.pdf`);
  };

  // 🚫 Annuler et cacher le formulaire
  const handleCancel = () => {
    setShowForm(false);
    setMedicaments([{ nom: "", duree: "" }]);
    setPatient({ name: "", address: "", age: "", diagnosis: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          ➕ Créer une ordonnance
        </button>
      ) : (
        <div className="max-w-2xl mx-auto mt-6 bg-white shadow-xl p-8 rounded-xl">
          <div className="border-b-2 border-blue-500 pb-4 mb-6">
            <h2 className="text-3xl font-bold text-center text-blue-700">Dr. Doctor Name</h2>
            <div className="flex justify-between text-sm text-gray-600">
              <span>HOSPITAL</span>
              <span>Certification: xyz-abc</span>
            </div>
          </div>

          {/* Section Patient */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Informations du Patient</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600">Patient Name:</label>
                <input
                  type="text"
                  value={patient.name}
                  onChange={(e) => handlePatientChange("name", e.target.value)}
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-600">Address:</label>
                <input
                  type="text"
                  value={patient.address}
                  onChange={(e) => handlePatientChange("address", e.target.value)}
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-600">Age:</label>
                <input
                  type="text"
                  value={patient.age}
                  onChange={(e) => handlePatientChange("age", e.target.value)}
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-600">Date:</label>
                <input
                  type="text"
                  value={new Date().toLocaleDateString("fr-FR")}
                  readOnly
                  className="border border-gray-300 p-2 rounded w-full bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-600">Diagnosis:</label>
                <input
                  type="text"
                  value={patient.diagnosis}
                  onChange={(e) => handlePatientChange("diagnosis", e.target.value)}
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

          {/* Boutons d'action */}
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

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Tel: 95-77-93-45-16</p>
            <p>email: here@gmail.com</p>
            <p>www.webpage.com</p>
          </div>
        </div>
      )}
    </div>
  );
}