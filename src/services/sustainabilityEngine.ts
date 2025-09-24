export interface ProductData {
  category: string;
  weight_g: number;
  packaging_weight_g: number;
  distance_km_to_market: number;
  percent_recycled_material: number;
  production_method: string;
  materials?: string;
}

export interface SustainabilityMetrics {
  carbon_footprint: number;
  sustainability_score: number;
  co2_saving_kg?: number;
  waste_reduction_pct?: number;
}

export interface ImprovementSuggestion {
  id: string;
  category: 'materials' | 'production' | 'packaging' | 'distribution' | 'design';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedImprovement: {
    carbonReduction?: number;
    sustainabilityIncrease?: number;
    parameter?: string;
    newValue?: number | string;
  };
  implementation: string[];
  cost: 'low' | 'medium' | 'high';
}

export interface OptimizationTarget {
  parameter: keyof ProductData;
  currentValue: number | string;
  suggestedValue: number | string;
  improvement: number;
  reasoning: string;
}

export class SustainabilityRecommendationsEngine {
  private categoryFactors = {
    'textiles': { baseCarbonFactor: 5.0, handmadeMultiplier: 0.5 },
    'terracotta': { baseCarbonFactor: 3.0, handmadeMultiplier: 1.0 },
    'bamboo': { baseCarbonFactor: 2.5, handmadeMultiplier: 0.8 },
    'toys': { baseCarbonFactor: 4.0, handmadeMultiplier: 0.7 },
    'painting': { baseCarbonFactor: 1.5, handmadeMultiplier: 0.5 },
  };

  /**
   * Analyze current sustainability metrics and generate improvement suggestions
   */
  public async analyzeSustainability(
    productData: ProductData,
    currentMetrics: SustainabilityMetrics
  ): Promise<{
    suggestions: ImprovementSuggestion[];
    optimization: OptimizationTarget[];
    priorityActions: string[];
    potentialImpact: {
      maxCarbonReduction: number;
      maxSustainabilityIncrease: number;
    };
  }> {
    const suggestions = this.generateSuggestions(productData, currentMetrics);
    const optimization = this.optimizeParameters(productData, currentMetrics);
    const priorityActions = this.getPriorityActions(suggestions);
    const potentialImpact = this.calculatePotentialImpact(suggestions);

    return {
      suggestions,
      optimization,
      priorityActions,
      potentialImpact
    };
  }

  /**
   * Generate specific improvement suggestions based on product data
   */
  private generateSuggestions(
    productData: ProductData,
    currentMetrics: SustainabilityMetrics
  ): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    // Material optimization suggestions
    if (productData.percent_recycled_material < 60) {
      suggestions.push({
        id: 'increase-recycled-content',
        category: 'materials',
        title: 'Increase Recycled Content',
        description: `Your current recycled content is ${productData.percent_recycled_material}%. Increasing to 80% could significantly boost your sustainability score.`,
        impact: 'high',
        difficulty: 'medium',
        expectedImprovement: {
          sustainabilityIncrease: 15,
          parameter: 'percent_recycled_material',
          newValue: Math.min(80, productData.percent_recycled_material + 20)
        },
        implementation: [
          'Source recycled materials from local suppliers',
          'Partner with textile recycling facilities',
          'Use post-consumer waste materials',
          'Implement material recovery programs'
        ],
        cost: 'medium'
      });
    }

    // Production method optimization
    if (productData.production_method !== 'handmade') {
      suggestions.push({
        id: 'handmade-production',
        category: 'production',
        title: 'Switch to Handmade Production',
        description: 'Handmade production methods can reduce carbon footprint by up to 50% compared to machine production.',
        impact: 'high',
        difficulty: 'hard',
        expectedImprovement: {
          carbonReduction: currentMetrics.carbon_footprint * 0.3,
          sustainabilityIncrease: 25,
          parameter: 'production_method',
          newValue: 'handmade'
        },
        implementation: [
          'Train artisans in traditional techniques',
          'Set up hand-tool workshops',
          'Develop quality control for handmade products',
          'Create artisan networks'
        ],
        cost: 'high'
      });
    }

