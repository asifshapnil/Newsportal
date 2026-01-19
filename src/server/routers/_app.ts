import { router } from "../trpc/trpc";
import { articleRouter } from "./article";
import { categoryRouter } from "./category";
import { statsRouter } from "./stats";

export const appRouter = router({
  article: articleRouter,
  category: categoryRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
