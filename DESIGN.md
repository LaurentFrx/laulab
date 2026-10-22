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
- `prefers-reduced-motion` : pas de tracé, mécanisme figé dans sa pose initiale, transitions de pages coupées, scène 3D remplacée par la figure SVG.

## Scène d'accueil (techniques empruntées à Lusion et Immersive Garden, octobre 2026)

- **Un canvas derrière le texte, le texte reste du HTML.** Le Jansenosaure (4 pattes, châssis, deux moteurs) est dessiné en fil de fer sur un Canvas 2D collant ; les chapitres de texte défilent par-dessus. Les étiquettes (manivelle, pivot, moteurs, trajectoire) sont des éléments HTML repositionnés chaque image à partir des points 3D projetés.
- **Le défilement pilote la caméra.** Trois images-clés : élévation de côté (titre), perspective trois quarts (les deux moteurs), vue de dessus (les trajectoires des pieds). Interpolation lissée, avec un retard élastique plutôt qu'un détournement du scroll.
- **La caméra respire.** Bruit fractal à trois octaves sur le lacet, le tangage et la hauteur de cible ; le curseur incline la vue de ±2° sur les écrans à survol.
- **Précalculer.** Les trajectoires des pieds et les phases des pattes sont calculées une fois ; chaque image ne fait que 20 intersections de cercles et ~800 projections.
- **Pas de bibliothèque 3D.** Tout est lignes : un moteur de projection de 100 lignes remplace Three.js. Pas de texture, pas de modèle, rien à télécharger.
- **Son coupé par défaut.** Un bouton dans la scène ; les pas sont synthétisés (bruit filtré + toc grave) au contact de chaque pied, jamais sans action de l'utilisateur.
- **Repli.** Sans animation (préférence système) : la figure SVG cotée et le seul premier chapitre.

Le phasage des pattes est calé sur l'arc d'appui réel de la trajectoire de Jansen : avec quatre pattes au quart de tour, deux pieds sont au sol 92 % du temps, jamais zéro. C'est aussi un résultat pour le projet lui-même : trois pieds au sol demanderont six pattes ou un autre phasage.

## Atelier Jansenosaure (octobre 2026)

L'atelier du robot, une application produite à part, est repris au plan : jetons et polices du site, feuilles numérotées 1/6 à 6/6 dans l'en-tête et le cartouche, boutons en filet fin et lettrage osifont. Le bouton « Marcher » est au crayon rouge, puisqu'il fait tourner la manivelle ; les autres actions sont aux couleurs des cotes.

La 3D garde ses matières, dans les bleus du plan : chaque matière tient sa place dans l'échelle des valeurs (corps plus clair que les pattes, acier plus clair que le bois, PETG et courroies sombres), les douilles de laiton prennent la couleur des cotes, et toutes les pièces sont cernées de leurs arêtes, ce qui donne à la vue « à travers le bois » l'allure d'une radiographie. Le sol se confond avec le papier, seule la grille le dessine. La pièce choisie se surligne au crayon.

Exception assumée : les plateaux de découpe et les figures des études restent sur papier clair, dans leurs couleurs d'origine, parce que leurs textes les nomment (« en brun les contours », « la ligne noire ») et que ce sont celles des calques du laser.

Comme l'original, l'atelier est un seul document : les feuilles s'enchaînent sans rechargement et le robot 3D, une fois chargé, reste vivant d'une feuille à l'autre. Un bouton « Plein écran » (là où le navigateur le permet) rend la scène et ses commandes seules à l'écran. Sur téléphone, le bandeau des feuilles défile et se centre sur la feuille ouverte.

## À ne pas faire

Cartes à ombre portée, dégradés décoratifs, coins arrondis généralisés, étiquettes en capitales au-dessus de chaque titre, flèches « → » collées aux liens. Si un élément n'encode pas une information, il est retiré.
