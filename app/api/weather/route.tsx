/* eslint-disable @next/next/no-img-element */

import { ImageResponse } from '@vercel/og';
import OpenWeatherAPI from 'apis/openweather';
import { Units } from 'apis/openweather/enums';
import { object, string } from 'yup';

export const runtime = 'experimental-edge';

const fonts = [
  fetch(new URL('../../../assets/fonts/inter-medium.woff', import.meta.url)).then(response => response.arrayBuffer()),
  fetch(new URL('../../../assets/fonts/inter-regular.woff', import.meta.url)).then(response => response.arrayBuffer()),
];

const renderUnits = (units = Units.Celsius): string => {
  if (units === Units.Celsius) {
    return '°C';
  }
  if (units === Units.Fahrenheit) {
    return '°F';
  }
  return '';
};

const renderPrediction = (prediction: OpenWeatherPrediction): JSX.Element => (
  <div
    key={prediction.dayOfWeek + prediction.timeOfDay}
    style={{
      alignItems: 'center',
      backgroundColor: '#23272a',
      borderRadius: 8,
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      margin: 8,
      marginTop: 0,
    }}
  >
    <div style={{ fontSize: 16, fontWeight: 500 }}>{prediction.dayOfWeek + ' ' + prediction.timeOfDay}</div>
    <div style={{ color: '#99aab5', fontSize: 14, marginTop: 8 }}>{prediction.weather}</div>
    <img alt="" height="100" src={prediction.icon} width="100" />
    <div style={{ fontSize: 24, fontWeight: 500 }}>
      {prediction.temperature.actual + renderUnits(prediction.temperature.units)}
    </div>
    <div style={{ color: '#99aab5', fontSize: 14, marginTop: 8 }}>
      {'Feels like ' + prediction.temperature.feelsLike + renderUnits(prediction.temperature.units)}
    </div>
  </div>
);

export async function GET(request: Request) {
  const requestURL = new URL(request.url);
  const params = {
    city: requestURL.searchParams.get('city'),
    country: requestURL.searchParams.get('country'),
    state: requestURL.searchParams.get('state'),
  };
  const paramsSchema = object({
    city: string().required().min(1).max(100),
    country: string().required().length(2),
    state: string().required().min(0).max(100),
  });
  if (!paramsSchema.isValidSync(params)) {
    return new Response(undefined, { status: 400 });
  }
  const location = await OpenWeatherAPI.getLocation(params.city, params.state, params.country);
  if (!location) {
    return new Response(undefined, { status: 404 });
  }
  let units = Units.Celsius;
  if (['LR', 'MM', 'US'].includes(location.country)) {
    units = Units.Fahrenheit;
  }
  const forecast = await OpenWeatherAPI.getForecast(location.latitude, location.longitude, units);

  const [interMedium, interRegular] = await Promise.all(fonts);

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          backgroundColor: '#2c2f33',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter',
          height: '100%',
          justifyContent: 'center',
          padding: 8,
          width: '100%',
        }}
      >
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 16,
            marginTop: 8,
            width: '100%',
          }}
        >
          <img alt="" height="100" src={forecast.predictions[0].icon} width="100" />
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: '#99aab5', fontSize: 16 }}>{forecast.city + ', ' + forecast.country}</div>
            <div style={{ fontSize: 24, fontWeight: 500, marginTop: 8 }}>
              {forecast.predictions[0].dayOfWeek + ' ' + forecast.predictions[0].timeOfDay}
            </div>
            <div style={{ color: '#99aab5', fontSize: 16, marginTop: 8 }}>{forecast.predictions[0].weather}</div>
          </div>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              marginLeft: 26,
              marginRight: 16,
            }}
          >
            <div style={{ fontSize: 52, lineHeight: 1 }}>
              {forecast.predictions[0].temperature.actual + renderUnits(forecast.predictions[0].temperature.units)}
            </div>
            <div style={{ color: '#99aab5', fontSize: 16, marginTop: 8 }}>
              {'Feels like ' +
                forecast.predictions[0].temperature.feelsLike +
                renderUnits(forecast.predictions[0].temperature.units)}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            width: '100%',
          }}
        >
          {forecast.predictions.slice(1, 4).map(renderPrediction)}
        </div>
      </div>
    ),
    {
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
    },
  );
}
