"use client";

import { sarutobi, type Props } from "@ascencia/sarutobi-react";

/**
 * Mesure d'audience Sarutobi.
 *
 * Le produit tient en un entonnoir : choisir une plateforme, choisir un format,
 * saisir un pseudo, obtenir sa carte. Une pageview ne dit rien de cet
 * entonnoir, puisque les quatre étapes vivent sur la même URL — d'où des
 * événements par étape, sans quoi on ne saurait jamais où les gens
 * abandonnent.
 */

export type AnalyticsProps = Record<string, string | number | boolean | null>;

/**
 * Clé publique du site, sous le nom que l'écran d'installation donne à copier.
 *
 * Next remplace `process.env.NEXT_PUBLIC_*` littéralement à la compilation :
 * l'accès s'écrit en toutes lettres, un accès calculé ne serait pas substitué.
 */
function siteId(): string | undefined {
  return process.env.NEXT_PUBLIC_SARUTOBI_SITE_ID?.trim() || undefined;
}

/**
 * Chemins jamais collectés.
 *
 * - **`/admin`** n'est pas de l'audience : un ou deux comptes, et des visites
 *   qui fausseraient les chiffres du site public sans rien apprendre.
 * - **`/auth`** porte les échanges d'authentification, dont des URL de
 *   rappel avec paramètres. Sarutobi ne conserve la query que sur allowlist
 *   explicite, donc rien ne serait stocké — mais la meilleure façon de ne pas
 *   divulguer quelque chose reste de ne pas l'envoyer.
 */
const CHEMINS_EXCLUS = ["/admin/**", "/auth/**"];

let pret = false;

/**
 * Démarre la collecte. Appelée une fois, depuis la racine cliente.
 *
 * Sans clé configurée, la fonction ne fait rien : un développement ou une
 * préproduction non instrumentée doit fonctionner sans erreur ni requête.
 */
export function demarrerAnalytics(): void {
  const site = siteId();
  if (!site || pret) return;

  sarutobi.init({
    siteId: site,
    /*
     * Consentement automatique : la collecte démarre dès la première visite,
     * sans bandeau. Le SDK reste en `pending` et ne collecte rien sans cette
     * ligne, donc c'est un choix explicite.
     *
     * Un refus déjà enregistré l'emporte : le SDK relit l'état stocké avant
     * d'appliquer ce défaut, donc `refuserAnalytics()` est un opt-out durable
     * et non un réglage écrasé au rechargement suivant.
     */
    consent: "granted",
    excludePaths: CHEMINS_EXCLUS,
    environment: process.env.NEXT_PUBLIC_SARUTOBI_ENVIRONMENT?.trim() || "production",
    /*
     * Le SDK se désactive sur localhost par défaut, et c'est le bon défaut :
     * le développement ne doit pas polluer les chiffres de production, et
     * nettoyer après coup est impossible — rien ne distingue ensuite une visite
     * de développeur d'une vraie.
     *
     * Cette variable lève la garde le temps de vérifier l'instrumentation.
     * Elle n'a rien à faire dans un environnement déployé.
     */
    ...(process.env.NEXT_PUBLIC_SARUTOBI_ENABLE_LOCAL === "true" ? { enabled: true } : {}),
  });

  pret = true;
}

export function captureAnalytics(name: string, props?: AnalyticsProps): void {
  const normalise = name.trim();
  if (!normalise) return;
  sarutobi.capture(normalise, props as Props);
}

// ---------------------------------------------------------------------------
// Événements du produit
// ---------------------------------------------------------------------------

/**
 * Étape atteinte dans le générateur.
 *
 * Les quatre étapes partagent une seule URL — l'état vit dans la query string —
 * donc aucune pageview ne les distingue. Sans ces événements, on saurait
 * combien de gens ouvrent l'accueil et combien repartent avec une carte, mais
 * jamais **où** les autres se sont arrêtés.
 *
 * Un seul nom d'événement avec l'étape en propriété, et non quatre noms : un
 * entonnoir se construit sur des étapes comparables, et quatre courbes
 * séparées ne se comparent pas.
 */
export function captureEtape(etape: string, props?: AnalyticsProps): void {
  captureAnalytics("card_step", { step: etape, ...props });
}

/**
 * Carte obtenue.
 *
 * Le pseudo saisi n'est **jamais** transmis : c'est l'identité d'une personne
 * sur une plateforme tierce, et le savoir n'apprend rien sur l'usage. La
 * plateforme et le format, eux, disent ce qui sert.
 */
export function captureCarteGeneree(platform: string, cardType: string): void {
  captureAnalytics("card_generated", { platform, cardType });
}

/**
 * Échec de génération.
 *
 * Compte autant que la réussite : c'est lui qui dit si une plateforme est
 * cassée, ou si les gens se trompent de pseudo. Le motif est catégorisé — on
 * ne transmet pas le message brut, qui peut contenir le pseudo cherché.
 */
export function captureCarteEchouee(platform: string, motif: string): void {
  captureAnalytics("card_failed", { platform, reason: motif });
}

/** Partage : lien copié, balise d'intégration, téléchargement. */
export function capturePartage(type: string, cardType: string): void {
  captureAnalytics("card_shared", { method: type, cardType });
}

// ---------------------------------------------------------------------------
// Consentement
// ---------------------------------------------------------------------------

const abonnes = new Set<() => void>();

function prevenir(): void {
  for (const abonne of abonnes) abonne();
}

export function abonnerRefus(callback: () => void): () => void {
  abonnes.add(callback);
  return () => abonnes.delete(callback);
}

export function accepterAnalytics(): void {
  sarutobi.setConsent("granted");
  prevenir();
}

export function refuserAnalytics(): void {
  sarutobi.setConsent("denied");
  prevenir();
}

export function analyticsRefusee(): boolean {
  return sarutobi.isOptedOut();
}

/**
 * Ce que le serveur suppose : rien n'est refusé.
 *
 * Il ne peut pas savoir — le choix vit dans le navigateur. `useSyncExternalStore`
 * rend cet instantané puis bascule sur l'état réel dès l'hydratation.
 */
export function analyticsRefuseeServeur(): boolean {
  return false;
}
