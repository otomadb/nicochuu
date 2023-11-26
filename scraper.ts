import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const $response = z.object({
  data: z.array(
    z.object({
      contentId: z.string(),
      title: z.string(),
      tags: z.string(),
      startTime: z.string().datetime({ offset: true }),
    }),
  ),
  meta: z.object({
    status: z.literal(200),
    totalCount: z.number(),
  }),
});

export function buildUrl(
  { tags, range, today }: { tags: string[]; today: Date; range: number },
) {
  const url = new URL(
    "/api/v2/snapshot/video/contents/search",
    "https://api.search.nicovideo.jp",
  );

  url.searchParams.set("q", tags.join(" OR "));
  url.searchParams.set("targets", "tagsExact");
  url.searchParams.set(
    "fields",
    ["contentId", "title", "tags", "startTime"].join(","),
  );
  url.searchParams.set("_sort", "startTime");
  url.searchParams.set("_limit", (100).toString());
  url.searchParams.set(
    "jsonFilter",
    JSON.stringify({
      type: "range",
      field: "startTime",
      from: new Date(today.getTime() - range),
      to: today,
      "include_lower": false,
      "include_upper": true,
    }),
  );

  return url.toString();
}

export async function scrape(
  { tags, range, today }: { tags: string[]; today: Date; range: number },
): Promise<{
  count: number;
  mads: { contentId: string; title: string; tags: string[]; startTime: Date }[];
}> {
  const url = buildUrl({ tags, range, today });
  const data = await fetch(url).then((res) => res.json());

  const parsedData = $response.safeParse(data);
  if (!parsedData.success) {
    console.error(parsedData.error);
    throw new Error("Failed to parse response");
  }

  return {
    count: parsedData.data.meta.totalCount,
    mads: parsedData.data.data.map((v) => ({
      contentId: v.contentId,
      title: v.title,
      tags: v.tags.split(" "),
      startTime: new Date(v.startTime),
    })),
  };
}

if (import.meta.main) {
  console.dir(
    await scrape({
      tags: ["音MAD"],
      today: new Date(),
      range: 2 * 60 * 60 * 24 * 1000,
    }),
  );
}
