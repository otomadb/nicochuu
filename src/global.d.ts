/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production";

    readonly SCRAPE_TAGS?: string;
    readonly SCRAPE_DURATION?: string;
    readonly SCRAPE_INTERVAL?: string;
  }
}
