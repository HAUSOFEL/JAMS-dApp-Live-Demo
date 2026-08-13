import { createFileRoute } from "@tanstack/react-router";
import { JamsApp } from "@/components/jams/jams-app";

const title = "JAMS | Decentralized Urban Culture Engine";
const description =
  "Live breaking jams, reels, creator profiles, community chat, interactive maps and on-chain Solana Blinks in one urban culture engine.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5">
      <h1 className="sr-only">JAMS — decentralized urban culture engine</h1>
      <JamsApp />
    </main>
  );
}
