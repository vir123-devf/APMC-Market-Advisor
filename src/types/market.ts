export interface MarketData {
  'State Name': string;
  'District Name': string;
  'Market Name': string;
  'Variety': string;
  'Group': string;
  'Arrivals (Tonnes)': number;
  'Min Price (Rs./Quintal)': number;
  'Max Price (Rs./Quintal)': number;
  'Modal Price (Rs./Quintal)': number;
  'Reported Date': string;
}

export interface ProcessedMarketData {
  state: string;
  district: string;
  market: string;
  variety: string;
  group: string;
  arrivals: number;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: Date;
}

export interface MarketRecommendation {
  market: string;
  district: string;
  state: string;
  predictedPrice: number;
  currentPrice: number;
  priceChange: number;
  distance: number;
  transportCost: number;
  netProfit: number;
  confidence: number;
  bestSellingMonth: string;
  seasonalTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  state: string;
  district: string;
}

export interface PriceForecast {
  date: string;
  predictedPrice: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  seasonalComponent?: number;
  trendComponent?: number;
  yearlyComponent?: number;
  weeklyComponent?: number;
}

export interface SeasonalPattern {
  month: string;
  averagePrice: number;
  priceIndex: number;
  recommendation: 'excellent' | 'good' | 'average' | 'poor';
  volatility?: number;
  historicalHigh?: number;
  historicalLow?: number;
}

export interface RouteInfo {
  distance: number; // in km
  duration: number; // in minutes
  fuelCost: number; // in rupees
  coordinates: [number, number][];
}

export interface VehicleInfo {
  mileage: number; // km/litre
  fuelPrice: number; // rupees/litre
}

export interface AIInsight {
  summary: string;
  keyPoints: string[];
  recommendation: string;
  confidence: number;
  riskFactors: string[];
  opportunities: string[];
}