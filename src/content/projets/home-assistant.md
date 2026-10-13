---
titre: Home Assistant, avant Domo
accroche: La domotique précédente — ce qu'elle a appris, et pourquoi elle a été remplacée.
categorie: applications
statut: termine
periode: → mai 2026
debut: 2026-01
repere: 18
lieu: Maison
matieres:
  - Home Assistant
  - Automatisations YAML
  - Relais de notifications push
liens:
  - label: Dépôt Home_Assistant
    url: https://github.com/LaurentFrx/Home_Assistant
collaboration:
  laurent:
    - Installation, intégrations, automatisations du cumulus
  claude:
    - Automatisations, relais de notifications, dépannage
revision: A
---

Avant Domo, la maison tournait sous Home Assistant. L'outil est puissant et sa communauté immense, mais je passais plus de temps à le maintenir qu'à l'utiliser : mises à jour fréquentes, intégrations qui cassent, automatisations difficiles à rendre fiables pour le pilotage du cumulus.

## Ce qui en reste

Les intégrations matériel (Shelly, onduleur, batteries) ont été comprises et documentées pendant cette période. Deux petits projets annexes, une application native et un relais de notifications push, ont servi de banc d'essai.

## La décision

En juin 2026, j'ai tout remplacé par Domo, une application écrite pour nos besoins. Home Assistant n'est plus utilisé à la maison.
