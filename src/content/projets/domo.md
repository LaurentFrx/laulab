---
titre: Domo
accroche: La domotique de la maison, écrite sur mesure, qui fait chauffer l'eau quand le soleil donne.
categorie: applications
statut: en-service
periode: depuis juin 2026
debut: 2026-06
repere: 1
vedette: true
lieu: Maison · VPS
figure: cumulus
reperes:
  - Ballon Atlantic 300 L, chauffe en tout-ou-rien
  - Sonde Sonoff au fond du doigt de gant
  - Contacteur piloté par un Shelly Pro 1
  - Compteur Shelly Pro EM-50, import et export réseau
  - Onduleur APSystems EZ1-H et deux Solarbank 3 Pro
  - Serveur Domo sur le VPS, tunnel SSH vers la maison
matieres:
  - SvelteKit 2
  - Svelte 5 (runes)
  - TypeScript
  - Tailwind 4
  - Node.js
  - Caddy
  - Web Push
  - Shelly Pro 1 et Pro EM-50
  - APSystems EZ1-H
  - Anker Solarbank 3 Pro ×2, Max AC
  - Daikin Perfera
  - WLED
liens:
  - label: domo.feroux.fr
    url: https://domo.feroux.fr
collaboration:
  laurent:
    - Cahier des charges, règles d'orchestration, tarifs et contraintes du foyer
    - Installation et câblage des Shelly, de l'onduleur, des batteries
    - Tests sur le matériel réel, arbitrages d'interface pour la famille
  claude:
    - Architecture SvelteKit, machine à états du cumulus, intégrations matériel
    - Code du serveur, du tunnel et de la PWA, notifications Web Push
    - Maquettes d'interface et brief de design
revision: C
---

Domo est l'application qui pilote l'énergie de la maison. Elle a remplacé Home Assistant, que j'avais fini par trouver lourd à maintenir pour ce que j'en faisais : une seule application, écrite pour nos besoins, qui tourne sur mon serveur et parle à nos appareils.

## Le cœur : le cumulus

Le ballon d'eau chaude est le plus gros consommateur pilotable du foyer. Domo décide quand l'allumer selon quatre modes : **OFF**, **PV** (sur surplus solaire), **HC** (heures creuses) et **FORCE**. Le pilotage est en tout-ou-rien, à travers un contacteur commandé par un Shelly Pro 1 ; une sonde placée au fond du doigt de gant donne la seule température mesurée, et un modèle estime le reste du ballon en tenant compte du refroidissement.

L'orchestrateur est une machine à états : **REST**, **IGNITION**, **ESTABLISHED**, **CESSION**, **FULL**, **HC_RECHARGE**. Chaque phase a ses conditions d'entrée et de sortie, calculées à partir du surplus mesuré par le compteur Shelly EM-50, de l'état des batteries Anker et de la prévision de production.

## Autour

- Suivi de la production de l'onduleur APSystems et des deux Solarbank, de l'import et de l'export réseau.
- Pilotage de la climatisation Daikin par son adaptateur local.
- Tuile WLED pour l'éclairage de la terrasse.
- Notifications Web Push sur nos téléphones, raccourcis iOS déclenchés par une étiquette NFC au portail.

## Architecture

Le serveur tourne sur un VPS Hetzner derrière Caddy. Il rejoint le réseau de la maison par un tunnel SSH permanent, ce qui évite d'ouvrir le moindre port à la maison. L'interface est une PWA installée sur les téléphones de la famille.
