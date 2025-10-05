import { z } from "zod"

export const createSubscriberSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t("validation.email.invalid")),
  role: z.enum(["PLAYER", "COACH"], {
    message: t("validation.role.required"),
  }),
})

export type SubscriberInput = z.infer<ReturnType<typeof createSubscriberSchema>>
