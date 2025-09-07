# Configuration Google reCAPTCHA

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env` :

```env
# Google reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

## Étapes de configuration

### 1. Créer un projet reCAPTCHA

1. Allez sur [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Cliquez sur "Créer" pour créer un nouveau site
3. Remplissez les informations :
   - **Label** : CardMyAnime
   - **Type de reCAPTCHA** : reCAPTCHA v2 ("Je ne suis pas un robot")
   - **Domaines** : 
     - `localhost` (pour le développement)
     - `cma.ascencia.re` (pour la production)

### 2. Récupérer les clés

Après création, vous obtiendrez :
- **Clé du site** → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- **Clé secrète** → `RECAPTCHA_SECRET_KEY`

### 3. Configuration des domaines

Assurez-vous d'ajouter tous les domaines où le reCAPTCHA sera utilisé :
- `localhost` (développement)
- `cma.ascencia.re` (production)
- Tous les sous-domaines si nécessaire

### 4. Test

Le reCAPTCHA est configuré pour :
- ✅ Thème sombre (compatible avec le design du site)
- ✅ Taille normale
- ✅ Validation côté serveur
- ✅ Gestion des erreurs et expiration

## Sécurité

- La clé secrète ne doit JAMAIS être exposée côté client
- Utilisez des variables d'environnement pour stocker les clés
- La validation se fait côté serveur via l'API `/api/recaptcha`

## Dépannage

### Erreur "Invalid site key"
- Vérifiez que `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` est correcte
- Vérifiez que le domaine est autorisé dans la console reCAPTCHA

### Erreur "Invalid secret key"
- Vérifiez que `RECAPTCHA_SECRET_KEY` est correcte
- Vérifiez que la clé secrète correspond au site

### reCAPTCHA ne s'affiche pas
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez que le script reCAPTCHA se charge correctement
