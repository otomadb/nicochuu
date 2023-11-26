import { parse } from "https://deno.land/std@0.204.0/flags/mod.ts";
import { scrape } from "./scraper.ts";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const { range, tags } = parse(Deno.args);

  const parsedTags = tags?.split(",") ?? [];
  if (parsedTags.length === 0) {
    console.error(
      "Please specify at least one tag. For example: --tags=音MAD",
    );
    Deno.exit(1);
  }

  const parsedRange = parseInt(range, 10);
  if (Number.isNaN(parsedRange) || parsedRange < 0) {
    console.error(
      "Please specify a valid range in seconds. For example: --range=86400",
    );
    Deno.exit(1);
  }

  const today = new Date();

  console.dir(
    await scrape({
      today: today,
      tags: parsedTags,
      range: parsedRange,
    }),
  );
}
