/* eslint-disable @next/next/no-img-element */

import { TemperatureUnits } from 'apis/openweather/enums';

class OpenWeatherImage {
  public static getUnits(units = TemperatureUnits.Celsius): string {
    switch (units) {
      case TemperatureUnits.Celsius: {
        return '°C';
      }
      case TemperatureUnits.Fahrenheit: {
        return '°F';
      }
      default: {
        return '';
      }
    }
  }

  public static renderCurrentPrediction(location: OpenWeatherLocation, prediction: OpenWeatherSnapshot): JSX.Element {
    return (
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
        <img alt="" height="100" src={prediction.icon} width="100" />
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ color: '#99aab5', fontSize: 16 }}>{location.city + ', ' + location.country}</div>
          <div style={{ fontSize: 24, fontWeight: 500, marginTop: 8 }}>
            {prediction.dayOfWeek + ' ' + prediction.timeOfDay}
          </div>
          <div style={{ color: '#99aab5', fontSize: 16, marginTop: 8 }}>{prediction.weather}</div>
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
            {prediction.temperature.actual + OpenWeatherImage.getUnits(prediction.temperature.units)}
          </div>
          <div style={{ color: '#99aab5', fontSize: 16, marginTop: 8 }}>
            {'Feels like ' + prediction.temperature.feelsLike + OpenWeatherImage.getUnits(prediction.temperature.units)}
          </div>
        </div>
      </div>
    );
  }

  public static renderFuturePrediction(prediction: OpenWeatherSnapshot): JSX.Element {
    return (
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
          {prediction.temperature.actual + OpenWeatherImage.getUnits(prediction.temperature.units)}
        </div>
        <div style={{ color: '#99aab5', fontSize: 14, marginTop: 8 }}>
          {'Feels like ' + prediction.temperature.feelsLike + OpenWeatherImage.getUnits(prediction.temperature.units)}
        </div>
      </div>
    );
  }

  public static render(
    location: OpenWeatherLocation,
    currentWeather: OpenWeatherSnapshot,
    forecast: OpenWeatherForecast,
  ): JSX.Element {
    return (
      <div
        style={{
          alignItems: 'center',
          backgroundColor: '#2e3035',
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
        {OpenWeatherImage.renderCurrentPrediction(location, currentWeather)}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            width: '100%',
          }}
        >
          {forecast.predictions.map(OpenWeatherImage.renderFuturePrediction)}
        </div>
      </div>
    );
  }
}

export default OpenWeatherImage;
