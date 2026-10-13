---
titre: Cube de résine lumineux
accroche: Un cube d'époxy éclairé par des LED adressables, sur batterie, avec un socle découpé au laser.
categorie: atelier
statut: en-chantier
periode: "2026"
debut: 2026-08
repere: 10
lieu: BiscaLab
figure: cube
reperes:
  - Cube en résine époxy coulée
  - Anneau de LED SK6812 RGBW
  - ESP32-C3 sous WLED
  - Chargeur TP4056 et batterie LiPo
  - Socle en contreplaqué découpé au laser
matieres:
  - Résine époxy
  - SK6812 RGBW
  - ESP32-C3
  - WLED
  - TP4056 + LiPo
  - Contreplaqué, xTool P2S
collaboration:
  laurent:
    - Coulée de la résine, découpe du socle, assemblage
  claude:
    - Schéma d'alimentation sur batterie, configuration WLED du microcontrôleur
revision: A
---

Un objet pour le plaisir : un cube de résine époxy qui capte et diffuse la lumière d'un anneau de LED adressables caché dans son socle.

## Dedans

Un ESP32-C3 fait tourner WLED, ce qui donne tous les effets et le pilotage depuis le téléphone sans écrire une ligne de code. L'alimentation vient d'une batterie LiPo chargée par un module TP4056. Le socle, en contreplaqué, est découpé au laser du FabLab.

## Reste à faire

Finir le socle et la finition du cube, puis vérifier l'autonomie réelle.
