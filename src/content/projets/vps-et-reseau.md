---
titre: Serveur public et réseau
accroche: Un VPS derrière Caddy, un tunnel vers la maison, et aucun port ouvert chez nous.
categorie: energie
statut: en-service
periode: depuis 2026
debut: 2026-05
repere: 16
lieu: VPS
matieres:
  - VPS Hetzner (tazieff-dev)
  - Caddy
  - Tunnel SSH inversé
  - Cloudflare Tunnel
  - Mosquitto
  - systemd
collaboration:
  laurent:
    - Choix de l'hébergeur, noms de domaine, règles d'exposition
  claude:
    - Configuration Caddy, services systemd, tunnel persistant, déploiements
revision: B
---

Tout ce qui doit être joignable depuis Internet vit sur un VPS Hetzner : Domo, ce site, le broker MQTT. Caddy sert de portier et gère les certificats.

## Joindre la maison sans l'exposer

Le serveur de Domo doit parler aux appareils de la maison (Shelly, onduleur, batteries, climatisation). Plutôt que d'ouvrir des ports sur la box, un tunnel SSH inversé, maintenu par systemd, relie en permanence le VPS au réseau local. Certains services passent aussi par un tunnel Cloudflare.

## Au quotidien

Je travaille sur ce serveur depuis Claude Code en SSH, dans une session tmux qui survit aux déconnexions. Les mises en production sont des scripts, pas des manipulations à la main.
