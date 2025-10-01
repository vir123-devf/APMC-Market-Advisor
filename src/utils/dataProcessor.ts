import { MarketData, ProcessedMarketData, PriceForecast, SeasonalPattern } from '../types/market';
import { NeuralProphetService } from '../services/neuralProphetService';

export class DataProcessor {
  private data: ProcessedMarketData[] = [];
  private neuralProphet: NeuralProphetService;
  private readonly API_KEY = '579b464db66ec23bdd000001f0f6a7949454433273d820bdada2f663';
  private readonly BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

  constructor() {
    this.neuralProphet = new NeuralProphetService();
  }

  async loadData(): Promise<void> {
    try {
      console.log('Loading data from APMC API...');
      
      // Fetch data from APMC API
      const response = await fetch(
        `${this.BASE_URL}?api-key=${this.API_KEY}&format=json&limit=10000&offset=0`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();
      console.log('API Response:', apiData);

      if (!apiData.records || !Array.isArray(apiData.records)) {
        throw new Error('Invalid API response format');
      }

      // Process API data
      this.data = this.processAPIData(apiData.records);
      console.log(`Total records loaded from API: ${this.data.length}`);

      // If we have limited data, fetch more with different offsets
      if (this.data.length < 1000) {
        await this.loadAdditionalData();
      }

    } catch (error) {
      console.error('Error loading data from API:', error);
      
      // Fallback to CSV files if API fails
      console.log('Falling back to CSV files...');
      await this.loadCSVData();
    }
  }

  private async loadAdditionalData(): Promise<void> {
    try {
      // Load additional batches of data
      for (let offset = 10000; offset < 50000; offset += 10000) {
        const response = await fetch(
          `${this.BASE_URL}?api-key=${this.API_KEY}&format=json&limit=10000&offset=${offset}`
        );

        if (response.ok) {
          const apiData = await response.json();
          if (apiData.records && apiData.records.length > 0) {
            const additionalData = this.processAPIData(apiData.records);
            this.data.push(...additionalData);
            console.log(`Loaded additional ${additionalData.length} records (offset: ${offset})`);
          } else {
            break; // No more data available
          }
        }
      }
    } catch (error) {
      console.warn('Error loading additional data:', error);
    }
  }

  private processAPIData(records: any[]): ProcessedMarketData[] {
    const processedData: ProcessedMarketData[] = [];

    records.forEach((record, index) => {
      try {
        // Handle different possible field names from API
        const state = record.state || record.State || record['State Name'] || '';
        const district = record.district || record.District || record['District Name'] || '';
        const market = record.market || record.Market || record['Market Name'] || '';
        const variety = record.variety || record.Variety || record.commodity || record.Commodity || '';
        const group = record.group || record.Group || record.category || record.Category || '';
        
        // Handle price fields
        const minPrice = this.parsePrice(record.min_price || record['Min Price'] || record.minPrice || record['Min Price (Rs./Quintal)'] || 0);
        const maxPrice = this.parsePrice(record.max_price || record['Max Price'] || record.maxPrice || record['Max Price (Rs./Quintal)'] || 0);
        const modalPrice = this.parsePrice(record.modal_price || record['Modal Price'] || record.modalPrice || record['Modal Price (Rs./Quintal)'] || 0);
        
        // Handle arrivals
        const arrivals = this.parseNumber(record.arrivals || record.Arrivals || record['Arrivals (Tonnes)'] || 0);
        
        // Handle date
        const dateStr = record.date || record.Date || record['Reported Date'] || record.arrival_date || new Date().toISOString();
        const date = new Date(dateStr);

        // Only include records with valid data
        if (state && district && market && variety && modalPrice > 0) {
          processedData.push({
            state: state.trim(),
            district: district.trim(),
            market: market.trim(),
            variety: variety.trim(),
            group: group.trim(),
            arrivals,
            minPrice,
            maxPrice,
            modalPrice,
            date: isNaN(date.getTime()) ? new Date() : date
          });
        }
      } catch (error) {
        console.warn(`Error processing record ${index}:`, error, record);
      }
    });

    return processedData;
  }

  private parsePrice(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols and parse
      const cleaned = value.replace(/[₹,\s]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  // Fallback method to load CSV data if API fails
  private async loadCSVData(): Promise<void> {
    try {
      const csvFiles = [
        { file: 'Ambada Seed.csv', variety: 'Ambada Seed' },
        { file: 'Astera.csv', variety: 'Astera' },
        { file: 'Almond(Badam).csv', variety: 'Almond(Badam)' },
        { file: 'Antawala.csv', variety: 'Antawala' },
        { file: 'Bamboo.csv', variety: 'Bamboo' }
      ];

      const allData: ProcessedMarketData[] = [];

      for (const csvInfo of csvFiles) {
        try {
          const response = await fetch(`/data/${csvInfo.file}`);
          if (response.ok) {
            const text = await response.text();
            const data = this.parseCSV(text, csvInfo.variety);
            allData.push(...data);
            console.log(`Loaded ${data.length} records from ${csvInfo.file}`);
          }
        } catch (error) {
          console.warn(`Error loading ${csvInfo.file}:`, error);
        }
      }

      this.data = allData;
      console.log(`Total records loaded from CSV: ${this.data.length}`);
    } catch (error) {
      console.error('Error loading CSV data:', error);
      throw new Error('Failed to load market data');
    }
  }

  private parseCSV(csvText: string, defaultVariety?: string): ProcessedMarketData[] {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data: ProcessedMarketData[] = [];

    const getColumnIndex = (possibleNames: string[]): number => {
      for (const name of possibleNames) {
        const index = headers.findIndex(h => 
          h.toLowerCase().includes(name.toLowerCase()) || 
          h.toLowerCase() === name.toLowerCase()
        );
        if (index !== -1) return index;
      }
      return -1;
    };

    const stateIndex = getColumnIndex(['State Name', 'State']);
    const districtIndex = getColumnIndex(['District Name', 'District']);
    const marketIndex = getColumnIndex(['Market Name', 'Market']);
    const varietyIndex = getColumnIndex(['Variety']);
    const groupIndex = getColumnIndex(['Group']);
    const arrivalsIndex = getColumnIndex(['Arrivals (Tonnes)', 'Arrivals']);
    const minPriceIndex = getColumnIndex(['Min Price (Rs./Quintal)', 'Min Price']);
    const maxPriceIndex = getColumnIndex(['Max Price (Rs./Quintal)', 'Max Price']);
    const modalPriceIndex = getColumnIndex(['Modal Price (Rs./Quintal)', 'Modal Price']);
    const dateIndex = getColumnIndex(['Reported Date', 'Date']);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line);
      if (values.length < headers.length) continue;

      try {
        const state = stateIndex >= 0 ? values[stateIndex] : '';
        const district = districtIndex >= 0 ? values[districtIndex] : '';
        const market = marketIndex >= 0 ? values[marketIndex] : '';
        const variety = varietyIndex >= 0 ? values[varietyIndex] : defaultVariety || '';
        const group = groupIndex >= 0 ? values[groupIndex] : '';
        const arrivals = arrivalsIndex >= 0 ? parseFloat(values[arrivalsIndex]) || 0 : 0;
        const minPrice = minPriceIndex >= 0 ? parseFloat(values[minPriceIndex]) || 0 : 0;
        const maxPrice = maxPriceIndex >= 0 ? parseFloat(values[maxPriceIndex]) || 0 : 0;
        const modalPrice = modalPriceIndex >= 0 ? parseFloat(values[modalPriceIndex]) || 0 : 0;
        const dateStr = dateIndex >= 0 ? values[dateIndex] : '2023-01-01';

        const row: ProcessedMarketData = {
          state: state.trim(),
          district: district.trim(),
          market: market.trim(),
          variety: variety.trim(),
          group: group.trim(),
          arrivals,
          minPrice,
          maxPrice,
          modalPrice,
          date: new Date(dateStr)
        };

        if (row.modalPrice > 0 && row.state && row.district && row.market && row.variety) {
          data.push(row);
        }
      } catch (error) {
        console.warn('Error parsing row:', line, error);
      }
    }

    return data;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  getStates(): string[] {
    const states = new Set(this.data.map(d => d.state));
    return Array.from(states).filter(s => s).sort();
  }

  getDistricts(state: string): string[] {
    const districts = new Set(
      this.data
        .filter(d => d.state === state)
        .map(d => d.district)
    );
    return Array.from(districts).filter(d => d).sort();
  }

  getVarieties(): string[] {
    const varieties = new Set(this.data.map(d => d.variety));
    return Array.from(varieties)
      .filter(v => v && v !== 'Other' && v.trim() !== '')
      .sort();
  }

  getMarketData(state?: string, district?: string, variety?: string): ProcessedMarketData[] {
    return this.data.filter(d => {
      if (state && d.state !== state) return false;
      if (district && d.district !== district) return false;
      if (variety && d.variety !== variety) return false;
      return true;
    });
  }

  generateAdvancedPriceForecast(variety: string, months: number = 12): PriceForecast[] {
    const varietyData = this.data.filter(d => d.variety === variety);
    if (varietyData.length === 0) return [];

    // Prepare historical data for NeuralProphet
    const historicalData = varietyData.map(d => ({
      date: d.date,
      price: d.modalPrice
    }));

    // Use NeuralProphet service for advanced forecasting
    return this.neuralProphet.generateAdvancedForecast(historicalData, months);
  }

  generatePriceForecast(variety: string, months: number = 12): PriceForecast[] {
    return this.generateAdvancedPriceForecast(variety, months);
  }

  private calculateMonthlyAverages(data: ProcessedMarketData[]): number[] {
    const monthlyData: { [key: number]: number[] } = {};
    
    data.forEach(d => {
      const month = d.date.getMonth();
      if (!monthlyData[month]) monthlyData[month] = [];
      monthlyData[month].push(d.modalPrice);
    });

    const monthlyAvg: number[] = [];
    for (let i = 0; i < 12; i++) {
      if (monthlyData[i] && monthlyData[i].length > 0) {
        monthlyAvg[i] = monthlyData[i].reduce((sum, price) => sum + price, 0) / monthlyData[i].length;
      } else {
        const overallAvg = data.reduce((sum, d) => sum + d.modalPrice, 0) / data.length;
        monthlyAvg[i] = overallAvg;
      }
    }

    return monthlyAvg;
  }

  getSeasonalPatterns(variety: string): SeasonalPattern[] {
    const varietyData = this.data.filter(d => d.variety === variety);
    if (varietyData.length === 0) return [];

    const monthlyAvg = this.calculateMonthlyAverages(varietyData);
    const overallAvg = monthlyAvg.reduce((sum, price) => sum + price, 0) / 12;

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return months.map((month, index) => {
      const priceIndex = monthlyAvg[index] / overallAvg;
      let recommendation: 'excellent' | 'good' | 'average' | 'poor';
      
      if (priceIndex >= 1.15) recommendation = 'excellent';
      else if (priceIndex >= 1.05) recommendation = 'good';
      else if (priceIndex >= 0.95) recommendation = 'average';
      else recommendation = 'poor';

      // Calculate additional metrics
      const monthData = varietyData.filter(d => d.date.getMonth() === index);
      const prices = monthData.map(d => d.modalPrice);
      const volatility = prices.length > 1 ? this.calculateStandardDeviation(prices) : 0;
      const historicalHigh = prices.length > 0 ? Math.max(...prices) : monthlyAvg[index];
      const historicalLow = prices.length > 0 ? Math.min(...prices) : monthlyAvg[index];

      return {
        month,
        averagePrice: Math.round(monthlyAvg[index]),
        priceIndex,
        recommendation,
        volatility: Math.round(volatility),
        historicalHigh: Math.round(historicalHigh),
        historicalLow: Math.round(historicalLow)
      };
    });
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  getBestMarkets(variety: string, userState?: string, limit: number = 5): ProcessedMarketData[] {
    const varietyData = this.data.filter(d => d.variety === variety);
    
    const marketGroups: { [key: string]: ProcessedMarketData[] } = {};
    
    varietyData.forEach(d => {
      const key = `${d.state}-${d.district}-${d.market}`;
      if (!marketGroups[key]) marketGroups[key] = [];
      marketGroups[key].push(d);
    });

    const marketAverages = Object.entries(marketGroups).map(([key, data]) => {
      const avgPrice = data.reduce((sum, d) => sum + d.modalPrice, 0) / data.length;
      const latest = data.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
      
      return {
        ...latest,
        modalPrice: Math.round(avgPrice),
        arrivals: data.reduce((sum, d) => sum + d.arrivals, 0) / data.length
      };
    });

    return marketAverages
      .sort((a, b) => {
        if (userState) {
          if (a.state === userState && b.state !== userState) return -1;
          if (b.state === userState && a.state !== userState) return 1;
        }
        return b.modalPrice - a.modalPrice;
      })
      .slice(0, limit);
  }

  // Get coordinates for markets (mock data for demo)
  getMarketCoordinates(state: string, district: string, market: string): [number, number] | null {
    // Mock coordinates for major Indian cities/districts
    const coordinates: { [key: string]: [number, number] } = {
      'Maharashtra-Pune': [73.8567, 18.5204],
      'Karnataka-Bangalore': [77.5946, 12.9716],
      'Gujarat-Ahmedabad': [72.5714, 23.0225],
      'Telangana-Hyderabad': [78.4867, 17.3850],
      'Tamil Nadu-Chennai': [80.2707, 13.0827],
      'Rajasthan-Jaipur': [75.7873, 26.9124],
      'West Bengal-Kolkata': [88.3639, 22.5726],
      'Uttar Pradesh-Lucknow': [80.9462, 26.8467],
      'Madhya Pradesh-Bhopal': [77.4126, 23.2599],
      'Haryana-Gurgaon': [77.0266, 28.4595],
      'Punjab-Chandigarh': [76.7794, 30.7333],
      'Bihar-Patna': [85.1376, 25.5941],
      'Odisha-Bhubaneswar': [85.8245, 20.2961],
      'Kerala-Kochi': [76.2673, 9.9312],
      'Assam-Guwahati': [91.7362, 26.1445],
      'Jharkhand-Ranchi': [85.3096, 23.3441],
      'Uttarakhand-Dehradun': [78.0322, 30.3165],
      'Himachal Pradesh-Shimla': [77.1734, 31.1048],
      'Jammu and Kashmir-Srinagar': [74.7973, 34.0837],
      'Goa-Panaji': [73.8278, 15.4909],
      'Tripura-Agartala': [91.2868, 23.8315],
      'Meghalaya-Shillong': [91.8933, 25.5788],
      'Manipur-Imphal': [93.9063, 24.8170],
      'Mizoram-Aizawl': [92.9376, 23.1645],
      'Nagaland-Kohima': [94.1086, 25.6751],
      'Arunachal Pradesh-Itanagar': [93.6053, 27.0844],
      'Sikkim-Gangtok': [88.6138, 27.3389],
      'Andaman and Nicobar Islands-Port Blair': [92.7265, 11.6234],
      'Lakshadweep-Kavaratti': [72.6420, 10.5669],
      'Delhi-New Delhi': [77.2090, 28.6139],
      'Puducherry-Puducherry': [79.8083, 11.9416],
      'Chandigarh-Chandigarh': [76.7794, 30.7333],
      'Dadra and Nagar Haveli-Silvassa': [73.0169, 20.2738],
      'Daman and Diu-Daman': [72.8397, 20.3974]
    };

    const key = `${state}-${district}`;
    return coordinates[key] || null;
  }
}