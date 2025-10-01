export class GeminiService {
  private readonly API_KEY = 'AIzaSyB9vbG11sHLF-3R0mT9NuDzvv9vaVBNxi4';
  private readonly BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  async generateSeasonalInsights(
    variety: string,
    seasonalData: any[],
    forecastData: any[]
  ): Promise<any> {
    try {
      const prompt = this.createSeasonalPrompt(variety, seasonalData, forecastData);
      
      const response = await fetch(`${this.BASE_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return this.parseInsightResponse(text);
    } catch (error) {
      console.error('Error generating Gemini insights:', error);
      return this.getFallbackInsights(variety, seasonalData);
    }
  }

  private createSeasonalPrompt(variety: string, seasonalData: any[], forecastData: any[]): string {
    const bestMonths = seasonalData
      .filter(s => s.recommendation === 'excellent' || s.recommendation === 'good')
      .map(s => s.month);
    
    const worstMonths = seasonalData
      .filter(s => s.recommendation === 'poor')
      .map(s => s.month);

    const priceRange = {
      min: Math.min(...seasonalData.map(s => s.averagePrice)),
      max: Math.max(...seasonalData.map(s => s.averagePrice))
    };

    return `
Analyze the seasonal price trends for ${variety} crop in Indian APMC markets:

SEASONAL DATA:
- Best selling months: ${bestMonths.join(', ')}
- Worst selling months: ${worstMonths.join(', ')}
- Price range: ₹${priceRange.min} - ₹${priceRange.max} per quintal
- Monthly data: ${JSON.stringify(seasonalData.slice(0, 6))}

FORECAST TRENDS:
- 12-month forecast available
- Current trend indicators

Please provide:
1. A concise 2-3 sentence summary of seasonal trends
2. 3-4 key actionable insights for farmers
3. Main recommendation for optimal selling strategy
4. 2-3 risk factors to consider
5. 2-3 market opportunities

Format as JSON with keys: summary, keyPoints, recommendation, riskFactors, opportunities
Keep responses practical and farmer-focused. Use Indian context and terminology.
`;
  }

  private parseInsightResponse(text: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing if JSON is not properly formatted
      return {
        summary: this.extractSection(text, 'summary') || 'Seasonal analysis shows varying price patterns throughout the year.',
        keyPoints: this.extractList(text, 'key') || [
          'Monitor seasonal price variations',
          'Plan harvest timing strategically',
          'Consider storage options during low-price periods'
        ],
        recommendation: this.extractSection(text, 'recommendation') || 'Sell during peak price months for better profits.',
        riskFactors: this.extractList(text, 'risk') || ['Weather dependency', 'Market volatility'],
        opportunities: this.extractList(text, 'opportunit') || ['Value addition', 'Direct marketing']
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return this.getFallbackInsights('', []);
    }
  }

  private extractSection(text: string, keyword: string): string {
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(keyword)) {
        return lines[i + 1]?.trim() || '';
      }
    }
    return '';
  }

  private extractList(text: string, keyword: string): string[] {
    const lines = text.split('\n');
    const items: string[] = [];
    let inSection = false;
    
    for (const line of lines) {
      if (line.toLowerCase().includes(keyword)) {
        inSection = true;
        continue;
      }
      if (inSection && line.trim().startsWith('-')) {
        items.push(line.replace(/^-\s*/, '').trim());
      } else if (inSection && line.trim() === '') {
        break;
      }
    }
    
    return items.slice(0, 4); // Limit to 4 items
  }

  private getFallbackInsights(variety: string, seasonalData: any[]): any {
    return {
      summary: `${variety} shows seasonal price variations with distinct patterns throughout the year. Strategic timing of sales can significantly impact farmer profits.`,
      keyPoints: [
        'Monitor monthly price trends for optimal selling timing',
        'Consider post-harvest storage during low-price periods',
        'Plan cultivation cycles based on seasonal demand',
        'Diversify marketing channels to reduce price risks'
      ],
      recommendation: 'Focus on selling during peak price months and explore value-addition opportunities to maximize returns.',
      riskFactors: [
        'Weather-dependent price volatility',
        'Storage and transportation costs',
        'Market demand fluctuations'
      ],
      opportunities: [
        'Direct farmer-to-consumer sales',
        'Value-added product development',
        'Cooperative marketing initiatives'
      ]
    };
  }
}