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

/**
 * `YYYY-MM-DDThh:mm:ss±09:mm`の形式しか受け付けていない
 */
export function parseISOString(date: Date) {
  const offset = new Date(date.getTime() + 1000 * 60 * 60 * 9);
  const Y = offset.getUTCFullYear();
  const M = (offset.getUTCMonth() + 1).toString().padStart(2, "0");
  const D = offset.getUTCDate().toString().padStart(2, "0");
  const h = offset.getUTCHours().toString().padStart(2, "0");
  const m = offset.getUTCMinutes().toString().padStart(2, "0");
  const s = offset.getUTCSeconds().toString().padStart(2, "0");
  return `${Y}-${M}-${D}T${h}:${m}:${s}+09:00`;
}

export function buildUrl({ tags, duration: range, today }: { tags: string[]; today: Date; duration: number }) {
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
      from: parseISOString(new Date(today.getTime() - range)),
      to: parseISOString(today),
      include_lower: false,
    }),
  );

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
