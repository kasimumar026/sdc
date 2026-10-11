import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "SDC Smart Data Subscription",
    short_name: "SDC",
    description: "Subscribe to data and digital services with SDC.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#12386b",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
