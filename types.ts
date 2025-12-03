
export enum TravelMode {
  WALKING = 'Walking',
  BUS = 'Bus',
  CAR = 'Car Ride',
  TUBE = 'Tube',
  TRAIN = 'Train',
  BICYCLE = 'Bicycle',
  RIDE_HAIL = 'Ride-Hail'
}

export interface RouteSegment {
  mode: string;
  duration: string;
  description: string;
}

export interface RouteOption {
  id: string;
  mode: TravelMode;
  duration: string;
  distance: string;
  cost: string;
  co2: string;
  tag?: string; // e.g., 'Eco-friendly', 'Fastest', 'Cheapest'
  tagColor?: string; // 'green', 'blue', 'yellow'
  status?: string; // e.g., 'On Time', 'Delayed'
  details?: string; // Summary of the route
  transitLines?: string[]; // e.g. ['Bus 55', 'Victoria Line']
  trafficCondition?: string; // e.g., 'Heavy', 'Moderate', 'Light'
  nextDeparture?: string; // e.g., '14:05', 'in 5 mins'
  arrivalEstimate?: string; // e.g., '14:50'
  nextDepartures?: string[]; // e.g. ['14:05', '14:15', '14:30']
  segments?: RouteSegment[]; // Breakdown of the journey
}

export interface WeatherInfo {
  temp: string;
  condition: string; // 'Sunny', 'Cloudy', 'Rain'
  icon: string;
}

export interface PointOfInterest {
  name: string;
  type: 'Toilet' | 'Shop' | 'Restaurant' | 'Attraction' | 'Event' | 'Coffee' | 'Accessibility' | 'Park' | 'Bar' | 'Hotel' | 'Other';
  description?: string;
}

export interface RouteData {
  from: string;
  to: string;
  options: RouteOption[];
  weather: {
    origin: WeatherInfo;
    midRoute: WeatherInfo;
    destination: WeatherInfo;
  };
  transitStatus: string;
  pointsOfInterest: PointOfInterest[];
  aiSuggestion?: string; // New field for smart advice
}

export interface AppState {
  routes: RouteData | null;
  loading: boolean;
  error: string | null;
  preferences: {
    useMetric: boolean;
    darkMode: boolean;
  };
}
