"""Compile real OSM geometry and Microsoft/Bing building footprints.
No synthetic buildings or parcel infill. Python 3 + shapely required.
"""
import xml.etree.ElementTree as ET
import json,math,random,hashlib
from collections import defaultdict,Counter
from pathlib import Path
from shapely.geometry import Polygon,Point,shape,LineString
from shapely.ops import unary_union,polygonize
ROOT=Path(__file__).resolve().parents[1]
random.seed(73)
r=ET.parse(ROOT/'public/data/orindiuva.osm').getroot()
def xy(lon,lat):return [round((float(lon)+49.351)*104450,2),round((-float(lat)-20.182)*111320,2)]
nodes={e.attrib['id']:xy(e.attrib['lon'],e.attrib['lat']) for e in r.findall('node')}
def tags(e):return {t.attrib['k']:t.attrib['v'] for t in e.findall('tag')}
def ring(pts):return pts[:-1] if pts[0]==pts[-1] else pts
roads=[];areas=[];places=[];osm_buildings=[];waterways=[]
for e in r:
 t=tags(e);eid=e.attrib.get('id');pts=[nodes[n.attrib['ref']] for n in e.findall('nd') if n.attrib['ref'] in nodes]
 if e.tag=='way' and len(pts)>1:
  if 'highway'in t:
   kind=t['highway'];default=2 if kind in ['footway','path','steps'] else 4 if kind in ['service','track'] else 10 if kind in ['primary','secondary','tertiary'] else 7
   try:width=float(t.get('width',default))
   except ValueError:width=default
   roads.append({'nodes':[n.attrib['ref'] for n in e.findall('nd')],'layer':int(t.get('layer','0')),'bridge':t.get('bridge')=='yes','access':t.get('access','yes'),'widthSource':'osm' if 'width' in t else 'estimated','id':eid,'points':pts,'name':t.get('name',''),'kind':kind,'width':width,'surface':t.get('surface','unknown'),'oneway':t.get('oneway')=='yes'})
  if 'waterway'in t or t.get('natural')=='tree_row':waterways.append({'points':pts,'kind':t.get('waterway',t.get('natural'))})
  if len(pts)>3 and pts[0]==pts[-1] and any(k in t for k in ['leisure','landuse','building','natural','water']):
   p=Polygon(pts)
   if p.is_valid:
    if 'building'in t:osm_buildings.append({'points':ring(pts),'id':'osm-'+eid,'h':4.5,'heightSource':'illustrative','roof':0,'source':'OpenStreetMap','name':t.get('name','')})
    else:areas.append({'id':eid,'sport':t.get('sport'),'points':ring(pts),'kind':t.get('leisure',t.get('landuse',t.get('natural','water'))),'name':t.get('name','')})
 if t.get('name') and (t.get('leisure')=='park' or t.get('amenity')in ['townhall','place_of_worship','bus_station','school','theatre','post_office']):
  p=nodes[eid] if e.tag=='node' else list(Polygon(pts).centroid.coords)[0] if len(pts)>3 else None
  if p:places.append({'id':eid,'type':e.tag,'name':t['name'],'kind':t.get('amenity',t.get('leisure')),'point':p,'street':t.get('addr:street','')})
# Paint the whole network in passes. Buffer in geographic metre space BEFORE
# isometric projection: screen-space strokes distort widths at diagonal junctions.
def polygons(geom):
 if geom.is_empty:return []
 items=[geom] if geom.geom_type=='Polygon' else list(geom.geoms)
 return [{'points':[[round(x,2),round(y,2)] for x,y in p.exterior.coords[:-1]],'holes':[[[round(x,2),round(y,2)] for x,y in h.coords[:-1]] for h in p.interiors]} for p in items if p.geom_type=='Polygon']
