---
titre: Installation solaire
accroche: 3,3 kWc sur deux pans de toit, deux batteries, et la question de ce qu'on autoconsomme vraiment.
categorie: energie
statut: en-service
periode: depuis mai 2026
debut: 2026-05
repere: 14
vedette: true
lieu: Maison
figure: solaire
reperes:
  - 4 × 585 Wc, orientés à 190°, inclinés à 20°
  - 2 × 500 Wc, orientés à 280°, inclinés à 20°
  - Onduleur APSystems EZ1-H, deux panneaux
  - Solarbank 3 Pro n° 1 et n° 2, 5,4 kWh chacune
  - Solarbank Max AC, raccordée sur circuit dédié
  - Compteur Linky, smart meter Anker sur la phase
matieres:
  - 6 panneaux, 3 340 Wc
  - APSystems EZ1-H
  - Anker Solarbank 3 Pro ×2 (LFP, 5,376 kWh)
  - Anker Solarbank Max AC, smart meter Gen 2
  - Circuit dédié 16 A courbe C + 30 mA type A
  - Consuel SC144, déclaration CACSI
collaboration:
  laurent:
    - Pose des panneaux et des batteries, câblage du circuit dédié
    - Démarches Consuel et Enedis, relevés de production
  claude:
    - Dimensionnement, lecture des normes (NF C 15-100), choix des protections
    - Modèle économique heures pleines/creuses avec pertes de stockage, calibrage de la prévision
revision: C
---

Six panneaux pour 3 340 Wc, répartis sur deux pans de toit qui ne voient pas le soleil aux mêmes heures : quatre panneaux de 585 Wc orientés au sud-sud-ouest (190°), deux de 500 Wc à l'ouest (280°), tous inclinés à 20°. Un mur et un avant-toit masquent une partie de la journée selon la saison.

## Stockage

Deux Anker Solarbank 3 Pro, 5,4 kWh chacune, limitées à 1 200 W en sortie et réglées pour ne rien réinjecter : quand elles sont pleines, elles coupent les panneaux. Un onduleur APSystems EZ1-H, lui, réinjecte sans limite ; son surplus est vu par le compteur Anker et absorbé par les batteries. Une Solarbank Max AC a rejoint l'ensemble en juillet 2026, sur un circuit dédié de 3 500 W.

## Conformité

Le circuit dédié respecte la NF C 15-100 : disjoncteur 16 A courbe C, différentiel 30 mA de type A, câble U-1000 R2V 3G2,5 mm². Attestation Consuel violette (SC144) et déclaration CACSI auprès d'Enedis.

## La vraie question

Combien économise-t-on ? Pas la production, mais l'énergie réellement autoconsommée, en déduisant les pertes de charge et de décharge des batteries. C'est ce que Domo cherche à mesurer, et ce qui décide quand faire chauffer l'eau.
