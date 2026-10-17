#!/usr/bin/env python3
"""Icônes du site tirées du logo LF (logo-lf.png, 640 × 640, fond transparent).

Le logo est posé sur le bleu de Prusse du thème cyanotype (#0e2a47) : le verre
bleu clair y reste lisible jusqu'à 16 px, ce qui n'est pas le cas sur fond clair.

- favicon.ico (16, 32, 48) et icon-192/512.png : carré à coins arrondis, comme
  l'ancien favicon.svg (rayon 12,5 %), coins transparents ;
- apple-touch-icon.png (180) et icon-512-maskable.png : fond plein, iOS et
  Android découpent eux-mêmes la forme (zone sûre : cercle de 80 %).

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
icone(192, 0.14, True).save(PUBLIC / 'icon-192.png', optimize=True)
icone(512, 0.14, True).save(PUBLIC / 'icon-512.png', optimize=True)
icone(180, 0.16, False).convert('RGB').save(PUBLIC / 'apple-touch-icon.png', optimize=True)
icone(512, 0.22, False).convert('RGB').save(PUBLIC / 'icon-512-maskable.png', optimize=True)
print('Icônes écrites dans', PUBLIC)
