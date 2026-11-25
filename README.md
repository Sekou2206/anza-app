# Anza, application client, formule Magasin

Application web installable (téléphone et ordinateur) avec comptes en ligne.
Chaque client crée son compte, fait l’entretien avec Nia, puis retrouve ses données sur tous ses appareils.

Fonctions : Parler à Nia (Claude), tableau de bord, CRM (liste et pipeline), relances, devis (PDF, WhatsApp), Nia (entretien de départ, question de la semaine, journal), séquenceur de stories, carrousels et posts Instagram et LinkedIn, calendrier, bilan du mois, charte et bio, landing page (Boutique), IA personnelle et accompagnement (Magasin), réglages, export et suppression des données.

## 1. Tester tout de suite, sans serveur

Laissez `supabaseUrl` vide dans `config.js` : l’application fonctionne en mode local (données dans le navigateur).

    python3 -m http.server 8080

puis ouvrez http://localhost:8080

## 2. Créer la base de données (Supabase, gratuit)

1. Créez un compte sur supabase.com, puis **New project**. Région : **Europe (Paris ou Francfort)** pour le RGPD.
2. **SQL Editor** : collez tout le fichier `setup.sql`, puis **Run**.
3. **Project Settings > API Keys** : copiez l’URL du projet et la **Publishable key** (elle commence par `sb_publishable_`) dans `config.js` :

       supabaseUrl: 'https://xxxx.supabase.co',
       supabaseAnonKey: 'sb_publishable_...',

   Cette clé est faite pour être publique. Ne mettez jamais la **Secret key** dans l’application.
4. **Authentication > URL Configuration** :
   - Site URL : l’adresse finale, par exemple `https://app.anza.website`
   - Redirect URLs : la même adresse, plus `http://localhost:8080` pour vos tests

## 3. Les emails (obligatoire avant d’ouvrir aux clients)

Supabase n’envoie les emails de confirmation et de mot de passe oublié qu’aux membres de votre équipe tant qu’aucun serveur d’envoi n’est configuré.

**Authentication > Emails > SMTP Settings** : activez le SMTP avec votre boîte IONOS `contact@anza.website`
- Hôte : `smtp.ionos.fr`, port `587`
- Identifiant : `contact@anza.website`, mot de passe de la boîte
- Nom de l’expéditeur : `Anza`

**Authentication > Emails > Templates**, en français :

*Confirm signup* · Objet : `Confirmez votre compte Anza`

    <h2>Bienvenue sur Anza</h2>
    <p>Cliquez sur le lien ci dessous pour confirmer votre adresse et accéder à votre espace.</p>
    <p><a href="{{ .ConfirmationURL }}">Confirmer mon compte</a></p>
    <p>L’équipe Anza</p>

*Reset password* · Objet : `Votre nouveau mot de passe Anza`

    <h2>Mot de passe oublié</h2>
    <p>Cliquez sur le lien ci dessous pour choisir un nouveau mot de passe.</p>
    <p><a href="{{ .ConfirmationURL }}">Choisir un nouveau mot de passe</a></p>
    <p>Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.</p>

## 4. Mettre en ligne

GitHub Pages (gratuit) :

    cd anza-app && git init && git add -A && git commit -m "Anza app" && git branch -M main
    gh repo create anza-app --public --source=. --push

Puis **Settings > Pages > Deploy from branch > main**. Pour `app.anza.website` : le fichier `CNAME` est déjà fourni (modifiez le si vous changez d’adresse), et chez IONOS un enregistrement DNS **CNAME** `app` vers `sekou2206.github.io`.

## 5. Connecter Nia à une IA (formule Magasin)

Nia fonctionne sans IA grâce à ses modèles intégrés. Connectée à une IA, elle mène un vrai entretien, rebondit sur chaque réponse, choisit la question de la semaine, en tire des actions concrètes (profil, mémoire, publications planifiées), écrit stories, posts, relances, bios et landing page, et répond librement dans « Parler à Nia ».

