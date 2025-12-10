import { WrappedData } from "@/app/actions/github";
import { motion } from "framer-motion";

export function Arsenal({ data, onNext }: { data: WrappedData; onNext: () => void }) {
  const maxCount = Math.max(...data.stats.topLanguages.map((l) => l.count));

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4" onClick={onNext}>
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-5xl font-bold mb-12 font-display text-center"
      >
        Your Weapon of Choice
      </motion.h2>

      <div className="w-full max-w-2xl space-y-6">
        {data.stats.topLanguages.map((lang, index) => (
          <div key={lang.name} className="relative">
            <div className="flex justify-between items-end mb-2">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="text-xl md:text-2xl font-mono font-bold"
              >
                {lang.name}
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 1 }}
                className="text-gray-400 font-mono"
              >
                {lang.count} repos
              </motion.span>
            </div>

            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(lang.count / maxCount) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 + 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full shadow-[0_0_15px_rgba(188,19,254,0.5)]"
              />
            </div>
          </div>
        ))}
      </div>

       <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-12 text-gray-500 italic text-center"
      >
        "{data.stats.topLanguages[0]?.name || "Code"} is your native tongue."
      </motion.p>
    </div>
  );
}
