"""Hand-placed hover photos for the scenes template matching can't handle.

MANUAL gives, for photo 2 (the lifestyle shot, in its own pixels): dropper bulb top y, bottle base y, bottle centre x.
Photo 1's bottle is measured automatically on its white background. Photo 2 is scaled so the bottle heights match,
then positioned so the bulb tops and centres coincide; uncovered edges get a blurred fill (as in the main script).
"""
import os, sys
import cv2, numpy as np

MANUAL = {
    "banana": (45, 360, 280),
    "blueberry": (102, 400, 240),
    "condensed-milk": (145, 480, 278),
    "honey": (62, 470, 280),
    "salted-caramel": (107, 320, 280),
}
P = sys.argv[1]
SHEET = sys.argv[2] if len(sys.argv) > 2 else None


def read(p):
    return cv2.imdecode(np.fromfile(p, np.uint8), cv2.IMREAD_COLOR)


def bottle1(a):
    h, w = a.shape[:2]
    dark = a.max(axis=2) < 70
    x0, x1 = int(w * 0.3), int(w * 0.7)
    rows = np.where(dark[:, x0:x1].sum(axis=1) >= max(4, w * 0.02))[0]
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
    col = a[:, int(cx) - 3:int(cx) + 4].min(axis=2).min(axis=1)
    base = np.where(col < 215)[0].max()
    return top, base, cx


def compose(a, b, t2, b2, c2):
    H, W = a.shape[:2]
    t1, b1, c1 = bottle1(a)
    k = (b1 - t1) / (b2 - t2)
    nb = cv2.resize(b, (round(b.shape[1] * k), round(b.shape[0] * k)), interpolation=cv2.INTER_AREA if k < 1 else cv2.INTER_CUBIC)
    px, py = round(c1 - c2 * k), round(t1 - t2 * k)
    g = max(W / b.shape[1], H / b.shape[0])
    cover = cv2.resize(b, (round(b.shape[1] * g) + 1, round(b.shape[0] * g) + 1))
    cy0, cx0 = (cover.shape[0] - H) // 2, (cover.shape[1] - W) // 2
    out = cv2.GaussianBlur(cover[cy0:cy0 + H, cx0:cx0 + W], (0, 0), 18)
    x0, y0, x1, y1 = max(0, px), max(0, py), min(W, px + nb.shape[1]), min(H, py + nb.shape[0])
    out[y0:y1, x0:x1] = nb[y0 - py:y1 - py, x0 - px:x1 - px]
    return out, (t1, b1, c1, k)


tiles = []
for n, (t2, b2, c2) in MANUAL.items():
    f1 = os.path.join(P, f"pure-{n}-flavor-concentrate-1-sm.webp")
    a, b = read(f1), read(f1.replace("-1-sm.webp", "-2-sm.webp"))
    out, info = compose(a, b, t2, b2, c2)
    print(n, "photo1 top/base/cx", info[:3], "scale %.2f" % info[3])
    if SHEET:
        ga, go = a.copy(), out.copy()
        for im in (ga, go):  # guide lines at photo 1's bulb top, base and centre
            cv2.line(im, (0, int(info[0])), (im.shape[1], int(info[0])), (0, 200, 0), 1)
            cv2.line(im, (0, int(info[1])), (im.shape[1], int(info[1])), (0, 200, 0), 1)
            cv2.line(im, (int(info[2]), 0), (int(info[2]), im.shape[0]), (0, 200, 0), 1)
        tiles.append(np.hstack([ga, go]))
    else:
        ok, buf = cv2.imencode(".webp", out, [cv2.IMWRITE_WEBP_QUALITY, 82])
        buf.tofile(f1.replace("-1-sm.webp", "-hover-sm.webp"))
if SHEET:
    ok, buf = cv2.imencode(".png", cv2.resize(np.vstack(tiles), None, fx=0.5, fy=0.5))
    buf.tofile(SHEET)
