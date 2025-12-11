'use client';

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { fetchUserStats, WrappedData } from "./actions/github";
import { WrappedContainer } from "./components/WrappedContainer";
import { ArrowRight, Loader2, Github, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "./lib/auth-client";

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WrappedData | null>(null);
  const [error, setError] = useState("");

  // Better Auth session
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Convex mutation for caching wrapped data
  const saveWrapped = useMutation(api.wrapped.saveWrapped);

  // When user signs in, immediately fetch their wrapped (using token on-the-fly)
  useEffect(() => {
    const fetchWithToken = async () => {
      if (session?.user && !data && !loading) {
        const githubUsername = session.user.name;
        if (!githubUsername) return;

        setUsername(githubUsername);
        setLoading(true);
        setError("");

        try {
          // Get access token ON-THE-FLY (not stored anywhere)
          const tokenResult = await authClient.getAccessToken({
            providerId: "github",
          });

          const accessToken = tokenResult.data?.accessToken;

          // Fetch stats with token (for private repos) - token used and discarded
          const stats = await fetchUserStats(githubUsername, accessToken || undefined);

          // Cache ONLY the wrapped data (not the token)
          await saveWrapped({ username: githubUsername, data: stats });

          setData(stats);
        } catch (err: any) {
          console.error("Error:", err);
          setError(err.message || "Something went wrong.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWithToken();
  }, [session, data, loading, saveWrapped]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Public data only (no token)
      const stats = await fetchUserStats(username);
      await saveWrapped({ username, data: stats });
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
      callbackURL: window.location.origin,
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    setData(null);
    setUsername("");
  };

  if (data) {
    return <WrappedContainer data={data} onReset={() => setData(null)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
       {/* Background */}
       <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[100px]" />
       </div>

       {/* Auth Status */}
       {session?.user && (
         <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
           <span className="text-sm text-gray-400 hidden sm:inline">
             <span className="text-neon-green font-medium">{session.user.name}</span>
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

       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md space-y-8 text-center"
       >
          <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-white">
            GitHub Wrapped <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">2025</span>
          </h1>

          {sessionLoading || loading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-12 h-12 animate-spin text-neon-blue" />
              <p className="text-gray-400">
                {sessionLoading ? "Checking session..." : "Analyzing your profile..."}
              </p>
            </div>
          ) : session?.user ? (
            <div className="text-gray-400 py-8">Loading your wrapped...</div>
          ) : (
            <>
              {/* Primary: Sign In */}
              <button
                onClick={handleSignIn}
                className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Github className="w-5 h-5" />
                Sign In with GitHub
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-2">+ Private Stats</span>
              </button>

              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <div className="flex-1 h-px bg-white/10" />
                or
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Secondary: Manual Input */}
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="relative">
                  <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter any GitHub username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-glass-bg border border-glass-border rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={!username.trim()}
                  className="w-full bg-glass-bg border border-glass-border text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Generate Wrapped <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </>
          )}

          <div className="pt-8 text-xs text-gray-600">
            <p>Not affiliated with GitHub. Built with Next.js & Convex.</p>
          </div>
       </motion.div>
    </div>
  );
}
