'use client';

import { useState, useEffect } from 'react';
import { Slider } from './Input';

interface ScenarioVariable {
  name: string;
  currentValue: number;
  min: number;
  max: number;
  unit: string;
  label: string;
}

interface ScenarioSimulatorProps {
  variables: ScenarioVariable[];
  currentRisk: number;
  onSimulate: (values: Record<string, number>) => number;
}

export default function ScenarioSimulator({ 
  variables, 
  currentRisk,
  onSimulate 
}: ScenarioSimulatorProps) {
  const [values, setValues] = useState<Record<string, number>>(
    variables.reduce((acc, v) => ({ ...acc, [v.name]: v.currentValue }), {})
  );
  const [predictedRisk, setPredictedRisk] = useState(currentRisk);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed = variables.some(v => values[v.name] !== v.currentValue);
    setHasChanges(changed);
    
    if (changed) {
      const newRisk = onSimulate(values);
      setPredictedRisk(newRisk);
    } else {
      setPredictedRisk(currentRisk);
    }
  }, [values, variables, currentRisk, onSimulate]);

  const handleSliderChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({ ...prev, [name]: parseInt(e.target.value) }));
  };

  const resetValues = () => {
    setValues(variables.reduce((acc, v) => ({ ...acc, [v.name]: v.currentValue }), {}));
  };

  const riskChange = predictedRisk - currentRisk;
  const riskChangePercent = ((riskChange / currentRisk) * 100).toFixed(1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          🔮 Scenario Simulator
        </h3>
        {hasChanges && (
          <button
            onClick={resetValues}
            className="text-sm text-[var(--color-cta)] hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <p className="text-sm text-[var(--color-text-light)] mb-6">
        Adjust the sliders below to see how changes would affect the risk prediction.
      </p>

      {/* Variables */}
      <div className="space-y-6 mb-6">
        {variables.map((variable) => (
          <div key={variable.name}>
            <Slider
              label={variable.label}
              min={variable.min}
              max={variable.max}
              value={values[variable.name]}
              onChange={handleSliderChange(variable.name)}
              unit={variable.unit}
              showValue={true}
            />
            {values[variable.name] !== variable.currentValue && (
              <p className="text-xs text-[var(--color-primary)] mt-1">
                Changed from {variable.currentValue}{variable.unit}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Results */}
      <div className={`p-4 rounded-xl border-2 transition-all ${
        hasChanges 
          ? 'border-[var(--color-primary)] bg-blue-50' 
          : 'border-[var(--color-border)] bg-gray-50'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[var(--color-text)]">
            Predicted Risk Level
          </span>
          {hasChanges && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              riskChange < 0 
                ? 'bg-green-100 text-green-700' 
                : riskChange > 0 
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {riskChange > 0 ? '+' : ''}{riskChangePercent}%
            </span>
          )}
        </div>

        <div className="flex items-end gap-4">
          {/* Current Risk */}
          <div className="flex-1">
            <p className="text-xs text-[var(--color-text-light)] mb-1">Current</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[var(--color-text)]">
                {currentRisk}%
              </span>
            </div>
          </div>

          {/* Arrow */}
          {hasChanges && (
            <svg 
              className={`w-6 h-6 mb-2 ${
                riskChange < 0 ? 'text-green-500' : 'text-gray-400'
              }`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}

          {/* Predicted Risk */}
          <div className="flex-1">
            <p className="text-xs text-[var(--color-text-light)] mb-1">
              {hasChanges ? 'Predicted' : 'No Changes'}
            </p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${
                hasChanges 
                  ? predictedRisk < currentRisk ? 'text-green-600' : 'text-red-600'
                  : 'text-[var(--color-text)]'
              }`}>
                {predictedRisk}%
              </span>
            </div>
          </div>
        </div>

        {hasChanges && (
          <p className="text-xs text-[var(--color-text-light)] mt-3">
            {riskChange < 0 
              ? `✓ These changes could reduce risk by ${Math.abs(riskChange).toFixed(1)} percentage points.`
              : riskChange > 0
              ? `⚠️ These changes might increase risk by ${riskChange.toFixed(1)} percentage points.`
              : 'No significant change in risk prediction.'
            }
          </p>
        )}
      </div>

      {hasChanges && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>Note:</strong> These are simulated predictions based on the AI model. 
            Real outcomes may vary based on implementation and individual circumstances.
          </p>
        </div>
      )}
    </div>
  );
}
