// Scene conditions derived from WMO weather codes (Open-Meteo).
// Each mode drives clouds, sky dimming, precipitation, fog and lightning.
export const sceneModes={
 sun:{label:'Céu limpo',icon:'☀'},
 partly:{label:'Poucas nuvens',icon:'⛅'},
 cloud:{label:'Nublado',icon:'☁'},
 fog:{label:'Neblina',icon:'≋'},
 drizzle:{label:'Garoa',icon:'☂'},
 rain:{label:'Chuva',icon:'☂'},
 storm:{label:'Tempestade',icon:'⚡'},
 off:{label:'Sem clima',icon:'○'}
};
const precipitating=new Set(['drizzle','rain','storm']);
export const isPrecipitating=mode=>precipitating.has(mode);
export function atmosphere(code,isDay=1){
 if(code>=95)return 'storm';
 if(code>=51&&code<=57)return 'drizzle';
 if(code>=61&&code<=67||code>=80&&code<=82)return 'rain';
 if(code===45||code===48)return 'fog';
 if(!isDay)return 'night';
 if(code===3||code>=71)return 'cloud';
 if(code===2)return 'partly';
 return 'sun';
}
export function weatherLabel(code){if(code===0)return 'Céu limpo';if(code<=2)return 'Poucas nuvens';if(code===3)return 'Nublado';if(code<=48)return 'Névoa';if(code<=57)return 'Garoa';if(code<=67)return 'Chuva';if(code<=77)return 'Neve';if(code<=82)return 'Pancadas de chuva';if(code>=95)return 'Trovoadas';return 'Precipitação'}
export const weatherURL='https://api.open-meteo.com/v1/forecast?latitude=-20.18194&longitude=-49.35083&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&timezone=America%2FSao_Paulo&forecast_days=1';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Artistic defaults per mode; live numbers override coverage, wind and rain rate.
const defaults={
 sun:{coverage:.16,wind:8,darkness:0,fog:0},
 partly:{coverage:.42,wind:10,darkness:.02,fog:0},
 cloud:{coverage:.7,wind:12,darkness:.1,fog:0},
 fog:{coverage:.55,wind:4,darkness:.05,fog:.8},
 drizzle:{coverage:.88,wind:10,darkness:.14,fog:.18},
 rain:{coverage:.92,wind:18,darkness:.2,fog:.08},
 storm:{coverage:1,wind:38,darkness:.36,fog:.05},
 // Weather switched off: clear, still sky with no clouds, rain or fog.
 off:{coverage:0,wind:0,darkness:0,fog:0}
};
export function sceneWeather(mode,current=null,live=true){
 const d=defaults[mode]||defaults.sun;
 const coverage=live&&Number.isFinite(current?.cloud_cover)?clamp(current.cloud_cover/100,0,1):d.coverage;
 const wind=live&&Number.isFinite(current?.wind_speed_10m)?clamp(current.wind_speed_10m,0,75):d.wind;
 // API direction is where wind comes FROM; convert to east/south drift.
 const bearing=(live&&Number.isFinite(current?.wind_direction_10m)?current.wind_direction_10m:300)*Math.PI/180;
 const measured=live&&Number.isFinite(current?.precipitation)?current.precipitation:null;
 let rain=0;
 if(mode==='drizzle')rain=clamp(measured===null?.3:.15+Math.sqrt(Math.max(0,measured))*.25,.12,.45);
 if(mode==='rain')rain=clamp(measured===null?.55:.18+Math.sqrt(Math.max(0,measured))*.32,.18,1);
 if(mode==='storm')rain=clamp(measured===null?.9:.55+Math.sqrt(Math.max(0,measured))*.25,.55,1);
 // Overcast skies dim with real coverage even when the mode is not precipitating.
 const darkness=clamp(d.darkness+(mode==='cloud'||mode==='partly'?(coverage-d.coverage)*.12:0),0,.45);
 return {mode,coverage,rain,wind,drift:[-Math.sin(bearing),Math.cos(bearing)],darkness,fog:d.fog,lightning:mode==='storm',fine:mode==='drizzle',birds:rain<.4&&d.fog<.5,umbrellas:rain>0};
}
