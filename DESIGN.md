# Direction artistique — « plan d'ingénieur »

Choisie par Laurent parmi trois propositions (journal de bord, atelier la nuit, plan d'ingénieur), le 13 octobre 2026.

## Idée

Le site est un jeu de plans. Chaque page est une planche : un cadre avec zones de repérage (A–H, 1–6), un cartouche en bas à droite (conçu / dessiné / vérifié / date / révision / échelle), des repères numérotés en bulles, et une nomenclature qui tient lieu d'index. Les conventions du dessin technique ne décorent pas : elles portent l'information (statut = tampon, catégorie = groupe de nomenclature, qui a fait quoi = cartouche).

## Couleurs

Cyanotype (défaut) : fond bleu de Prusse `#0e2a47`, traits `#dce9f5`, texte `#eaf2fa` / `#a9c0d4`, cotes et liens `#8fd8ff`, crayon rouge `#ff6a3d` (manivelle, « en chantier », focus — seul accent chaud).

Calque : papier `#f2f5f8`, encre `#0f2b4a`, traits `#143a5e`, cotes `#0a6fb5`, crayon `#d8432b`.

Les épaisseurs de traits suivent l'esprit ISO 128 : fort 1,5 px (contours), moyen 1 px, fin 0,75 px (cotes, attaches), trait mixte pour les axes, tirets pour les parties cachées et les projets « à l'étude ».

## Typographie

- **Anybody** (variable, largeur 92–125 %) : titres et nom du site. Condensé pour les titres, élargi pour la marque.
- **Atkinson Hyperlegible** : texte courant, 17 px, interligne 1,55, 66 caractères par ligne au plus.
- **osifont** : cotes, étiquettes du cartouche, nomenclature. C'est la police du lettrage ISO 3098 utilisée en CAO ; elle est en petites capitales uniquement dans le cartouche et les en-têtes de tableau, jamais ailleurs.

Échelle : 0,78 / 1,06 / 1,25 / 1,6 / 2,1 / 3 rem, et un titre d'accueil fluide (2,9–6,2 rem).

## Mise en page

Contenu aligné à gauche, largeur 1 240 px maximum, cadre fixe à 10 px du bord sur grand écran (double filet avec la bande des zones), simple filet sur mobile. En-tête collant sur grand écran, statique sur mobile.

Page d'accueil : titre sur toute la largeur, puis texte (4/12) et figure de Jansen animée (8/12). La figure est la seule chose qui bouge sur le site, parce qu'elle est le sujet.

## Mouvement

- Les figures se tracent une fois à l'apparition (`stroke-dashoffset`), puis restent.
- Le mécanisme de Jansen tourne en continu (un tour en 6 s), uniquement quand il est à l'écran.
- `prefers-reduced-motion` : pas de tracé, mécanisme figé dans sa pose initiale, transitions de pages coupées.

## À ne pas faire

Cartes à ombre portée, dégradés décoratifs, coins arrondis généralisés, étiquettes en capitales au-dessus de chaque titre, flèches « → » collées aux liens. Si un élément n'encode pas une information, il est retiré.