À faire seulement au premier client Magasin. D’ici là, laissez `aiServer: false` dans `config.js` : Nia utilise ses modèles intégrés, sans coût. Une fois la fonction et la clé en place, passez `aiServer: true` et `allowOwnKey: false` et publiez : tous les clients Magasin utilisent alors votre clé, sans rien connecter. Avec `allowOwnKey: true`, chaque client Magasin peut brancher sa propre clé Claude depuis l’app.

La clé de l’IA ne doit jamais être dans l’application : elle reste sur le serveur, dans la fonction `nia`.

1. Supabase > **Edge Functions > Deploy a new function > Via Editor**. Nom : `nia`. Remplacez le code d’exemple par tout le fichier `nia-edge-function.ts`, puis **Deploy function**. Dans les réglages de la fonction, désactivez **Verify JWT** : la fonction vérifie elle même l’utilisateur connecté.
2. Supabase > **Edge Functions > Secrets** : ajoutez les secrets de l’IA choisie, puis **Save**.

**Claude (recommandé, c’est avec lui que Nia a été réglée)**
- Sur platform.claude.com : **API Keys > Create Key**, ajoutez des crédits dans **Billing**, fixez une limite de dépense.
- Secret `ANTHROPIC_API_KEY` = la clé (`sk-ant-...`).
- Facultatif : `NIA_MODEL` = `claude-sonnet-5-5` (par défaut), `claude-opus-5-5` (plus fin), `claude-haiku-5-5` (moins cher).

**OpenAI (ChatGPT)**
- `NIA_PROVIDER` = `openai`
- `OPENAI_API_KEY` = la clé créée sur platform.openai.com
- `NIA_MODEL` = le nom exact d’un modèle de la page Models d’OpenAI (obligatoire)

**Mistral (français, hébergé en Europe)**
- `NIA_PROVIDER` = `mistral`
- `MISTRAL_API_KEY` = la clé créée sur console.mistral.ai
- `NIA_MODEL` = par exemple `mistral-large-latest` (obligatoire)

**Z.ai (GLM)**
- `NIA_PROVIDER` = `zai`
- `ZAI_API_KEY` = la clé créée sur z.ai
- `NIA_MODEL` = par exemple `glm-5.3` (obligatoire)
- Société basée en Chine : données envoyées hors de l’Union européenne, à éviter pour des clients européens.

**Toute autre IA compatible OpenAI** (OpenRouter, Groq, un serveur privé…)
- `NIA_PROVIDER` = `custom`
- `NIA_BASE_URL` = l’adresse de l’API, par exemple `https://openrouter.ai/api/v1`
- `NIA_API_KEY` = la clé
- `NIA_MODEL` = le nom du modèle chez ce fournisseur (obligatoire)
- Le modèle doit gérer l’appel d’outils (« tool calling » ou « function calling »). Si le fournisseur refuse le choix forcé de l’outil, la fonction réessaie toute seule en mode automatique (ou mettez `NIA_TOOL_CHOICE` = `auto`).

Réglages communs, facultatifs : `NIA_DAILY_LIMIT` (appels par client et par jour, 150 par défaut), `NIA_PLANS` (formules autorisées, `magasin` par défaut), `ALLOWED_ORIGIN` (adresse de l’application, par exemple `https://app.anza.website`).
Dans `config.js`, `aiName` est le nom affiché aux clients (« Connectée à Claude »). Mettez `'Mistral'`, `'ChatGPT'` ou ce que vous voulez.

3. Dans l’application : **Réglages > Tester la connexion**.

Changer d’IA plus tard : modifiez seulement les secrets, sans redéployer. Chaque appel est enregistré dans `ai_usage` ; la vue `ai_usage_month` donne la consommation par client et par mois.

**Mode test sans serveur** : si `supabaseUrl` est vide, les Réglages permettent de coller une clé Claude, enregistrée uniquement sur l’appareil. À réserver aux tests.

Le guide complet, étape par étape jusqu’à la livraison au client, est dans `Anza_Guide_installation.pdf`.

## 6. Gérer vos clients (Supabase > Table Editor)

