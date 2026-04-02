'use client';

import { useConverterStore } from '@/lib/store';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function WizardSteps() {
  const currentStep = useConverterStore((s) => s.currentStep);
  const setStep = useConverterStore((s) => s.setStep);
  const selectedTemplate = useConverterStore((s) => s.selectedTemplate);
  const totalSteps = useConverterStore((s) => s.totalSteps);
  const maxStepReached = useConverterStore((s) => s.maxStepReached);

  const steps = selectedTemplate?.steps || [];

  if (steps.length === 0) return null;

  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gray-100">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-3 overflow-x-auto px-2 py-1">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;
          const canGo = stepNum <= maxStepReached;

          return (
            <div key={step.label} className="flex items-center">
              <button
                onClick={() => canGo && setStep(stepNum)}
                disabled={!canGo}
                className={cn(
                  'relative flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 lg:px-5 py-2 text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap',
                  // Active
                  isActive && 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm',
                  // Completed
                  isCompleted && canGo && 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer',
                  // Accessible but not current
                  !isActive && !isCompleted && canGo && 'bg-white text-slate-500 border border-gray-200 hover:bg-gray-50 hover:text-slate-700 cursor-pointer',
                  // Disabled
                  !canGo && 'bg-gray-50 text-slate-400 border border-gray-100 cursor-not-allowed',
                )}
              >
                {isCompleted ? (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </span>
                ) : isActive ? (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    {stepNum}
                  </span>
                ) : (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 border border-gray-200 text-[10px] font-medium text-slate-500">
                    {stepNum}
                  </span>
                )}
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{stepNum}</span>
                {isActive && (
                  <motion.div
                    layoutId="stepGlow"
                    className="absolute inset-0 rounded-full border border-emerald-300"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>

              {idx < steps.length - 1 && (
                <div className="w-3 sm:w-6 lg:w-10 flex-shrink-0">
                  <div className={cn(
                    'h-[1px] w-full transition-all duration-500',
                    currentStep > stepNum
                      ? 'bg-emerald-400'
                      : 'bg-gray-200'
                  )} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
