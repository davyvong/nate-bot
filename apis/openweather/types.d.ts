interface OpenWeatherLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  state: string;
}

interface OpenWeatherForecast {
  city: string;
  country: string;
  predictions: OpenWeatherPrediction[];
}

interface OpenWeatherPrediction {
  dayOfWeek: string;
  icon: string;
  temperature: {
    actual: number;
    feelsLike: number;
    units: TemperatureUnits;
  };
  timeOfDay: string;
  weather: string;
}

interface OpenWeatherDirectGeocodingResponse {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state: string;
}

interface OpenWeatherForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: {
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf?: number;
    };
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust?: number;
    };
    visibility?: number;
    pop?: number;
    rain?: {
      '3h': number;
    };
    snow?: {
      '3h': number;
    };
    sys: {
      pod: string;
    };
    dt_txt: string;
  }[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population?: number;
    timezone: number;
    sunrise?: number;
    sunset?: number;
  };
}
