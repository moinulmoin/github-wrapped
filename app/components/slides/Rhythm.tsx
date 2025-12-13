import { WrappedData } from "@/app/actions/github";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export function Rhythm({ data, onNext }: { data: WrappedData; onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 w-full max-w-4xl" onClick={onNext}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-24 h-24 rounded-full bg-acid-green/20 flex items-center justify-center border border-acid-green shadow-[0_0_30px_rgba(204,255,0,0.3)]"
      >
        <Activity className="w-12 h-12 text-acid-green" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl md:text-5xl font-bold font-display"
      >
        Your rhythm was unbreakable on
      </motion.h2>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ delay: 0.6, type: "spring" }}
        className="text-[4rem] md:text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 uppercase tracking-tighter"
      >
        {data.stats.busyDay}S
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="bg-glass-bg border border-glass-border p-6 rounded-xl max-w-lg"
      >
        <p className="text-lg text-gray-300 italic">
          &quot;{getQuote(data.stats.busyDay)}&quot;
        </p>
      </motion.div>
    </div>
  );
}

function getQuote(day: string): string {
    const quotes: Record<string, string> = {
        "Monday": "Starting the week with a bang. Pure momentum.",
        "Tuesday": "Flow state unlocked. You were unstoppable.",
        "Wednesday": "Hump day? More like pump day.",
        "Thursday": "Consistency is key, and you turned the key.",
        "Friday": "Deploying on Fridays? You like to live dangerously.",
        "Saturday": "Weekend warrior. While others slept, you shipped.",
        "Sunday": "The holy day of coding. Dedication level: Max."
    };
    return quotes[day] || "That was your peak performance day. The code just flowed.";
}
