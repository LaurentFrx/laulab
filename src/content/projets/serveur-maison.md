---
titre: Serveur maison
accroche: Un Raspberry Pi 4 qui héberge photos, musique et fichiers, et la migration de 660 Go depuis iCloud.
categorie: energie
statut: en-chantier
periode: depuis 2026
debut: 2026-06
repere: 15
lieu: Maison
matieres:
  - Raspberry Pi 4
  - Nextcloud, Plex, MariaDB, Redis
  - Docker, Portainer
  - Samsung T7 (exFAT)
  - Tailscale
  - Python (WebDAV, SHA-256)
collaboration:
  laurent:
    - Choix des services, installation, arbitrages sur Nextcloud et le futur NAS
  claude:
    - Script de migration iCloud → Nextcloud, diagnostic des resets USB du SSD
    - Comparatif NAS et mini-PC selon mes critères
revision: B
---

Reprendre la main sur nos données : photos, vidéos, documents, musique. Un Raspberry Pi 4 fait tourner Nextcloud, Plex, MariaDB et Redis dans Docker, gérés avec Portainer, avec un SSD externe pour les médias. Tailscale relie le tout à mes appareils où que je sois.

## La migration

Environ 660 Go de photos à sortir d'iCloud. Un script Python les transfère en WebDAV, cinq fichiers à la fois, avec un manifeste et une empreinte SHA-256 par fichier pour pouvoir reprendre sans doublon. Le client iCloud, lui, bloque sur quelques centaines d'éléments aux noms dupliqués hérités d'anciennes fusions de bibliothèques.

## Ce que j'ai appris

Nextcloud fait beaucoup, mais ses mises à jour sont fréquentes et son application iOS n'est pas à la hauteur. Je cherche une solution qui ne demande de l'entretien que quelques fois par an, et je prévois de remplacer le Pi par un NAS à deux baies pour la fiabilité du stockage.
