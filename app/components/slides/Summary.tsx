import { WrappedData } from "@/app/actions/github";
import { Persona } from "./Persona";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Share2, Download, Trophy, Flame, GitCommit, Calendar, Code, Star, Zap } from "lucide-react";
import html2canvas from "html2canvas-pro";

export function Summary({ data, isSharedView }: { data: WrappedData; onNext?: () => void; isSharedView?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Logic duplicated from Persona to display consistent Rank/Archetype
  const getArchetype = () => {
    const { topLanguages, totalContributions, busyDay, specifics, longestStreak } = data.stats;
    const prs = specifics?.prs || 0;
    const issues = specifics?.issues || 0;

    if (totalContributions > 3000) return { title: "THE TITAN", color: "text-neon-blue" };
    if (prs > 100) return { title: "THE SHIPPER", color: "text-green-400" };
    if (issues > 50) return { title: "THE GUARDIAN", color: "text-yellow-400" };
    if (topLanguages.length > 6) return { title: "THE POLYGLOT", color: "text-neon-purple" };
    if (topLanguages.length < 3 && totalContributions > 500) return { title: "THE SPECIALIST", color: "text-blue-500" };
    if (longestStreak > 30) return { title: "THE SURVIVOR", color: "text-orange-500" };
    if (["Saturday", "Sunday"].includes(busyDay)) return { title: "THE WARRIOR", color: "text-red-500" };
    return { title: "THE ARCHITECT", color: "text-white" };
  };

  const archetype = getArchetype();

  const handleDownload = async () => {
    // We capture the "Persona" card which is rendered inside this component
    // effectively saving just the card visualization as before.
    // However, if the user wants to save the ENTIRE dashboard, we target a wrapper.
    // For now, let's target the wrapper of the Persona card to keep the "Card" artifact.
    // OR we can make a new "Dashboard" capture.
    // Let's stick to capturing the Persona Card for now as it's the "collectible".
    const elementToCapture = document.querySelector("#persona-card-container") as HTMLElement;
    if (!elementToCapture) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(elementToCapture, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = `github-wrapped-${data.user.login}-2025-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const BentoItem = ({ title, value, sub, icon: Icon, delay, className = "" }: any) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring" }}
      className={`bg-glass-bg border border-glass-border/50 rounded-xl p-4 flex flex-col justify-between hover:bg-white/5 transition-colors ${className}`}
    >
      <div className="flex items-center gap-2 text-white/50 text-xs font-mono uppercase">
        {Icon && <Icon className="w-3 h-3" />}
        {title}
      </div>
      <div className="mt-2">
        <div className={`text-xl md:text-2xl font-bold font-display ${className.includes("text-") ? "" : "text-white"}`}>
          {value}
        </div>
        {sub && <div className="text-[10px] text-white/40 font-mono mt-1">{sub}</div>}
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-7xl mx-auto">

      {/* Left Column: The Card */}
      <div className="flex-shrink-0 flex flex-col items-center gap-6">
        <div id="persona-card-container" className="transform scale-90 md:scale-100 transition-transform">
          <Persona data={data} isSharedView={true} onNext={() => { }} />
        </div>

        {/* Actions for Mobile (below card) / Desktop (below card) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex gap-4 w-full justify-center"
        >
          <button
            onClick={() => {
              const url = `${window.location.origin}/u/${data.user.login}`;
              navigator.clipboard.writeText(url);
              alert("Link copied to clipboard!");
            }}
            className="flex items-center gap-2 px-6 py-3 bg-neon-blue text-black font-bold rounded-full hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)]"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4" /> {downloading ? "..." : "Save Card"}
          </button>
        </motion.div>
      </div>

      {/* Right Column: Bento Grid Stats */}
      <div className="flex-1 w-full max-w-xl h-full flex flex-col justify-center">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 w-full">

          {/* 1. Rank */}
          <BentoItem
            title="Universal Rank"
            value={archetype.title}
            sub="Based on overall activity"
            icon={Trophy}
            delay={0.1}
            className={archetype.color} // Use the rank color text
          />

          {/* 2. Streak */}
          <BentoItem
            title="Longest Streak"
            value={`${data.stats.longestStreak} Days`}
            sub="Consistency is key"
            icon={Flame}
            delay={0.2}
            className="text-orange-400"
          />

          {/* 3. Total Contributions (Big) */}
          <BentoItem
            title="2025 Contributions"
            value={data.stats.totalContributions.toLocaleString()}
            sub="Total impact this year"
            icon={GitCommit}
            delay={0.3}
            className="col-span-2 bg-gradient-to-r from-white/5 to-transparent text-white"
          />

          {/* 4. Top Language */}
          <BentoItem
            title="Top Language"
            value={data.stats.topLanguages[0]?.name || "N/A"}
            sub={`${data.stats.topLanguages[0]?.count || 0} Repos`}
            icon={Code}
            delay={0.4}
            className="text-neon-purple"
          />

          {/* 5. Most Active Day */}
          <BentoItem
            title="Power Day"
            value={data.stats.busyDay}
            sub="When you're most productive"
            icon={Calendar}
            delay={0.5}
            className="text-yellow-400"
          />

          {/* 6. Stars & Forks */}
          <div className="grid grid-cols-2 gap-3 col-span-2">
            <BentoItem
              title="Stars Earned"
              value={data.stats.totalStars}
              icon={Star}
              delay={0.6}
              className="text-neon-blue"
            />
            <BentoItem
              title="Repositories"
              value={data.user.publicRepos}
              icon={Code}
              delay={0.7}
              className="text-pink-400"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-center md:text-left"
        >
          <div className="text-sm text-gray-500 font-mono">
            Generated by <span className="text-white">git-wrapped.com</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
