# View Transition Theme Toggle — Documentation complète

## Vue d'ensemble

Ce système implémente un changement de thème (light/dark) avec une animation de **révélation circulaire** utilisant l'API **View Transitions**. Quand l'utilisateur clique sur un bouton de thème, un cercle s'étend depuis la position du clic pour révéler le nouveau thème, créant un effet visuel élégant.

---

## Architecture des fichiers

| Fichier | Rôle |
|---------|------|
| `app/global.css` | Définition CSS de l'animation circulaire (clip-path, keyframes) |
| `components/theme-toggle.tsx` | Composant UI (dropdown menu) qui déclenche l'animation |
| `components/theme-provider.tsx` | Context React qui gère l'état du thème + méthode `toggleTheme` |
| `lib/atoms/preferences.ts` | Atomes Jotai pour les préférences (mode, horaires) |
| `lib/atoms/editor.ts` | Atome Jotai principal du thème avec historique undo/redo |
| `hooks/use-time-based-theme.ts` | Hook pour le mode "automatique" basé sur l'heure |
| `utils/apply-theme.ts` | Utilitaire qui applique les variables CSS du thème au DOM |
| `utils/ai/apply-theme.ts` | Variante pour appliquer un thème généré par IA (aussi avec view transition) |
| `components/providers.tsx` | Arbre de providers — `ThemeProvider` enveloppe toute l'app |
| `app/layout.tsx` | Layout racine qui monte `<Providers>` |

---

## 1. CSS — Animation circulaire (`app/global.css`)

C'est le cœur visuel du système. On utilise les pseudo-éléments `::view-transition-old` et `::view-transition-new` fournis par l'API View Transitions du navigateur.

```css
/* Désactiver les animations par défaut de view-transition */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

/* L'ancien thème (sortant) est en dessous */
::view-transition-old(root) {
  z-index: 0;
}

/* Le nouveau thème (entrant) est au-dessus */
::view-transition-new(root) {
  z-index: 1;
}

/* Keyframe de révélation circulaire */
@keyframes reveal {
  from {
    clip-path: circle(0% at var(--x, 50%) var(--y, 50%));
    opacity: 0.7;
  }
  to {
    clip-path: circle(150% at var(--x, 50%) var(--y, 50%));
    opacity: 1;
  }
}

/* Appliquer l'animation au nouveau thème */
::view-transition-new(root) {
  animation: reveal 0.4s ease-in-out forwards;
}
```

### Comment ça marche

1. **`::view-transition-old(root)`** = capture/screenshot de la page AVANT le changement de thème
2. **`::view-transition-new(root)`** = capture/screenshot de la page APRÈS le changement de thème
3. L'ancien screenshot reste statique en dessous (`z-index: 0`)
4. Le nouveau screenshot apparaît par-dessus (`z-index: 1`) avec un `clip-path: circle()` qui grandit
5. Le cercle part de `0%` (invisible) et va jusqu'à `150%` (couvre tout l'écran) en **0.4s**
6. Les variables CSS `--x` et `--y` définissent le **centre du cercle** = la position du clic de l'utilisateur
7. Si `--x`/`--y` ne sont pas définies, le cercle part du centre de l'écran (`50% 50%`)
8. L'opacité passe de `0.7` à `1` pour un fondu subtil en plus du cercle

---

## 2. Composant Toggle (`components/theme-toggle.tsx`)

