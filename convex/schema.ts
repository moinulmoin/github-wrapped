import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Cache wrapped data for 24 hours
  wrappedCache: defineTable({
    username: v.string(),
    data: v.any(), // The WrappedData object
    createdAt: v.number(), // Timestamp in ms
  }).index("by_username", ["username"]),
});
