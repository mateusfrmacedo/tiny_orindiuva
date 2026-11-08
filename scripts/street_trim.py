"""Final guarantee that no displayed building sits on motor-road pavement.

After registration, alignment and small placement moves, some outlines still touch
the street: OSM road widths are estimates and the machine detections are not
surveys. For display only, the part of a footprint that falls on the pavement
(plus a thin kerb margin) is cut away. When less than half of an outline would
remain, the detection is most likely a false positive or a mis-traced street; it
is withheld from display but kept, untouched, in the exported model.
"""
from shapely.geometry import LineString, Polygon
from shapely.geometry.polygon import orient
from shapely.ops import unary_union

NON_MOTOR = {'footway', 'path', 'steps', 'track'}
KERB = .4
MIN_OVERLAP = .3
KEEP_FRACTION = .5
MIN_AREA = 12


def _display(b):
    g = b.get('placement') or b.get('alignment') or b
    return Polygon(g['points'], g.get('holes', []))


def trim_buildings(buildings, roads):
    motor = [r for r in roads if r['kind'] not in NON_MOTOR]
    pavement = unary_union([LineString(r['points']).buffer(r['width'] / 2, quad_segs=16) for r in motor])
    clear = unary_union([LineString(r['points']).buffer(r['width'] / 2 + KERB, quad_segs=16) for r in motor])
    kept, withheld, trimmed, removed = [], [], 0, 0.0
    for b in buildings:
        shape = _display(b)
        if b.get('landmark') or not shape.intersects(clear):
            kept.append(b)
            continue
        overlap = shape.intersection(clear).area
        if overlap < MIN_OVERLAP and not shape.intersects(pavement):
            kept.append(b)
            continue
        rest = shape.difference(clear)
        parts = [rest] if rest.geom_type == 'Polygon' else list(getattr(rest, 'geoms', []))
        parts = [p for p in parts if p.geom_type == 'Polygon']
        best = max(parts, key=lambda p: p.area) if parts else Polygon()
        if best.is_empty or best.area < max(MIN_AREA, KEEP_FRACTION * shape.area):
            withheld.append({'reason': 'mostly_on_street', 'onStreetFraction': round(overlap / shape.area, 3), 'building': b})
            continue
        best = orient(best.simplify(.05, preserve_topology=True), 1.0)
        b['clearance'] = {
            'points': [[round(x, 4), round(y, 4)] for x, y in list(best.exterior.coords)[:-1]],
            'holes': [[[round(x, 4), round(y, 4)] for x, y in list(h.coords)[:-1]] for h in best.interiors],
            'centroid': [round(v, 4) for v in best.centroid.coords[0]],
            'bounds': [round(v, 4) for v in best.bounds],
            'removedSquareMetres': round(shape.area - best.area, 2),
            'method': 'display-only cut of the part on road pavement plus 0.4 m kerb; source outline unchanged',
        }
        trimmed += 1
        removed += shape.area - best.area
        kept.append(b)
    report = {'kerbMetres': KERB, 'trimmed': trimmed, 'trimmedSquareMetres': round(removed, 1),
              'withheld': len(withheld), 'keepFraction': KEEP_FRACTION}
    return kept, withheld, report
