import { WrappedData } from "@/app/actions/github";
import { motion } from "framer-motion";

export function Intro({ data, onNext }: { data: WrappedData; onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-2xl" onClick={onNext}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-neon-blue font-mono text-xl tracking-widest uppercase"
      >
        GitHub Wrapped
      </motion.div>

      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
        className="text-[4rem] md:text-[8rem] font-bold leading-none bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent select-none font-display"
      >
        2025
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex items-center gap-4 bg-glass-bg border border-glass-border px-6 py-3 rounded-full"
      >
        <img
          src={data.user.avatarUrl}
          alt={data.user.login}
          className="w-10 h-10 rounded-full border-2 border-neon-purple"
        />
        <div className="text-left">
          <p className="text-sm text-gray-400">Welcome,</p>
          <p className="font-bold text-lg leading-none">@{data.user.login}</p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
        className="absolute bottom-20 text-sm text-white/30 font-mono"
      >
        [ CLICK OR PRESS SPACE ]
      </motion.p>
    </div>
  );
}
