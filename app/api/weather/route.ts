import OpenWeatherAPI from 'apis/openweather';
import { Units } from 'apis/openweather/enums';
import { NextResponse } from 'next/server';
import { object, string } from 'yup';

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
  return NextResponse.json(forecast);
}
