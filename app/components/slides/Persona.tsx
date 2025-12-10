import { WrappedData } from "@/app/actions/github";
import { motion } from "framer-motion";
import { Share2, Download } from "lucide-react";

export function Persona({ data, onNext }: { data: WrappedData; onNext: () => void }) {

  const getArchetype = () => {
    const { topLanguages, totalContributions, busyDay } = data.stats;
    if (totalContributions > 2000) return { title: "THE MACHINE", color: "text-red-500", desc: "Code flows through your veins." };
    if (topLanguages.length > 4) return { title: "THE POLYGLOT", color: "text-neon-purple", desc: "You speak in many tongues." };
    if (["Saturday", "Sunday"].includes(busyDay)) return { title: "THE WARRIOR", color: "text-orange-500", desc: "You battle bugs on weekends." };
    return { title: "THE ARCHITECT", color: "text-neon-blue", desc: "You build the future, one commit at a time." };
  };

  const archetype = getArchetype();

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 w-full max-w-4xl">
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative group perspective-1000"
      >
        {/* Card */}
        <div className="w-[300px] h-[450px] md:w-[380px] md:h-[550px] bg-gradient-to-br from-glass-bg to-black border border-glass-border rounded-xl p-8 flex flex-col items-center justify-between shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">

          {/* Holographic Overlay Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.05),transparent)] pointer-events-none" />

          {/* Header */}
          <div className="w-full flex justify-between items-center text-xs text-gray-500 font-mono mb-2">
             <span>#{data.user.login.toUpperCase()}</span>
             <span>2025 EDITION</span>
          </div>

          {/* Main Title - Reverted Priority */}
          <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white drop-shadow-lg mb-6">
             GIT WRAPPED
          </h2>

          {/* Avatar */}
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple blur-2xl opacity-50 rounded-full" />
             <img src={data.user.avatarUrl} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/20 relative z-10" alt="Avatar" />

             {/* Rank Badge overlay */}
             <div className="absolute -bottom-2 md:-bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-neon-green text-neon-green text-[10px] md:text-xs font-bold whitespace-nowrap z-20">
                LVL {data.stats.level} • {archetype.title}
             </div>
          </div>

          {/* Subtitle / Desc */}
          <div className="space-y-2 mb-6">
             <p className={`text-lg md:text-xl font-bold font-mono ${archetype.color}`}>
                "{archetype.desc}"
             </p>
          </div>

          {/* Stats Summary */}
          <div className="w-full grid grid-cols-2 gap-2 text-xs text-gray-400 border-t border-white/10 pt-4">
             <div className="text-left">
               <span className="block text-white font-bold">{data.stats.totalContributions}</span> Contributions
             </div>
              <div className="text-right">
                <span className="block text-white font-bold">{data.stats.topLanguages[0]?.name}</span> Main Stack
              </div>

              {/* Secondary Stats Row */}
              <div className="text-left mt-2 pt-2 border-t border-white/10">
                <span className="block text-white font-bold">{data.stats.totalStars}</span> Stars Earned
              </div>
              <div className="text-right mt-2 pt-2 border-t border-white/10">
                <span className="block text-white font-bold">{data.stats.longestStreak} Day</span> Streak
              </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex gap-4"
      >
        <button className="flex items-center gap-2 px-6 py-3 bg-neon-blue text-black font-bold rounded-full hover:bg-white transition-colors"
         onClick={() => {
             const url = `${window.location.origin}/u/${data.user.login}`;
             navigator.clipboard.writeText(url);
             alert("Link copied to clipboard: " + url);
         }}
        >
          <Share2 className="w-4 h-4" /> Share Link
        </button>
      </motion.div>
    </div>
  );
}
