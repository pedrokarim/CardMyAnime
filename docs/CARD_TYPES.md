# Types de cartes

> 🇬🇧 [English version](CARD_TYPES.en.md)

CardMyAnime propose **7 types de cartes** avec chacun un style visuel distinct. Tous les exemples ci-dessous utilisent le profil AniList `PedroKarim64`.

---

## Small

Format compact. Avatar, pseudo et 3 derniers animes.

**Dimensions :** 400×200px

![Small Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=small)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=small
```

---

## Medium

Format équilibré. Avatar, statistiques et derniers animes/mangas.

**Dimensions :** 600×300px

![Medium Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=medium)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=medium
```

---

## Large

Profil complet avec couvertures d'animes et mangas.

**Dimensions :** 800×500px

![Large Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=large)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=large
```

---

## Summary

Statistiques détaillées style GitHub Stats. Stat cards, genres favoris, achievements.

**Dimensions :** 800×600px

![Summary Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=summary)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=summary
```

---

## Neon

Esthétique cyberpunk avec effets lumineux cyan et magenta, grille en arrière-plan.

**Dimensions :** 600×350px

![Neon Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=neon)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=neon
```

---

## Minimal

Design épuré sur fond clair avec barre d'accent violette. Focus sur l'essentiel.

**Dimensions :** 500×250px

![Minimal Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=minimal)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=minimal
```

---

## Glassmorphism

Effet verre dépoli avec gradient violet/rose et panneau semi-transparent.

**Dimensions :** 700×400px

![Glassmorphism Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=glassmorphism)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=glassmorphism
```

---

## Paramètres

Chaque carte peut être générée avec les paramètres suivants :

| Paramètre | Valeurs | Description |
|-----------|---------|-------------|
| `platform` | `anilist`, `mal`, `nautiljon` | Plateforme source |
| `username` | texte | Pseudo de l'utilisateur |
| `type` | `small`, `medium`, `large`, `summary`, `neon`, `minimal`, `glassmorphism` | Type de carte |
| `background` | `0` ou `1` | Désactiver/activer l'arrière-plan anime (activé par défaut) |

### Sans arrière-plan anime

Ajoutez `&background=0` pour désactiver l'image de fond :

![Small sans fond](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=small&background=0)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=small&background=0
```

## Intégration

### Markdown

```markdown
![Ma carte anime](https://cma.ascencia.re/card?platform=anilist&username=VOTRE_PSEUDO&type=small)
```

### HTML

```html
<img src="https://cma.ascencia.re/card?platform=anilist&username=VOTRE_PSEUDO&type=small" alt="Ma carte anime" />
```

### BBCode (forums)

```
[img]https://cma.ascencia.re/card?platform=anilist&username=VOTRE_PSEUDO&type=small[/img]
```
