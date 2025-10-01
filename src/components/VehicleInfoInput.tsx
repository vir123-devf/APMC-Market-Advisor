import React, { useState } from 'react';
import { Car, Fuel, Calculator } from 'lucide-react';
import { VehicleInfo } from '../types/market';

interface VehicleInfoInputProps {
  onVehicleInfoChange: (info: VehicleInfo) => void;
  vehicleInfo: VehicleInfo;
}

export const VehicleInfoInput: React.FC<VehicleInfoInputProps> = ({
  onVehicleInfoChange,
  vehicleInfo
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMileageChange = (mileage: number) => {
    onVehicleInfoChange({ ...vehicleInfo, mileage });
  };

  const handleFuelPriceChange = (fuelPrice: number) => {
    onVehicleInfoChange({ ...vehicleInfo, fuelPrice });
  };

  const commonVehicles = [
    { name: 'Motorcycle', mileage: 45 },
    { name: 'Small Car', mileage: 18 },
    { name: 'Pickup Truck', mileage: 12 },
    { name: 'Tractor', mileage: 8 },
    { name: 'Mini Truck', mileage: 10 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Car className="mr-2 text-blue-600" size={20} />
          Vehicle & Fuel Information
        </h3>
        <div className="text-sm text-gray-600">
          {isExpanded ? 'Hide' : 'Show'} Details
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Fuel className="inline mr-1" size={16} />
                Fuel Price (₹/litre)
              </label>
              <input
                type="number"
                value={vehicleInfo.fuelPrice}
                onChange={(e) => handleFuelPriceChange(parseFloat(e.target.value) || 0)}
                placeholder="Enter fuel price"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calculator className="inline mr-1" size={16} />
                Vehicle Mileage (km/litre)
              </label>
              <input
                type="number"
                value={vehicleInfo.mileage}
                onChange={(e) => handleMileageChange(parseFloat(e.target.value) || 0)}
                placeholder="Enter mileage"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Select Vehicle Type:</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {commonVehicles.map((vehicle) => (
                <button
                  key={vehicle.name}
                  onClick={() => handleMileageChange(vehicle.mileage)}
                  className="p-2 text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium">{vehicle.name}</div>
                  <div className="text-xs text-gray-600">{vehicle.mileage} km/l</div>
                </button>
              ))}
            </div>
          </div>

          {vehicleInfo.mileage > 0 && vehicleInfo.fuelPrice > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">Cost Calculation Ready</p>
              <p className="text-blue-600 text-sm">
                Fuel cost: ₹{vehicleInfo.fuelPrice}/L • Mileage: {vehicleInfo.mileage} km/L
              </p>
              <p className="text-blue-600 text-sm">
                Cost per km: ₹{(vehicleInfo.fuelPrice / vehicleInfo.mileage).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};