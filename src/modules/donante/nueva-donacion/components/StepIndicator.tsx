import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  return (
    <nav className="flex justify-center sm:justify-end space-x-2 sm:space-x-4">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index + 1}
          className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium ${
            currentStep >= index + 1 ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <div
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${
              currentStep >= index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            {currentStep > index + 1 ? <Check className="w-3 h-3 sm:w-5 sm:h-5" /> : index + 1}
          </div>
          <span className="hidden sm:block">{stepLabels[index]}</span>
        </div>
      ))}
    </nav>
  );
}
