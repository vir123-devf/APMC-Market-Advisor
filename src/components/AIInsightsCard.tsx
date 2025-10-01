import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { AIInsight } from '../types/market';
import { NeuralProphetService } from '../services/neuralProphetService';

interface AIInsightsCardProps {
  insights: AIInsight | null;
  variety: string;
  isLoading: boolean;
  historicalData?: { date: Date; price: number }[];
  locationName?: string;
}

// Add a type for seasonality rows
interface SeasonalityRow {
  month: string;
  trend: string;
  action: string;
}

const fallbackSummary = "No summary available. This crop shows typical seasonal price variations. Strategic timing of sales can impact profits.";
const fallbackSeasonality = [
  { month: "January", trend: "➡️", action: "Monitor" },
  { month: "February", trend: "⬆️", action: "Sell" },
  { month: "March", trend: "⬆️", action: "Sell" },
  { month: "April", trend: "➡️", action: "Hold" },
  { month: "May", trend: "⬇️", action: "Store" },
  { month: "June", trend: "⬇️", action: "Store" },
  { month: "July", trend: "➡️", action: "Monitor" },
  { month: "August", trend: "⬆️", action: "Sell" },
  { month: "September", trend: "⬆️", action: "Sell" },
  { month: "October", trend: "➡️", action: "Hold" },
  { month: "November", trend: "⬇️", action: "Store" },
  { month: "December", trend: "⬇️", action: "Store" },
];

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({
  insights,
  variety,
  isLoading,
  historicalData = [],
  locationName = 'All India',
}) => {
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const [summary, setSummary] = useState('');
  const [fullSummary, setFullSummary] = useState('');
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [seasonalityTable, setSeasonalityTable] = useState<{ month: string; trend: string; action: string }[]>([]);
  const [overallTrend, setOverallTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [highMonths, setHighMonths] = useState<string[]>([]);
  const [lowMonths, setLowMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!historicalData || historicalData.length < 6) {
      setSeasonalityTable([]);
      setHighMonths([]);
      setLowMonths([]);
      setOverallTrend('stable');
      setLoading(false);
      return;
    }
    setLoading(true);
    const np = new NeuralProphetService();
    const table = np.getSeasonalityActionTable(historicalData);
    setSeasonalityTable(table);
    setHighMonths(table.filter(row => row.action === 'Sell').map(row => row.month));
    setLowMonths(table.filter(row => row.action === 'Store').map(row => row.month));
    // Determine overall trend
    const yearly = np.extractSeasonality(historicalData);
    const trendVal = yearly.reduce((a, b) => a + b, 0);
    setOverallTrend(trendVal > 5 ? 'up' : trendVal < -5 ? 'down' : 'stable');
    setLoading(false);
  }, [historicalData]);

  // Fetch summary
  useEffect(() => {
    setLoading(true);
    fetch(`/api/market-summary?commodity=${variety}`)
      .then(res => res.json())
      .then(data => {
        setSummary(data.summary || fallbackSummary);
        setFullSummary(data.fullSummary || data.summary || fallbackSummary);
      })
      .catch(() => {
        setSummary(fallbackSummary);
        setFullSummary(fallbackSummary);
      });
  }, [variety]);

  // Fetch seasonality
  useEffect(() => {
    fetch(`/api/seasonality?commodity=${variety}`)
      .then(res => res.json())
      .then(data => setSeasonalityTable(data || fallbackSeasonality))
      .catch(() => setSeasonalityTable(fallbackSeasonality))
      .finally(() => setLoading(false));
  }, [variety]);

  if (isLoading) {
    return (
      <div className="mx-4 my-4 max-w-2xl w-full bg-gradient-to-br from-[#f9fefb] to-[#eefdf8] rounded-2xl shadow-lg p-8 min-w-[600px] max-w-[700px]">
        <div className="flex items-center mb-4">
          <Brain className="mr-2 text-purple-600 animate-pulse" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">AI Market Insights</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="mx-4 my-4 max-w-2xl w-full bg-gradient-to-br from-[#f9fefb] to-[#eefdf8] rounded-2xl shadow-lg p-8 min-w-[600px] max-w-[700px]">
        <div className="flex items-center mb-4">
          <Brain className="mr-2 text-purple-600" size={28} />
          <h3 className="font-bold text-[22px] text-gray-800">AI Market Insights</h3>
        </div>
        <p className="italic text-gray-400 text-xs mb-4">Powered by Gemini AI</p>
        <p className="text-gray-600">Select a crop to get AI-powered market insights.</p>
      </div>
    );
  }

  return (
    <div className="mx-4 my-4 max-w-2xl w-full bg-gradient-to-br from-[#f9fefb] to-[#eefdf8] rounded-2xl shadow-lg p-8 min-w-[600px] max-w-[700px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="mr-2 text-purple-600" size={28} />
          <h3 className="font-bold text-[22px] text-gray-800">AI Market Insights</h3>
        </div>
        <span className="italic text-xs text-gray-400">Powered by Gemini AI</span>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Summary */}
        <div className="flex-1 min-w-[240px] max-w-[320px]">
          <div className="mb-6 p-4 bg-[#f5f0ff] rounded-lg border-l-4 border-purple-500 text-base flex flex-col justify-between h-full">
            <div>
              <h4 className="font-semibold text-purple-800 mb-1 flex items-center">
                <TrendingUp className="mr-2" size={16} />
                Market Summary for {variety}
              </h4>
              <p className="text-gray-700">
                {showFullSummary ? fullSummary : summary}
              </p>
              {fullSummary && fullSummary !== summary && (
                <button
                  className="mt-2 flex items-center text-purple-700 hover:underline text-sm font-medium"
                  onClick={() => setShowFullSummary(v => !v)}
                >
                  {showFullSummary ? <>Show Less <ChevronUp size={16} className="ml-1" /></> : <>View Full Summary <ChevronDown size={16} className="ml-1" /></>}
                </button>
              )}
            </div>
          </div>
          {/* Confidence Score at the bottom of left column */}
          <div className="mt-6 p-4 bg-white rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">AI Confidence Score</span>
              <span className="text-sm font-bold text-purple-600">
                {Math.round((insights.confidence || 0.8) * 100)}%
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(insights.confidence || 0.8) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        {/* Right Column: Comprehensive Market Analysis */}
        <div className="flex-1 min-w-[240px]">
          <div className="mb-4">
            <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center">
              <TrendingUp className="mr-2 text-purple-600" size={20} />
              Market Analysis Based on Neural Prophet Forecast
            </h3>
            {/* Seasonality Analysis Table */}
            <div className="mb-4">
              <h4 className="font-semibold text-green-800 mb-2">Seasonality Analysis</h4>
              {loading ? (
                <div className="text-gray-400 italic">Analyzing seasonality...</div>
              ) : seasonalityTable.length === 0 ? (
                <div className="text-gray-400 italic">Not enough data for seasonality analysis.</div>
              ) : (
                <table className="min-w-full text-sm mb-4 border rounded-lg overflow-hidden">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="py-1 px-2 text-left">Type</th>
                      <th className="py-1 px-2 text-left">High Demand/High Arrival Period</th>
                      <th className="py-1 px-2 text-left">Low Demand/Low Arrival Period</th>
                      <th className="py-1 px-2 text-left">Trend (Overall)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-bold">Yearly</td>
                      <td className="py-1 px-2">{locationName}: {highMonths.length ? highMonths.join(', ') : 'N/A'};</td>
                      <td className="py-1 px-2">{locationName}: {lowMonths.length ? lowMonths.join(', ') : 'N/A'};</td>
                      <td className="py-1 px-2">{locationName}: {overallTrend === 'up' ? 'Rising' : overallTrend === 'down' ? 'Falling' : 'Stable'};</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 font-bold">Weekly</td>
                      <td className="py-1 px-2">N/A</td>
                      <td className="py-1 px-2">N/A</td>
                      <td className="py-1 px-2">N/A</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
            {/* Recommendations Section */}
            <div className="mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Recommendations</h4>
              <div className="mb-2">
                <span className="font-bold">High Demand Period Strategy:</span><br />
                {highMonths.length ? (
                  <span>Harvest and sell during {highMonths.join(', ')} for optimal prices in {locationName}.</span>
                ) : (
                  <span>Monitor market conditions for best selling periods.</span>
                )}
              </div>
              <div className="mb-2">
                <span className="font-bold">Low Demand Period Strategy:</span><br />
                {lowMonths.length ? (
                  <span>Preserve or store produce during {lowMonths.join(', ')} to avoid low prices in {locationName}.</span>
                ) : (
                  <span>Monitor for low demand periods to avoid losses.</span>
                )}
              </div>
              <div className="mb-2">
                <span className="font-bold">Weekly Optimization:</span><br />
                <span>Weekly trends not available in this analysis.</span>
              </div>
              <div className="mb-2">
                <span className="font-bold">Trend Adaptation:</span><br />
                {overallTrend === 'up' ? (
                  <span>Long-term trend is rising. Consider expanding production or market reach.</span>
                ) : overallTrend === 'down' ? (
                  <span>Long-term trend is falling. Focus on cost control and value addition.</span>
                ) : (
                  <span>Long-term trend is stable. Maintain current strategies and monitor for changes.</span>
                )}
              </div>
            </div>
            {/* Additional Detailed Recommendations */}
            <div className="mb-4">
              <h4 className="font-semibold text-orange-800 mb-2">Additional Detailed Recommendations:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li><span className="font-bold">Market Diversification:</span> Explore new markets during high demand months.</li>
                <li><span className="font-bold">Storage and Preservation:</span> Invest in storage solutions for low demand periods.</li>
                <li><span className="font-bold">Value-Added Products:</span> Consider processing or packaging to increase value.</li>
                <li><span className="font-bold">Harvesting Optimization:</span> Time harvests to align with high price periods.</li>
                <li><span className="font-bold">Risk Management:</span> Monitor for pests, diseases, and market risks.</li>
                <li><span className="font-bold">Technology Adoption:</span> Use precision agriculture for better yield and timing.</li>
                <li><span className="font-bold">Cooperative Strategies:</span> Collaborate with other farmers for better bargaining power.</li>
                <li><span className="font-bold">Government Support:</span> Leverage available schemes and subsidies.</li>
              </ol>
            </div>
            {/* Market Comparison Section */}
            <div className="mb-2">
              <h4 className="font-semibold text-purple-800 mb-2">Market Comparison</h4>
              <div className="mb-1">
                <span className="font-bold">Regional Analysis:</span><br />
                <span>Compare prices and demand across regions to identify the best markets for your crop.</span>
              </div>
              <div>
                <span className="font-bold">Strategic Recommendations:</span><br />
                <span>Focus on markets with higher demand and better prices during peak periods.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};