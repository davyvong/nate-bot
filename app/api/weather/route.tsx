import { ImageResponse } from '@vercel/og';
import OpenWeatherAPI from 'apis/openweather';
import { TemperatureUnits } from 'apis/openweather/enums';
import { object, string } from 'yup';

import WeatherImage from './image';

export const runtime = 'experimental-edge';

const fonts = [
  fetch(new URL('../../../assets/fonts/inter-medium.woff', import.meta.url)).then(response => response.arrayBuffer()),
  fetch(new URL('../../../assets/fonts/inter-regular.woff', import.meta.url)).then(response => response.arrayBuffer()),
];

export async function GET(request: Request) {
  const requestURL = new URL(request.url);
  const params = {
    query: requestURL.searchParams.get('query'),
  };
  const paramsSchema = object({
    query: string().required().min(1).max(100),
  });
  if (!paramsSchema.isValidSync(params)) {
    return new Response(undefined, { status: 400 });
  }
  const location = await OpenWeatherAPI.getLocation(params.query);
  if (!location) {
    return new Response(undefined, { status: 404 });
  }
  let units = TemperatureUnits.Celsius;
  if (['LR', 'MM', 'US'].includes(location.country)) {
    units = TemperatureUnits.Fahrenheit;
  }

  const [currentWeather, forecast, interMedium, interRegular] = await Promise.all([
    OpenWeatherAPI.getCurrentWeather(location.latitude, location.longitude, units),
    OpenWeatherAPI.getForecast(location.latitude, location.longitude, units),
    ...fonts,
  ]);

  return new ImageResponse(WeatherImage.render(location, currentWeather, forecast), {
    fonts: [
      {
        data: interRegular,
        name: 'Inter',
        style: 'normal',
        weight: 400,
      },
      {
        data: interMedium,
        name: 'Inter',
        style: 'normal',
        weight: 500,
      },
    ],
    headers: {
      'cache-control': 'public, s-maxage=1200, stale-while-revalidate=600',
    },
    height: 390,
    width: 600,
  });
}
