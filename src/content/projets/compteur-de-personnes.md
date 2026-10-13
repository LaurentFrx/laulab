---
titre: Compteur de personnes
accroche: Compter les passages avec une caméra et un accélérateur Hailo-8 sur Raspberry Pi 5.
categorie: applications
statut: en-chantier
periode: depuis février 2026
debut: 2026-02
repere: 3
vedette: true
lieu: BiscaLab
figure: compteur
reperes:
  - Caméra au-dessus du passage
  - Ligne virtuelle de comptage
  - Raspberry Pi 5 et module Hailo-8
  - Détection YOLOv8n, suivi des trajectoires
matieres:
  - Raspberry Pi 5
  - Hailo-8
  - YOLOv8n
  - Python
liens:
  - label: Dépôt Compteur-de-personnes
    url: https://github.com/LaurentFrx/Compteur-de-personnes
  - label: Dépôt camera-RPi5-comptage
    url: https://github.com/LaurentFrx/camera-RPi5-comptage
collaboration:
  laurent:
    - Montage caméra et Raspberry Pi, essais sur site, en binôme au FabLab
    - Compilation du modèle pour le Hailo-8, mesures de performance
  claude:
    - Lecture du format de sortie du modèle, réécriture de l'analyse des détections
    - Logique de comptage sur ligne virtuelle, outils de mise au point
revision: B
---

Le but est simple à énoncer : savoir combien de personnes passent par un endroit, sans rien enregistrer d'autre que des comptes. Une caméra regarde le passage, un petit modèle de détection repère les silhouettes, et on compte les trajectoires qui franchissent une ligne.

## Matériel

Un Raspberry Pi 5 avec un accélérateur Hailo-8. Le modèle YOLOv8n est compilé pour cette puce ; le Pi n'a plus qu'à préparer les images et à exploiter les détections.

## Le point dur

La sortie du modèle, dans le format *HAILO NMS BY CLASS*, est un tampon binaire qu'il faut relire correctement : un seul type d'objet, au plus cent boîtes, des nombres flottants à découper dans le bon ordre. L'analyseur a été réécrit plusieurs fois avant d'être fiable ; la version en service est la 35e.

## Où on en est

Le comptage fonctionne sur le banc d'essai. Reste l'installation définitive et les mesures sur une longue durée.
