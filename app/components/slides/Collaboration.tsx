import { WrappedData } from "@/app/actions/github";
import { motion } from "framer-motion";
import { GitPullRequest, CircleDot, GitFork } from "lucide-react";

export function Collaboration({ data, onNext }: { data: WrappedData; onNext: () => void }) {
  const stats = [
    {
      label: "PRs Merged",
      value: data.stats.specifics?.prs || 0,
      icon: GitPullRequest,
      color: "text-purple-400",
      delay: 0.5
    },
    {
      label: "Issues Closed",
      value: data.stats.specifics?.issues || 0,
      icon: CircleDot,
      color: "text-green-400",
      delay: 1.0
    },
    {
      label: "Forks Earned",
      value: data.stats.totalForks,
      icon: GitFork,
      color: "text-blue-400",
      delay: 1.5
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4 space-y-12" onClick={onNext}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-5xl font-bold font-display text-center"
      >
        Building Together
      </motion.h2>

      <div className="flex flex-wrap justify-center gap-6 md:gap-12">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: stat.delay, type: "spring", bounce: 0.5 }}
            className="flex flex-col items-center p-6 bg-glass-bg border border-glass-border rounded-2xl min-w-[140px] md:min-w-[180px]"
          >
            <div className={`p-4 rounded-full bg-white/5 mb-4 ${stat.color}`}>
              <stat.icon className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <span className="text-4xl md:text-5xl font-bold text-white mb-2">
              {stat.value}
            </span>
            <span className="text-sm text-gray-400 uppercase tracking-widest text-center">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="text-gray-500 italic max-w-md text-center"
      >
        "Open source is not a spectator sport."
      </motion.p>
    </div>
  );
}