Dropdown menu avec 4 options : Clair, Sombre, Système, Automatique (basé sur l'heure).

### Logique principale

```tsx
// Capture les coordonnées du clic pour centrer le cercle
const handleThemeChange = (newTheme: ThemeMode, event?: React.MouseEvent) => {
  setPreferredThemeMode(newTheme); // Sauvegarde la préférence

  if (newTheme === "light") {
    const coords = event ? { x: event.clientX, y: event.clientY } : undefined;
    applyThemeWithAnimation("light", coords);
  } else if (newTheme === "dark") {
    const coords = event ? { x: event.clientX, y: event.clientY } : undefined;
    applyThemeWithAnimation("dark", coords);
  } else if (newTheme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const coords = event ? { x: event.clientX, y: event.clientY } : undefined;
    applyThemeWithAnimation(prefersDark ? "dark" : "light", coords);
  }
  // "time-based" est géré automatiquement par le hook useTimeBasedTheme
};
```

### Fonction d'animation

```tsx
const applyThemeWithAnimation = (
  newMode: "light" | "dark",
  coords?: { x: number; y: number }
) => {
  const root = document.documentElement;

  // Respect de l'accessibilité : pas d'animation si l'utilisateur préfère le mouvement réduit
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Fallback si le navigateur ne supporte pas View Transitions ou mouvement réduit
  if (!document.startViewTransition || prefersReducedMotion) {
    setThemeState({ ...themeState, currentMode: newMode });
    return;
  }

  // Injecter les coordonnées du clic comme variables CSS
  if (coords) {
    root.style.setProperty("--x", `${coords.x}px`);
    root.style.setProperty("--y", `${coords.y}px`);
  }

  // Déclencher la View Transition : le navigateur capture l'avant/après
  document.startViewTransition(() => {
    setThemeState({ ...themeState, currentMode: newMode });
  });
};
```

### Flux complet d'un clic

1. L'utilisateur clique sur "Sombre" dans le dropdown
2. `onClick={(e) => handleThemeChange("dark", e)}` capture le `MouseEvent`
3. `event.clientX` et `event.clientY` sont extraits (position du clic en pixels)
4. Ces valeurs sont injectées comme `--x` et `--y` sur `document.documentElement`
5. `document.startViewTransition()` est appelé :
   - Le navigateur prend un screenshot de la page actuelle (ancien thème)
   - Le callback change l'état Jotai → le DOM se met à jour (nouveau thème)
   - Le navigateur prend un screenshot de la page mise à jour
   - Les pseudo-éléments `::view-transition-old/new` sont créés
   - L'animation CSS `reveal` s'exécute : le cercle grandit depuis `(--x, --y)`
6. Après 0.4s, la transition est terminée

### Rendu JSX

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <Icon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      <span className="sr-only">Changer le thème</span>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end">
    <DropdownMenuItem onClick={(e) => handleThemeChange("light", e)}>
      <Sun className="mr-2 h-4 w-4" /> Clair
    </DropdownMenuItem>
    <DropdownMenuItem onClick={(e) => handleThemeChange("dark", e)}>
      <Moon className="mr-2 h-4 w-4" /> Sombre
    </DropdownMenuItem>
    <DropdownMenuItem onClick={(e) => handleThemeChange("system", e)}>
      <Monitor className="mr-2 h-4 w-4" /> Système
    </DropdownMenuItem>
    <DropdownMenuItem onClick={(e) => handleThemeChange("time-based", e)}>
      <Clock className="mr-2 h-4 w-4" /> Automatique ({dayStartHour}h-{dayEndHour}h)
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

L'icône affichée change dynamiquement selon le mode actif (Sun, Moon, Monitor, Clock).

---

## 3. Theme Provider (`components/theme-provider.tsx`)

Context React qui expose `theme`, `setTheme`, et `toggleTheme` à toute l'app.

```tsx
type Coords = { x: number; y: number };

type ThemeProviderState = {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: (coords?: Coords) => void;
};
```

### `toggleTheme` — bascule avec animation

```tsx
const handleThemeToggle = (coords?: Coords) => {
  const root = document.documentElement;
  const newMode = themeState.currentMode === "light" ? "dark" : "light";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!document.startViewTransition || prefersReducedMotion) {
    handleThemeChange(newMode);
    return;
  }

  if (coords) {
    root.style.setProperty("--x", `${coords.x}px`);
    root.style.setProperty("--y", `${coords.y}px`);
  }

  document.startViewTransition(() => {
    handleThemeChange(newMode);
  });
};
```

Cette méthode est utilisable depuis n'importe où via `useTheme().toggleTheme({ x, y })`.

### Application du thème au DOM

```tsx
useEffect(() => {
  const root = document.documentElement;
  if (!root || !themeState || !themeState.styles) return;
  applyThemeToElement(themeState, root);
}, [themeState]);
```

À chaque changement de `themeState`, `applyThemeToElement` :
- Ajoute/retire la classe `dark` sur `<html>`
- Applique les variables CSS de couleurs, radius, spacing, shadows

---

## 4. State Management — Jotai Atoms

### Atomes de préférences (`lib/atoms/preferences.ts`)

```tsx
export type ThemeMode = "light" | "dark" | "system" | "time-based";

// Mode préféré de l'utilisateur, persisté dans localStorage
export const preferredThemeModeAtom = atomWithStorage<ThemeMode>(
  "preferredThemeMode",
  "system" // valeur par défaut
);

// Configuration du mode automatique
export const timeBasedThemeAtom = atomWithStorage<{
  dayStartHour: number;
  dayEndHour: number;
}>("timeBasedTheme", {
  dayStartHour: 7,   // 7h du matin
  dayEndHour: 19,     // 19h le soir
});
```

### Atome du thème éditeur (`lib/atoms/editor.ts`)

```tsx
// État principal du thème (mode + styles complets)
export const themeEditorStateAtom = atomWithStorage<ThemeEditorState>(
  "theme-editor-state",
  defaultThemeState
);

// Setter avec support undo/redo
export const setThemeStateAtom = atom(
  null,
  (get, set, newState: ThemeEditorState) => {
    // Logique d'historique pour undo/redo
    set(themeEditorStateAtom, newState);
    set(themeHistoryAtom, updatedHistory);
    set(themeFutureAtom, updatedFuture);
  }
);
```

Toutes les préférences sont persistées dans `localStorage` via `atomWithStorage`.

---

## 5. Hook Time-Based (`hooks/use-time-based-theme.ts`)

Change automatiquement le thème selon l'heure, vérifie toutes les minutes.

```tsx
export function useTimeBasedTheme() {
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  // Met à jour l'heure toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (preferredThemeMode === "time-based") {
      const { dayStartHour, dayEndHour } = timeBasedTheme;
      const isDayTime = currentHour >= dayStartHour && currentHour < dayEndHour;
      const newMode = isDayTime ? "light" : "dark";

      if (themeState.currentMode !== newMode) {
        setThemeState({ ...themeState, currentMode: newMode });
      }
    }
  }, [currentHour, timeBasedTheme, preferredThemeMode, themeState]);
}
```

Note : le changement automatique ne déclenche **PAS** l'animation circulaire (pas de `startViewTransition`), seuls les clics manuels le font.

---

## 6. Application du thème au DOM (`utils/apply-theme.ts`)

```tsx
export const applyThemeToElement = (
  themeState: ThemeEditorState,
  rootElement: HTMLElement
) => {
  const { currentMode: mode, styles: themeStyles } = themeState;
  if (!rootElement || !themeStyles || !themeStyles[mode]) return;

  updateThemeClass(rootElement, mode);     // .dark class
  applyCommonStyles(rootElement, themeStyles, mode);  // radius, spacing
  applyThemeColors(rootElement, themeStyles, mode);   // couleurs CSS variables
  setShadowVariables(themeState);          // ombres
};

const updateThemeClass = (root: HTMLElement, mode: Theme) => {
  if (mode === "light") {
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
  }
};
```

Le système utilise la classe `dark` sur `<html>` (compatible Tailwind CSS dark mode) + des variables CSS custom pour les couleurs.

---

## 7. Variante IA (`utils/ai/apply-theme.ts`)

Quand un thème est généré par IA, il est aussi appliqué avec une view transition (mais sans coordonnées de clic, donc le cercle part du centre) :

```tsx
export function applyGeneratedTheme(themeStyles, themeState, setThemeState) {
  const mergedStyles = mergeThemeStylesWithDefaults(themeStyles);

  if (!document.startViewTransition) {
    setThemeState({ ...themeState, styles: mergedStyles });
  } else {
    document.startViewTransition(() => {
      setThemeState({ ...themeState, styles: mergedStyles });
    });
  }
}
```

---

## 8. Montage dans l'app (`components/providers.tsx` + `app/layout.tsx`)

```tsx
// providers.tsx — ThemeProvider enveloppe toute l'application
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatProvider>
        <Suspense fallback={null}>
          <NuqsAdapter>
            <ThemeProvider>         {/* ← ICI */}
              <TranslationProvider>
                <SessionProvider>
                  <TooltipProvider delayDuration={150}>
                    {children}
                  </TooltipProvider>
                </SessionProvider>
              </TranslationProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </Suspense>
      </ChatProvider>
    </QueryClientProvider>
  );
}
```

```tsx
// layout.tsx — Layout racine
export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
```

---

## Résumé technique

| Aspect | Détail |
|--------|--------|
| **API utilisée** | `document.startViewTransition()` (View Transitions API) |
| **Animation** | `clip-path: circle()` de 0% à 150%, durée 0.4s ease-in-out |
| **Centre du cercle** | Variables CSS `--x` et `--y` = position du clic (`clientX`, `clientY`) |
| **Fallback** | Changement instantané si API non supportée ou `prefers-reduced-motion` |
| **State management** | Jotai avec `atomWithStorage` (persistance localStorage) |
| **Modes supportés** | Light, Dark, System, Time-based (automatique par heure) |
| **Framework** | Next.js App Router + React + Tailwind CSS |
| **Composants UI** | shadcn/ui (DropdownMenu, Button) |
| **Icônes** | Lucide React (Sun, Moon, Monitor, Clock) |

---

## Pour reproduire ce système dans un autre projet

### Prérequis
- Navigateur supportant l'API View Transitions (Chrome 111+, Edge 111+)
- React (ou tout framework qui modifie le DOM de façon synchrone dans le callback)

### Étapes minimales

1. **Ajouter le CSS** des pseudo-éléments `::view-transition-old/new(root)` et le keyframe `reveal` avec `clip-path: circle()`
2. **Capturer les coordonnées du clic** (`event.clientX`, `event.clientY`)
3. **Injecter les coordonnées** comme variables CSS `--x` et `--y` sur `document.documentElement`
4. **Appeler `document.startViewTransition(callback)`** où le callback modifie le thème (ajoute/retire la classe `dark`, change les variables CSS)
5. **Prévoir un fallback** : vérifier `document.startViewTransition` et `prefers-reduced-motion`

### Code minimal standalone

```tsx
function toggleTheme(event: React.MouseEvent) {
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");

  // Fallback
  if (!document.startViewTransition) {
    root.classList.toggle("dark");
    return;
  }

  // Injecter la position du clic
  root.style.setProperty("--x", `${event.clientX}px`);
  root.style.setProperty("--y", `${event.clientY}px`);

  // Lancer la transition
  document.startViewTransition(() => {
    root.classList.toggle("dark");
  });
}
```

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root) { z-index: 0; }
::view-transition-new(root) { z-index: 1; }

@keyframes reveal {
  from { clip-path: circle(0% at var(--x, 50%) var(--y, 50%)); opacity: 0.7; }
  to   { clip-path: circle(150% at var(--x, 50%) var(--y, 50%)); opacity: 1; }
}

::view-transition-new(root) {
  animation: reveal 0.4s ease-in-out forwards;
}
```
