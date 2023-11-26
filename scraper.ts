import { z } from "zod";

const $response = z.object({
  data: z.array(
    z.object({
      contentId: z.string(),
      title: z.string(),
      tags: z.string(),
      description: z.string(),
      startTime: z.string().datetime({ offset: true }),
    }),
  ),
  meta: z.object({
    status: z.literal(200),
    totalCount: z.number(),
  }),
});

export function buildUrl({ tags, range, today }: { tags: string[]; today: Date; range: number }) {
  const url = new URL("/api/v2/snapshot/video/contents/search", "https://api.search.nicovideo.jp");

  url.searchParams.set("q", tags.join(" OR "));
  url.searchParams.set("targets", "tagsExact");
  url.searchParams.set("fields", ["contentId", "title", "tags", "startTime", "description"].join(","));
  url.searchParams.set("_sort", "startTime");
  url.searchParams.set("_limit", (100).toString());
  url.searchParams.set(
    "jsonFilter",
    JSON.stringify({
      type: "range",
      field: "startTime",
      from: new Date(today.getTime() - range),
      to: today,
      include_lower: false,
      include_upper: true,
    }),
  );

  return url.toString();
}

export async function scrape({ tags, range, today }: { tags: string[]; today: Date; range: number }) {
  const url = buildUrl({ tags, range, today });
  const data = await fetch(url).then((res) => res.json());

  const parsedData = $response.safeParse(data);
  if (!parsedData.success) {
    console.error(parsedData.error);
    throw new Error("Failed to parse response");
  }

  return {
    count: parsedData.data.meta.totalCount,
    videos: parsedData.data.data.map((v) => ({
      sourceId: v.contentId,
      title: v.title,
      description: v.description,
      tags: v.tags.split(" "),
      postedAt: new Date(v.startTime),
    })),
  };
}
