// src/components/CarbonFootprintBadge.tsx
import React from 'react';

type CarbonFootprintBadgeProps = {
  co2Savings: number; // kg of CO2 saved
  sustainabilityScore?: number; // percentage score
  size?: 'small' | 'medium' | 'large';
  layout?: 'horizontal' | 'vertical';
  showDetails?: boolean;
};

const CarbonFootprintBadge: React.FC<CarbonFootprintBadgeProps> = ({
  co2Savings,
  sustainabilityScore,
  size = 'medium',
  layout = 'horizontal',
  showDetails = true
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'text-sm',
          value: 'text-xs font-semibold',
          label: 'text-xs'
        };
      case 'large':
        return {
          container: 'px-4 py-3 text-base',
          icon: 'text-xl',
          value: 'text-lg font-bold',
          label: 'text-sm'
        };
      default: // medium
        return {
          container: 'px-3 py-2 text-sm',
          icon: 'text-base',
          value: 'text-sm font-semibold',
          label: 'text-xs'
        };
    }
  };

  const getLayoutClasses = () => {
    if (layout === 'vertical') {
      return 'flex-col items-center text-center';
    }
    return 'flex-row items-center';
  };

  const classes = getSizeClasses();

  if (co2Savings <= 0 && (!sustainabilityScore || sustainabilityScore <= 0)) {
    return null;
  }

  return (
    <div className={`inline-flex ${getLayoutClasses()} bg-green-100 text-green-800 rounded-full border border-green-300 ${classes.container}`}>
      <span className={`${classes.icon} mr-1`}>🌱</span>
      
      <div className={layout === 'vertical' ? 'text-center' : 'flex items-center gap-1'}>
        {co2Savings > 0 && (
          <span className={classes.value}>
            {co2Savings.toFixed(1)}kg CO₂
          </span>
        )}
        
        {showDetails && sustainabilityScore && sustainabilityScore > 0 && (
          <span className={`${classes.label} ${layout === 'horizontal' ? 'ml-1' : 'mt-1 block'} opacity-75`}>
            {sustainabilityScore.toFixed(0)}% sustainable
          </span>
        )}
        
        {!showDetails && (
          <span className={`${classes.label} ${layout === 'horizontal' ? 'ml-1' : 'mt-1 block'} opacity-75`}>
            eco-friendly
          </span>
        )}
      </div>
    </div>
  );
};

// Extended component for detailed display
export const CarbonFootprintCard: React.FC<{
  co2Savings: number;
  sustainabilityScore?: number;
  wasteReduction?: number;
  compactMode?: boolean;
}> = ({ co2Savings, sustainabilityScore, wasteReduction, compactMode = false }) => {
  if (co2Savings <= 0 && (!sustainabilityScore || sustainabilityScore <= 0)) {
    return null;
  }

  if (compactMode) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-600">🌱</span>
            <span className="text-sm font-medium text-green-800">Eco Impact</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-green-700">
              {co2Savings.toFixed(1)}kg CO₂ saved
            </div>
            {sustainabilityScore && (
              <div className="text-xs text-green-600">
                {sustainabilityScore.toFixed(0)}% sustainable
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
        <span>🌱</span>
        Environmental Impact
      </h4>
      
      <div className="grid grid-cols-1 gap-3">
        {co2Savings > 0 && (
          <div className="flex justify-between items-center p-2 bg-white rounded border border-green-100">
            <span className="text-sm text-green-700">CO₂ Savings</span>
            <span className="font-semibold text-green-800">{co2Savings.toFixed(2)} kg</span>
          </div>
        )}
        
        {sustainabilityScore && sustainabilityScore > 0 && (
          <div className="flex justify-between items-center p-2 bg-white rounded border border-green-100">
            <span className="text-sm text-green-700">Sustainability Score</span>
            <span className="font-semibold text-green-800">{sustainabilityScore.toFixed(1)}%</span>
          </div>
        )}
        
        {wasteReduction && wasteReduction > 0 && (
          <div className="flex justify-between items-center p-2 bg-white rounded border border-green-100">
            <span className="text-sm text-green-700">Waste Reduction</span>
            <span className="font-semibold text-green-800">{wasteReduction.toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-xs text-green-600">
        This product supports sustainable craftsmanship and reduces environmental impact compared to mass production.
      </div>
    </div>
  );
};

export default CarbonFootprintBadge;
