"""Estimate one rigid offset between Microsoft/Bing footprints and OSM streets.

Bing imagery and the imagery used to trace OSM streets are not perfectly
co-registered. Measured on the 2026-11-06 snapshot, the footprints sit a few
metres off the street axes in the same direction in every quadrant of town, so a
single translation (not per-house nudging) is the honest correction.

The estimate minimises the footprint area that falls on motor-road pavement.
It never rotates or scales and is bounded to MAX_OFFSET metres.
"""
import numpy as np
import shapely
from shapely.geometry import LineString, Polygon

MAX_OFFSET = 8.0
NON_MOTOR = {'footway', 'path', 'steps', 'track'}


def _local_pavement(polys, roads, reach):
    motor = [r for r in roads if r['kind'] not in NON_MOTOR]
    pavement = shapely.buffer(np.array([LineString(r['points']) for r in motor]),
                              np.array([r['width'] for r in motor]) / 2)
    tree = shapely.STRtree(pavement)
    local = []
    for poly in polys:
        ids = tree.query(shapely.buffer(poly, reach))
        local.append(shapely.union_all(pavement[ids]) if len(ids) else Polygon())
    local = np.array(local)
    shapely.prepare(local)
    return local


def _overlap(polys, local, dx, dy):
    moved = shapely.transform(polys, lambda c: c + [dx, dy])
    return shapely.area(shapely.intersection(moved, local))


def estimate_offset(footprints, roads):
    """footprints: list of point rings in local metres. Returns (dx, dy, report)."""
    polys = np.array([Polygon(p) for p in footprints])
    local = _local_pavement(polys, roads, MAX_OFFSET + 2)
    cost = lambda dx, dy: float(_overlap(polys, local, dx, dy).sum())
    best = (cost(0, 0), 0.0, 0.0)
    before = best[0]
    for step in (2.0, 1.0, .5, .25):
        cx, cy = best[1], best[2]
        span = 4 if step == 2.0 else 2
        for i in range(-span, span + 1):
            for j in range(-span, span + 1):
                dx, dy = cx + i * step, cy + j * step
                if abs(dx) > MAX_OFFSET or abs(dy) > MAX_OFFSET:
                    continue
                c = cost(dx, dy)
                if c < best[0] - 1e-6:
                    best = (c, dx, dy)
    _, dx, dy = best
    ov_before = _overlap(polys, local, 0, 0)
    ov_after = _overlap(polys, local, dx, dy)
    report = {
        'translationMetres': [dx, dy],
        'method': 'single rigid translation minimising Microsoft footprint area on OSM motor-road pavement; no rotation or scale',
        'footprints': len(polys),
        'onPavementBefore': {'buildingsOver2m2': int((ov_before > 2).sum()), 'squareMetres': round(float(ov_before.sum()), 1)},
        'onPavementAfter': {'buildingsOver2m2': int((ov_after > 2).sum()), 'squareMetres': round(float(ov_after.sum()), 1)},
    }
    return dx, dy, report
