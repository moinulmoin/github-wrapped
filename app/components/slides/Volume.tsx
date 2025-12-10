import { WrappedData } from "@/app/actions/github";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Volume({ data, onNext }: { data: WrappedData; onNext: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // ms
    const steps = 60;
    const interval = duration / steps;
    const increment = data.contributions.total / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= data.contributions.total) {
        setCount(data.contributions.total);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [data.contributions.total]);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 w-full max-w-4xl" onClick={onNext}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-4xl font-light text-gray-400 font-display"
      >
        You made some noise this year.
      </motion.h2>

      <div className="relative">
        <motion.div
           initial={{ scale: 0.5, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.5, type: "spring" }}
           className="text-[6rem] md:text-[10rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple font-display leading-none"
        >
          {count.toLocaleString()}
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute -bottom-6 right-0 text-xl md:text-2xl text-white font-mono"
        >
          CONTRIBUTIONS
        </motion.p>
      </div>

      <div className="grid grid-cols-2 gap-8 md:gap-16 mt-12 w-full max-w-2xl">
        <StatBox label="Repositories" value={data.user.publicRepos} delay={2} />
        <StatBox label="Total Stars" value={data.stats.totalStars} delay={2.2} />
      </div>
    </div>
  );
}

function StatBox({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-glass-bg border border-glass-border p-6 rounded-2xl flex flex-col items-center"
    >
      <span className="text-4xl md:text-5xl font-bold text-white mb-2">{value}</span>
      <span className="text-sm md:text-base text-gray-400 uppercase tracking-widest">{label}</span>
    </motion.div>
  );
}
