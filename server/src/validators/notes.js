const { z } = require('zod');

// Tags are trimmed, lowercased, de-duplicated, and capped at 10 per note.
const tagsSchema = z
  .array(z.string().trim().toLowerCase().min(1, 'Tags cannot be empty').max(30, 'Tags must be 30 characters or fewer'))
  .max(10, 'A note can have at most 10 tags')
  .transform((tags) => [...new Set(tags)]);

const title = z.string().trim().min(1, 'Title is required').max(200);
const content = z.string().min(1, 'Content is required').max(10000);
const category = z.string().trim().min(1, 'Category is required').max(50);

const createNoteSchema = z.object({
  title,
  content,
  category: category.default('General'),
  tags: tagsSchema.default([]),
  isPinned: z.boolean().default(false),
});

const updateNoteSchema = z
  .object({
    title: title.optional(),
    content: content.optional(),
    category: category.optional(),
    tags: tagsSchema.optional(),
    isPinned: z.boolean().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Provide at least one field to update' });

const listQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(50).optional(),
  tag: z.string().trim().toLowerCase().max(30).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

module.exports = { createNoteSchema, updateNoteSchema, listQuerySchema };
