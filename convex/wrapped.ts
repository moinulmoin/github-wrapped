import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Get cached wrapped data if it exists and is fresh
export const getWrapped = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const username = args.username.toLowerCase();

    const cached = await ctx.db
      .query("wrappedCache")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (!cached) {
      return null;
    }

    // Check if cache is still fresh (< 24h old)
    const now = Date.now();
    if (now - cached.createdAt > CACHE_TTL_MS) {
      return null; // Expired
    }

    return cached.data;
  },
});

// Save wrapped data to cache
export const saveWrapped = mutation({
  args: {
    username: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const username = args.username.toLowerCase();

    // Delete existing cache for this user
    const existing = await ctx.db
      .query("wrappedCache")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    // Insert new cached data
    await ctx.db.insert("wrappedCache", {
      username,
      data: args.data,
      createdAt: Date.now(),
    });
  },
});
