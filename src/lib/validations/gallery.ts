import { z } from "zod";

export const gallerySchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["photo", "video"]).default("photo"),
  category: z.enum(["training", "match", "community", "life_skills", "outreach", "events", "celebrations"]),
  age_group_id: z.string().optional().or(z.literal("")),
  team_id: z.string().optional().or(z.literal("")),
  program_id: z.string().optional().or(z.literal("")),
  // Note: 'url' and 'thumbnail_url' are handled by the FileUpload component state, 
  // but we validate them here to ensure they aren't empty on submit.
  url: z.string().min(1, "Please upload at least one file or provide a URL"),
  thumbnail_url: z.string().optional().or(z.literal("")),
});

export type GalleryFormData = z.infer<typeof gallerySchema>;