- **Donner sa formule à un client** (avant ou après qu’il crée son compte), dans le SQL Editor :

      select give_plan('client@exemple.fr', 'boutique');

  Formules : `stand`, `boutique`, `magasin`, ou `attente` pour couper l’accès. Ou Table Editor > `plan_grants` > Insert row (email, plan). Un compte créé sans formule reste sur un écran d’attente et s’ouvre tout seul, en 30 secondes au plus, dès que la formule est donnée. Le client ne peut pas la modifier lui même. Le client ne peut pas la modifier lui même.
- **Vue d’ensemble** : la vue `clients_overview` liste les comptes, la formule, l’activité et la dernière activité.
- **Répondre à un message** (Magasin) : table `messages`, nouvelle ligne avec le `user_id` du client, `from_team` = true et votre réponse dans `body`.
- **Contenus préparés** (Magasin) : table `team_items` (`user_id`, `day`, `title`, `status` : `en_preparation`, `programme` ou `publie`).
- **Être prévenu d’un nouveau message** : Database > Webhooks sur la table `messages`, vers un scénario n8n qui vous envoie un email.

## Version 16 : studio photo, marque, ma page

### Mise à jour à faire une seule fois
1. Supabase > SQL Editor : collez tout `setup.sql` et lancez le (il est rejouable sans risque). Il crée les deux espaces de stockage (`media` privé pour les photos, `pages` public pour les pages en ligne), la table `pages` et la table `page_leads`, avec leurs règles de sécurité.
2. Poussez le dossier sur GitHub comme d’habitude. Le dossier `p/` contient la page publique : `https://app.anza.website/p/?adresse-du-client`.
3. Rien d’autre : aucune clé secrète n’est ajoutée, seule la clé publishable est utilisée.

### Ce qui est nouveau
- **Photothèque** : import de photos et du logo, compression automatique, stockage privé par client, synchronisé entre appareils. 40 photos au Stand, 150 à la Boutique, 500 au Magasin.
- **Stories, carrousels et posts** : photos intégrées dans les images (plein cadre, encadrée, en haut), cadrage, logo en filigrane, six polices, quatre fonds, brouillons gardés, types Occasion (fêtes du calendrier français) et Objection (tirées du client idéal), Instagram, LinkedIn, Facebook, TikTok, format portrait ou carré.
- **Publier** : vérification automatique (tirets, emojis, tu ou vous, bouton, hashtags, photos floues) avec correction en un clic, puis partage. Sur téléphone, l’application choisie s’ouvre avec les images. Sur ordinateur, ZIP téléchargé, légende copiée, plateforme ouverte. La publication automatique par les API Meta et LinkedIn demandera une app validée par ces plateformes.
- **Hashtags** : 5 au maximum pour Instagram (règle Instagram depuis décembre 2025), 3 pour LinkedIn, locaux et renouvelés chaque semaine.
- **Client idéal** : questionnaire, profils, hésitations et réponses, où les trouver, client à éviter, fiche PDF. Enrichi par Nia au Magasin. Tous les contenus s’en servent.
- **Charte** : logo, couleurs extraites du logo ou des photos, palettes prêtes, polices, import et export, charte PDF.
- **Bios** : Instagram, TikTok, Facebook, WhatsApp Business, LinkedIn, fiche Google, avec score.
- **Ma page** : lien en bio hébergé (Stand), page complète avec galerie, avis, FAQ et demande de rendez vous (Boutique). Les demandes arrivent toutes seules dans les clients.
- **Kit de marque** (Boutique) : voix de marque, pitchs, couvertures de highlights, bannières, carte de visite et flyer avec QR code, story avis, kit presse PDF.
- **Vendre** : acompte sur les devis avec lien de paiement, rappel de rendez vous la veille, lien d’avis Google, ajout d’un contact depuis un message collé, conditions générales de vente (Boutique).
- **Net en poche** : cotisations URSSAF 2026 (12,3 %, 21,2 %, 25,6 %, 23,2 %), versement libératoire, plafonds 2026 (83 600 € et 203 100 €), seuil de TVA réglable.

