import { z } from "zod";

export const programSchema = z.object({
  name: z.string().min(3, "Program name must be at least 3 characters"),
  category: z.enum(["life_skills", "community_outreach", "education", "health", "mentorship", "training", "player_development"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  target_age_min: z.coerce.number().min(0, "Invalid minimum age").max(100),
  target_age_max: z.coerce.number().min(0, "Invalid maximum age").max(100),
  schedule: z.string().optional(),
  location: z.string().optional(),
  coordinator_id: z.string().optional().or(z.literal("")),
  photo_url: z.string().optional().or(z.literal("")),
  video_url: z.string().optional().or(z.literal("")),
  media_type: z.enum(["image", "video"]).default("image"),
}).refine((data) => data.target_age_max >= data.target_age_min, {
  message: "Maximum age must be greater than or equal to minimum age",
  path: ["target_age_max"], // This attaches the error to the max_age field
});

export type ProgramFormData = z.infer<typeof programSchema>;