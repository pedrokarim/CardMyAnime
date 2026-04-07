# Card Types

> 🇫🇷 [Version française](CARD_TYPES.md)

CardMyAnime offers **7 card types**, each with a distinct visual style. All examples below use the AniList profile `PedroKarim64`.

---

## Small

Compact format. Avatar, username and 3 latest anime.

**Dimensions:** 400×200px

![Small Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=small)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=small
```

---

## Medium

Balanced format. Avatar, statistics and latest anime/manga.

**Dimensions:** 600×300px

![Medium Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=medium)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=medium
```

---

## Large

Full profile with anime and manga covers.

**Dimensions:** 800×500px

![Large Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=large)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=large
```

---

## Summary

Detailed statistics, GitHub Stats style. Stat cards, favorite genres, achievements.

**Dimensions:** 800×600px

![Summary Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=summary)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=summary
```

---

## Neon

Cyberpunk aesthetic with cyan and magenta glow effects, background grid.

**Dimensions:** 600×350px

![Neon Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=neon)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=neon
```

---

## Minimal

Clean design on a light background with a purple accent bar. Focus on essentials.

**Dimensions:** 500×250px

![Minimal Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=minimal)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=minimal
```

---

## Glassmorphism

Frosted glass effect with purple/pink gradient and semi-transparent panel.

**Dimensions:** 700×400px

![Glassmorphism Card](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=glassmorphism)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=glassmorphism
```

---

## Parameters

Each card can be generated with the following parameters:

| Parameter | Values | Description |
|-----------|--------|-------------|
| `platform` | `anilist`, `mal`, `nautiljon` | Source platform |
| `username` | text | User's username |
| `type` | `small`, `medium`, `large`, `summary`, `neon`, `minimal`, `glassmorphism` | Card type |
| `background` | `0` or `1` | Disable/enable anime background (enabled by default) |

### Without anime background

Add `&background=0` to disable the background image:

![Small no background](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=small&background=0)

```
https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=small&background=0
```

## Embedding

### Markdown

```markdown
![My anime card](https://cma.ascencia.re/card?platform=anilist&username=YOUR_USERNAME&type=small)
```

### HTML

```html
<img src="https://cma.ascencia.re/card?platform=anilist&username=YOUR_USERNAME&type=small" alt="My anime card" />
```

### BBCode (forums)

```
[img]https://cma.ascencia.re/card?platform=anilist&username=YOUR_USERNAME&type=small[/img]
```
