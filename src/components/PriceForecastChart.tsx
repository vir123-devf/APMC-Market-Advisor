import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { PriceForecast } from '../types/market';

interface PriceForecastChartProps {
  forecasts: PriceForecast[];
  variety: string;
}

export const PriceForecastChart: React.FC<PriceForecastChartProps> = ({
  forecasts,
  variety
}) => {
  if (forecasts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="mr-2 text-blue-600" size={20} />
          Price Forecast
        </h3>
        <p className="text-gray-600">No forecast data available for this crop.</p>
      </div>
    );
  }

  const chartData = forecasts.map(f => ({
    date: new Date(f.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    price: f.predictedPrice,
    confidence: f.confidence * 100
  }));

  const currentPrice = forecasts[0]?.predictedPrice || 0;
  const futurePrice = forecasts[forecasts.length - 1]?.predictedPrice || 0;
  const priceChange = ((futurePrice - currentPrice) / currentPrice) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <TrendingUp className="mr-2 text-blue-600" size={20} />
          Price Forecast - {variety}
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">12-Month Trend</p>
          <p className={`text-lg font-bold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
              formatter={(value: number) => [`₹${value}/quintal`, 'Predicted Price']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-medium">Current Predicted Price</p>
          <p className="text-2xl font-bold text-blue-900">₹{currentPrice}/quintal</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800 font-medium">12-Month Forecast</p>
          <p className="text-2xl font-bold text-green-900">₹{futurePrice}/quintal</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-purple-800 font-medium">Forecast Confidence</p>
          <p className="text-2xl font-bold text-purple-900">
            {Math.round(forecasts[0]?.confidence * 100 || 0)}%
          </p>
        </div>
      </div>
    </div>
  );
};