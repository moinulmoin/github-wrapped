'use client';

import { useState } from "react";
import { fetchUserStats, WrappedData } from "./actions/github";
import { WrappedContainer } from "./components/WrappedContainer";
import { ArrowRight, Loader2, Github, Key, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WrappedData | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Pass the optional token for private repo access
      const stats = await fetchUserStats(username, token || undefined);
      setData(stats);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (data) {
    return <WrappedContainer data={data} onReset={() => setData(null)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
       {/* Background Elements */}
       <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[100px]" />
       </div>

       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md space-y-8 text-center"
       >
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-white">
              GitHub Wrapped <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">2025</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
             <div className="relative">
                <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="GitHub Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-glass-bg border border-glass-border rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                  autoFocus
                />
             </div>

             {/* Optional Token Input */}
             <div className="text-left">
                <button
                  type="button"
                  onClick={() => setShowTokenInput(!showTokenInput)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <Key className="w-3 h-3" />
                  {showTokenInput ? "Hide" : "Add"} Personal Access Token (for private repos)
                  {showTokenInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showTokenInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2"
                  >
                    <input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxx"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full bg-glass-bg border border-glass-border rounded-lg py-3 px-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                    />
                    <p className="text-[10px] text-gray-600 mt-1">
                      Generate one at <a href="https://github.com/settings/tokens" target="_blank" className="underline hover:text-gray-400">github.com/settings/tokens</a> with <code className="text-neon-purple">repo</code> scope.
                    </p>
                  </motion.div>
                )}
             </div>

             {error && (
               <p className="text-red-500 text-sm">{error}</p>
             )}

             <button
               type="submit"
               disabled={loading}
               className="w-full bg-white text-black font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {loading ? (
                 <>
                   <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                 </>
               ) : (
                 <>
                   Generate Wrapped <ArrowRight className="w-5 h-5" />
                 </>
               )}
             </button>
          </form>

          <div className="pt-8 text-xs text-gray-600">
            <p>Not affiliated with GitHub.</p>
            <p>Built with Next.js 16.</p>
          </div>
       </motion.div>
    </div>
  );
}
