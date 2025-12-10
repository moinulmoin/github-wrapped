import { WrappedData } from "@/app/actions/github";
import { motion } from "framer-motion";
import { Share2, Download } from "lucide-react";

export function Persona({ data, onNext }: { data: WrappedData; onNext: () => void }) {

  const getArchetype = () => {
    const { topLanguages, totalContributions, busyDay, specifics, longestStreak } = data.stats;
    const prs = specifics?.prs || 0;
    const issues = specifics?.issues || 0;

    if (totalContributions > 3000) return {
        title: "THE TITAN",
        color: "text-neon-blue",
        desc: "Your code footprint is visible from space.",
        explanation: "Earned by having over 3000 total contributions."
    };
    if (prs > 100) return {
        title: "THE SHIPPER",
        color: "text-green-400",
        desc: "You don't just write code, you deliver.",
        explanation: "Earned by merging over 100 Pull Requests."
    };
    if (issues > 50) return {
        title: "THE GUARDIAN",
        color: "text-yellow-400",
        desc: "You keep the bugs at bay.",
        explanation: "Earned by closing over 50 Issues."
    };
    if (topLanguages.length > 6) return {
        title: "THE POLYGLOT",
        color: "text-neon-purple",
        desc: "You speak in many tongues.",
        explanation: "Earned by using more than 6 languages."
    };
    if (topLanguages.length < 3 && totalContributions > 500) return {
        title: "THE SPECIALIST",
        color: "text-blue-500",
        desc: "Master of one, feared by many.",
        explanation: "Earned by high activity with focused language usage."
    };
    if (longestStreak > 30) return {
        title: "THE SURVIVOR",
        color: "text-orange-500",
        desc: "Consistency is your superpower.",
        explanation: "Earned by maintaining a commit streak over 30 days."
    };
    if (["Saturday", "Sunday"].includes(busyDay)) return {
        title: "THE WARRIOR",
        color: "text-red-500",
        desc: "You battle bugs while others sleep.",
        explanation: "Earned by having your busiest coding activity on weekends."
    };

    return {
        title: "THE ARCHITECT",
        color: "text-white",
        desc: "Building the future, one commit at a time.",
        explanation: "The default rank for balanced developers."
    };
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
             GITHUB WRAPPED
          </h2>

          {/* Avatar & Badge */}
          <div className="relative mb-4">
             <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple blur-2xl opacity-50 rounded-full" />
             <img src={data.user.avatarUrl} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/20 relative z-10" alt="Avatar" />

             {/* Rank Badge (Class Only) */}
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-neon-green text-neon-green text-[10px] md:text-xs font-bold whitespace-nowrap z-20 shadow-neon-green/20 shadow-lg">
                {archetype.title}
             </div>
          </div>

          {/* Subtitle / Desc */}
          <div className="space-y-2 mb-4 relative group/tooltip cursor-help">
             <p className={`text-base md:text-lg font-bold font-mono ${archetype.color}`}>
                "{archetype.desc}"
             </p>
             {/* Tooltip */}
             <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-black/90 border border-white/10 rounded text-xs text-gray-300 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-30">
                {archetype.explanation}
             </div>
          </div>

          {/* Contribution Graph (Mini Heatmap) */}
          <div className="w-full flex justify-center mb-4 px-2">
             <div className="flex gap-[2px] flex-wrap justify-center opacity-80 max-w-[280px]">
                {/* Render last ~100 days for visual flair without overwhelming DOM */}
                {data.contributions.calendar.slice(-80).map((day, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-[1px] ${
                            day.count > 0
                            ? (day.count > 5 ? 'bg-neon-green' : 'bg-neon-green/50')
                            : 'bg-white/10'
                        }`}
                        title={`${day.date}: ${day.count}`}
                    />
                ))}
             </div>
          </div>

          {/* Stats Summary Grid (Expanded) */}
          <div className="w-full grid grid-cols-2 gap-y-3 gap-x-4 text-xs text-gray-400 border-t border-white/10 pt-4">
               <div className="flex justify-between">
                <span>Commits</span>
                <span className="text-white font-bold">{data.stats.specifics?.commits || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>PRs</span>
                <span className="text-white font-bold">{data.stats.specifics?.prs || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Issues</span>
                <span className="text-white font-bold">{data.stats.specifics?.issues || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Streak</span>
                <span className="text-white font-bold">{data.stats.longestStreak} Days</span>
              </div>
              <div className="flex justify-between">
                <span>Busiest</span>
                <span className="text-white font-bold">{data.stats.busyDay}</span>
              </div>
              <div className="flex justify-between">
                <span>Top Lang</span>
                <span className="text-white font-bold">{data.stats.topLanguages[0]?.name || "-"}</span>
              </div>

              {/* Footer Stat */}
              <div className="col-span-2 text-center mt-2 pt-2 border-t border-white/5 text-neon-blue font-mono">
                {data.stats.totalContributions} TOTAL CONTRIBUTIONS
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
