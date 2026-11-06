"""Conservative display corrections; never edits the source footprint or invents lots."""
import math
from collections import Counter
from shapely.geometry import Polygon, LineString, Point
from shapely.ops import unary_union, polygonize, nearest_points
from shapely.affinity import rotate, translate
from shapely.strtree import STRtree


def align_buildings(buildings, roads, areas):
    segments = []
    for road in roads:
        if road['kind'] not in ['residential', 'secondary', 'tertiary', 'living_street']:
            continue
        for a, b in zip(road['points'], road['points'][1:]):
            if math.dist(a, b) > 15:
                segments.append((LineString([a, b]), math.atan2(b[1]-a[1], b[0]-a[0]), road['id']))
    index = STRtree([s[0] for s in segments])
    originals = [Polygon(b['points'], b.get('holes', [])) for b in buildings]
    current = list(originals)
    neighbours = STRtree(originals)
    motor = [r for r in roads if r['kind'] not in ['footway', 'path', 'steps']]
    pavement = unary_union([LineString(r['points']).buffer(r['width']/2+.15) for r in motor])
    blocks = list(polygonize(unary_union([LineString(r['points']) for r in motor])))
    block_index = STRtree(blocks)
    parks = unary_union([Polygon(a['points']) for a in areas if a['kind'] == 'park'])
    counts = Counter()
    for number, (building, source) in enumerate(zip(buildings, originals)):
        if building['source'] != 'Microsoft/Bing' or building.get('landmark') or parks.covers(source.centroid) or not 20 <= source.area <= 1800:
            counts['protected_or_unsuitable'] += 1
            continue
        edges = [(math.atan2(b[1]-a[1], b[0]-a[0]), math.dist(a, b)) for a, b in zip(building['points'], building['points'][1:]+building['points'][:1]) if math.dist(a, b) > 2]
        sx = sum(w*math.cos(4*t) for t, w in edges)
        sy = sum(w*math.sin(4*t) for t, w in edges)
        if not edges or math.hypot(sx, sy)/sum(w for _, w in edges) < .96:
            counts['non_rectilinear'] += 1
            continue
        angle = math.atan2(sy, sx)/4
        candidates = sorted((int(i) for i in index.query(source.centroid.buffer(55))), key=lambda i: segments[i][0].distance(source.centroid))[:8]
        if not candidates or source.distance(segments[candidates[0]][0]) > 30:
            counts['no_nearby_frontage'] += 1
            continue
        weights = [(segments[i], min(segments[i][0].length, 70)/(segments[i][0].distance(source.centroid)+10)**2) for i in candidates]
        x = sum(w*math.cos(4*s[1]) for s, w in weights)
        y = sum(w*math.sin(4*s[1]) for s, w in weights)
        if math.hypot(x, y)/sum(w for _, w in weights) < .985:
            counts['ambiguous_street_grid'] += 1
            continue
        target = math.atan2(y, x)/4
        delta = (target-angle+math.pi/4) % (math.pi/2)-math.pi/4
        degrees = math.degrees(delta)
        if not .75 <= abs(degrees) <= 8:
            counts['already_aligned_or_intentional_angle'] += 1
            continue
        centroid = source.centroid
        nearest = nearest_points(segments[candidates[0]][0], centroid)[0]
        dx, dy = centroid.x-nearest.x, centroid.y-nearest.y
        length = math.hypot(dx, dy) or 1
        dx, dy = dx/length, dy/length
        cell = next((blocks[int(i)] for i in block_index.query(centroid) if blocks[int(i)].covers(centroid)), None)
        old_road = source.intersection(pavement).area
        old_outside = source.difference(cell).area if cell is not None else 0
        ids = [int(i) for i in neighbours.query(source.buffer(5)) if int(i) != number]
        old_overlaps = {i: source.intersection(originals[i]).area for i in ids}
        accepted = None
        for factor in [1, .75, .5]:
            turned = rotate(source, degrees*factor, origin=centroid)
            for setback in [0, .25, .5, .75, 1]:
                candidate = translate(turned, dx*setback, dy*setback)
                moved = max(math.dist(a, b) for a, b in zip(source.exterior.coords, candidate.exterior.coords))
                if moved > 2.25 or candidate.intersection(pavement).area > old_road+.05:
                    continue
                if cell is not None and candidate.difference(cell).area > old_outside+.05:
                    continue
                if any(candidate.intersection(current[i]).area > old_overlaps[i]+.05 for i in ids):
                    continue
                accepted = candidate, degrees*factor, [dx*setback, dy*setback], moved
                break
            if accepted:
                break
        if accepted is None:
            counts['space_constraint'] += 1
            continue
        candidate, turn, shift, moved = accepted
        current[number] = candidate
        building['alignment'] = {
            'points': [[round(x, 4), round(y, 4)] for x, y in list(candidate.exterior.coords)[:-1]],
            'holes': [[[round(x, 4), round(y, 4)] for x, y in list(h.coords)[:-1]] for h in candidate.interiors],
            'centroid': [round(candidate.centroid.x, 4), round(candidate.centroid.y, 4)],
            'bounds': [round(v, 4) for v in candidate.bounds],
            'rotationDegrees': round(turn, 6), 'translation': [round(v, 6) for v in shift],
            'maxVertexDisplacement': round(moved, 5),
            'roadIds': list(dict.fromkeys(segments[i][2] for i in candidates[:3])),
            'method': 'inferred street-grid display alignment; source retained; no cadastral lot boundaries'
        }
        counts['aligned'] += 1
    return {'evaluated': len(buildings), 'counts': dict(counts), 'maxRotationDegrees': 8, 'maxVertexDisplacementMetres': 2.25, 'maxTranslationMetres': 1, 'basis': 'OSM street direction and blocks; visually checked against owner drone panorama CIABIhB3Ga3kscNQA7WSywv0Hphj; inferred, not a per-building survey'}
