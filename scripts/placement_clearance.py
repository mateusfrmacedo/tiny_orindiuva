"""Resolve small illustration conflicts, without treating estimated streets as a survey.

All work is offline. Keep source and alignment geometries; store a separate rigid
translation only when it fully clears the street within the same mapped block.
"""
import math
from collections import Counter
from shapely.geometry import Polygon, LineString
from shapely.ops import unary_union, polygonize, nearest_points
from shapely.affinity import translate
from shapely.strtree import STRtree


def correct_placement(buildings, roads, areas):
    motor = [r for r in roads if r['kind'] not in ['footway', 'path', 'steps', 'track']]
    lines = [LineString(r['points']) for r in motor]
    pavement = unary_union([line.buffer(road['width']/2) for line, road in zip(lines, motor)])
    clearance = pavement.buffer(.15)
    road_index = STRtree(lines)
    blocks = list(polygonize(unary_union(lines)))
    block_index = STRtree(blocks)
    parks = unary_union([Polygon(a['points']) for a in areas if a['kind'] == 'park'])
    before = [Polygon(b.get('alignment', b)['points'], b.get('alignment', b).get('holes', [])) for b in buildings]
    current = list(before)
    neighbours = STRtree(before)
    counts = Counter()
    review = []
    for number, (building, shape) in enumerate(zip(buildings, before)):
        old_road = shape.intersection(pavement).area
        if old_road <= 2:
            continue
        nearby_roads = sorted(int(i) for i in road_index.query(shape.buffer(4)))
        reason = None
        if building.get('landmark') or building['source'] != 'Microsoft/Bing' or parks.intersects(shape):
            reason = 'protected'
        elif old_road/shape.area > .22 or not 20 <= shape.area <= 1800:
            reason = 'large_or_ambiguous_conflict'
        cell = next((blocks[int(i)] for i in block_index.query(shape.centroid) if blocks[int(i)].covers(shape.centroid)), None)
        if not reason and cell is None:
            reason = 'no_closed_block'
        accepted = None
        if reason is None:
            vectors = []
            for i in nearby_roads:
                point = nearest_points(lines[i], shape.centroid)[0]
                dx, dy = shape.centroid.x-point.x, shape.centroid.y-point.y
                length = math.hypot(dx, dy)
                if length:
                    vectors.append((dx/length, dy/length))
            if len(vectors) > 1:
                dx, dy = sum(v[0] for v in vectors), sum(v[1] for v in vectors)
                length = math.hypot(dx, dy)
                if length:
                    vectors.append((dx/length, dy/length))
            ids = [int(i) for i in neighbours.query(shape.buffer(7)) if int(i) != number]
            overlaps = {i: shape.intersection(current[i]).area for i in ids}
            candidates = []
            for dx, dy in vectors:
                for step in range(1, 13):
                    distance = step*.25
                    candidate = translate(shape, dx*distance, dy*distance)
                    if candidate.intersection(clearance).area > .02 or not cell.covers(candidate):
                        continue
                    if any(candidate.intersection(current[i]).area > overlaps[i]+.02 for i in ids):
                        continue
                    candidates.append((distance, dx, dy, candidate))
                    break
            if candidates:
                accepted = min(candidates, key=lambda c: c[0])
            else:
                reason = 'insufficient_space_within_3m'
        if accepted:
            distance, dx, dy, candidate = accepted
            # Quantize first: the exported geometry is what subsequent houses see.
            points = [[round(x, 4), round(y, 4)] for x, y in list(candidate.exterior.coords)[:-1]]
            holes = [[[round(x, 4), round(y, 4)] for x, y in list(h.coords)[:-1]] for h in candidate.interiors]
            candidate = Polygon(points, holes)
            current[number] = candidate
            building['placement'] = {
                'points': points, 'holes': holes,
                'centroid': [round(v, 4) for v in candidate.centroid.coords[0]],
                'bounds': [round(v, 4) for v in candidate.bounds],
                'translation': [round(dx*distance, 6), round(dy*distance, 6)],
                'distance': distance,
                'roadOverlapBefore': round(old_road, 3),
                'roadOverlapAfter': round(candidate.intersection(pavement).area, 3),
                'roadIds': [motor[i]['id'] for i in nearby_roads],
                'method': 'inferred small street-clearance translation within OSM block; not a measured parcel or Earth-derived footprint'
            }
            counts['corrected'] += 1
        else:
            counts[reason] += 1
            review.append({'id': building['id'], 'overlapSquareMetres': round(old_road, 2), 'reason': reason, 'roadIds': [motor[i]['id'] for i in nearby_roads]})
    return {
        'evaluated': len(buildings), 'conflictsBefore': sum(counts.values()),
        'conflictsAfter': len(review), 'counts': dict(counts),
        'maxTranslationMetres': 3, 'minimumReportedOverlapSquareMetres': 2,
        'reviewedAt': '2026-11-07',
        'basis': 'visual comparison of central and southern blocks in Google Earth (imagery dated 2025-12-22); corrections are inferred from OSM/Microsoft, not manually surveyed houses',
        'review': review
    }
