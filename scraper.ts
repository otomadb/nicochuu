import { z } from "zod";

const $response = z.object({
  data: z.object({
    items: z.array(
      z.object({
        content: z.object({
          id: z.string(),
          registeredAt: z.string().datetime({ offset: true }),
        }),
      }),
    ),
  }),
  meta: z.object({
    status: z.literal(200),
  }),
});

export function buildUrl({ tags, duration: range, today }: { tags: string[]; today: Date; duration: number }) {
  const url = new URL("/v1/playlist/search", "https://nvapi.nicovideo.jp");
  url.searchParams.set("tag", tags.join(" "));
  url.searchParams.set("sortKey", "registeredAt");
  url.searchParams.set("sortOrder", "desc");
  url.searchParams.set("pageSize", (64).toString());
  url.searchParams.set("page", (1).toString());
  url.searchParams.set("_frontendId", "6");
  url.searchParams.set("_frontendVersion", "0");

  return url.toString();
}

export async function scrape({ tags, duration: duration, today }: { tags: string[]; today: Date; duration: number }) {
  const url = buildUrl({ tags, duration: duration, today });
  const data = await fetch(url).then((res) => res.json());

  const parsedData = $response.safeParse(data);
  if (!parsedData.success) {
    console.error(parsedData.error);
    throw new Error("Failed to parse response");
  }

  return {
    videos: parsedData.data.data.items.map((v) => ({
      sourceId: v.content.id,
      postedAt: new Date(v.content.registeredAt),
    })),
  };
}
