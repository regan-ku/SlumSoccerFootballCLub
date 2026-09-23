import { z } from "zod";

export const playerSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"]),
  position: z.string().optional(),
  jersey_number: z.string().optional(),
  guardian_name: z.string().min(2, "Guardian name is required"),
  // Validates Kenyan/international phone formats (e.g., +254 700 000 000 or 0700000000)
  guardian_phone: z.string().regex(/^\+?[0-9\s-]{10,15}$/, "Invalid phone number (e.g., +254 700 000 000)"),
  // Allows empty string OR a valid email
  guardian_email: z.string().email("Invalid email address").or(z.literal("")),
  medical_conditions: z.string().optional(),
  allergies: z.string().optional(),
  school: z.string().optional(),
  grade_level: z.string().optional(),
  current_age_group_id: z.string().min(1, "Please enter a valid Date of Birth to auto-assign the age group"),
  photo_url: z.string().optional(),
});

// This automatically generates a TypeScript type from the schema!
export type PlayerFormData = z.infer<typeof playerSchema>;