pedestrian={'footway','path','steps'}
motor=[r for r in roads if r['kind']not in pedestrian]
paved=[r for r in motor if r['surface']not in ['unpaved','dirt','ground','gravel']]
unpaved=[r for r in motor if r not in paved]
def surfaces(items,extra=0):return polygons(unary_union([LineString(r['points']).buffer(r['width']/2+extra,quad_segs=4,join_style='round') for r in items]))
road_surfaces={'sidewalk':surfaces(motor,1.25),'asphalt':surfaces(paved),'unpaved':surfaces(unpaved),'pedestrian':surfaces([r for r in roads if r['kind']in pedestrian])}
# Audit source topology using shared OSM node IDs; never join nearby streets by guess.
graph=defaultdict(set);node_roads=defaultdict(set);road_by_id={r['id']:r for r in roads}
for road in roads:
 for a,b in zip(road['nodes'],road['nodes'][1:]):graph[a].add(b);graph[b].add(a)
 for n in road['nodes']:node_roads[n].add(road['id'])
remaining=set(graph);components=[]
while remaining:
 stack=[min(remaining)];remaining.remove(stack[0]);component=set(stack)
 while stack:
  for v in graph[stack.pop()]:
   if v in remaining:remaining.remove(v);component.add(v);stack.append(v)
 ids=sorted({rid for n in component for rid in node_roads[n]})
 components.append({'nodeCount':len(component),'roads':ids,'kinds':dict(Counter(road_by_id[rid]['kind'] for rid in ids))})
