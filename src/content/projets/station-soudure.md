---
titre: Station de soudure nomade
accroche: Un Pinecil V2 alimenté en USB-C, réglé pour chauffer vite et ne pas s'endormir au mauvais moment.
categorie: atelier
statut: termine
periode: septembre 2026
debut: 2026-09
repere: 12
lieu: BiscaLab
matieres:
  - Pinecil V2, IronOS 2.23
  - Panne TS-D24
  - Chargeur Anker Prime 140 W
  - Batterie Anker Prime 20K
collaboration:
  laurent:
    - Choix du fer et des pannes, essais des alimentations
  claude:
    - Réglages IronOS, diagnostic du câble défectueux
revision: A
---

Un fer à souder qui tient dans la poche et se branche sur un chargeur de téléphone : le Pinecil V2, avec le firmware IronOS. L'intérêt est d'avoir le même fer à la maison et au FabLab, alimenté par USB-C Power Delivery.

## Réglages retenus

- IronOS 2.23, mode PD *Safe*, délai PD à 0, détection automatique du type de panne.
- Panne TS-D24 pour la plupart des travaux.
- Chargeur Anker Prime 140 W (ports C1 et C2 seuls capables du 28 V), chargeur GaN 100 W en secours.

## La leçon

Sur batterie, le fer refusait de chauffer : le câble USB-C n'était pas *e-marked* et la négociation de puissance échouait. Un câble certifié a réglé le problème, et le câble défectueux a été mis au rebut.
