import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar } from 'recharts';
import { TrendingUp, Calendar, BarChart3, Activity } from 'lucide-react';
import { PriceForecast } from '../types/market';

interface AdvancedPriceForecastProps {
  forecasts: PriceForecast[];
  variety: string;
}

export const AdvancedPriceForecast: React.FC<AdvancedPriceForecastProps> = ({
  forecasts,
  variety
}) => {
  if (forecasts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="mr-2 text-blue-600" size={20} />
          Advanced Price Forecast
        </h3>
        <p className="text-gray-600">No forecast data available for this crop.</p>
      </div>
    );
  }

  const chartData = forecasts.map(f => ({
    date: new Date(f.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    price: f.predictedPrice,
    confidence: f.confidence * 100,
    trend: f.trendComponent || 0,
    seasonal: f.seasonalComponent || 0,
    weekly: f.weeklyComponent || 0,
    upper: f.predictedPrice + (f.predictedPrice * (1 - f.confidence) * 0.5),
    lower: f.predictedPrice - (f.predictedPrice * (1 - f.confidence) * 0.5)
  }));

  const currentPrice = forecasts[0]?.predictedPrice || 0;
  const futurePrice = forecasts[forecasts.length - 1]?.predictedPrice || 0;
  const priceChange = ((futurePrice - currentPrice) / currentPrice) * 100;
  const avgConfidence = forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;

  // Find best and worst months
  const bestMonth = forecasts.reduce((best, current) => 
    current.predictedPrice > best.predictedPrice ? current : best
  );
  const worstMonth = forecasts.reduce((worst, current) => 
    current.predictedPrice < worst.predictedPrice ? current : worst
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Activity className="mr-2 text-blue-600" size={20} />
          Neural Prophet Forecast - {variety}
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">12-Month Prediction</p>
          <p className={`text-lg font-bold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Main Forecast Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              yAxisId="price"
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => `₹${value}`}
            />
            <YAxis 
              yAxisId="confidence"
              orientation="right"
              stroke="#10B981"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'price') return [`₹${value}/quintal`, 'Predicted Price'];
                if (name === 'confidence') return [`${value.toFixed(1)}%`, 'Confidence'];
                if (name === 'upper') return [`₹${value}/quintal`, 'Upper Bound'];
                if (name === 'lower') return [`₹${value}/quintal`, 'Lower Bound'];
                return [value, name];
              }}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
            
            {/* Confidence Band */}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="url(#confidenceGradient)"
            />
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="white"
            />
            
            {/* Main Price Line */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
            
            {/* Confidence Line */}
            <Line
              yAxisId="confidence"
              type="monotone"
              dataKey="confidence"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Decomposition Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trend Component */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <TrendingUp className="mr-2 text-purple-600" size={16} />
            Trend Component
          </h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={false}
                />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip formatter={(value: number) => [`₹${value}`, 'Trend']} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Component */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Calendar className="mr-2 text-orange-600" size={16} />
            Seasonal Component
          </h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area
                  type="monotone"
                  dataKey="seasonal"
                  stroke="#F59E0B"
                  fill="#FEF3C7"
                  strokeWidth={2}
                />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip formatter={(value: number) => [`₹${value}`, 'Seasonal']} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-medium">Current Price</p>
          <p className="text-2xl font-bold text-blue-900">₹{currentPrice}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800 font-medium">12M Forecast</p>
          <p className="text-2xl font-bold text-green-900">₹{futurePrice}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-purple-800 font-medium">Avg Confidence</p>
          <p className="text-2xl font-bold text-purple-900">{Math.round(avgConfidence * 100)}%</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-orange-800 font-medium">Volatility</p>
          <p className="text-2xl font-bold text-orange-900">
            {Math.round(Math.abs(priceChange))}%
          </p>
        </div>
      </div>

      {/* Best/Worst Months */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <h4 className="font-semibold text-green-800 mb-2">Best Selling Month</h4>
          <p className="text-green-700">
            {new Date(bestMonth.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
          <p className="text-2xl font-bold text-green-900">₹{bestMonth.predictedPrice}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
          <h4 className="font-semibold text-red-800 mb-2">Lowest Price Month</h4>
          <p className="text-red-700">
            {new Date(worstMonth.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
          <p className="text-2xl font-bold text-red-900">₹{worstMonth.predictedPrice}</p>
        </div>
      </div>
    </div>
  );
};