"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { fetchUserStats, WrappedData } from "../../actions/github";
import { WrappedContainer } from "../../components/WrappedContainer";
import { useState, useEffect } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const [username, setUsername] = useState<string>("");
  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Unwrap params
  useEffect(() => {
    params.then(p => setUsername(p.username));
  }, [params]);

  // Check Convex cache
  const cachedData = useQuery(
    api.wrapped.getWrapped,
    username ? { username } : "skip"
  );
  const saveWrapped = useMutation(api.wrapped.saveWrapped);

  useEffect(() => {
    if (!username) return;

    // If we have cached data, use it
    if (cachedData !== undefined) {
      if (cachedData) {
        setData(cachedData as WrappedData);
        setLoading(false);
      } else {
        // No cache or expired - fetch fresh
        fetchUserStats(username)
          .then(async (stats) => {
            await saveWrapped({ username, data: stats });
            setData(stats);
          })
          .catch((err) => setError(err.message || "Could not load profile."))
          .finally(() => setLoading(false));
      }
    }
  }, [username, cachedData, saveWrapped]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-neon-blue mb-4" />
        <p className="text-gray-400">Loading {username}&apos;s Wrapped...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-4xl font-bold mb-4">404: Developer Not Found</h1>
        <p className="text-gray-400">Could not generate wrapped for <strong>{username}</strong>.</p>
        <Link href="/" className="mt-8 px-6 py-3 bg-white text-black rounded-full font-bold">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <WrappedContainer data={data} isSharedView />

      {/* Generate Yours CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-neon-blue text-black font-bold rounded-full hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,245,255,0.3)]"
        >
          Generate Yours <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  );
}
