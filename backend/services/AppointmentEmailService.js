import emailjs from '@emailjs/nodejs';

export default class AppointmentEmailService {
  constructor(opts = {}) {
    this.serviceId  = "service_fcbxjzr";
    this.templateId = "template_nzkjzap";
    this.publicKey  = "DodYEy8l-QAHoehhy";
    this.privateKey = "8XJNm9J6z7eIOrmtX80CB";

    if (!this.serviceId || !this.templateId || !this.publicKey || !this.privateKey) {
      // On log seulement (pas de throw) pour ne pas casser la création du RDV
      console.warn('⚠️ EmailJS non configuré : vérifie les variables .env');
    }

    this.appName = process.env.APP_NAME || 'Dentaire';
    this.appUrl  = process.env.APP_DASHBOARD_URL || 'https://dentaire.local';
  }

  getPersonName(p) {
    if (!p) return 'Patient';
    if (p.raisonSociale) return p.raisonSociale;
    if (p.prenom && p.nom) return `${p.prenom} ${p.nom}`;
    return p.nom || p.prenom || 'Patient';
  }

  getDentistName(d) {
    if (!d) return 'Dentiste';
    if (d.titre && (d.nom || d.prenom)) return `${d.titre} ${d.prenom || ''} ${d.nom || ''}`.trim();
    if (d.user?.nom || d.user?.prenom) return `${d.user?.prenom || ''} ${d.user?.nom || ''}`.trim();
    return d.nom || d.prenom || 'Dentiste';
  }

  // Utilitaire format date/heure FR (ou ar-TN en option)
  formatDateTime(dt, locale = 'fr-FR', tz = 'Africa/Tunis') {
    try {
      return new Date(dt).toLocaleString(locale, {
        timeZone: tz,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dt);
    }
  }

  /**
   * Envoie un email au dentiste quand un RDV est créé.
   * @param {Object} payload
   * @param {Object} payload.dentiste   (doit contenir email ou user.email)
   * @param {Object} payload.patient    (nom/prenom/tel/email, etc.)
   * @param {Object} payload.rendezvous ({ id, dateDebut, dateFin, notes, createdBy })
   * @returns Promise<{success:boolean, reason?:string, error?:string}>
   */
  async sendAppointmentCreated({ dentiste, patient, rendezvous }) {
    const toEmail =
      dentiste?.email ||
      dentiste?.user?.email ||
      dentiste?.User?.email; // selon ORM

    if (!toEmail) return { success: false, reason: 'dentist_no_email' };
    if (!this.serviceId || !this.templateId || !this.publicKey || !this.privateKey) {
      return { success: false, reason: 'emailjs_not_configured' };
    }

    // Construction des variables pour le template EmailJS
    const params = {
      // champs "To email" dans le template
      to_email: toEmail,

      // Sujet/entêtes
      subject: `🗓️ Nouveau rendez-vous — ${this.getPersonName(patient)}`,

      // Variables affichées dans le corps du mail
      dentist_name: this.getDentistName(dentiste),
      patient_name: this.getPersonName(patient),
      appt_datetime: this.formatDateTime(rendezvous?.dateDebut),
      appt_datetime_end: rendezvous?.dateFin ? this.formatDateTime(rendezvous?.dateFin) : '',
      appt_notes: rendezvous?.notes || '',
      created_by: this.getPersonName(rendezvous?.createdBy) || 'Système',
      app_name: this.appName,
      app_url: this.appUrl,

      // timestamp d’envoi
      sent_at: this.formatDateTime(new Date())
    };

    try {
      const resp = await emailjs.send(
        this.serviceId,
        this.templateId,
        params,
        { publicKey: this.publicKey, privateKey: this.privateKey }
      );

      console.log('✅ Email RDV -> dentiste:', toEmail, resp?.status, resp?.text);
      return { success: true, recipient: toEmail, status: resp?.status, messageId: resp?.text };
    } catch (err) {
      const errText = err?.text || err?.message || String(err);
      console.error('❌ Email RDV (dentiste) échec:', toEmail, errText);
      return { success: false, error: errText, recipient: toEmail };
    }
  }
}