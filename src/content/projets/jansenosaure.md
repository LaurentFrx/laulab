---
titre: Jansenosaure
accroche: Un quadrupède marcheur à mécanisme de Jansen, au look de bête préhistorique, découpé au laser dans du contreplaqué de 5 mm.
categorie: robots
statut: a-l-etude
periode: depuis septembre 2026
debut: 2026-09
repere: 5
vedette: true
lieu: BiscaLab
figure: jansen
reperes:
  - Manivelle m = 15, un moteur par côté
  - Pivot fixe du bassin, décalé de a = 38 et l = 7,8
  - Triangle supérieur b, d, e
  - Triangle inférieur g, h, i
  - Pied, trajectoire plate au sol
matieres:
  - Mécanisme de Jansen, chaque patte doublée (tringleries A et B calées à 180°)
  - FreeCAD, modèle régénéré par script
  - Découpe laser, contreplaqué ordinaire 5 mm (129 pièces, 6 plateaux)
  - Impression 3D PETG et TPU (poulies, moyeux, pieds)
  - 2 moteurs pas-à-pas 17HS4401, drivers TMC2209, courroies GT2 6 mm
  - Arduino et radio nRF24L01+, télécommande Freenove
liens:
  - label: Dépôt atelier-jansenosaure
    url: https://github.com/LaurentFrx/atelier-jansenosaure
atelier:
  url: /projets/jansenosaure/atelier/
  description: Le dossier de fabrication complet, tenu à jour par le générateur du modèle — le robot en 3D qui marche, l'ordre de montage, les achats, les plateaux de découpe et les études.
collaboration:
  laurent:
    - Idée, exigences de marche et d'allure, choix des matériaux
    - Modélisation FreeCAD et découpe, une fois le design validé
  claude:
    - Cinématique du mécanisme, trajectoire du pied, phases entre les pattes
    - Étude de la direction par différentiel et de la motorisation
revision: B
---

Theo Jansen a conçu, pour ses Strandbeest, un mécanisme à une seule manivelle qui transforme une rotation en un pas presque parfait : le pied avance à plat au sol, puis se relève pour revenir. Les proportions, qu'il appelle ses *nombres sacrés*, tiennent en treize longueurs. Le dessin ci-dessus les respecte au dixième ; la manivelle tourne, le pied suit.

## Le cahier des charges

- Quatre pattes, deux par côté, chaque côté entraîné par son propre moteur : la direction se fait par différentiel, comme un char.
- Au moins trois pieds au sol le plus longtemps possible. Une configuration qui reste souvent sur deux pieds n'est pas acceptable.
- Une allure de quadrupède préhistorique, parce que je suis exigeant sur le design.
- Des pièces découpées au laser, et une largeur minimale en optimisant les jonctions. Prévues en 3 mm au départ, elles sont toutes en contreplaqué de 5 mm depuis le 26 septembre 2026.

## Motorisation

Deux moteurs pas-à-pas, un par côté, cachés entre les plaques-flancs et reliés aux vilebrequins par des courroies crantées. L'étude du 27 septembre 2026 a tranché : on garde les 17HS4401 du fablab. Réglés à 1,0 A, ils donnent 0,35 N·m au vilebrequin pour 0,29 demandés par la marche, et c'est la courroie GT2 de 6 mm qui plafonne le couple, pas le moteur. L'étude complète est dans l'atelier.

## Où on en est

Le modèle est complet. Un seul fichier de réglages le décrit ; un script le régénère dans FreeCAD, le soumet à 162 contrôles automatiques, puis en tire les plateaux de découpe, la liste d'achats et l'ordre de montage. L'atelier publie le tout à chaque génération.
