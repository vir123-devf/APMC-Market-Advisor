import { PriceForecast } from '../types/market';

export class NeuralProphetService {
  // Simulate NeuralProphet-like forecasting with advanced time series analysis
  generateAdvancedForecast(
    historicalData: Array<{ date: Date; price: number }>,
    months: number = 12
  ): PriceForecast[] {
    if (historicalData.length === 0) return [];

    // Sort data by date
    const sortedData = historicalData.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Extract components
    const trendComponent = this.extractTrend(sortedData);
    const seasonalComponent = this.extractSeasonality(sortedData);
    const weeklyComponent = this.extractWeeklyPattern(sortedData);
    
    const forecasts: PriceForecast[] = [];
    const currentDate = new Date();
    
    for (let i = 0; i < months; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      
      const dayOfYear = this.getDayOfYear(forecastDate);
      const weekOfYear = this.getWeekOfYear(forecastDate);
      
      // Combine components
      const trend = this.getTrendValue(trendComponent, i);
      const seasonal = this.getSeasonalValue(seasonalComponent, dayOfYear);
      const weekly = this.getWeeklyValue(weeklyComponent, weekOfYear);
      const noise = this.generateNoise();
      
      const predictedPrice = Math.max(0, trend + seasonal + weekly + noise);
      const confidence = Math.max(0.5, 1 - (i * 0.03)); // Decreasing confidence over time
      
      // Determine trend direction
      const previousPrice = i > 0 ? forecasts[i - 1].predictedPrice : sortedData[sortedData.length - 1].price;
      const trend_direction = predictedPrice > previousPrice * 1.05 ? 'up' : 
                            predictedPrice < previousPrice * 0.95 ? 'down' : 'stable';
      
      forecasts.push({
        date: forecastDate.toISOString().split('T')[0],
        predictedPrice: Math.round(predictedPrice),
        confidence,
        trend: trend_direction,
        seasonalComponent: Math.round(seasonal),
        trendComponent: Math.round(trend),
        yearlyComponent: Math.round(seasonal),
        weeklyComponent: Math.round(weekly)
      });
    }

    return forecasts;
  }

  private extractTrend(data: Array<{ date: Date; price: number }>): number[] {
    // Simple linear trend extraction
    const prices = data.map(d => d.price);
    const n = prices.length;
    
    if (n < 2) return [prices[0] || 0];
    
    // Calculate linear regression
    const xSum = (n * (n - 1)) / 2;
    const ySum = prices.reduce((sum, price) => sum + price, 0);
    const xySum = prices.reduce((sum, price, index) => sum + price * index, 0);
    const x2Sum = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;
    
    return data.map((_, index) => intercept + slope * index);
  }

  public extractSeasonality(data: Array<{ date: Date; price: number }>): number[] {
    // Extract yearly seasonal pattern
    const monthlyAvg: { [key: number]: number[] } = {};
    
    data.forEach(d => {
      const month = d.date.getMonth();
      if (!monthlyAvg[month]) monthlyAvg[month] = [];
      monthlyAvg[month].push(d.price);
    });

    const overallAvg = data.reduce((sum, d) => sum + d.price, 0) / data.length;
    const seasonalPattern: number[] = [];
    
    for (let month = 0; month < 12; month++) {
      if (monthlyAvg[month] && monthlyAvg[month].length > 0) {
        const monthAvg = monthlyAvg[month].reduce((sum, price) => sum + price, 0) / monthlyAvg[month].length;
        seasonalPattern[month] = monthAvg - overallAvg;
      } else {
        seasonalPattern[month] = 0;
      }
    }

    return seasonalPattern;
  }

  private extractWeeklyPattern(data: Array<{ date: Date; price: number }>): number[] {
    // Extract weekly pattern (day of week effects)
    const weeklyAvg: { [key: number]: number[] } = {};
    
    data.forEach(d => {
      const dayOfWeek = d.date.getDay();
      if (!weeklyAvg[dayOfWeek]) weeklyAvg[dayOfWeek] = [];
      weeklyAvg[dayOfWeek].push(d.price);
    });

    const overallAvg = data.reduce((sum, d) => sum + d.price, 0) / data.length;
    const weeklyPattern: number[] = [];
    
    for (let day = 0; day < 7; day++) {
      if (weeklyAvg[day] && weeklyAvg[day].length > 0) {
        const dayAvg = weeklyAvg[day].reduce((sum, price) => sum + price, 0) / weeklyAvg[day].length;
        weeklyPattern[day] = dayAvg - overallAvg;
      } else {
        weeklyPattern[day] = 0;
      }
    }

    return weeklyPattern;
  }

  private getTrendValue(trendComponent: number[], futureIndex: number): number {
    if (trendComponent.length === 0) return 0;
    
    // Extrapolate trend
    const lastTrend = trendComponent[trendComponent.length - 1];
    const secondLastTrend = trendComponent.length > 1 ? trendComponent[trendComponent.length - 2] : lastTrend;
    const trendSlope = lastTrend - secondLastTrend;
    
    return lastTrend + (trendSlope * futureIndex);
  }

  private getSeasonalValue(seasonalPattern: number[], dayOfYear: number): number {
    // Convert day of year to month and interpolate
    const month = Math.floor((dayOfYear - 1) / 30.44); // Approximate days per month
    const monthIndex = Math.min(11, Math.max(0, month));
    
    return seasonalPattern[monthIndex] || 0;
  }

  private getWeeklyValue(weeklyPattern: number[], weekOfYear: number): number {
    // Simple weekly pattern
    const dayOfWeek = weekOfYear % 7;
    return weeklyPattern[dayOfWeek] || 0;
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private getWeekOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  }

  private generateNoise(): number {
    // Add some random noise to make forecasts more realistic
    return (Math.random() - 0.5) * 20; // ±10 rupees random variation
  }

  /**
   * Returns a month-wise seasonality action table based on the yearly seasonality component.
   * Each row: { month, trend, action }
   */
  public getSeasonalityActionTable(data: Array<{ date: Date; price: number }>): { month: string; trend: string; action: string }[] {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const yearlyComponent = this.extractSeasonality(data); // length 12
    const avg = yearlyComponent.reduce((a, b) => a + b, 0) / yearlyComponent.length;
    const threshold = Math.abs(avg) * 0.02; // 2% of average as threshold for "stable"

    return months.map((month, i) => {
      const prev = yearlyComponent[(i + 11) % 12]; // previous month, wrap around
      const curr = yearlyComponent[i];
      let trend: '⬆️' | '⬇️' | '➡️';
      let action: 'Sell' | 'Store' | 'Monitor';

      if (curr - prev > threshold) {
        trend = '⬆️';
        action = 'Sell';
      } else if (prev - curr > threshold) {
        trend = '⬇️';
        action = 'Store';
      } else {
        trend = '➡️';
        action = 'Monitor';
      }

      return { month, trend, action };
    });
  }
}