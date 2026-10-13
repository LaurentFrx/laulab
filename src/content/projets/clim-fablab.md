---
titre: Climatisation du FabLab
accroche: Piloter la Daikin du FabLab depuis une application web ouverte aux adhérents.
categorie: applications
statut: a-l-etude
periode: depuis septembre 2026
debut: 2026-09
repere: 4
lieu: BiscaLab
matieres:
  - Daikin Perfera (adaptateur BRP069C4x)
  - ESP32 avec Faikout
  - MQTT (Mosquitto sur le VPS)
  - SvelteKit
collaboration:
  laurent:
    - État des lieux de l'installation, choix du module ESP32
    - Relations avec le FabLab, câblage sur la machine
  claude:
    - Comparaison des voies d'accès (cloud Onecta, adaptateur local, connecteur S21)
    - Architecture MQTT et maquette de l'application
revision: A
---

La climatisation de BiscaLab est une Daikin Perfera. Son adaptateur Wi-Fi est encore lié au compte du précédent occupant, ce qui rend le pilotage par l'application du fabricant impossible.

## Le plan

Contourner le cloud : un ESP32 équipé du firmware **Faikout** se branche sur le connecteur de service de l'unité intérieure et publie l'état de la machine en MQTT vers le serveur Mosquitto du VPS. Une petite application web, réservée aux adhérents, affiche la température et permet de régler la consigne et le mode.

## Ce qui reste à décider

Le module exact, la façon de le loger proprement dans l'unité, et les règles d'usage (qui peut régler quoi, et quand la machine s'éteint toute seule).
