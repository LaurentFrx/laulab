---
titre: Station météo de Biscarrosse
accroche: Vent, pluie, température et UV, transmis en LoRaWAN — un projet du FabLab, en cours de reprise.
categorie: atelier
statut: en-chantier
periode: depuis 2026
debut: 2026-09
repere: 8
vedette: true
lieu: BiscaLab
figure: meteo
reperes:
  - Anémomètre et girouette
  - Pluviomètre à augets
  - Capteur de température et d'UV
  - Carte ESP32 et antenne LoRaWAN
  - Passerelle, puis Node-RED
matieres:
  - ESP32
  - LoRaWAN
  - KiCad
  - Node-RED
collaboration:
  laurent:
    - Reprise du projet existant, inventaire des capteurs et de la carte
    - Montage, installation sur site, mesures
  claude:
    - Relecture du schéma et du firmware, chaîne de données LoRaWAN → Node-RED
    - Tableaux de bord et alertes
revision: A
---

La station météo de Biscarrosse est un projet du FabLab que je reprends : mesurer le vent, la pluie, la température et l'indice UV, et transmettre le tout en LoRaWAN jusqu'à une passerelle, puis dans Node-RED pour l'affichage et l'archivage.

## Matériel

Une carte à base d'ESP32, dessinée sous KiCad, reçoit les capteurs et un module LoRaWAN. L'alimentation et la tenue aux intempéries sont les deux points à soigner pour une installation en extérieur, sur le littoral.

## Où on en est

Inventaire de l'existant et remise en route. Les prochaines étapes : valider la carte, écrire le firmware d'envoi, puis installer la station.