    // Packaging optimization
    if (productData.packaging_weight_g > 50) {
      const reduction = Math.floor(productData.packaging_weight_g * 0.4);
      suggestions.push({
        id: 'reduce-packaging',
        category: 'packaging',
        title: 'Minimize Packaging Weight',
        description: `Reducing packaging from ${productData.packaging_weight_g}g to ${productData.packaging_weight_g - reduction}g can improve sustainability.`,
        impact: 'medium',
        difficulty: 'easy',
        expectedImprovement: {
          sustainabilityIncrease: 8,
          carbonReduction: 0.1,
          parameter: 'packaging_weight_g',
          newValue: productData.packaging_weight_g - reduction
        },
        implementation: [
          'Use minimal, form-fitting packaging',
          'Switch to biodegradable materials',
          'Eliminate unnecessary plastic wrapping',
          'Use recycled cardboard boxes'
        ],
        cost: 'low'
      });
    }

    // Distribution optimization
    if (productData.distance_km_to_market > 200) {
      suggestions.push({
        id: 'local-distribution',
        category: 'distribution',
        title: 'Optimize Distribution Network',
        description: `Reducing transport distance from ${productData.distance_km_to_market}km to under 200km will lower emissions.`,
        impact: 'medium',
        difficulty: 'hard',
        expectedImprovement: {
          carbonReduction: (productData.distance_km_to_market - 200) * 0.01,
          parameter: 'distance_km_to_market',
          newValue: Math.max(100, productData.distance_km_to_market * 0.7)
        },
        implementation: [
          'Find regional distribution centers',
          'Partner with local retailers',
          'Implement direct-to-consumer sales',
          'Use local courier services'
        ],
        cost: 'medium'
      });
    }

    // Weight optimization
    if (productData.weight_g > 500) {
      suggestions.push({
        id: 'design-optimization',
        category: 'design',
        title: 'Optimize Product Design',
        description: 'Reducing weight through design optimization can lower transportation emissions and material usage.',
        impact: 'medium',
        difficulty: 'medium',
        expectedImprovement: {
          carbonReduction: 0.2,
          parameter: 'weight_g',
          newValue: Math.floor(productData.weight_g * 0.9)
        },
        implementation: [
          'Review design for unnecessary material',
          'Use hollow or lattice structures',
          'Optimize thickness and dimensions',
          'Consider modular designs'
        ],
        cost: 'medium'
      });
    }

    // Category-specific suggestions
    suggestions.push(...this.getCategorySpecificSuggestions(productData));

