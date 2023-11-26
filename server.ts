import { fastifyConnectPlugin } from "@connectrpc/connect-fastify";
import { fastifySchedule } from "@fastify/schedule";
import { PrismaClient } from "@prisma/client";
import { fastify } from "fastify";
import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import routes from "./connect.js";
import { scrape } from "./scraper.js";

const scrapeTags = process.env.SCRAPE_TAGS?.split(",") ?? [];
if (scrapeTags.length === 0) {
  console.error("Invalid SCRAPE_TAGS: %s", process.env.SCRAPE_TAGS);
  process.exit(1);
}

const scrapeInterval = process.env.SCRAPE_INTERVAL ? parseInt(process.env.SCRAPE_INTERVAL, 10) : 600;
if (Number.isNaN(scrapeInterval) || scrapeInterval < 0) {
  console.error("Invalid SCRAPE_INTERVAL: %s", process.env.SCRAPE_INTERVAL);
  process.exit(1);
}

const scrapeDuration = process.env.SCRAPE_DURATION ? parseInt(process.env.SCRAPE_DURATION, 10) : 172800;
if (Number.isNaN(scrapeDuration) || scrapeDuration < 0) {
  console.error("Invalid SCRAPE_DURATION: %s", process.env.SCRAPE_DURATION);
  process.exit(1);
}

const prisma = new PrismaClient();

const scrapeTask = new AsyncTask(
  "scrape",
  async () => {
    const result = await scrape({ tags: scrapeTags, range: scrapeDuration, today: new Date() });
    await prisma.$transaction(
      result.videos.map((video) =>
        prisma.nicovideoVideo.upsert({
          where: { sourceId: video.sourceId },
          create: {
            sourceId: video.sourceId,
            title: video.title,
            tags: video.tags,
            description: video.description,
            postedAt: new Date(video.postedAt),
          },
          update: {
            title: video.title,
            tags: video.tags,
            description: video.description,
          },
        }),
      ),
    );
  },
  () => {},
);

const server = fastify();

await server.register(fastifySchedule);
await server.register(fastifyConnectPlugin, { routes });

server.get("/", (_, reply) => {
  reply.type("text/plain");
  reply.send("Hello World!");
});

await server.ready();

await server.scheduler.addSimpleIntervalJob(new SimpleIntervalJob({ seconds: scrapeInterval }, scrapeTask));
await server.listen({ host: "localhost", port: 58080 });
console.log("server is listening at", server.addresses());
