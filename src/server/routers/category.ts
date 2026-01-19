import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc/trpc";
import { TRPCError } from "@trpc/server";

export const categoryRouter = router({
  // Public procedures
  getAll: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { articles: { where: { status: "PUBLISHED" } } },
        },
      },
    });

    return categories;
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.prisma.category.findUnique({
        where: { slug: input.slug },
        include: {
          _count: {
            select: { articles: { where: { status: "PUBLISHED" } } },
          },
        },
      });

      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      }

      return category;
    }),

  // Admin procedures
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingCategory = await ctx.prisma.category.findFirst({
        where: {
          OR: [{ name: input.name }, { slug: input.slug }],
        },
      });

      if (existingCategory) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A category with this name or slug already exists",
        });
      }

      const category = await ctx.prisma.category.create({
        data: input,
      });

      return category;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingCategory = await ctx.prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      }

      const category = await ctx.prisma.category.update({
        where: { id },
        data,
      });

      return category;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.prisma.category.findUnique({
        where: { id: input.id },
        include: { _count: { select: { articles: true } } },
      });

      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      }

      if (category._count.articles > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete category with existing articles",
        });
      }

      await ctx.prisma.category.delete({ where: { id: input.id } });

      return { success: true };
    }),
});
