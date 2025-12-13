import { WrappedData } from "@/app/actions/github";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Book, Star, type LucideIcon } from "lucide-react";

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
           className="text-[4rem] md:text-[8rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple font-display leading-none"
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
        <StatBox label="Repositories" value={data.user.publicRepos} delay={2} icon={Book} color="text-neon-blue" />
        <StatBox label="Total Stars" value={data.stats.totalStars} delay={2.2} icon={Star} color="text-yellow-400" />
      </div>
    </div>
  );
}

function StatBox({ label, value, delay, icon: Icon, color }: { label: string; value: number; delay: number; icon: LucideIcon; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col items-center"
    >
      <div className="flex items-center gap-3 mb-3">
         <Icon className={`w-8 h-8 md:w-10 md:h-10 ${color}`} />
         <span className="text-5xl md:text-6xl font-bold text-white">{value.toLocaleString()}</span>
      </div>
      <span className="text-sm md:text-base text-gray-400 uppercase tracking-widest font-mono">{label}</span>
    </motion.div>
  );
}
