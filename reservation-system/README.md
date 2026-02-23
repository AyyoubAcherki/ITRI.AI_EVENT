# Système de Réservation Automatique (WhatsApp & Email)

Ce projet Node.js permet d'enregistrer les réservations, d'envoyer un message WhatsApp via l'API UltraMsg, et d'envoyer un email de confirmation.

## 🚀 1. Installation

1. Ouvrez un terminal dans ce dossier (`reservation-system`).
2. Installez les dépendances :

   ```bash
   npm install
   ```

## ⚙️ 2. Configuration (.env)

Créez un fichier `.env` à la racine de ce dossier avec vos informations SMTP pour envoyer les emails :

```env
# Configuration Email (Exemple Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.email@gmail.com
SMTP_PASS=votre_mot_de_passe_d_application
```

*Note : Pour Gmail, vous devez générer un "Mot de passe d'application" dans les paramètres de sécurité de votre compte Google.*

## ▶️ 3. Démarrage du serveur

Lancez le serveur avec la commande suivante :

```bash
npm start
```

Le serveur fonctionnera sur `http://localhost:3000`.

## 📩 4. Comment envoyer des données (Test)

Vous pouvez tester l'API en envoyant une requête `POST` à `http://localhost:3000/api/reservations`.

Exemple de requête (JSON) :

```json
{
  "name": "Jean Dupont",
  "phone": "212600000000",
  "email": "jean.dupont@example.com",
  "event_date": "14 Mai 2026",
  "event_time": "09:00"
}
```

### Exemple de Test avec cURL

```bash
curl -X POST http://localhost:3000/api/reservations \
-H "Content-Type: application/json" \
-d '{"name":"Jean","phone":"212650866320","email":"votre_email@test.com","event_date":"14 Mai 2026","event_time":"10:00"}'
```

---

### Explication du code

- **SQLite3** : Sauvegarde la réservation dans une base de données locale (`reservations.db`).
- **Axios / UltraMsg** : Envoie la requête à l'API UltraMsg pour distribuer le message WhatsApp.
- **Nodemailer** : Envoie un email de confirmation via le SMTP configuré.
