import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Fuel } from 'lucide-react';
import { RouteInfo } from '../types/market';

interface RouteMapProps {
  origin: [number, number] | null;
  destination: [number, number] | null;
  routeInfo: RouteInfo | null;
  isLoading: boolean;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  origin,
  destination,
  routeInfo,
  isLoading
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  // Simple map visualization without external dependencies
  const renderSimpleMap = () => {
    if (!origin || !destination) return null;

    const centerLat = (origin[1] + destination[1]) / 2;
    const centerLng = (origin[0] + destination[0]) / 2;

    return (
      <div className="relative w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-green-200 via-yellow-100 to-blue-200"></div>
        </div>

        {/* Route Line */}
        {routeInfo && (
          <svg className="absolute inset-0 w-full h-full">
            <line
              x1="20%"
              y1="80%"
              x2="80%"
              y2="20%"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Origin Marker */}
        <div className="absolute bottom-4 left-4 flex items-center bg-green-600 text-white px-3 py-2 rounded-full shadow-lg">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm font-medium">Your Location</span>
        </div>

        {/* Destination Marker */}
        <div className="absolute top-4 right-4 flex items-center bg-red-600 text-white px-3 py-2 rounded-full shadow-lg">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm font-medium">Market</span>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center text-blue-600">
              <Navigation className="animate-spin mr-2" size={24} />
              <span>Calculating route...</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Navigation className="mr-2 text-blue-600" size={20} />
        Route & Travel Information
      </h3>

      {!origin || !destination ? (
        <div className="text-center py-12 text-gray-500">
          <MapPin className="mx-auto mb-4" size={48} />
          <p>Select your location and a market to see route information</p>
        </div>
      ) : (
        <>
          {renderSimpleMap()}
          
          {routeInfo && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center text-blue-800 mb-2">
                  <Navigation className="mr-2" size={16} />
                  <span className="font-medium">Distance</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{routeInfo.distance} km</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center text-green-800 mb-2">
                  <Clock className="mr-2" size={16} />
                  <span className="font-medium">Travel Time</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {Math.floor(routeInfo.duration / 60)}h {routeInfo.duration % 60}m
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center text-orange-800 mb-2">
                  <Fuel className="mr-2" size={16} />
                  <span className="font-medium">Fuel Cost</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">₹{routeInfo.fuelCost}</p>
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">💡 Travel Tips</h4>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Check market timings before traveling</li>
              <li>• Consider fuel price fluctuations</li>
              <li>• Plan for return journey costs</li>
              <li>• Factor in loading/unloading time</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};