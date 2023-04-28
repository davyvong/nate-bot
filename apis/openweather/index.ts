import { dayOfWeek, timeOfDay } from './constants';
import { Units } from './enums';

class OpenWeatherAPI {
  public static async getLocation(
    city: string,
    state: string,
    country: string,
  ): Promise<OpenWeatherLocation | undefined> {
    const url = new URL('https://api.openweathermap.org/geo/1.0/direct');
    url.searchParams.set('appid', process.env.OPENWEATHER_API_KEY);
    url.searchParams.set('limit', '5');
    url.searchParams.set('q', city + ',' + state + ',' + country);
    const response = await fetch(url, { cache: 'no-cache' });
    const responseJSON: OpenWeatherDirectGeocodingResponse[] = await response.json();
    for (const location of responseJSON) {
      return {
        city: location.local_names?.en || location.name,
        country: location.country,
        latitude: location.lat,
        longitude: location.lon,
        state: location.state,
      };
    }
  }

  public static async getForecast(lat: number, lon: number, units = Units.Celsius): Promise<OpenWeatherForecast> {
    const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
    url.searchParams.set('appid', process.env.OPENWEATHER_API_KEY);
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lon.toString());
    url.searchParams.set('units', units);
    const response = await fetch(url, { cache: 'no-cache' });
    const responseJSON: OpenWeatherForecastResponse = await response.json();
    return {
      city: responseJSON.city.name,
      country: responseJSON.city.country,
      predictions: responseJSON.list
        .filter((value, index: number) => index < 4)
        .map((prediction): OpenWeatherPrediction => {
          const [dateString, timeString] = prediction.dt_txt.split(' ');
          return {
            dayOfWeek: dayOfWeek[new Date(dateString).getDay()],
            icon: 'https://openweathermap.org/img/wn/' + prediction.weather[0].icon + '@2x.png',
            temperature: {
              actual: Math.round(prediction.main.temp),
              feelsLike: Math.round(prediction.main.feels_like),
              units,
            },
            timeOfDay: timeOfDay.get(timeString) as string,
            weather: prediction.weather[0].description.replace(/(^\w|\s\w)/g, (char: string): string =>
              char.toUpperCase(),
            ),
          };
        }),
    };
  }
}

export default OpenWeatherAPI;
