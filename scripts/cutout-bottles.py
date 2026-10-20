"""Cut product shots out of their grey studio background for the homepage hero.

GrabCut (OpenCV, runs locally) separates the bottle and its props from the smooth grey gradient.
The mask is cleaned (largest shapes only), feathered by 1.5px, cropped to the subject, and saved as
public/media/hero/<id>-cutout.webp (with alpha) at most 900px tall.

usage: python scripts/cutout-bottles.py mango strawberry matcha [--sheet check.png]
"""
import os, sys
import cv2
import numpy as np

ids = [a for a in sys.argv[1:] if not a.startswith("--") and not a.endswith(".png")]
sheet = sys.argv[sys.argv.index("--sheet") + 1] if "--sheet" in sys.argv else None
SRC = "public/media/products"
OUT = "public/media/hero"
os.makedirs(OUT, exist_ok=True)


def name(i):
    for n in (f"pure-{i}-flavor-concentrate-1.webp", f"pure-{i}-1.webp"):
        if os.path.exists(os.path.join(SRC, n)):
            return os.path.join(SRC, n)
    raise SystemExit(f"no photo for {i}")


def cut(path):
    img = cv2.imdecode(np.fromfile(path, np.uint8), cv2.IMREAD_COLOR)
    h, w = img.shape[:2]
    mask = np.zeros((h, w), np.uint8)
    rect = (int(w * 0.04), int(h * 0.02), int(w * 0.92), int(h * 0.96))
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, rect, bgd, fgd, 6, cv2.GC_INIT_WITH_RECT)
    m = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    # GrabCut keeps patches of the grey backdrop beside props. Backdrop = bright, colourless pixels; remove the
    # ones connected to the image edge (white label text sits inside the coloured label, so it is not connected).
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    grey = ((hsv[..., 1] < 22) & (hsv[..., 2] > 150)).astype(np.uint8)
    n0, lab0 = cv2.connectedComponents(grey)
    edge = set(np.unique(np.concatenate([lab0[0], lab0[-1], lab0[:, 0], lab0[:, -1]]))) - {0}
    backdrop = np.isin(lab0, list(edge))
    m[backdrop] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    # keep shapes of meaningful size (bottle + props), drop specks
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    big = stats[1:, cv2.CC_STAT_AREA].max() if n > 1 else 0
    for k in range(1, n):
        if stats[k, cv2.CC_STAT_AREA] >= big * 0.02:
            keep[lab == k] = 255
    alpha = cv2.GaussianBlur(keep, (0, 0), 1.5)
    ys, xs = np.where(keep > 0)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgba = np.dstack([img, alpha])[y0:y1, x0:x1]
    if rgba.shape[0] > 900:
        f = 900 / rgba.shape[0]
        rgba = cv2.resize(rgba, (round(rgba.shape[1] * f), 900), interpolation=cv2.INTER_AREA)
    return rgba


tiles = []
for i in ids:
    rgba = cut(name(i))
    ok, buf = cv2.imencode(".webp", rgba, [cv2.IMWRITE_WEBP_QUALITY, 90])
    buf.tofile(os.path.join(OUT, f"{i}-cutout.webp"))
    print(i, rgba.shape)
    if sheet:
        t = cv2.resize(rgba, (round(rgba.shape[1] * 400 / rgba.shape[0]), 400))
        a = t[..., 3:4] / 255.0
        for bg in ((40, 120, 60), (255, 255, 255)):  # check on green and on white
            tiles.append((t[..., :3] * a + np.array(bg) * (1 - a)).astype(np.uint8))
if sheet:
    hmax = max(t.shape[0] for t in tiles)
    ok, buf = cv2.imencode(".png", np.hstack([cv2.copyMakeBorder(t, 0, hmax - t.shape[0], 4, 4, cv2.BORDER_CONSTANT, value=(200, 200, 200)) for t in tiles]))
    buf.tofile(sheet)
