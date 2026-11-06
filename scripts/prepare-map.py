"""Compile the attributed OSM snapshot into deterministic illustrated map geometry.
Run with Python 3 and shapely. Houses are artistic infill, not surveyed footprints.
"""
import xml.etree.ElementTree as ET
import json,math,random
from pathlib import Path
from shapely.geometry import LineString,Polygon,Point
from shapely.ops import unary_union,polygonize
random.seed(73)
r=ET.parse(Path(__file__).resolve().parents[1]/'public/data/orindiuva.osm').getroot()
def xy(lon,lat):return [round((float(lon)+49.351)*104450,2),round((-float(lat)-20.182)*111320,2)]
nodes={e.attrib['id']:xy(e.attrib['lon'],e.attrib['lat']) for e in r.findall('node')}
def tags(e):return {t.attrib['k']:t.attrib['v'] for t in e.findall('tag')}
roads=[];areas=[];places=[];buildings=[]
for e in r:
 t=tags(e);eid=e.attrib.get('id');pts=[nodes[n.attrib['ref']] for n in e.findall('nd') if n.attrib['ref'] in nodes]
 if e.tag=='way' and len(pts)>1:
  if 'highway'in t and t['highway']not in ['footway','path','steps','track','service']:
   roads.append({'id':eid,'points':pts,'name':t.get('name',''),'kind':t['highway']})
  if len(pts)>3 and pts[0]==pts[-1] and any(k in t for k in ['leisure','landuse','building','natural','water']):
   p=Polygon(pts)
   if p.is_valid:
    if 'building'in t:buildings.append({'points':pts,'h':8,'roof':0})
    else:areas.append({'points':pts,'kind':t.get('leisure',t.get('landuse',t.get('natural','water'))),'name':t.get('name','')})
 if t.get('name') and (t.get('leisure')=='park' or t.get('amenity')in ['townhall','place_of_worship','bus_station','school','theatre','post_office']):
  p=nodes[eid] if e.tag=='node' else list(Polygon(pts).centroid.coords)[0] if len(pts)>3 else None
  if p:places.append({'id':eid,'type':e.tag,'name':t['name'],'kind':t.get('amenity',t.get('leisure')),'point':p,'street':t.get('addr:street','')})
lines=[LineString(d['points']) for d in roads]
blocks=list(polygonize(unary_union(lines)))
exclusions=unary_union([Polygon(a['points']) for a in areas if a['kind']not in ['residential','farmland','meadow']]+[Polygon(b['points']) for b in buildings])
houses=[];trees=[]
for block in blocks:
 if block.area<400 or block.area>90000:continue
 interior=block.buffer(-10).difference(exclusions.buffer(3))
 edge=block.exterior
 for d in range(0,int(edge.length),16):
  p=edge.interpolate(d);q=edge.interpolate(d+2)
  a=math.atan2(q.y-p.y,q.x-p.x)
  for side in [1,-1]:
   cx=p.x-side*math.sin(a)*18;cy=p.y+side*math.cos(a)*18
   if not interior.contains(Point(cx,cy)):continue
   w=random.uniform(8,11);l=random.uniform(10,16)
   pts=[[round(cx+u*math.cos(a)-v*math.sin(a),2),round(cy+u*math.sin(a)+v*math.cos(a),2)] for u,v in [(-w/2,-l/2),(w/2,-l/2),(w/2,l/2),(-w/2,l/2)]]
   if not interior.contains(Polygon(pts)):continue
   houses.append({'points':pts,'h':random.choice([5,6,7,8,10]),'roof':random.randrange(6)})
   if random.random()<.65:trees.append([cx+math.sin(a)*13,cy-math.cos(a)*13,random.uniform(3,5)])
 for _ in range(int(block.area/650)):
  x=random.uniform(block.bounds[0],block.bounds[2]);y=random.uniform(block.bounds[1],block.bounds[3])
  if interior.contains(Point(x,y)) and edge.distance(Point(x,y))>35:trees.append([x,y,random.uniform(4,7)])
for area in areas:
 if area['kind']=='park':
  poly=Polygon(area['points']);xmin,ymin,xmax,ymax=poly.bounds
  for _ in range(int(poly.area/100)):
   x=random.uniform(xmin,xmax);y=random.uniform(ymin,ymax)
   if poly.contains(Point(x,y)):trees.append([x,y,random.uniform(4,7)])
# The real church node is used for the illustrated yellow church.
church=next(p for p in places if 'Santa Terezinha'in p['name'])
model={'center':church['point'],'roads':roads,'areas':areas,'buildings':buildings+houses,'trees':trees,'places':places,'meta':{'source':'OpenStreetMap contributors','license':'ODbL-1.0','snapshot':'2026-11-06','infill':'Procedural artistic houses; not real building footprints'}}
Path('public/data/map.json').write_text(json.dumps(model,separators=(',',':'),ensure_ascii=False))
print(len(roads),'roads,',len(houses),'illustrated houses,',len(trees),'trees,',len(places),'places; center',church['point'])
