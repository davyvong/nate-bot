import { ImageResponse } from '@vercel/og';
import OpenWeatherAPI from 'server/openweather/api';
import { TemperatureUnits } from 'server/openweather/enums';
import Token from 'server/token';
import { number, object, string } from 'yup';

import OpenWeatherImage from './image';

export const runtime = 'edge';

const fonts = [
  fetch(new URL('../../../assets/fonts/inter-medium.woff', import.meta.url)).then(response => response.arrayBuffer()),
  fetch(new URL('../../../assets/fonts/inter-regular.woff', import.meta.url)).then(response => response.arrayBuffer()),
];

export const POST = async (request: Request) => {
  const body: OpenWeatherLocation = await request.json();
  const bodySchema = object({
    city: string().required(),
    country: string().required(),
    latitude: number().required(),
    longitude: number().required(),
    state: string(),
  });
  if (!bodySchema.isValidSync(body)) {
    return new Response(undefined, { status: 400 });
  }
  const requestURL = new URL(request.url);
  const params = {
    token: requestURL.searchParams.get('token'),
  };
  const paramsSchema = object({
    token: string().required().length(64),
  });
  if (!paramsSchema.isValidSync(params)) {
    return new Response(undefined, { status: 400 });
  }
  if (!(await Token.verify(params.token, { latitude: body.latitude, longitude: body.longitude }))) {
    return new Response(undefined, { status: 401 });
  }
  let units = TemperatureUnits.Celsius;
  if (['LR', 'MM', 'US'].includes(body.country)) {
    units = TemperatureUnits.Fahrenheit;
  }
  const [currentWeather, forecast, interMedium, interRegular] = await Promise.all([
    OpenWeatherAPI.getCurrentWeather(body.latitude, body.longitude, units),
    OpenWeatherAPI.getForecast(body.latitude, body.longitude, units),
    ...fonts,
  ]);

  return new ImageResponse(OpenWeatherImage.render(body, currentWeather, forecast), {
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
      'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600',
    },
    height: 390,
    width: 600,
  });
};
