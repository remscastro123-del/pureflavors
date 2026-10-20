"""Align each product's hover photo (photo 2) to its card photo (photo 1) by the bottle.
Run: python scripts/align-hover-photos.py public/media/products   (needs opencv-python-headless)
Check first: python scripts/align-hover-photos.py public/media/products check.png
Busy scenes it cannot match are placed by hand with scripts/align-hover-photos-manual.py (banana, blueberry,
condensed-milk, honey, salted-caramel as of Oct 2026). Then
rebuild src/data/hover-photos.json, the list of product ids that have a hover photo.


1. Photo 1 has a near-white background, so the bottle is cut out as a template: the dropper bulb is the
   topmost near-black run in the central band; the template spans from just above the bulb to the label.
   Non-white pixels form the mask, so the template ignores the white studio background.
2. The template is searched in photo 2 over a range of scales (masked normalised cross-correlation).
3. Photo 2 is scaled and shifted so the bottle lands exactly where it is in photo 1, then cropped to
   photo 1's size. If that would leave an empty edge, the shift is clamped and the residual reported.

usage: align2.py <products dir> [sheet.png]   (with a sheet path it only writes the check sheet)
"""
import glob, os, sys
import cv2
import numpy as np

SRC, SHEET = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else None)


def read(p):
    return cv2.imdecode(np.fromfile(p, np.uint8), cv2.IMREAD_COLOR)


def write(p, img):
    ok, buf = cv2.imencode(".webp", img, [cv2.IMWRITE_WEBP_QUALITY, 82])
    buf.tofile(p)


def bottle_template(a):
    h, w = a.shape[:2]
    dark = a.max(axis=2) < 70
    x0, x1 = int(w * 0.3), int(w * 0.7)
    counts = dark[:, x0:x1].sum(axis=1)
    rows = np.where(counts >= max(4, w * 0.02))[0]
    if not len(rows):
        return None
    top = rows[0]
    end = top
    for r in rows[1:]:
        if r - end <= 2:
            end = r
        else:
            break
    seg = dark[top:end + 1, x0:x1]
    cols = seg.sum(axis=0)
    cx = x0 + (np.arange(len(cols)) * cols).sum() / cols.sum()
    bw = np.percentile(seg.sum(axis=1), 80)
    half = int(bw * 1.6)
    t0, t1 = max(0, top - 4), min(h, int(top + (end - top) * 4.2))
    c0, c1 = max(0, int(cx - half)), min(w, int(cx + half))
    tpl = a[t0:t1, c0:c1]
    mask = (tpl.min(axis=2) < 225).astype(np.uint8) * 255
    return tpl, mask, (c0, t0)


def match(b, tpl, mask):
    best = (-1, None, None)
    for s in np.geomspace(0.8, 2.6, 40):
        th, tw = int(tpl.shape[0] * s), int(tpl.shape[1] * s)
        if th < 20 or tw < 10 or th >= b.shape[0] or tw >= b.shape[1]:
            continue
        t = cv2.resize(tpl, (tw, th), interpolation=cv2.INTER_AREA)
        m = cv2.resize(mask, (tw, th), interpolation=cv2.INTER_NEAREST)
        r = cv2.matchTemplate(b, t, cv2.TM_CCORR_NORMED, mask=m)
        r = np.nan_to_num(r, nan=0, posinf=0, neginf=0)
        _, v, _, loc = cv2.minMaxLoc(r)
        if v > best[0]:
            best = (v, s, loc)
    return best


def align(p1, p2):
    a, b = read(p1), read(p2)
    T = bottle_template(a)
    if T is None:
        return None, "no bulb in photo 1", 0
    tpl, mask, (tx, ty) = T
    score, s, loc = match(b, tpl, mask)
    if s is None:
        return None, "no match", 0
    mx, my = loc
    # photo 2 is scaled by 1/s so its bottle matches photo 1's size, then placed so the bottles coincide exactly
    k = 1 / s
    H, W = a.shape[:2]
    nb = cv2.resize(b, (round(b.shape[1] * k), round(b.shape[0] * k)), interpolation=cv2.INTER_AREA if k < 1 else cv2.INTER_CUBIC)
    px, py = round(tx - mx * k), round(ty - my * k)  # where scaled photo 2's top-left goes on the card canvas
    # Background for any edge the scaled photo doesn't reach: photo 2 stretched to cover, heavily blurred.
    g = max(W / b.shape[1], H / b.shape[0])
    cover = cv2.resize(b, (round(b.shape[1] * g) + 1, round(b.shape[0] * g) + 1))
    cy0, cx0 = (cover.shape[0] - H) // 2, (cover.shape[1] - W) // 2
    out = cv2.GaussianBlur(cover[cy0:cy0 + H, cx0:cx0 + W], (0, 0), 18)
    # paste the aligned photo with a soft edge so the seam into the blur isn't a hard line
    x0, y0 = max(0, px), max(0, py)
    x1, y1 = min(W, px + nb.shape[1]), min(H, py + nb.shape[0])
    piece = nb[y0 - py:y1 - py, x0 - px:x1 - px].astype(np.float32)
    alpha = np.ones(piece.shape[:2], np.float32)
    f = 14
    for edge, inside in (("l", px > 0), ("r", px + nb.shape[1] < W), ("t", py > 0), ("b", py + nb.shape[0] < H)):
        if not inside:
            continue
        ramp = np.linspace(0, 1, f, dtype=np.float32)
        if edge == "l": alpha[:, :f] = np.minimum(alpha[:, :f], ramp[None, :])
        if edge == "r": alpha[:, -f:] = np.minimum(alpha[:, -f:], ramp[::-1][None, :])
        if edge == "t": alpha[:f, :] = np.minimum(alpha[:f, :], ramp[:, None])
        if edge == "b": alpha[-f:, :] = np.minimum(alpha[-f:, :], ramp[::-1][:, None])
    region = out[y0:y1, x0:x1].astype(np.float32)
    out[y0:y1, x0:x1] = (piece * alpha[..., None] + region * (1 - alpha[..., None])).astype(np.uint8)
    gap = (x0 > 0) or (y0 > 0) or (x1 < W) or (y1 < H)
    return out, f"score {score:.3f} scale {k:.2f}{' blurred edge' if gap else ''}", 0


def main():
    rows = []
    for f1 in sorted(glob.glob(os.path.join(SRC, "*-1-sm.webp"))):
        f2 = f1.replace("-1-sm.webp", "-2-sm.webp")
        if not os.path.exists(f2):
            continue
        out, note, resid = align(f1, f2)
        name = os.path.basename(f1).replace("pure-", "").replace("-flavor-concentrate-1-sm.webp", "")
        print(f"{name:22s} {note}")
        rows.append((f1, f2, out))
        if out is not None and not SHEET:
            write(f1.replace("-1-sm.webp", "-hover-sm.webp"), out)
    if SHEET:
        tw, th = 180, 141
        sheet = np.full((th * len(rows), tw * 3, 3), 255, np.uint8)
        for i, (f1, f2, out) in enumerate(rows):
            for j, im in enumerate([read(f1), read(f2), out]):
                if im is None:
                    continue
                sheet[i * th:(i + 1) * th, j * tw:(j + 1) * tw] = cv2.resize(im, (tw, th))
        ok, buf = cv2.imencode(".png", sheet)
        buf.tofile(SHEET)


main()
