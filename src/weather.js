const rainCodes=new Set([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99]);
export function atmosphere(code,isDay=1){if(rainCodes.has(code))return 'rain';if(!isDay)return 'night';if(code>=2)return 'cloud';return 'sun'}
export function weatherLabel(code){if(code===0)return 'Céu limpo';if(code<=2)return 'Poucas nuvens';if(code===3)return 'Nublado';if(code<=48)return 'Névoa';if(code<=57)return 'Garoa';if(code<=67)return 'Chuva';if(code<=77)return 'Neve';if(code<=82)return 'Pancadas de chuva';if(code>=95)return 'Trovoadas';return 'Precipitação'}
export const weatherURL='https://api.open-meteo.com/v1/forecast?latitude=-20.18194&longitude=-49.35083&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&timezone=America%2FSao_Paulo&forecast_days=1';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function sceneWeather(mode,current=null,live=true){
 const raining=mode==='rain',coverage=live&&Number.isFinite(current?.cloud_cover)?clamp(current.cloud_cover/100,0,1):raining?.92:mode==='cloud'?.7:.16;
 const wind=live&&Number.isFinite(current?.wind_speed_10m)?clamp(current.wind_speed_10m,0,75):raining?18:8;
 // API direction is where wind comes FROM; convert to east/south drift.
 const bearing=(live&&Number.isFinite(current?.wind_direction_10m)?current.wind_direction_10m:300)*Math.PI/180;
 const measured=live&&Number.isFinite(current?.precipitation)?current.precipitation:null;
 const rain=raining?clamp(measured===null?.55:.18+Math.sqrt(Math.max(0,measured))*.32,.18,1):0;
 return {coverage,rain,wind,drift:[-Math.sin(bearing),Math.cos(bearing)],birds:rain<.4};
}
