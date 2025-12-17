import { WrappedData } from "@/app/actions/github";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Share2, Download, Trophy, Flame, GitCommit, Calendar, Code, Star, Zap, Layers, Users } from "lucide-react";
import html2canvas from "html2canvas-pro";

export function Summary({ data, isSharedView }: { data: WrappedData; onNext?: () => void; isSharedView?: boolean }) {
  const [downloading, setDownloading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Pre-fetch avatar via proxy for CORS support in html2canvas
  useEffect(() => {
    let active = true;
    const fetchAvatar = async () => {
      try {
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(data.user.avatarUrl)}`;
        const response = await fetch(proxyUrl);
        const blob = await response.blob();
        if (active) {
          const url = URL.createObjectURL(blob);
          setAvatarUrl(url);
        }
      } catch (err) {
        console.warn("Failed to load avatar blob:", err);
        if (active) setAvatarUrl(data.user.avatarUrl);
      }
    };
    fetchAvatar();
    return () => {
      active = false;
      if (avatarUrl && avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [data.user.avatarUrl]);

  const getArchetype = () => {
    const { topLanguages, totalContributions, busyDay, specifics, longestStreak } = data.stats;
    const prs = specifics?.prs || 0;
    const issues = specifics?.issues || 0;

    if (totalContributions > 3000) return { title: "THE TITAN", color: "text-neon-blue", border: "border-neon-blue", shadow: "shadow-neon-blue/30" };
    if (prs > 100) return { title: "THE SHIPPER", color: "text-green-400", border: "border-green-400", shadow: "shadow-green-400/30" };
    if (issues > 50) return { title: "THE GUARDIAN", color: "text-yellow-400", border: "border-yellow-400", shadow: "shadow-yellow-400/30" };
    if (topLanguages.length > 6) return { title: "THE POLYGLOT", color: "text-neon-purple", border: "border-neon-purple", shadow: "shadow-neon-purple/30" };
    if (topLanguages.length < 3 && totalContributions > 500) return { title: "THE SPECIALIST", color: "text-blue-500", border: "border-blue-500", shadow: "shadow-blue-500/30" };
    if (longestStreak > 30) return { title: "THE SURVIVOR", color: "text-orange-500", border: "border-orange-500", shadow: "shadow-orange-500/30" };
    if (["Saturday", "Sunday"].includes(busyDay)) return { title: "THE WARRIOR", color: "text-red-500", border: "border-red-500", shadow: "shadow-red-500/30" };
    return { title: "THE ARCHITECT", color: "text-white", border: "border-white", shadow: "shadow-white/30" };
  };

  const archetype = getArchetype();

  const handleDownload = async () => {
    const elementToCapture = document.querySelector("#unified-dashboard") as HTMLElement;
    if (!elementToCapture) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(elementToCapture, {
        backgroundColor: "#000000", // Ensure dark background
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = `github-wrapped-${data.user.login}-2025.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const BentoItem = ({ title, value, sub, icon: Icon, className = "", colSpan = "col-span-1" }: any) => (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between ${className} ${colSpan}`}>
      <div className="flex items-center gap-2 text-white/50 text-xs font-mono uppercase mb-2">
        {Icon && <Icon className="w-3 h-3" />}
        {title}
      </div>
      <div>
        <div className={`text-2xl md:text-3xl font-bold font-display ${className.includes("text-") ? "" : "text-white"}`}>
          {value}
        </div>
        {sub && <div className="text-[10px] text-white/40 font-mono mt-1">{sub}</div>}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {/* The Capture Container */}
        <div
          id="unified-dashboard"
          className="bg-[#050505] p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />

          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8 relative z-10">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple blur rounded-full opacity-50" />
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    crossOrigin="anonymous"
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/20 relative z-10"
                    alt="Avatar"
                  />
                )}
              </div>
              <div className="text-center md:text-left">
                <div className="text-neon-blue text-xs font-mono tracking-widest mb-1">GITHUB WRAPPED 2025</div>
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-none mb-1">{data.user.name || data.user.login}</h1>
                <div className="text-white/40 font-mono text-sm">@{data.user.login}</div>
              </div>
            </div>

            <div className={`px-6 py-2 rounded-full border ${archetype.border} bg-white/5 backdrop-blur-md ${archetype.shadow} shadow-lg`}>
              <div className={`text-sm md:text-base font-bold tracking-wider ${archetype.color}`}>
                {archetype.title}
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">

            {/* Hero Stat: Total Contributions */}
            <div className="col-span-2 md:col-span-2 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 text-neon-green text-sm font-mono uppercase mb-1">
                <GitCommit className="w-4 h-4" /> Total Contributions
              </div>
              <div className="text-5xl md:text-6xl font-black text-white tracking-tight">
                {data.stats.totalContributions.toLocaleString()}
              </div>
              {/* Mini visual representation of contribution graph */}
              <div className="flex gap-[2px] mt-4 opacity-30 h-8 items-end">
                {data.contributions.calendar.slice(-40).map((d, i) => (
                  <div key={i} className="w-1.5 bg-white rounded-sm" style={{ height: `${Math.max(10, Math.min(100, d.count * 10))}%` }} />
                ))}
              </div>
            </div>

            {/* Streak */}
            <BentoItem
              title="Longest Streak"
              value={`${data.stats.longestStreak} Days`}
              icon={Flame}
              className="text-orange-400 bg-orange-500/5 border-orange-500/20"
            />

            {/* Top Language */}
            <BentoItem
              title="Top Language"
              value={data.stats.topLanguages[0]?.name || "N/A"}
              icon={Code}
              className="text-neon-purple bg-neon-purple/5 border-neon-purple/20"
            />

            {/* Most Active Day */}
            <BentoItem
              title="Power Day"
              value={data.stats.busyDay}
              icon={Zap}
              className="text-yellow-400 bg-yellow-500/5 border-yellow-500/20"
            />

            {/* Repositories */}
            <BentoItem
              title="Repositories"
              value={data.user.publicRepos}
              icon={Layers}
              className="text-pink-400 bg-pink-500/5 border-pink-500/20"
            />

            {/* Stars */}
            <BentoItem
              title="Stars Earned"
              value={data.stats.totalStars}
              icon={Star}
              className="text-neon-blue bg-neon-blue/5 border-neon-blue/20"
            />

            {/* Followers */}
            <BentoItem
              title="Followers"
              value={data.user.followers}
              icon={Users}
              className="text-white bg-white/5 border-white/20"
            />
          </div>

          {/* Footer Brand */}
          <div className="mt-8 flex justify-between items-end border-t border-white/5 pt-4 opacity-50 relative z-10">
            <div className="text-xs text-white/40 font-mono">
              Generated on {new Date().toLocaleDateString()}
            </div>
            <div className="text-sm font-display font-bold text-white tracking-widest">
              GITHUB-WRAPPED.COM
            </div>
          </div>
        </div>

        {/* Actions */}
        {!isSharedView && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex gap-4 w-full justify-center mt-8"
          >
            <button
              onClick={() => {
                const url = `${window.location.origin}/u/${data.user.login}`;
                navigator.clipboard.writeText(url);
                alert("Link copied to clipboard!");
              }}
              className="flex items-center gap-2 px-6 py-3 bg-neon-blue text-black font-bold rounded-full hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)]"
            >
              <Share2 className="w-4 h-4" /> Share Link
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors"
            >
              <Download className="w-4 h-4" /> {downloading ? "Saving..." : "Save Image"}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
