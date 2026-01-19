import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc/trpc";
import { TRPCError } from "@trpc/server";

export const articleRouter = router({
  // Public procedures
  getLatest: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const articles = await ctx.prisma.article.findMany({
        where: { status: "PUBLISHED" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { publishedAt: "desc" },
        include: {
          category: true,
          author: { select: { id: true, name: true } },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (articles.length > limit) {
        const nextItem = articles.pop();
        nextCursor = nextItem!.id;
      }

      return { articles, nextCursor };
    }),

  getByCategory: publicProcedure
    .input(
      z.object({
        categorySlug: z.string(),
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { categorySlug, limit, cursor } = input;

      const category = await ctx.prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      }

      const articles = await ctx.prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          categoryId: category.id,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { publishedAt: "desc" },
        include: {
          category: true,
          author: { select: { id: true, name: true } },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (articles.length > limit) {
        const nextItem = articles.pop();
        nextCursor = nextItem!.id;
      }

      return { articles, nextCursor, category };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const article = await ctx.prisma.article.findUnique({
        where: { slug: input.slug },
        include: {
          category: true,
          author: { select: { id: true, name: true } },
        },
      });

      if (!article) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
      }

      // Increment views
      await ctx.prisma.article.update({
        where: { id: article.id },
        data: { views: { increment: 1 } },
      });

      return article;
    }),

  getRelated: publicProcedure
    .input(
      z.object({
        articleId: z.string(),
        categoryId: z.string(),
        limit: z.number().min(1).max(10).default(4),
      })
    )
    .query(async ({ ctx, input }) => {
      const articles = await ctx.prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          categoryId: input.categoryId,
          NOT: { id: input.articleId },
        },
        take: input.limit,
        orderBy: { publishedAt: "desc" },
        include: {
          category: true,
          author: { select: { id: true, name: true } },
        },
      });

      return articles;
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const articles = await ctx.prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: input.query, mode: "insensitive" } },
            { summary: { contains: input.query, mode: "insensitive" } },
          ],
        },
        take: input.limit,
        orderBy: { publishedAt: "desc" },
        include: {
          category: true,
          author: { select: { id: true, name: true } },
        },
      });

      return articles;
    }),

  // Admin procedures
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish(),
        status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, status } = input;
      const articles = await ctx.prisma.article.findMany({
        where: status ? { status } : undefined,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          author: { select: { id: true, name: true } },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (articles.length > limit) {
        const nextItem = articles.pop();
        nextCursor = nextItem!.id;
      }

      return { articles, nextCursor };
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const article = await ctx.prisma.article.findUnique({
        where: { id: input.id },
        include: {
          category: true,
          author: { select: { id: true, name: true } },
        },
      });

      if (!article) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
      }

      return article;
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        summary: z.string().min(1),
        content: z.string().min(1),
        featuredImage: z.string().optional(),
        categoryId: z.string(),
        status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingArticle = await ctx.prisma.article.findUnique({
        where: { slug: input.slug },
      });

      if (existingArticle) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An article with this slug already exists",
        });
      }

      const article = await ctx.prisma.article.create({
        data: {
          ...input,
          authorId: ctx.session.user.id,
          publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        },
        include: {
          category: true,
          author: { select: { id: true, name: true } },
        },
      });

      return article;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        summary: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        featuredImage: z.string().optional(),
        categoryId: z.string().optional(),
        status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingArticle = await ctx.prisma.article.findUnique({
        where: { id },
      });

      if (!existingArticle) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
      }

      // Check slug uniqueness if changing
      if (data.slug && data.slug !== existingArticle.slug) {
        const slugExists = await ctx.prisma.article.findUnique({
          where: { slug: data.slug },
        });
        if (slugExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An article with this slug already exists",
          });
        }
      }

      // Set publishedAt when publishing
      const publishedAt =
        data.status === "PUBLISHED" && existingArticle.status !== "PUBLISHED"
          ? new Date()
          : undefined;

      const article = await ctx.prisma.article.update({
        where: { id },
        data: {
          ...data,
          ...(publishedAt && { publishedAt }),
        },
        include: {
          category: true,
          author: { select: { id: true, name: true } },
        },
      });

      return article;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const article = await ctx.prisma.article.findUnique({
        where: { id: input.id },
      });

      if (!article) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
      }

      await ctx.prisma.article.delete({ where: { id: input.id } });

      return { success: true };
    }),
});
