"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { fetchUserStats, WrappedData } from "./actions/github";
import { WrappedContainer } from "./components/WrappedContainer";
import { ArrowRight, Loader, Github, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "./lib/auth-client";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractAccessToken(tokenResult: unknown): string | undefined {
  if (!isRecord(tokenResult)) return undefined;

  const direct = tokenResult["accessToken"];
  if (typeof direct === "string") return direct;

  const data = tokenResult["data"];
  if (!isRecord(data)) return undefined;

  const dataAccessToken = data["accessToken"];
  if (typeof dataAccessToken === "string") return dataAccessToken;

  const token = data["token"];
  if (!isRecord(token)) return undefined;

  const nestedAccessToken = token["accessToken"];
  return typeof nestedAccessToken === "string" ? nestedAccessToken : undefined;
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WrappedData | null>(null);
  const [error, setError] = useState("");
  const hasHandledCallback = useRef(false);

  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const saveWrapped = useMutation(api.wrapped.saveWrapped);

  // Fetch authenticated user's wrapped data
  const fetchAuthenticatedWrapped = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const tokenResult = await authClient.getAccessToken({
        providerId: "github",
      });

      const accessToken = extractAccessToken(tokenResult);
      if (!accessToken) {
        throw new Error("GitHub access token is not available.");
      }

      const stats = await fetchUserStats("", accessToken);
      const githubLogin = stats.user.login;

      setUsername(githubLogin);
      await saveWrapped({ username: githubLogin, data: stats });
      setData(stats);
    } catch (err: unknown) {
      console.error("Error fetching wrapped:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [saveWrapped]);

  // Handle OAuth callback - runs once when redirected back with ?callback=1
  useEffect(() => {
    if (hasHandledCallback.current || sessionLoading) return;

    const params = new URLSearchParams(window.location.search);
    const isCallback = params.get("callback") === "1";

    if (isCallback && session?.user) {
      hasHandledCallback.current = true;
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
      fetchAuthenticatedWrapped();
    }
  }, [session, sessionLoading, fetchAuthenticatedWrapped]);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: `${window.location.origin}?callback=1`,
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
            <span className="text-neon-green font-medium">
              {session.user.name}
            </span>
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
          GitHub Wrapped{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
            2025
          </span>
        </h1>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader className="w-12 h-12 animate-spin text-neon-blue" />
            <p className="text-gray-400">Analyzing your profile...</p>
          </div>
        ) : (
          <>
            {/* Primary: Sign In or Generate (if already signed in) */}
            {session?.user ? (
              <button
                onClick={fetchAuthenticatedWrapped}
                className="group relative w-full bg-black/50 hover:bg-black/70 border border-white/10 hover:border-white/30 text-white font-bold rounded-xl py-6 flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Github className="w-6 h-6 group-hover:scale-110 transition-transform text-white group-hover:text-neon-blue" />
                <span className="text-lg tracking-wide">Generate My Wrapped</span>
                <span className="ml-2 text-xs font-mono bg-white/10 text-gray-300 px-2 py-1 rounded border border-white/5">
                  + Private Stats
                </span>
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="group relative w-full bg-black/50 hover:bg-black/70 border border-white/10 hover:border-white/30 text-white font-bold rounded-xl py-6 flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Github className="w-6 h-6 group-hover:scale-110 transition-transform text-white group-hover:text-neon-blue" />
                <span className="text-lg tracking-wide">Sign In with GitHub</span>
                <span className="ml-2 text-xs font-mono bg-white/10 text-gray-300 px-2 py-1 rounded border border-white/5">
                  + Private Stats
                </span>
              </button>
            )}

            {/* Manual input only for non-logged-in users */}
            {!session?.user && (
              <>
                <div className="flex items-center gap-4 text-gray-500 text-sm py-2">
                  <div className="flex-1 h-px bg-white/10" />
                  or
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                  <div className="relative group">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-neon-purple transition-colors" />
                    <input
                      type="text"
                      placeholder="Enter any GitHub username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-glass-bg border border-glass-border/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                    />
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={!username.trim()}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Wrapped <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}

            {error && session?.user && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
