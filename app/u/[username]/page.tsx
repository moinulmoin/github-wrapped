"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { fetchUserStats, WrappedData } from "../../actions/github";
import { WrappedContainer } from "../../components/WrappedContainer";
import { useState, useEffect, useRef } from "react";
import { Loader, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const [username, setUsername] = useState<string>("");
  const [fetched, setFetched] = useState<{
    username: string;
    data: WrappedData;
  } | null>(null);
  const [fetchAttemptedFor, setFetchAttemptedFor] = useState<string | null>(
    null,
  );
  const [fetchError, setFetchError] = useState<{
    username: string;
    message: string;
  } | null>(null);
  const fetchInFlightFor = useRef<Set<string>>(new Set());

  // Unwrap params
  useEffect(() => {
    params.then((p) => setUsername(p.username));
  }, [params]);

  // Check Convex cache
  const cachedData = useQuery(
    api.wrapped.getWrapped,
    username ? { username } : "skip",
  );
  const saveWrapped = useMutation(api.wrapped.saveWrapped);

  const fetchedForUser = fetched?.username === username ? fetched.data : null;
  const data =
    (cachedData as unknown as WrappedData | null | undefined) ?? fetchedForUser;
  const error = fetchError?.username === username ? fetchError.message : "";
  const hasAttemptedFetch = fetchAttemptedFor === username;
  const isLoading =
    !username ||
    cachedData === undefined ||
    (cachedData === null && !hasAttemptedFetch);

  useEffect(() => {
    if (!username) return;

    if (cachedData === undefined) return;
    if (cachedData) return;
    if (hasAttemptedFetch) return;
    if (fetchInFlightFor.current.has(username)) return;

    fetchInFlightFor.current.add(username);

    fetchUserStats(username)
      .then(async (stats) => {
        await saveWrapped({ username, data: stats });
        setFetched({ username, data: stats });
      })
      .catch((err: unknown) =>
        setFetchError({
          username,
          message:
            err instanceof Error ? err.message : "Could not load profile.",
        }),
      )
      .finally(() => {
        fetchInFlightFor.current.delete(username);
        setFetchAttemptedFor(username);
      });
  }, [username, cachedData, saveWrapped, hasAttemptedFetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <Loader className="w-12 h-12 animate-spin text-neon-blue mb-4" />
        <p className="text-gray-400">Loading {username}&apos;s Wrapped...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-4xl font-bold mb-4">404: Developer Not Found</h1>
        <p className="text-gray-400">
          Could not generate wrapped for <strong>{username}</strong>.
        </p>
        <Link
          href="/"
          className="mt-8 px-6 py-3 bg-white text-black rounded-full font-bold"
        >
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
