import { WrappedData } from "@/app/actions/github";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

export function Evolution({ data, onNext }: { data: WrappedData; onNext: () => void }) {
  const prev = data.previousYear;
  const curr = {
    totalContributions: data.stats.totalContributions,
    longestStreak: data.stats.longestStreak,
    busyDay: data.stats.busyDay,
    topLanguage: data.stats.topLanguages[0]?.name || "N/A",
  };

  // If no 2024 data, show a simpler view
  if (!prev) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-8 w-full max-w-4xl" onClick={onNext}>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold font-display"
        >
          Your First Year Tracked!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-lg"
        >
          Come back next year to see how you&apos;ve evolved.
        </motion.p>
      </div>
    );
  }

  type Metric =
    | {
        kind: "number";
        label: string;
        prev: number;
        curr: number;
        format: (v: number) => string;
      }
    | {
        kind: "text";
        label: string;
        prev: string;
        curr: string;
        format: (v: string) => string;
      };

  const metrics: Metric[] = [
    {
      kind: "number",
      label: "CONTRIBUTIONS",
      prev: prev.totalContributions,
      curr: curr.totalContributions,
      format: (v: number) => v.toLocaleString(),
    },
    {
      kind: "number",
      label: "LONGEST STREAK",
      prev: prev.longestStreak,
      curr: curr.longestStreak,
      format: (v: number) => `${v} days`,
    },
    {
      kind: "text",
      label: "BUSIEST DAY",
      prev: prev.busyDay,
      curr: curr.busyDay,
      format: (v: string) => v,
    },
  ];

  const getTrend = (prev: number, curr: number) => {
    if (curr > prev) return { icon: TrendingUp, color: "text-neon-green" };
    if (curr < prev) return { icon: TrendingDown, color: "text-red-400" };
    return { icon: Minus, color: "text-gray-400" };
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 w-full max-w-4xl px-4" onClick={onNext}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-3xl md:text-5xl font-bold font-display">
          <span className="text-gray-500">2024</span>
          <span className="mx-4 text-neon-purple">→</span>
          <span className="text-white">2025</span>
        </h2>
        <p className="text-gray-500 text-sm font-mono">YOUR EVOLUTION</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {metrics.map((metric, index) => {
          const trend = metric.kind === "number" ? getTrend(metric.prev, metric.curr) : null;
          const TrendIcon = trend?.icon;

          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.15 }}
              className="bg-glass-bg border border-glass-border rounded-2xl p-6 flex flex-col"
            >
              <span className="text-xs text-gray-500 font-mono tracking-widest mb-4">{metric.label}</span>

              <div className="flex items-center justify-between gap-4">
                {/* 2024 Value */}
                <div className="text-left">
                  <span className="text-xs text-gray-600 block">2024</span>
                  <span className="text-xl md:text-2xl text-gray-500 font-bold">
                    {metric.format(metric.prev)}
                  </span>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 text-gray-600 flex-shrink-0" />

                {/* 2025 Value */}
                <div className="text-right">
                  <span className="text-xs text-gray-600 block">2025</span>
                  <span className={`text-xl md:text-2xl font-bold ${trend?.color || 'text-neon-blue'}`}>
                    {metric.format(metric.curr)}
                  </span>
                </div>
              </div>

              {/* Trend Indicator */}
              {TrendIcon && (
                <div className={`mt-3 flex items-center justify-center gap-1 text-xs ${trend?.color}`}>
                  <TrendIcon className="w-3 h-3" />
                  <span>
                    {metric.kind === "number"
                      ? metric.curr > metric.prev
                        ? `+${(metric.curr - metric.prev).toLocaleString()}`
                        : metric.curr < metric.prev
                          ? `${(metric.curr - metric.prev).toLocaleString()}`
                          : "Same"
                      : ""}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-gray-600 italic text-sm"
      >
        {curr.totalContributions > prev.totalContributions
          ? "You leveled up this year! 🚀"
          : curr.totalContributions === prev.totalContributions
          ? "Consistency is key. 💪"
          : "Quality over quantity. 🎯"}
      </motion.p>
    </div>
  );
}
