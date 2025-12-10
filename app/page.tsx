'use client';

import { useState, useEffect } from "react";
import { fetchUserStats, WrappedData } from "./actions/github";
import { WrappedContainer } from "./components/WrappedContainer";
import { ArrowRight, Loader2, Github, LogOut, Lock, Unlock } from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "./lib/auth-client";

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WrappedData | null>(null);
  const [error, setError] = useState("");

  const { data: session } = authClient.useSession();

  // Auto-fill username from GitHub session
  useEffect(() => {
    if (session?.user?.name && !username) {
      setUsername(session.user.name);
    }
  }, [session, username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Pass the session's name if it matches, or maybe just the token if we had it.
      // For now, fetchUserStats uses server-side logic.
      // Optimized: If logged in, we *could* use the user's token if we stored it,
      // but simpler is to just let the server action handle the public data or
      // if we upgrade fetchUserStats to use the session token later.
      const stats = await fetchUserStats(username);
      setData(stats);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
      await authClient.signIn.social({
          provider: "github",
          callbackURL: window.location.origin
      });
  };

  const handleSignOut = async () => {
      await authClient.signOut();
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

       {/* Auth Status (Top Right) */}
       <div className="absolute top-6 right-6 z-20">
           {!session ? (
               <button
                onClick={handleSignIn}
                className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-full text-sm hover:bg-white/10 transition-colors"
               >
                   <Github className="w-4 h-4" /> Sign In
               </button>
           ) : (
                <div className="flex items-center gap-4">
                     <span className="text-sm text-gray-400 hidden sm:inline">
                         <Unlock className="w-3 h-3 inline mr-1 text-neon-green" />
                         Logged in as <span className="text-neon-green font-medium">{session.user?.name}</span>
                     </span>
                    <button
                        onClick={handleSignOut}
                        className="p-2 bg-glass-bg border border-glass-border rounded-full hover:bg-red-500/20 hover:border-red-500/50 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
           )}
       </div>

       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md space-y-8 text-center"
       >
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-white">
              Git Wrapped <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">2025</span>
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
            <p>Built with Next.js 16 & Better-Auth.</p>
          </div>
       </motion.div>
    </div>
  );
}
