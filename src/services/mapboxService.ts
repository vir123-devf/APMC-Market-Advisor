import { RouteInfo, VehicleInfo } from '../types/market';

export class MapboxService {
  private readonly ACCESS_TOKEN = 'pk.eyJ1IjoidmlyZW5kcmEyMyIsImEiOiJjbWM0ZTJ0MGIwMGE3MmpxeWJuNnk1ZmhnIn0.lxzNAYfswaFcVdCU7GAuBg';
  private readonly BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox/driving';

  async getRoute(
    origin: [number, number],
    destination: [number, number],
    vehicleInfo: VehicleInfo
  ): Promise<RouteInfo> {
    try {
      const url = `${this.BASE_URL}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
      const params = new URLSearchParams({
        access_token: this.ACCESS_TOKEN,
        geometries: 'geojson',
        overview: 'full',
        steps: 'false'
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }

      const data = await response.json();
      const route = data.routes?.[0];

      if (!route) {
        throw new Error('No route found');
      }

      const distance = route.distance / 1000; // Convert to km
      const duration = route.duration / 60; // Convert to minutes
      const fuelCost = this.calculateFuelCost(distance, vehicleInfo);
      const coordinates = route.geometry.coordinates;

      return {
        distance: Math.round(distance * 10) / 10,
        duration: Math.round(duration),
        fuelCost: Math.round(fuelCost),
        coordinates
      };
    } catch (error) {
      console.error('Error getting route from Mapbox:', error);
      
      // Fallback calculation using straight-line distance
      const straightLineDistance = this.calculateStraightLineDistance(origin, destination);
      const estimatedDistance = straightLineDistance * 1.3; // Add 30% for road routing
      
      return {
        distance: Math.round(estimatedDistance * 10) / 10,
        duration: Math.round(estimatedDistance * 2), // Rough estimate: 30 km/h average
        fuelCost: Math.round(this.calculateFuelCost(estimatedDistance, vehicleInfo)),
        coordinates: [origin, destination]
      };
    }
  }

  private calculateStraightLineDistance(
    origin: [number, number],
    destination: [number, number]
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(destination[1] - origin[1]);
    const dLon = this.toRadians(destination[0] - origin[0]);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(origin[1])) * Math.cos(this.toRadians(destination[1])) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateFuelCost(distance: number, vehicleInfo: VehicleInfo): number {
    const fuelNeeded = distance / vehicleInfo.mileage;
    return fuelNeeded * vehicleInfo.fuelPrice;
  }

  async geocodeLocation(address: string): Promise<[number, number] | null> {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
      const params = new URLSearchParams({
        access_token: this.ACCESS_TOKEN,
        country: 'IN',
        limit: '1'
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Geocoding error: ${response.status}`);
      }

      const data = await response.json();
      const feature = data.features?.[0];

      if (feature?.geometry?.coordinates) {
        return feature.geometry.coordinates as [number, number];
      }

      return null;
    } catch (error) {
      console.error('Error geocoding location:', error);
      return null;
    }
  }
}