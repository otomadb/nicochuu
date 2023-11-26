import { ConnectRouter } from "@connectrpc/connect";
import { PrismaClient } from "@prisma/client";
import { NicochuuService } from "./gen/nicochuu_connect.js";

const prisma = new PrismaClient();

export default (router: ConnectRouter) =>
  router.service(NicochuuService, {
    listVideos: async (req) => {
      const [total, videos] = await prisma.$transaction([
        prisma.nicovideoVideo.count({
          where: { checked: false },
        }),
        prisma.nicovideoVideo.findMany({
          take: req.take,
          skip: req.skip,
          where: { checked: false },
          orderBy: { postedAt: "desc" },
          select: {
            id: true,
            sourceId: true,
            postedAt: true,
            title: true,
            description: true,
            tags: true,
          },
        }),
      ]);
      return {
        total: total,
        videos: videos.map(({ postedAt, ...props }) => ({
          postedAt: postedAt.toISOString(),
          ...props,
        })),
      };
    },
    getVideo: async (req) => {
      return {
        video: await prisma.nicovideoVideo
          .findUnique({
            where: {
              sourceId: req.sourceId,
            },
            select: {
              id: true,
              sourceId: true,
              postedAt: true,
              title: true,
              description: true,
              tags: true,
            },
          })
          .then((video) =>
            video
              ? {
                  ...video,
                  postedAt: video.postedAt.toISOString(),
                }
              : undefined,
          ),
      };
    },
    checkVideo: async (req) => {
      return prisma.nicovideoVideo
        .update({
          where: { sourceId: req.sourceId },
          data: { checked: true },
        })
        .then(() => ({ ok: true }))
        .catch(() => ({ ok: false }));
    },
  });
