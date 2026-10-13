---
titre: Jansenosaure
accroche: Un quadrupède marcheur à mécanisme de Jansen, au look de bête préhistorique, découpé dans du 3 mm.
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
  - Mécanisme de Jansen
  - FreeCAD
  - Découpe laser, panneaux 3 mm
  - NEMA 17 (17HS15-1504S-X1) ×3, à confirmer
liens:
  - label: Dépôt atelier-jansenosaure
    url: https://github.com/LaurentFrx/atelier-jansenosaure
collaboration:
  laurent:
    - Idée, exigences de marche et d'allure, choix des matériaux
    - Modélisation FreeCAD et découpe, une fois le design validé
  claude:
    - Cinématique du mécanisme, trajectoire du pied, phases entre les pattes
    - Étude de la direction par différentiel et de la motorisation
revision: A
---

Theo Jansen a conçu, pour ses Strandbeest, un mécanisme à une seule manivelle qui transforme une rotation en un pas presque parfait : le pied avance à plat au sol, puis se relève pour revenir. Les proportions, qu'il appelle ses *nombres sacrés*, tiennent en treize longueurs. Le dessin ci-dessus les respecte au dixième ; la manivelle tourne, le pied suit.

## Le cahier des charges

- Quatre pattes, deux par côté, chaque côté entraîné par son propre moteur : la direction se fait par différentiel, comme un char.
- Au moins trois pieds au sol le plus longtemps possible. Une configuration qui reste souvent sur deux pieds n'est pas acceptable.
- Une allure de quadrupède préhistorique, parce que je suis exigeant sur le design.
- Des pièces en 3 mm d'épaisseur, découpées au laser, et une largeur minimale en optimisant les jonctions.

## Motorisation

Trois moteurs pas-à-pas NEMA 17 sont envisagés. La question reste ouverte : un moteur à courant continu avec réducteur serait plus simple à commander, mais moins précis pour synchroniser les deux côtés.

## Où on en est

Le design n'est pas encore validé. La modélisation FreeCAD commencera une fois la géométrie et le phasage des pattes arrêtés.
