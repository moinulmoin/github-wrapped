import { WrappedData } from "@/app/actions/github";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export function Consistency({ data, onNext }: { data: WrappedData; onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 w-full max-w-4xl" onClick={onNext}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative"
      >
        <Flame className="w-32 h-32 md:w-48 md:h-48 text-orange-500 fill-orange-500 drop-shadow-[0_0_50px_rgba(249,115,22,0.6)]" />
        <motion.div
           animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
           transition={{ repeat: Infinity, duration: 2 }}
           className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 rounded-full"
        />
      </motion.div>

      <div className="space-y-4">
         <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl text-gray-400 font-display"
        >
          Longest Streak
        </motion.h2>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[6rem] md:text-[10rem] font-bold leading-none text-white"
        >
          {data.stats.longestStreak}
          <span className="text-2xl md:text-4xl text-gray-500 ml-4">DAYS</span>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-xl md:text-2xl max-w-xl text-gray-300"
      >
        {data.stats.longestStreak > 7
          ? "Unstoppable momentum. you showed up when it mattered."
          : "Consistency is loading... 2026 is your year."}
      </motion.p>
    </div>
  );
}
