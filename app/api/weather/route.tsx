import { ImageResponse } from '@vercel/og';
import OpenWeatherAPI from 'apis/openweather';
import { TemperatureUnits } from 'apis/openweather/enums';
import SimpleToken from 'utils/simple-token';
import { object, string } from 'yup';

import OpenWeatherImage from './image';

export const runtime = 'edge';

const fonts = [
  fetch(new URL('../../../assets/fonts/inter-medium.woff', import.meta.url)).then(response => response.arrayBuffer()),
  fetch(new URL('../../../assets/fonts/inter-regular.woff', import.meta.url)).then(response => response.arrayBuffer()),
];

export const GET = async (request: Request) => {
  const requestURL = new URL(request.url);
  const params = {
    query: requestURL.searchParams.get('query'),
    token: requestURL.searchParams.get('token'),
  };
  const paramsSchema = object({
    query: string().required().min(1).max(100),
    token: string().required().length(64),
  });
  if (!paramsSchema.isValidSync(params)) {
    return new Response(undefined, { status: 400 });
  }
  if (!(await SimpleToken.verify(params.token, { query: params.query }))) {
    return new Response(undefined, { status: 401 });
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

  return new ImageResponse(OpenWeatherImage.render(location, currentWeather, forecast), {
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
};
