// Artistic colour grading, not an astronomical sunrise/sunset forecast.
const keys=[
 [0,[13,25,58],.78,1],[270,[13,25,58],.78,1],
 [330,[97,67,119],.48,.65],[375,[240,155,95],.23,.1],
 [450,[255,220,150],.08,0],[720,[255,255,255],0,0],
 [960,[252,203,119],.10,0],[1050,[245,134,67],.28,.15],
 [1110,[131,67,123],.50,.75],[1170,[13,25,58],.76,1],
 [1440,[13,25,58],.78,1]
];
export function daylight(minutes){const m=Math.max(0,Math.min(1440,Number.isFinite(minutes)?minutes:720));const end=keys.findIndex((k,i)=>i>0&&k[0]>=m),a=keys[end-1],b=keys[end];let t=(m-a[0])/(b[0]-a[0]);t=t*t*(3-2*t);const mix=(x,y)=>x+(y-x)*t;return {color:a[1].map((v,i)=>Math.round(mix(v,b[1][i]))),opacity:mix(a[2],b[2]),lamps:mix(a[3],b[3]),label:m<300||m>=1170?'Noite':m<420?'Amanhecer':m<960?'Dia':m<1050?'Fim de tarde':m<1140?'Pôr do sol':'Anoitecer'}}
export function localMinutes(date=new Date()){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);return Number(parts.find(p=>p.type==='hour').value)*60+Number(parts.find(p=>p.type==='minute').value)}
export function formatTime(minutes){const m=Math.max(0,Math.min(1440,Math.round(minutes)));return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`}
export function parseSceneTime(value){if(value===null||value==='')return null;const n=Number(value);return Number.isFinite(n)&&n>=0&&n<=1440?n:null}
