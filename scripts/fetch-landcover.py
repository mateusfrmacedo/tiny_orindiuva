import rasterio,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
from rasterio.windows import from_bounds
from rasterio.features import shapes
from shapely.geometry import shape,mapping
url='https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_S21W051_Map.tif'
with rasterio.Env(GDAL_HTTP_CAINFO='/etc/ssl/cert.pem',GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR'):
 with rasterio.open(url) as ds:
  window=from_bounds(-49.369,-20.199,-49.335,-20.166,ds.transform).round_offsets().round_lengths()
  arr=ds.read(1,window=window);transform=ds.window_transform(window)
  feats=[]
  for g,v in shapes(arr,mask=(arr==10)|(arr==80),transform=transform):
   poly=shape(g)
   if poly.area<.00000004:continue
   poly=poly.simplify(.000025,preserve_topology=True)
   feats.append({'type':'Feature','properties':{'class':int(v),'source':'ESA WorldCover 2021 v200','resolution_m':10},'geometry':mapping(poly)})
  json.dump({'type':'FeatureCollection','features':feats},open(ROOT/'public/data/landcover-esa.geojson','w'),separators=(',',':'))
  print(len(feats),'tree-cover/water polygons extracted from Sentinel classification')