### Sécurité
- Photos privées : chaque client ne lit et n’écrit que son dossier, double authentification respectée.
- Page publique : seules les colonnes utiles sont lisibles, rien d’autre du compte n’est exposé.
- Formulaire public : contrôlé côté base (page publiée, longueurs, dates), 20 demandes par heure et par page au maximum, champ piège contre les robots.
- Suppression du compte : photos et page supprimées avec les données.

## 7. À savoir

**Sécurité**
- Mot de passe effacé de la page dès la connexion, 10 caractères minimum avec lettres et chiffres.
- Politique de sécurité du contenu (CSP) : aucun script ni appel vers un domaine non autorisé, affichage bloqué dans un site tiers.
- Double authentification (TOTP) au choix de chaque client dans ses Réglages, imposée ensuite par la base (politiques restrictives) et par la fonction Nia.
- Captcha Cloudflare Turnstile : mettez la Site Key dans `turnstileSiteKey` de `config.js`, publiez, puis activez le captcha dans Supabase avec la Secret Key.
- Clé Claude personnelle effacée à la déconnexion. Données importées vérifiées avant chargement.
- Dans Supabase : longueur minimale 10 avec lettres et chiffres, Secure email change et Secure password change, protection contre les mots de passe piratés et délai d’inactivité (plan Pro), Security Advisor une fois par mois. Double authentification sur Supabase, GitHub, IONOS et platform.claude.com.

**Protection des données**
- Deux appareils modifiés en même temps : l’application fusionne les changements (contacts, devis, calendrier, mémoire de Nia) au lieu d’écraser l’un par l’autre.
- Hors ligne, tout reste enregistré sur l’appareil et part dès le retour du réseau. La déconnexion est bloquée tant que des modifications ne sont pas envoyées.
- Les 30 dernières versions des données de chaque client sont gardées dans `anza_history` (au plus une par heure d’activité). Le client peut revenir à une version depuis Réglages > Versions précédentes, l’état actuel est gardé lui aussi.
- Mise à jour d’une installation existante : relancez simplement `setup.sql` dans le SQL Editor, il ne supprime rien.

- Un projet Supabase gratuit se met en pause après 7 jours sans activité. Passez au plan Pro (environ 25 $ par mois) dès les premiers clients payants.
- Chaque client peut exporter ses données et supprimer son compte depuis les Réglages (RGPD).
- Sans clé Claude, Nia utilise ses modèles intégrés : aucun coût, aucune donnée envoyée à un service d’IA.
- Avec une IA connectée, les réponses de l’utilisateur et son profil sont envoyés au fournisseur (Anthropic, OpenAI, Mistral…) pour générer les textes. Mentionnez ce fournisseur comme sous traitant dans la politique de confidentialité.
- Coût indicatif avec Claude Sonnet 5.5 : quelques centimes par action. Suivez la consommation réelle dans la console Claude et dans `ai_usage_month`.
- Mettez à jour la politique de confidentialité du site pour l’application : hébergement des données chez Supabase (Union européenne), finalité, durée de conservation.


## Version 18 : équipes et bloc notes

1. Relancez **tout** le fichier `setup.sql` dans Supabase, SQL Editor (il est fait pour être relancé sans risque). Il ajoute la table `team_members`, la fonction `my_workspace` et met à jour les règles d’accès.
2. Places par formule : Le Stand 1 utilisateur, La Boutique 3 (le responsable et 2 membres), Le Magasin sans limite.
3. Le responsable ajoute ses membres dans Réglages, carte « Votre équipe ». Chaque membre crée son compte avec l’adresse ajoutée et arrive directement dans l’espace du responsable.
4. Accès : Administrateur (tout sauf l’équipe et la suppression du compte), Membre (clients, devis, relances, contenus, notes), Lecture seule.
5. Nouveau menu « Bloc notes » : notes par catégorie, épinglées, liées à un client, listes à cocher, signées par leur auteur.
