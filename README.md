# 🏥 Cabinet Médical Santé & Soins — Application Web Complète

Application web de gestion intégrale d'un cabinet médical de médecine générale, conçue selon le cahier des charges officiel.

- **Frontend :** React (Vite) — Design moderne, dynamique et épuré avec couleurs claires (Bleu médical, Cyan, Blanc, Ombres douces, Badges de statut, Icônes vectorielles).
- **Backend :** Laravel 12 (API RESTful avec authentification Sanctum).
- **Base de données :** MySQL (compatible phpMyAdmin / XAMPP).

---

## 🚀 Accès Rapide aux Services (Serveurs Actifs)

| Interface | URL | Description |
| :--- | :--- | :--- |
| **Site Public & Prise de RDV** | [http://localhost:5173/](http://localhost:5173/) | Accueil du cabinet, présentation, horaires, prise de RDV en ligne |
| **Espace Médecin (Connexion)** | [http://localhost:5173/connexion](http://localhost:5173/connexion) | Accès sécurisé au tableau de bord médecin |
| **Tableau de Bord Médecin** | [http://localhost:5173/app](http://localhost:5173/app) | Espace de gestion global du cabinet |
| **API Laravel** | [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api) | Points d'accès RESTful |
| **phpMyAdmin** | [http://localhost/phpmyadmin](http://localhost/phpmyadmin) | Base de données `cabinet_medical` |

### 🔑 Identifiants Médecin (Démo)
- **E-mail :** `medecin@cabinet.local`
- **Mot de passe :** `password`
*(Un bouton « Remplir » en 1 clic est disponible directement sur la page de connexion).*

---

## ✨ Modules & Fonctionnalités Implémentés

### 1. Espace Public & Prise de Rendez-vous Patients (`/` & `/rendez-vous`)
- **Présentation du cabinet :** Titre, médecin, spécialité, adresse, carte/quartier, horaires d'ouverture et coordonnées.
- **Formulaire patient interactif :** Saisie du nom, prénom, téléphone, e-mail, sélection de la date avec calcul dynamique des créneaux horaires disponibles (`/public/slots`), motif de consultation et notes.
- **Confirmation immédiate :** Écran de récapitulatif avec consignes claires pour le patient.

### 2. Tableau de Bord Dynamique (`/app`)
- **Indicateurs clés (KPIs) en temps réel :** Nombre total de dossiers patients, consultations du jour, demandes de RDV en attente, ordonnances délivrées ce mois.
- **Barre d'actions rapides :** Boutons d'accès direct pour créer un patient, un RDV, ou une ordonnance.
- **File de traitement des demandes en ligne :** Carte d'alerte avec boutons en 1 clic **« Confirmer »** ou **« Refuser »**.
- **Planning des consultations du jour & derniers patients enregistrés.**

### 3. Gestion des Patients & Dossiers Médicaux (`/app/patients`)
- **Répertoire complet :** Recherche instantanée par nom, prénom, téléphone, filtre par groupe sanguin.
- **Création & modification :** Sexe, date de naissance, groupe sanguin, adresse, téléphone, e-mail, antécédents médicaux/chirurgicaux, allergies connues signalées par un badge d'alerte rouge.
- **Dossier Médical Partagé (`/app/patients/:id`) :**
  - **Onglet Consultations :** Historique chronologique, constantes vitales (Tension artérielle, Poids, Température), examen clinique, diagnostic posé, traitement prescrit.
  - **Onglet Ordonnances :** Historique des ordonnances délivrées avec réimpression et téléchargement PDF en 1 clic.
  - **Onglet Certificats :** Certificats délivrés au patient.
  - **Onglet Examens Radio :** Demandes d'imagerie associées au patient.

### 4. Agenda & Gestion des Rendez-vous (`/app/rendez-vous`)
- **Vue agenda :** Filtres par date (Aujourd'hui, Tous) et par statut (Confirmé, En attente, Terminé, Annulé).
- **Mise à jour rapide du statut :** Marquer un RDV comme « Terminé » ou « Annulé ».
- **Prise de RDV par le médecin :** Sélection d'un patient existant ou saisie d'un nouveau patient, date, heure, motif.
- **Onglet Demandes en attente :** Validation / refus des demandes transmises par les patients via le site web.

### 5. Studio d'Ordonnances Numériques (`/app/ordonnances`)
- **Prescription multi-médicaments dynamique :** Ajout illimité de lignes de médicaments avec sélection dans le catalogue ou saisie libre.
- **Détails thérapeutiques :** Dosage, posologie détaillée, durée du traitement, quantité prescrite, conseils hygiéno-diététiques.
- **Aperçu visuel A4 en direct :** Affichage d'une feuille d'ordonnance officielle avec en-tête du cabinet, coordonnées, logo, date, et zone de cachet/signature du médecin.
- **Export & Impression :** Bouton **« Imprimer directement »** (mise en page print CSS) et **« Télécharger le PDF officiel »** généré par Laravel DomPDF.

### 6. Attestations & Certificats Médicaux (`/app/attestations`)
- **Modèles intégrés :**
  - Certificat médical de repos (Arrêt de travail avec calcul des jours et dates début/fin).
  - Certificat médical d'aptitude physique et sportive.
  - Attestation de présence au cabinet.
  - Attestation de consultation médicale.
- **Génération automatique :** Injection du nom et des données du patient, aperçu en direct et export PDF officiel.

### 7. Demandes d'Examens Radiologiques (`/app/radiologie`)
- **Choix du type d'examen :** Radiographie standard, Échographie abdomino-pelvienne, Scanner TDM, IRM, Mammographie, Écho-Doppler.
- **Région anatomique :** Thorax, Rachis, Abdomen-pelvis, Genou, Épaule, etc.
- **Indication clinique & Renseignements médicaux.**
- **Mention d'urgence optionnelle (badge « URGENT »).**
- **Aperçu en direct & Téléchargement PDF.**

### 8. Base des Médicaments (`/app/medicaments`)
- **Catalogue thérapeutique :** Nom commercial / DCI, forme galénique (Comprimé, Gélule, Sirop, Injectable, etc.), dosage, posologie par défaut, laboratoire.
- **CRUD complet :** Ajout, modification, suppression et recherche en direct.

### 9. Configuration du Cabinet & Sauvegarde (`/app/parametres`)
- **Identité du cabinet :** Nom, médecin, spécialité, téléphone, e-mail, adresse, ville, code postal, texte de présentation, horaires.
- **Personnalisation graphique :** Téléversement du logo du cabinet pour en-tête des documents officiels.
- **Sauvegarde des données :** Bouton d'exportation complète de la base de données au format JSON normalisé (`/api/backup`).
- **Créneaux et disponibilités hebdomadaires.**

---

## 🛠️ Commandes Utiles

### Démarrer le Backend Laravel
```bash
cd backend
php artisan serve --port=8000
```

### Démarrer le Frontend React
```bash
cd frontend
npm run dev
```

### Réinitialiser la base de données (si besoin)
```bash
cd backend
php artisan migrate:fresh --seed
```
