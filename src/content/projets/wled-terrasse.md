---
titre: Éclairage de la terrasse
accroche: Un ruban COB RGBW de 3,2 m en six profilés, piloté par WLED et réactif à la musique.
categorie: atelier
statut: en-service
periode: été 2026
debut: 2026-07
repere: 9
vedette: true
lieu: Maison
figure: led
reperes:
  - Profilé aluminium avec diffuseur
  - Ruban FCOB 24 V WS2814 RGBW
  - Contrôleur QuinLED Dig Uno v3
  - Alimentation Mean Well HLG-320H-24A
  - Flux audio Plexamp → LedFx → DDP
matieres:
  - BTF-Lighting FCOB 24 V WS2814 RGBW
  - QuinLED Dig Uno v3
  - Mean Well HLG-320H-24A
  - WLED
  - LedFx
  - Plexamp sur Raspberry Pi 4
collaboration:
  laurent:
    - Pose des six profilés, câblage 24 V, mise en service
    - Réglages à l'œil, choix des effets
  claude:
    - Configuration WLED (GPIO, nombre de pixels, ordre des couleurs, blanc)
    - Chaîne audio Plexamp → LedFx → WLED en DDP, tuile Domo
revision: B
---

Un éclairage d'ambiance pour la terrasse : 3,2 m de ruban COB RGBW, répartis en six segments logés dans des profilés aluminium avec diffuseur, pour une lumière continue sans points visibles.

## Électronique

Le ruban est un FCOB 24 V au protocole WS2814, commandé par un contrôleur QuinLED Dig Uno v3 sous WLED, alimenté par une Mean Well HLG-320H-24A. Le réglage qui a demandé le plus d'essais : l'ordre des couleurs (BRG) et le traitement du blanc, pour que le blanc chaud soit vraiment blanc.

## Réactivité à la musique

Un Raspberry Pi 4 fait tourner Plexamp sans écran ; LedFx analyse le son en temps réel et envoie les couleurs à WLED par le protocole DDP. Le résultat se pilote aussi depuis une tuile de Domo.
