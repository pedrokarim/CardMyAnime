import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/**
 * eslint-config-next 16 expose directement des configs « flat ». Les faire
 * passer par FlatCompat (le pont vers l'ancien format .eslintrc) faisait
 * échouer eslint dès le chargement : le validateur sérialise la config en JSON
 * et tombait sur une référence circulaire ("property 'react' closes the
 * circle"), ce qui rendait `bun run lint` totalement inopérant.
 */
const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