    return suggestions;
  }

  /**
   * Generate category-specific improvement suggestions
   */
  private getCategorySpecificSuggestions(productData: ProductData): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    switch (productData.category.toLowerCase()) {
      case 'textiles':
        suggestions.push({
          id: 'natural-dyes',
          category: 'materials',
          title: 'Use Natural Dyes',
          description: 'Switch from synthetic to natural plant-based dyes to reduce chemical impact.',
          impact: 'medium',
          difficulty: 'medium',
          expectedImprovement: { sustainabilityIncrease: 10 },
          implementation: [
            'Source indigo, turmeric, and other plant dyes',
            'Experiment with fruit and vegetable dyes',
            'Learn traditional dyeing techniques',
            'Set up natural dye baths'
          ],
          cost: 'low'
        });
        break;

      case 'terracotta':
        suggestions.push({
          id: 'solar-drying',
          category: 'production',
          title: 'Implement Solar Drying',
          description: 'Use solar energy for drying instead of fuel-powered kilns where possible.',
          impact: 'high',
          difficulty: 'medium',
          expectedImprovement: { carbonReduction: 0.5, sustainabilityIncrease: 15 },
          implementation: [
            'Build solar drying chambers',
            'Schedule production around weather',
            'Use hybrid solar-kiln systems',
            'Optimize clay preparation for solar drying'
          ],
          cost: 'medium'
        });
        break;

      case 'bamboo':
        suggestions.push({
          id: 'sustainable-harvesting',
          category: 'materials',
          title: 'Sustainable Bamboo Harvesting',
          description: 'Ensure bamboo is harvested using sustainable rotation practices.',
          impact: 'high',
          difficulty: 'easy',
          expectedImprovement: { sustainabilityIncrease: 20 },
          implementation: [
            'Partner with certified bamboo farms',
            'Follow 3-5 year rotation cycles',
            'Harvest only mature bamboo',
            'Support bamboo reforestation'
          ],
          cost: 'low'
        });
        break;
    }

    return suggestions;
  }

  /**
   * Optimize product parameters for better sustainability
   */
  private optimizeParameters(
    productData: ProductData,
    currentMetrics: SustainabilityMetrics
  ): OptimizationTarget[] {
    const optimizations: OptimizationTarget[] = [];

    // Recycled content optimization
    if (productData.percent_recycled_material < 80) {
      const currentValue = productData.percent_recycled_material;
      const suggestedValue = Math.min(85, currentValue + 25);
      const improvement = (suggestedValue - currentValue) * 0.4; // 40% weight in sustainability score

      optimizations.push({
        parameter: 'percent_recycled_material',
        currentValue,
        suggestedValue,
        improvement,
        reasoning: 'Recycled content has the highest impact on sustainability score. Each 1% increase contributes 0.4% to the overall score.'
      });
    }

    // Distance optimization
    if (productData.distance_km_to_market > 150) {
      const currentValue = productData.distance_km_to_market;
      const suggestedValue = Math.max(100, currentValue * 0.75);
      const improvement = (currentValue - suggestedValue) * 0.01; // CO2 impact per km

      optimizations.push({
        parameter: 'distance_km_to_market',
        currentValue,
        suggestedValue,
        improvement,
        reasoning: 'Transportation distance directly affects CO2 emissions. Each kilometer reduction saves 0.01kg CO2.'
      });
    }

    // Packaging weight optimization
    if (productData.packaging_weight_g > 30) {
      const currentValue = productData.packaging_weight_g;
      const suggestedValue = Math.max(20, currentValue * 0.6);
      const improvement = Math.min((currentValue - suggestedValue) * 8, 15); // Max 15% penalty reduction

      optimizations.push({
        parameter: 'packaging_weight_g',
        currentValue,
        suggestedValue,
        improvement,
        reasoning: 'Packaging weight penalties can be reduced by minimizing materials. Each gram reduction helps sustainability score.'
      });
    }

    // Weight optimization
    if (productData.weight_g > 300) {
      const currentValue = productData.weight_g;
      const suggestedValue = currentValue * 0.85;
      const improvement = (currentValue - suggestedValue) * 0.01; // CO2 reduction from weight

      optimizations.push({
        parameter: 'weight_g',
        currentValue,
        suggestedValue,
        improvement,
        reasoning: 'Product weight affects transportation emissions and material usage. Design optimization can reduce weight while maintaining functionality.'
      });
    }

    return optimizations.sort((a, b) => b.improvement - a.improvement);
  }

  /**
   * Get priority actions based on impact and difficulty
   */
  private getPriorityActions(suggestions: ImprovementSuggestion[]): string[] {
    // Sort by impact (high first) and difficulty (easy first)
    const prioritized = suggestions
      .filter(s => s.impact === 'high' || (s.impact === 'medium' && s.difficulty === 'easy'))
      .sort((a, b) => {
        const impactScore = { high: 3, medium: 2, low: 1 };
        const difficultyScore = { easy: 3, medium: 2, hard: 1 };
        
        const scoreA = impactScore[a.impact] + difficultyScore[a.difficulty];
        const scoreB = impactScore[b.impact] + difficultyScore[b.difficulty];
        
        return scoreB - scoreA;
      });

    return prioritized.slice(0, 3).map(s => s.title);
  }

  /**
   * Calculate potential impact of all improvements
   */
  private calculatePotentialImpact(suggestions: ImprovementSuggestion[]): {
    maxCarbonReduction: number;
    maxSustainabilityIncrease: number;
  } {
    let maxCarbonReduction = 0;
    let maxSustainabilityIncrease = 0;

    suggestions.forEach(suggestion => {
      if (suggestion.expectedImprovement.carbonReduction) {
        maxCarbonReduction += suggestion.expectedImprovement.carbonReduction;
      }
      if (suggestion.expectedImprovement.sustainabilityIncrease) {
        maxSustainabilityIncrease += suggestion.expectedImprovement.sustainabilityIncrease;
      }
    });

    // Cap the maximum improvements to realistic values
    maxCarbonReduction = Math.min(maxCarbonReduction, 2.0); // Max 2kg CO2 improvement
    maxSustainabilityIncrease = Math.min(maxSustainabilityIncrease, 40); // Max 40% improvement

    return {
      maxCarbonReduction: Math.round(maxCarbonReduction * 100) / 100,
      maxSustainabilityIncrease: Math.round(maxSustainabilityIncrease)
    };
  }

  /**
   * Get quick sustainability tips for a specific category
   */
  public getQuickTips(category?: string): string[] {
    const generalTips = [
      'Use recycled materials when possible',
      'Choose local suppliers to reduce transport emissions',
      'Minimize packaging weight and volume',
      'Implement handmade production methods',
      'Use renewable energy sources',
      'Create zero-waste production processes'
    ];

    const categoryTips: { [key: string]: string[] } = {
      textiles: [
        'Use natural, plant-based dyes',
        'Source organic cotton or hemp fibers',
        'Implement water-efficient dyeing processes',
        'Use natural mordants for color fixing',
        'Create reversible designs to extend product life'
      ],
      terracotta: [
        'Use solar drying when weather permits',
        'Recycle clay scraps and failed pieces',
        'Use natural glazes and finishes',
        'Optimize kiln firing for energy efficiency',
        'Source local clay to reduce transport'
      ],
      bamboo: [
        'Ensure sustainable bamboo harvesting practices',
        'Use all parts of the bamboo plant',
        'Apply natural oil finishes instead of synthetic',
        'Support bamboo reforestation projects',
        'Implement proper bamboo treatment methods'
      ]
    };

    return category && categoryTips[category.toLowerCase()] 
      ? categoryTips[category.toLowerCase()]
      : generalTips;
  }

  /**
   * Simulate the impact of parameter changes
   */
  public simulateParameterChange(
    originalProduct: ProductData,
    changedParameter: keyof ProductData,
    newValue: number | string
  ): Promise<{
    originalMetrics: SustainabilityMetrics;
    newMetrics: SustainabilityMetrics;
    improvement: {
      carbonChange: number;
      sustainabilityChange: number;
      percentageImprovement: number;
    };
  }> {
    // This would ideally call the backend API to get real calculations
    // For now, we'll simulate the changes
    
    const modifiedProduct = { ...originalProduct, [changedParameter]: newValue };
    
    // Mock calculation - in real implementation, this would call the backend
    const originalMetrics = this.mockCalculateMetrics(originalProduct);
    const newMetrics = this.mockCalculateMetrics(modifiedProduct);
    
    return Promise.resolve({
      originalMetrics,
      newMetrics,
      improvement: {
        carbonChange: newMetrics.carbon_footprint - originalMetrics.carbon_footprint,
        sustainabilityChange: newMetrics.sustainability_score - originalMetrics.sustainability_score,
        percentageImprovement: ((newMetrics.sustainability_score - originalMetrics.sustainability_score) / originalMetrics.sustainability_score) * 100
      }
    });
  }

  /**
   * Mock calculation for demonstration - replace with actual API call
   */
  private mockCalculateMetrics(product: ProductData): SustainabilityMetrics {
    // Simplified calculation based on the backend estimator logic
    const baseSustainability = product.percent_recycled_material * 0.4;
    const methodBonus = product.production_method === 'handmade' ? 35 : 
                       product.production_method === 'small-batch' ? 20 : 0;
    const distancePenalty = Math.min(product.distance_km_to_market * 0.05, 25);
    const weightPenalty = Math.min((product.weight_g + product.packaging_weight_g) / 1000 * 8, 15);
    
    const sustainabilityScore = Math.max(0, Math.min(95, 
      baseSustainability + methodBonus - distancePenalty - weightPenalty
    ));
    
    const carbonFootprint = Math.max(0.5, 
      ((product.weight_g + product.packaging_weight_g) / 1000 * 3.0) - 
      (sustainabilityScore / 100 * 1.5)
    );
    
    return {
      carbon_footprint: Math.round(carbonFootprint * 100) / 100,
      sustainability_score: Math.round(sustainabilityScore * 10) / 10,
      co2_saving_kg: carbonFootprint,
      waste_reduction_pct: sustainabilityScore
    };
  }
}

export default SustainabilityRecommendationsEngine;