import { dayOfWeek, timeOfDay } from './constants';
import { TemperatureUnits } from './enums';

class OpenWeatherAPI {
  public static async getLocation(query: string): Promise<OpenWeatherLocation | undefined> {
    const url = new URL('https://api.openweathermap.org/geo/1.0/direct');
    url.searchParams.set('appid', process.env.OPENWEATHER_API_KEY);
    url.searchParams.set('limit', '5');
    url.searchParams.set('q', query);
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

  public static async getLocations(query: string): Promise<OpenWeatherLocation[]> {
    const url = new URL('https://api.openweathermap.org/geo/1.0/direct');
    url.searchParams.set('appid', process.env.OPENWEATHER_API_KEY);
    url.searchParams.set('limit', '5');
    url.searchParams.set('q', query);
    const response = await fetch(url, { cache: 'no-cache' });
    const responseJSON: OpenWeatherDirectGeocodingResponse[] = await response.json();
    return responseJSON.map((location: OpenWeatherDirectGeocodingResponse) => ({
      city: location.local_names?.en || location.name,
      country: location.country,
      latitude: location.lat,
      longitude: location.lon,
      state: location.state,
    }));
  }

  public static async getForecast(
    latitude: number,
    longitude: number,
    units = TemperatureUnits.Celsius,
  ): Promise<OpenWeatherForecast> {
    const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
    url.searchParams.set('appid', process.env.OPENWEATHER_API_KEY);
    url.searchParams.set('lat', latitude.toString());
    url.searchParams.set('lon', longitude.toString());
    url.searchParams.set('units', units);
    const response = await fetch(url, { cache: 'no-cache' });
    const responseJSON: OpenWeatherForecastResponse = await response.json();
    return {
      city: responseJSON.city.name,
      country: responseJSON.city.country,
      predictions: responseJSON.list.slice(0, 3).map((prediction): OpenWeatherSnapshot => {
        const date = new Date(new Date(prediction.dt_txt + ' UTC').getTime() + responseJSON.city.timezone * 1000);
        return {
          dayOfWeek: dayOfWeek[date.getDay()],
          icon: 'https://openweathermap.org/img/wn/' + prediction.weather[0].icon + '@2x.png',
          temperature: {
            actual: Math.round(prediction.main.temp),
            feelsLike: Math.round(prediction.main.feels_like),
            units,
          },
          timeOfDay: timeOfDay.get(OpenWeatherAPI.nearestTimeOfDay(date)) as string,
          weather: OpenWeatherAPI.toCapitalize(prediction.weather[0].description),
        };
      }),
    };
  }

  public static async getCurrentWeather(
    latitude: number,
    longitude: number,
    units = TemperatureUnits.Celsius,
  ): Promise<OpenWeatherSnapshot> {
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.set('appid', process.env.OPENWEATHER_API_KEY);
    url.searchParams.set('lat', latitude.toString());
    url.searchParams.set('lon', longitude.toString());
    url.searchParams.set('units', units);
    const response = await fetch(url, { cache: 'no-cache' });
    const responseJSON: OpenWeatherCurrentWeatherResponse = await response.json();
    const date = new Date((responseJSON.dt + responseJSON.timezone) * 1000);
    return {
      dayOfWeek: dayOfWeek[date.getDay()],
      icon: 'https://openweathermap.org/img/wn/' + responseJSON.weather[0].icon + '@2x.png',
      temperature: {
        actual: Math.round(responseJSON.main.temp),
        feelsLike: Math.round(responseJSON.main.feels_like),
        units,
      },
      timeOfDay: timeOfDay.get(OpenWeatherAPI.nearestTimeOfDay(date)) as string,
      weather: OpenWeatherAPI.toCapitalize(responseJSON.weather[0].description),
    };
  }

  private static toCapitalize(str: string): string {
    return str.replace(/(^\w|\s\w)/g, (char: string): string => char.toUpperCase());
  }

  private static nearestTimeOfDay(date: Date): string {
    const hours = date.getHours();
    const remainder = hours % 3;
    const nearestHours = hours - remainder + (remainder >= 1.5 ? 3 : 0);
    const nearestTime = new Date(date.getTime());
    nearestTime.setHours(nearestHours, 0, 0, 0);
    return nearestTime.toLocaleTimeString([], {
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
      second: '2-digit',
    });
  }
}

export default OpenWeatherAPI;
