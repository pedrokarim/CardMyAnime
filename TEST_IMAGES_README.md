# 🖼️ Tests de Génération d'Images - CardMyAnime

Ce document explique comment utiliser les différentes routes de test pour résoudre le problème de génération d'images avec du texte valide sur Vercel.

## 🎯 Objectif

Tester différentes méthodes de génération d'images pour identifier laquelle fonctionne le mieux sur Vercel avec :
- ✅ Texte avec accents français
- ✅ Support des emojis
- ✅ Performance optimale
- ✅ Compatibilité Vercel

## 🚀 Routes de Test Disponibles

### 1. **@vercel/og - Méthode Officielle**
- **Route simple** : `/api/test-images`
- **Route avancée** : `/api/test-images/vercel-og-advanced`
- **Route hybride** : `/api/test-images/hybrid`
- **Route carte anime** : `/api/test-images/anime-card-sim`
- **Route test polices** : `/api/test-images/fonts-test`

### 2. **Canvas Natif**
- **Node Canvas** : `/api/test-images/canvas`
- **NAPI-RS Canvas** : `/api/test-images/napi-rs`

### 3. **Alternatives**
- **SVG Direct** : `/api/test-images/svg`
- **Sharp + SVG** : `/api/test-images/sharp`

## 🧪 Pages de Test

### Page Principale
- **URL** : `/test-images`
- **Fonctionnalités** :
  - Aperçu de toutes les méthodes
  - Statut de chaque route (succès/erreur)
  - Comparaison des performances
  - Liens directs vers chaque image

### Page Interactive
- **URL** : `/test-images/interactive`
- **Fonctionnalités** :
  - Test des paramètres dynamiques
  - Aperçu en temps réel
  - Tests rapides prédéfinis
  - Personnalisation des couleurs et tailles

## 📝 Utilisation des Routes

### Route Hybride (Paramètres Dynamiques)
```bash
# Texte personnalisé
/api/test-images/hybrid?text=Mon%20Texte&color=%23ff6b6b&size=large

# Paramètres disponibles :
# - text : Texte à afficher
# - color : Couleur principale (format hex)
# - size : Taille de police (small/medium/large)
```

### Route Carte Anime (Simulation Réelle)
```bash
# Carte personnalisée
/api/test-images/anime-card-sim?username=MonNom&anime=OnePiece&score=9.5

# Paramètres disponibles :
# - username : Nom d'utilisateur
# - anime : Titre de l'anime
# - score : Score moyen
# - platform : Plateforme (anilist/mal/nautiljon)
```

## 🔍 Tests Recommandés

### 1. **Test de Base**
```bash
# Tester chaque route individuellement
curl /api/test-images
curl /api/test-images/canvas
curl /api/test-images/napi-rs
```

### 2. **Test des Accents**
```bash
# Tester avec du texte français
/api/test-images/hybrid?text=Testé%20avec%20accents%20é%20è%20à%20ç%20ù
```

### 3. **Test des Emojis**
```bash
# Tester avec des emojis
/api/test-images/hybrid?text=🎌%20Test%20Emojis%20🍜%20🎭
```

### 4. **Test de Performance**
- Comparer les temps de réponse
- Vérifier la qualité des images
- Tester avec différents navigateurs

## 📊 Analyse des Résultats

### Métriques à Surveiller
1. **Succès de génération** : L'image se génère-t-elle ?
2. **Qualité du texte** : Les accents et emojis s'affichent-ils ?
3. **Performance** : Temps de réponse
4. **Compatibilité** : Fonctionne sur tous les navigateurs ?
5. **Taille des images** : Optimisation

### Interprétation
- ✅ **@vercel/og** : Solution officielle, optimisée pour Vercel
- ⚠️ **node-canvas** : Peut poser problème sur Vercel
- 🔄 **@napi-rs/canvas** : Alternative performante
- 📱 **SVG** : Léger et compatible
- 🚀 **Sharp** : Haute performance

## 🛠️ Dépannage

### Erreurs Courantes

#### 1. **Erreur Canvas sur Vercel**
```
Error: Canvas is not supported in this environment
```
**Solution** : Utiliser @vercel/og ou @napi-rs/canvas

#### 2. **Texte Corrompu**
```
Caractères bizarres au lieu d'accents
```
**Solution** : Vérifier l'encodage et utiliser des polices appropriées

#### 3. **Emojis Non Affichés**
```
Emojis remplacés par des carrés
```
**Solution** : Utiliser des polices qui supportent les emojis

### Logs de Debug
```bash
# Vérifier les logs Vercel
vercel logs

# Tester en local
npm run dev
curl http://localhost:3000/api/test-images
```

## 🎨 Personnalisation

### Ajouter une Nouvelle Route
1. Créer un fichier dans `src/app/api/test-images/`
2. Implémenter la logique de génération
3. Ajouter à la page de test principale
4. Tester avec différents paramètres

### Modifier les Styles
- Ajuster les couleurs et tailles
- Changer les polices
- Modifier la mise en page
- Ajouter des animations CSS

## 📚 Ressources

- [Documentation @vercel/og](https://vercel.com/docs/functions/og-image-generation)
- [Documentation node-canvas](https://github.com/Automattic/node-canvas)
- [Documentation @napi-rs/canvas](https://napi.rs/canvas)
- [Documentation Sharp](https://sharp.pixelplumbing.com/)

## 🤝 Contribution

Pour ajouter de nouvelles méthodes de test :
1. Créer la route API
2. Ajouter à la page de test
3. Tester avec différents scénarios
4. Documenter les résultats

## 📞 Support

En cas de problème :
1. Vérifier les logs Vercel
2. Tester en local
3. Comparer avec les routes qui fonctionnent
4. Vérifier la compatibilité des dépendances

---

**Note** : Ces tests sont conçus pour identifier la meilleure méthode de génération d'images sur Vercel. Utilisez les résultats pour migrer votre système de cartes d'anime vers la solution la plus fiable.
