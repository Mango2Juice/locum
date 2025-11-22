// src/proxy.ts
import arcjet, { createMiddleware, detectBot, slidingWindow, shield } from "@arcjet/next";
export const config = {
  // matcher tells Next.js which routes to run the middleware on.
  // This runs the middleware on all routes except for static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
const arcjetKey = process.env.ARCJET_KEY;
if (!arcjetKey) {
  throw new Error("ARCJET_KEY environment variable is required but was not found. Please set ARCJET_KEY in your environment configuration.");
}
const aj = arcjet({
  key: arcjetKey,
  rules: [
    detectBot({
      mode: "LIVE", // LIVE or DRY_RUN
      // Block all bots except the following
      allow: [
        "CATEGORY:VERCEL", // Vercel's uptime monitoring bot
        "SENTRY_CRAWLER", // Sentry's bot for performance monitoring
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: 60, // 60 second sliding window
      max: 100, // allow a maximum of 100 requests
    }),
    shield({
      mode: "LIVE", // LIVE or DRY_RUN
    }),
  ],
});
// Pass any existing middleware with the optional existingMiddleware prop
export default createMiddleware(aj);
