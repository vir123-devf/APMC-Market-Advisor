import React from 'react';
import { Wheat } from 'lucide-react';

interface CropSelectorProps {
  varieties: string[];
  selectedVariety: string;
  onVarietyChange: (variety: string) => void;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  varieties,
  selectedVariety,
  onVarietyChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Wheat className="mr-2 text-green-600" size={24} />
        Select Your Crop
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Crop Variety
        </label>
        <select
          value={selectedVariety}
          onChange={(e) => onVarietyChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
        >
          <option value="">Select Crop Variety</option>
          {varieties.map(variety => (
            <option key={variety} value={variety}>{variety}</option>
          ))}
        </select>
      </div>

      {selectedVariety && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800 font-medium">
            Selected: {selectedVariety}
          </p>
          <p className="text-green-600 text-sm mt-1">
            We'll analyze market data and provide recommendations for this crop.
          </p>
        </div>
      )}
    </div>
  );
};