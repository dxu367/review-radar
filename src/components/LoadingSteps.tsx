"use client";

import { Check, Loader2, Circle } from "lucide-react";
import { SearchStep } from "@/hooks/useProductSearch";

interface LoadingStepsProps {
  step: SearchStep;
}

const steps = [
  { key: "searching", label: "Searching retailers" },
  { key: "fetching_reviews", label: "Collecting reviews" },
  { key: "analyzing", label: "AI analysis" },
] as const;

const stepOrder: SearchStep[] = ["searching", "fetching_reviews", "analyzing", "done"];

export default function LoadingSteps({ step }: LoadingStepsProps) {
  if (step === "idle" || step === "error") return null;

  const currentIndex = stepOrder.indexOf(step);

  return (
    <div className="flex items-center gap-3 py-6">
      {steps.map((s, i) => {
        const stepIndex = stepOrder.indexOf(s.key);
        const isComplete = currentIndex > stepIndex;
        const isActive = currentIndex === stepIndex;

        return (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`w-8 h-0.5 ${isComplete ? "bg-green-500" : "bg-gray-200"}`}
              />
            )}
            <div className="flex items-center gap-2">
              {isComplete ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : isActive ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
              <span
                className={`text-sm font-medium ${
                  isComplete
                    ? "text-green-600"
                    : isActive
                      ? "text-blue-600"
                      : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
