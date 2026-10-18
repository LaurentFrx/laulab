#!/usr/bin/env python3
"""Icônes du site tirées du logo LF (logo-lf.png, 640 × 640, fond transparent).

Le logo est posé sur le bleu de Prusse du thème cyanotype (#0e2a47) : le verre
bleu clair y reste lisible jusqu'à 16 px, ce qui n'est pas le cas sur fond clair.

- favicon.ico (16, 32, 48) : carré à coins arrondis, comme l'ancien favicon.svg
  (rayon 12,5 %), coins transparents — pour les onglets ;
- icones/lf-*.png : carrés pleins, sans transparence. iOS et Android découpent
  eux-mêmes la forme ; iOS (26 et plus) remplace par une lettre une icône qu'il
  juge inutilisable. Zone sûre de la version maskable : cercle de 80 %.
- apple-touch-icon.png et apple-touch-icon-precomposed.png à la racine : copies
  de lf-180, adresses qu'iOS essaie de lui-même.

iOS garde en cache une icône (ou un échec) par adresse : si le logo change,
changer aussi le nom des fichiers (lf-… → autre préfixe) dans ce script, dans
src/layouts/Planche.astro et dans public/manifest.json.

Usage : python3 scripts/icones/generer.py   (nécessite Pillow ; écrit dans public/)
"""
from pathlib import Path

from PIL import Image, ImageDraw

ICI = Path(__file__).resolve().parent
PUBLIC = ICI.parent.parent / 'public'
PAPIER = (14, 42, 71, 255)  # --papier du thème cyanotype

source = Image.open(ICI / 'logo-lf.png').convert('RGBA')
logo = source.crop(source.getchannel('A').getbbox())


def icone(taille: int, marge: float, arrondi: bool) -> Image.Image:
    """Logo centré sur le fond, `marge` = part du côté laissée vide de chaque côté."""
    # Le fond arrondi est dessiné à 4× puis réduit, pour un bord lissé
    fond = Image.new('RGBA', (taille * 4, taille * 4), (0, 0, 0, 0))
    rayon = round(taille * 4 * 0.125) if arrondi else 0
    ImageDraw.Draw(fond).rounded_rectangle((0, 0, taille * 4 - 1, taille * 4 - 1), rayon, fill=PAPIER)
    fond = fond.resize((taille, taille), Image.LANCZOS)
    cote = round(taille * (1 - 2 * marge))
    l = logo.copy()
    l.thumbnail((cote, cote), Image.LANCZOS)
    fond.alpha_composite(l, ((taille - l.width) // 2, (taille - l.height) // 2))
    return fond


# Petites tailles : marges réduites pour garder le dessin lisible
petites = [icone(16, 0.04, True), icone(32, 0.08, True), icone(48, 0.1, True)]
petites[2].save(PUBLIC / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)], append_images=petites[:2])
(PUBLIC / 'icones').mkdir(exist_ok=True)
for taille in (152, 167, 180, 192, 512):  # 152 et 167 : iPad, comme Domo
    icone(taille, 0.16, False).convert('RGB').save(PUBLIC / 'icones' / f'lf-{taille}.png', optimize=True)
icone(512, 0.22, False).convert('RGB').save(PUBLIC / 'icones' / 'lf-512-maskable.png', optimize=True)
for nom in ('apple-touch-icon.png', 'apple-touch-icon-precomposed.png'):
    (PUBLIC / nom).write_bytes((PUBLIC / 'icones' / 'lf-180.png').read_bytes())
print('Icônes écrites dans', PUBLIC)
