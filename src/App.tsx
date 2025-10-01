import React, { useState, useEffect } from 'react';
import { Sprout, BarChart3, MapPin, TrendingUp, Brain } from 'lucide-react';
import { LocationInput } from './components/LocationInput';
import { CropSelector } from './components/CropSelector';
import { AdvancedPriceForecast } from './components/AdvancedPriceForecast';
import { MarketRecommendations } from './components/MarketRecommendations';
import { VehicleInfoInput } from './components/VehicleInfoInput';
import { AIInsightsCard } from './components/AIInsightsCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { DataProcessor } from './utils/dataProcessor';
import { GeminiService } from './services/geminiService';
import { MapboxService } from './services/mapboxService';
import { LocationData, PriceForecast, SeasonalPattern, ProcessedMarketData, VehicleInfo, AIInsight, RouteInfo } from './types/market';

function App() {
  const [dataProcessor] = useState(new DataProcessor());
  const [geminiService] = useState(new GeminiService());
  const [mapboxService] = useState(new MapboxService());
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading market data...');
  
  // Data states
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [varieties, setVarieties] = useState<string[]>([]);
  
  // User input states
  const [location, setLocation] = useState<LocationData | null>(null);
  const [selectedVariety, setSelectedVariety] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({ mileage: 15, fuelPrice: 100 });
  
  // Analysis states
  const [forecasts, setForecasts] = useState<PriceForecast[]>([]);
  const [seasonalPatterns, setSeasonalPatterns] = useState<SeasonalPattern[]>([]);
  const [recommendedMarkets, setRecommendedMarkets] = useState<ProcessedMarketData[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<ProcessedMarketData | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoadingMessage('Loading APMC market data...');
        await dataProcessor.loadData();
        
        setLoadingMessage('Processing market information...');
        const availableStates = dataProcessor.getStates();
        const availableVarieties = dataProcessor.getVarieties();
        
        setStates(availableStates);
        setVarieties(availableVarieties);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize data:', error);
        setLoadingMessage('Error loading data. Please refresh the page.');
      }
    };

    initializeData();
  }, [dataProcessor]);

  // Update districts when state changes
  const handleStateChange = (state: string) => {
    const stateDistricts = dataProcessor.getDistricts(state);
    setDistricts(stateDistricts);
  };

  // Analyze market data when variety is selected
  useEffect(() => {
    if (selectedVariety) {
      analyzeMarket();
    }
  }, [selectedVariety, location]);

  const analyzeMarket = async () => {
    if (!selectedVariety) return;

    setIsAnalyzing(true);
    setIsGeneratingInsights(true);
    
    try {
      // Generate advanced price forecasts using NeuralProphet-like analysis
      const priceForecast = dataProcessor.generateAdvancedPriceForecast(selectedVariety, 12);
      setForecasts(priceForecast);

      // Get seasonal patterns
      const patterns = dataProcessor.getSeasonalPatterns(selectedVariety);
      setSeasonalPatterns(patterns);

      // Get best markets
      const bestMarkets = dataProcessor.getBestMarkets(
        selectedVariety, 
        location?.state, 
        5
      );
      setRecommendedMarkets(bestMarkets);

      // Generate AI insights using Gemini
      try {
        const insights = await geminiService.generateSeasonalInsights(
          selectedVariety,
          patterns,
          priceForecast
        );
        setAiInsights(insights);
      } catch (error) {
        console.error('Error generating AI insights:', error);
      }

    } catch (error) {
      console.error('Error analyzing market data:', error);
    } finally {
      setIsAnalyzing(false);
      setIsGeneratingInsights(false);
    }
  };

  // Calculate route when market is selected
  const handleMarketSelect = async (market: ProcessedMarketData) => {
    setSelectedMarket(market);
    
    if (!location) return;

    setIsCalculatingRoute(true);
    
    try {
      const origin: [number, number] = [location.longitude, location.latitude];
      const destination = dataProcessor.getMarketCoordinates(
        market.state, 
        market.district, 
        market.market
      );

      if (destination) {
        const route = await mapboxService.getRoute(origin, destination, vehicleInfo);
        setRouteInfo(route);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Sprout className="mx-auto text-green-600 mb-4" size={64} />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">APMC Market Advisor</h1>
          <LoadingSpinner message={loadingMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sprout className="text-green-600 mr-3" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">APMC Market Advisor</h1>
                <p className="text-sm text-gray-600">AI-powered farming insights with route optimization</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Brain className="mr-1" size={16} />
                <span>AI Insights</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-1" size={16} />
                <span>Route Planning</span>
              </div>
              <div className="flex items-center">
                <BarChart3 className="mr-1" size={16} />
                <span>Neural Forecasting</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="mr-1" size={16} />
                <span>Real-time Data</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Controls */}
          <div className="lg:col-span-1 space-y-6">
            <LocationInput
              onLocationChange={setLocation}
              states={states}
              districts={districts}
              onStateChange={handleStateChange}
            />
            
            <CropSelector
              varieties={varieties}
              selectedVariety={selectedVariety}
              onVarietyChange={setSelectedVariety}
            />

            <VehicleInfoInput
              vehicleInfo={vehicleInfo}
              onVehicleInfoChange={setVehicleInfo}
            />

            {location && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Your Location</h3>
                <p className="text-sm text-gray-600">
                  {location.district}, {location.state}
                </p>
                {location.address && (
                  <p className="text-xs text-gray-500 mt-1">{location.address}</p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-2 space-y-8">
            {!selectedVariety ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Sprout className="mx-auto text-gray-400 mb-4" size={64} />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome to Enhanced APMC Market Advisor
                </h2>
                <p className="text-gray-600 mb-6">
                  Get AI-powered insights, neural price forecasting, and route optimization for your crops.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <TrendingUp className="mx-auto text-green-600 mb-2" size={24} />
                    <p className="font-medium text-green-800">Neural Forecasting</p>
                    <p className="text-green-600">Advanced predictions</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Brain className="mx-auto text-blue-600 mb-2" size={24} />
                    <p className="font-medium text-blue-800">AI Insights</p>
                    <p className="text-blue-600">Gemini-powered analysis</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <MapPin className="mx-auto text-purple-600 mb-2" size={24} />
                    <p className="font-medium text-purple-800">Route Planning</p>
                    <p className="text-purple-600">Distance & fuel costs</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <BarChart3 className="mx-auto text-orange-600 mb-2" size={24} />
                    <p className="font-medium text-orange-800">Market Analysis</p>
                    <p className="text-orange-600">Best selling times</p>
                  </div>
                </div>
              </div>
            ) : isAnalyzing ? (
              <div className="bg-white rounded-xl shadow-lg p-12">
                <LoadingSpinner message="Analyzing market data with AI and generating insights..." />
              </div>
            ) : (
              <>
                <AdvancedPriceForecast 
                  forecasts={forecasts} 
                  variety={selectedVariety} 
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <AIInsightsCard
                    insights={aiInsights}
                    variety={selectedVariety}
                    isLoading={isGeneratingInsights}
                  />
                </div>
                
                <MarketRecommendations 
                  markets={recommendedMarkets} 
                  variety={selectedVariety}
                  userLocation={location ? { state: location.state, district: location.district } : undefined}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Empowering farmers with AI-driven market insights and route optimization
            </p>
            <p className="text-sm text-gray-500">
              Powered by Neural Prophet • Gemini AI • Mapbox • APMC Data
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;