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
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.04]">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400"
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
                  isActive && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
                  // Completed
                  isCompleted && canGo && 'bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-500/30 cursor-pointer',
                  // Accessible but not current
                  !isActive && !isCompleted && canGo && 'bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:bg-white/[0.08] hover:text-slate-300 cursor-pointer',
                  // Disabled
                  !canGo && 'bg-white/[0.02] text-slate-600 border border-white/[0.04] cursor-not-allowed',
                )}
              >
                {isCompleted ? (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </span>
                ) : isActive ? (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-black text-[10px] font-bold shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                    {stepNum}
                  </span>
                ) : (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[10px] font-medium text-slate-500">
                    {stepNum}
                  </span>
                )}
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{stepNum}</span>
                {isActive && (
                  <motion.div
                    layoutId="stepGlow"
                    className="absolute inset-0 rounded-full border border-emerald-500/30"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>

              {idx < steps.length - 1 && (
                <div className="w-3 sm:w-6 lg:w-10 flex-shrink-0">
                  <div className={cn(
                    'h-[1px] w-full transition-all duration-500',
                    currentStep > stepNum
                      ? 'bg-gradient-to-r from-emerald-500/60 to-emerald-500/30'
                      : 'bg-white/[0.06]'
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
