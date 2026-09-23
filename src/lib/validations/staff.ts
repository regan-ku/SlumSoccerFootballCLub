import { z } from "zod";

export const staffSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["head_coach", "assistant_coach", "goalkeeping_coach", "life_skills_instructor", "program_coordinator", "admin"]),
  email: z.string().email("Invalid email address").or(z.literal("")),
  phone: z.string().regex(/^\+?[0-9\s-]{10,15}$/, "Invalid phone number").or(z.literal("")),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
  photo_url: z.string().optional(),
});

export type StaffFormData = z.infer<typeof staffSchema>;