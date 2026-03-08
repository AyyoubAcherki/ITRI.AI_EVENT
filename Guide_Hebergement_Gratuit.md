# Guide d'Hébergement Gratuit pour la Plateforme de Billetterie AI ITRI NTIC EVENT

Ce document décrit comment déployer l'architecture complète du projet (Frontend React, Backend Laravel, et Envoi d'Emails) sans frais.

## 1. Hébergement du Frontend (React / Vite)

**Recommandation : Vercel**
Vercel est une plateforme cloud conçue spécialement pour les frameworks frontend modernes. Elle est ultra-rapide et gratuite pour les projets personnels.

* **Avantages :** 100% gratuit, déploiement automatique à chaque modification, liens HTTPS sécurisés.
* **Étapes clés :**
    1. Publiez votre dossier `frontend` sur un dépôt GitHub (privé ou public).
    2. Créez un compte sur [Vercel](https://vercel.com/) et connectez-le à votre GitHub.
    3. Importez votre projet. Vercel détectera automatiquement l'utilisation de Vite.
    4. Configurez la variable d'environnement `VITE_API_BASE_URL` pour pointer vers votre futur backend.
    5. Déployez.

---

## 2. Hébergement du Backend (Laravel)

**Recommandation (avec base SQLite) : AlwaysData**
Comme le projet utilise actuellement une base de données SQLite (un fichier local `database.sqlite`), il est crucial de choisir un hébergeur qui conserve les fichiers locaux, contrairement à Heroku par exemple.

* **Alternatives :** InfinityFree (si vous migrez vers MySQL).
* **Étapes clés (AlwaysData) :**
    1. Créez un compte gratuit sur [AlwaysData](https://www.alwaysdata.com/) (100 Mo offerts).
    2. Transférez le contenu de votre dossier `backend` via FTP (par ex., FileZilla).
    3. Dans le panel d'administration AlwaysData, configurez le point d'entrée (Document Root) vers le dossier `backend/public`.

---

## 3. Système d'Envoi d'Emails (Confirmation de Billets)

**Recommandation : Brevo (ex-Sendinblue)**
Les fonctions d'envoi d'emails natives (PHP mail) proposées par les hébergeurs gratuits (comme InfinityFree ou AlwaysData) atterrissent presque toujours dans les spams ou sont bloquées. Pour des confirmations de réservation professionnelles et fiables, un serveur SMTP externe est indispensable.

* **Avantages :** 100% gratuit (jusqu'à 300 emails/jour), livraison garantie en boîte de réception, simple à lier avec Laravel.
* **Étapes clés :**
    1. Créez un compte gratuit sur [Brevo](https://www.brevo.com/fr/).
    2. Allez dans la section SMTP & API pour obtenir vos identifiants SMTP (Serveur, Port, Utilisateur, Mot de passe).
    3. Mettez à jour le fichier `.env` sur le serveur backend avec ces identifiants :

        ```env
        MAIL_MAILER=smtp
        MAIL_HOST=smtp-relay.brevo.com
        MAIL_PORT=587
        MAIL_USERNAME=votre-email@exemple.com
        MAIL_PASSWORD=votre-mot-de-passe-smtp
        MAIL_ENCRYPTION=tls
        MAIL_FROM_ADDRESS="itriainticevent@gmail.com"
        MAIL_FROM_NAME="AI ITRI Event 2026"
        ```

    4. Laravel utilisera automatiquement ce serveur sécurisé pour expédier les billets.

## Synthese de l'Architecture Gratuite

- 🌐 **Interface Utilisateur :** Vercel
* ⚙️ **Serveur & Données :** AlwaysData
* 📧 **Communications :** Brevo
