import React from 'react';
import { MapPin, TrendingUp, Truck, IndianRupee, Star } from 'lucide-react';
import { ProcessedMarketData } from '../types/market';

interface MarketRecommendationsProps {
  markets: ProcessedMarketData[];
  variety: string;
  userLocation?: { state: string; district: string };
}

export const MarketRecommendations: React.FC<MarketRecommendationsProps> = ({
  markets,
  variety,
  userLocation
}) => {
  if (markets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Star className="mr-2 text-yellow-600" size={20} />
          Market Recommendations
        </h3>
        <p className="text-gray-600">No market data available for this crop.</p>
      </div>
    );
  }

  const calculateDistance = (market: ProcessedMarketData): string => {
    if (!userLocation) return 'Unknown';
    
    // Simple distance calculation based on state/district match
    if (market.state === userLocation.state) {
      if (market.district === userLocation.district) {
        return '< 50 km';
      }
      return '50-200 km';
    }
    return '200+ km';
  };

  const calculateTransportCost = (distance: string, price: number): number => {
    const baseCost = price * 0.02; // 2% of price as base transport cost
    
    switch (distance) {
      case '< 50 km': return Math.round(baseCost);
      case '50-200 km': return Math.round(baseCost * 2);
      case '200+ km': return Math.round(baseCost * 4);
      default: return Math.round(baseCost * 3);
    }
  };

  const getRecommendationScore = (market: ProcessedMarketData): number => {
    const distance = calculateDistance(market);
    const priceScore = market.modalPrice / 100; // Higher price = better score
    const distanceScore = distance === '< 50 km' ? 10 : distance === '50-200 km' ? 7 : 4;
    const arrivalScore = Math.min(market.arrivals / 10, 5); // Market activity score
    
    return Math.round((priceScore + distanceScore + arrivalScore) / 3);
  };

  const sortedMarkets = markets
    .map(market => ({
      ...market,
      distance: calculateDistance(market),
      transportCost: calculateTransportCost(calculateDistance(market), market.modalPrice),
      score: getRecommendationScore(market)
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Star className="mr-2 text-yellow-600" size={20} />
          Best Markets for {variety}
        </h3>
        <p className="text-sm text-gray-600">
          Showing top {Math.min(sortedMarkets.length, 5)} recommendations
        </p>
      </div>

      <div className="space-y-4">
        {sortedMarkets.slice(0, 5).map((market, index) => (
          <div 
            key={`${market.state}-${market.district}-${market.market}`}
            className={`p-4 rounded-lg border-2 ${
              index === 0 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                {index === 0 && <Star className="text-yellow-500 mr-2" size={20} fill="currentColor" />}
                <div>
                  <h4 className="font-semibold text-gray-800">{market.market}</h4>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="mr-1" size={14} />
                    {market.district}, {market.state}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  ₹{market.modalPrice}
                </p>
                <p className="text-sm text-gray-600">per quintal</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Truck className="mr-2 text-blue-600" size={16} />
                <div>
                  <p className="text-gray-600">Distance</p>
                  <p className="font-medium">{market.distance}</p>
                </div>
              </div>
              <div className="flex items-center">
                <IndianRupee className="mr-2 text-orange-600" size={16} />
                <div>
                  <p className="text-gray-600">Transport Cost</p>
                  <p className="font-medium">₹{market.transportCost}</p>
                </div>
              </div>
              <div className="flex items-center">
                <TrendingUp className="mr-2 text-purple-600" size={16} />
                <div>
                  <p className="text-gray-600">Market Activity</p>
                  <p className="font-medium">{market.arrivals.toFixed(1)}T</p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Net Price (after transport): 
                  <span className="font-semibold text-green-600 ml-1">
                    ₹{market.modalPrice - market.transportCost}
                  </span>
                </p>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Score:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < market.score ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {index === 0 && (
              <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800">
                <strong>Recommended:</strong> Best combination of price, distance, and market activity
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tips</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Contact markets before traveling to confirm current prices</li>
          <li>• Consider grouping with other farmers to reduce transport costs</li>
          <li>• Check market timings and weekly schedules</li>
          <li>• Negotiate better prices for larger quantities</li>
        </ul>
      </div>
    </div>
  );
};