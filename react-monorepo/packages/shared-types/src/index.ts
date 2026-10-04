import { z } from 'zod';

// --- Daily Learning App Types & Schemas ---
export const LearningEntrySchema = z.object({
    id: z.string(),
    title: z.string(),
    category: z.string(),
    content: z.string(),
    datePublished: z.string(),
});

export type LearningEntry = z.infer<typeof LearningEntrySchema>;


// --- Odyssey Hub App Types & Schemas ---
export const UserSchema = z.object({
    id: z.string(),
    username: z.string(),
    clearanceLevel: z.enum(['public', 'classified', 'admin']),
});

export type User = z.infer<typeof UserSchema>;

export const ClassifiedRecordSchema = z.object({
    id: z.string(),
    title: z.string(),
    codename: z.string(),
    content: z.string(),
    requiredClearance: z.enum(['classified', 'admin']),
});

export type ClassifiedRecord = z.infer<typeof ClassifiedRecordSchema>;