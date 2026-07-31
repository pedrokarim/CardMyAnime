# Migrations

La base est gérée par des migrations versionnées (`prisma migrate`), pas par
`prisma db push`. Le conteneur exécute `prisma migrate deploy` au démarrage :
il applique les migrations en attente et rien d'autre.

## Pourquoi pas `db push`

`db push` compare le schéma à la base et déduit les changements. Il ne peut pas
distinguer un renommage d'une suppression suivie d'une création, donc il
s'arrête et réclame `--accept-data-loss` dès qu'une colonne remplie disparaît.
Au démarrage d'un conteneur, cet arrêt empêche le serveur de se lever : le site
tombe en boucle de crash. Et le drapeau qui « règle » le problème supprime
justement le garde-fou qui protège les données.

Avec des migrations, le SQL destructif est écrit à la main, relu en revue et
versionné. Aucune surprise au déploiement.

## Ajouter une migration

```bash
# 1. Modifier prisma/schema.prisma
# 2. Générer la migration (à faire sur une base de développement)
bunx prisma migrate dev --name description_du_changement
# 3. LIRE le SQL généré, surtout s'il contient DROP ou ALTER ... DROP COLUMN
# 4. Commiter le dossier prisma/migrations/<horodatage>_<nom>/
```

Le déploiement applique ensuite la migration tout seul au redémarrage.

## À propos de `0_init`

C'est le point de départ : il décrit le schéma tel qu'il existait déjà en
production au moment du passage aux migrations. Il n'a jamais été exécuté sur
la base de production — il y a été marqué comme déjà appliqué :

```bash
prisma migrate resolve --applied 0_init
```

Toute base créée de zéro, elle, l'exécutera normalement.
