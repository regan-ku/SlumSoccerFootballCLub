import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  age_group_id: z.string().min(1, "Age group is required"),
  head_coach_id: z.string().optional().or(z.literal("")),
  captain_id: z.string().optional().or(z.literal("")),
  team_photo_url: z.string().optional().or(z.literal("")),
});

export type TeamFormData = z.infer<typeof teamSchema>;