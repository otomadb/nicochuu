import { ConnectRouter } from "@connectrpc/connect";
import { PrismaClient } from "@prisma/client";
import { NicochuuService } from "../gen/nicochuu_connect.js";

const prisma = new PrismaClient();

export default (router: ConnectRouter) =>
  router.service(NicochuuService, {
    listVideos: async (req) => {
      const [total, videos] = await prisma.$transaction([
        prisma.nicovideoNewVideo.count({
          where: { checked: false },
        }),
        prisma.nicovideoNewVideo.findMany({
          take: req.take,
          skip: req.skip,
          where: { checked: false },
          orderBy: { registeredAt: "desc" },
          select: { id: true, sourceId: true, registeredAt: true },
        }),
      ]);
      return {
        total: total,
        videos: videos.map(({ registeredAt, ...props }) => ({
          postedAt: registeredAt.toISOString(),
          ...props,
        })),
      };
    },
    getVideo: async (req) => {
      return {
        video: await prisma.nicovideoNewVideo
          .findUnique({
            where: { sourceId: req.sourceId },
            select: { sourceId: true, registeredAt: true },
          })
          .then((video) => (video ? { ...video, postedAt: video.registeredAt.toISOString() } : undefined)),
      };
    },
    checkVideo: async (req) => {
      return prisma.nicovideoNewVideo
        .update({
          where: { sourceId: req.sourceId },
          data: { checked: true },
        })
        .then(() => ({ ok: true }))
        .catch(() => ({ ok: false }));
    },
  });
