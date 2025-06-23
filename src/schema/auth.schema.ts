import { z } from "zod";

const authSchema = z.object({
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters",
    })
    .optional(),
  email: z.string().email({ message: "Email must be valid" }).optional(),
  name: z
    .string()
    .min(3, {
      message: "Name must be at least 3 characters",
    })
    .optional(),
  phone: z
    .string()
    .min(8, {
      message: "Phone number must be at least 8 digits",
    })
    .optional(),
  rememberMe: z.boolean().default(false).optional(),
});

export { authSchema };