components.sort(key=lambda c:-c['nodeCount'])
junctions=[{'node':n,'point':nodes[n],'degree':len(neighbours),'roads':sorted(node_roads[n])} for n,neighbours in graph.items() if len(neighbours)>2]
network={'nodeCount':len(graph),'edgeCount':sum(map(len,graph.values()))//2,'components':components,'junctions':junctions}
features=json.loads((ROOT/'public/data/buildings-microsoft.geojson').read_text())['features']
buildings=[];osm_shapes=[Polygon(b['points']) for b in osm_buildings]
for f in features:
 props=f['properties'];poly=shape(f['geometry']);pts=ring([xy(*c) for c in f['geometry']['coordinates'][0]]);p=Polygon(pts)
 if not p.is_valid or p.area<9:continue
 # Prefer community-mapped OSM outlines wherever they overlap machine detections.
 if any(p.intersection(o).area/min(p.area,o.area)>.35 for o in osm_shapes):continue
 key=hashlib.sha256(json.dumps(f['geometry'],sort_keys=True).encode()).hexdigest()[:16]
 buildings.append({'id':'ms-'+key,'points':pts,'holes':[ring([xy(*c) for c in hole]) for hole in f['geometry']['coordinates'][1:]],'h':props['height'] if props['height']>0 else 4.5,'heightSource':'microsoft' if props['height']>0 else 'illustrative','roof':int(key[:4],16)%6,'source':'Microsoft/Bing','confidence':round(props.get('confidence',-1),3),'area':round(p.area,1)})
buildings+=osm_buildings
for b in buildings:
 p=Polygon(b['points']);b['points']=b['points'] if p.exterior.is_ccw else list(reversed(b['points']));b['area']=round(p.area,1);b['centroid']=list(p.centroid.coords)[0];b['bounds']=list(p.bounds)
# Regional palette inferred from the supplied aerial references, not a per-house survey.
for b in buildings:
 seed=int(hashlib.sha256(b['id'].encode()).hexdigest()[:8],16)
 metal=seed%100<(65 if b['area']>550 else 15)
 b['roofMaterial']='metal' if metal else 'ceramic'
 b['roof']=(6+seed%2) if metal else seed%6
visual_details=json.loads((ROOT/'public/data/visual-details.json').read_text())
reference_corrections=[]
for detail in visual_details['parks'].values():
 feature=next((b for b in buildings if b['id']==detail.get('reclassifyBuilding')),None)
 if feature:
  buildings.remove(feature);reference_corrections.append({'classification':'fountain','reference':detail['reference'],'reason':detail['correctionReason'],'originalFeature':feature})
for a in areas:
 rect=list(Polygon(a['points']).minimum_rotated_rectangle.exterior.coords)[:-1]
 i=max(range(4),key=lambda i:Point(rect[i]).distance(Point(rect[(i+1)%4])))
 origin=rect[i];u=[rect[(i+1)%4][j]-origin[j] for j in [0,1]];v=[rect[(i-1)%4][j]-origin[j] for j in [0,1]]
 a['frame']={'origin':list(origin),'u':u,'v':v,'width':math.hypot(*u),'height':math.hypot(*v)}
 if a['id'] in visual_details['parks']:
  a['visual']=visual_details['parks'][a['id']]
  if a['visual'].get('officialName'):
   a['name']=a['visual']['officialName']
   if not any(p['id']==a['id'] for p in places):places.append({'id':a['id'],'type':'way','name':a['name'],'kind':'park','point':list(Polygon(a['points']).centroid.coords)[0],'street':'Praça identificada no croqui urbanístico e no guia municipal Onde Visitar.'})
  if a['visual'].get('lightRoofs'):
   for b in buildings:
    if Polygon(a['points']).contains(Point(b['centroid'])):b['roof']=6;b['roofMaterial']='metal'
# Warm inner-block ground replaces the blanket of grass between roofs.
# Derive block limits from existing streets and cut out all mapped parks/facilities.
building_cover=unary_union([Polygon(b['points']) for b in buildings])
excluded=unary_union([Polygon(a['points']) for a in areas]+[Polygon(a['points'],a['holes']) for a in road_surfaces['sidewalk']])
urban_blocks=[]
for block in polygonize(unary_union([LineString(r['points']) for r in motor])):
 if 300<block.area<80000 and building_cover.intersection(block).area/block.area>.12:
  urban_blocks.extend(polygons(block.difference(excluded)))
church=next(p for p in places if 'Santa Terezinha'in p['name'])
church_building=min(buildings,key=lambda b:Polygon(b['points']).distance(Point(church['point'])))
church_building['landmark']='church';church_building['name']=church['name'];church_building['h']=12;church_building['roof']=6;church_building['roofMaterial']='metal'
# Vegetation is restricted to mapped parks/tree rows; never invent houses or fill yards.
trees=[];built=unary_union([Polygon(b['points']).buffer(2) for b in buildings]+[LineString(r['points']).buffer(r['width']/2+1) for r in roads])
for area in areas:
 if area['kind']=='park':
  poly=Polygon(area['points']);edge=poly.exterior
  for d in range(0,int(edge.length),10):
   a=edge.interpolate(d);q=poly.centroid;v=[q.x-a.x,q.y-a.y];norm=math.hypot(*v) or 1;x=a.x+v[0]/norm*4;y=a.y+v[1]/norm*4
   if poly.contains(Point(x,y)) and not built.contains(Point(x,y)):trees.append([round(x,2),round(y,2),random.uniform(3,4.5)])
for line in waterways:
 if line['kind']=='tree_row':
  from shapely.geometry import LineString
  ls=LineString(line['points'])
  for d in range(0,int(ls.length),9):p=ls.interpolate(d);trees.append([p.x,p.y,4])
landcover=[]
for feature in json.loads((ROOT/'public/data/landcover-esa.geojson').read_text())['features']:
 rings=feature['geometry']['coordinates'];pts=ring([xy(*c) for c in rings[0]]);poly=Polygon(pts)
 if poly.area<500:continue
 kind='forest' if feature['properties']['class']==10 else 'water'
 landcover.append({'points':pts,'holes':[ring([xy(*c) for c in h]) for h in rings[1:]],'kind':kind})
 if kind=='forest' and poly.area>1800:
  xmin,ymin,xmax,ymax=poly.bounds
  for x in range(int(xmin),int(xmax),12):
   for y in range(int(ymin),int(ymax),12):
    px=x+random.uniform(-4,4);py=y+random.uniform(-4,4)
    if poly.contains(Point(px,py)) and not built.contains(Point(px,py)):trees.append([round(px,2),round(py,2),random.uniform(6,8)])
# Individual street trees are decorative; the road and building geometry is unchanged.
for road in roads:
 if road['kind']not in ['residential','living_street']:continue
 line=LineString(road['points'])
 for distance in range(14,int(line.length)-8,32):
  p=line.interpolate(distance);q=line.interpolate(distance+1);angle=math.atan2(q.y-p.y,q.x-p.x)
  for side in [-1,1]:
   offset=road['width']/2+2.7;x=p.x-side*math.sin(angle)*offset;y=p.y+side*math.cos(angle)*offset;point=Point(x,y)
   if not built.contains(point) and building_cover.distance(point)<28:trees.append([round(x,2),round(y,2),random.uniform(1.6,2.5)])
# Give the circular garden airy planting, keeping its paths legible.
for area in areas:
 pattern=area.get('visual',{}).get('pattern')
 if not pattern:continue
 poly=Polygon(area['points']);trees=[t for t in trees if not poly.contains(Point(t[:2]))];fr=area['frame']
 def local(u,v):return [fr['origin'][j]+u*fr['u'][j]+v*fr['v'][j] for j in [0,1]]
 planting=[(.12,.12),(.12,.88),(.88,.12),(.88,.88),(.5,.12),(.5,.88),(.12,.5),(.88,.5)] if pattern=='circular-garden' else [(u,v) for u in [.13,.28,.72,.87] for v in [.18,.82]] if pattern=='fountain-garden' else [(u,v) for u in [.22,.5,.77] for v in [.28,.72]]
 for u,v in planting:
  x,y=local(u,v)
  if poly.contains(Point(x,y)) and not built.contains(Point(x,y)):trees.append([round(x,2),round(y,2),3 if pattern=='circular-garden' else 3.7])
 if pattern=='circular-garden':
  for u,v in [(.4,.4),(.6,.4),(.4,.6),(.6,.6)]:
   x,y=local(u,v);trees.append([round(x,2),round(y,2),3.5,'palm'])
meta={'snapshot':'2026-11-06','projection':{'origin':[-49.351,-20.182],'metersPerDegree':[104450,111320]},'bounds':[-49.369,-20.199,-49.335,-20.166],'sources':[{'name':'OpenStreetMap contributors','role':'Ruas, praças, caminhos, água e lugares','url':'https://www.openstreetmap.org/copyright','license':'ODbL-1.0'},{'name':'Microsoft Global ML Building Footprints / Bing','role':'Posição e contorno das construções detectadas em imagens aéreas','url':'https://github.com/microsoft/GlobalMLBuildingFootprints','license':'CDLA-Permissive-2.0','quadkey':'210133203','release':'2026-07-24'},{'name':'Prefeitura de Orindiúva','role':'Croqui urbanístico consultado para comparação; fevereiro/2021','url':'https://orindiuva.sp.gov.br/wp-content/uploads/2022/04/MAPA-DA-CIDADE-BAIRROS-Atualizado-Model.pdf'}],'visualReferenceRevision':visual_details['revision'],'syntheticBuildings':0,'limitations':'Footprints are machine detections, not a cadastral survey. Heights, roof colors and facades are illustrative. Individual trees are decorative within OSM parks/tree rows, streets and ESA 2021 tree-cover areas. Park paths and regional roof materials are schematic, refined from user-supplied aerial reference images. Landcover resolution is 10 m and may be outdated. No imagery files are embedded or redistributed; building and road outlines remain from OSM/Microsoft.'}
urban=max(unary_union([Polygon(b['points']).buffer(22) for b in buildings]).geoms,key=lambda p:p.area).bounds
meta['urbanBounds']=[round(v,2) for v in urban]
meta['sources'].append({'name':'ESA WorldCover 2021 v200','role':'Cobertura arbórea e água, resolução 10 m; recorte e simplificação','url':'https://esa-worldcover.org/en/data-access','license':'CC-BY-4.0','attribution':'© ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium'})
model={'referenceCorrections':reference_corrections,'urbanBlocks':urban_blocks,'roadSurfaces':road_surfaces,'network':network,'landcover':landcover,'center':church['point'],'roads':roads,'areas':areas,'waterways':waterways,'buildings':buildings,'trees':trees,'places':places,'meta':meta}
(ROOT/'public/data/map.json').write_text(json.dumps(model,separators=(',',':'),ensure_ascii=False))
print(len(roads),'road/path segments;',len(buildings),'real footprint geometries;',len(trees),'decorative trees in mapped cover; zero synthetic buildings')
