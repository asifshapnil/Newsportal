import { router, adminProcedure } from "../trpc/trpc";

export const statsRouter = router({
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    const [totalArticles, publishedArticles, draftArticles, totalCategories, totalViews] =
      await Promise.all([
        ctx.prisma.article.count(),
        ctx.prisma.article.count({ where: { status: "PUBLISHED" } }),
        ctx.prisma.article.count({ where: { status: "DRAFT" } }),
        ctx.prisma.category.count(),
        ctx.prisma.article.aggregate({ _sum: { views: true } }),
      ]);

    const categoryDistribution = await ctx.prisma.category.findMany({
      select: {
        name: true,
        _count: {
          select: { articles: true },
        },
      },
      orderBy: {
        articles: { _count: "desc" },
      },
    });

    const recentArticles = await ctx.prisma.article.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        author: { select: { name: true } },
      },
    });

    return {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalCategories,
      totalViews: totalViews._sum.views || 0,
      categoryDistribution: categoryDistribution.map((cat) => ({
        name: cat.name,
        count: cat._count.articles,
      })),
      recentArticles,
    };
  }),
});
