import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const companySchema = z.object({
  name: z.string().trim().min(2, "نام شرکت باید حداقل ۲ حرف باشد").max(120),
  domain: optionalText,
  industry: optionalText,
  size: optionalText,
  phone: optionalText,
  website: optionalText,
  city: optionalText,
  address: optionalText,
  notes: optionalText,
  ownerId: optionalText,
});

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, "نام لازم است").max(60),
  lastName: z.string().trim().min(1, "نام خانوادگی لازم است").max(60),
  email: z.string().trim().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  phone: optionalText,
  mobile: optionalText,
  title: optionalText,
  companyId: optionalText,
  ownerId: optionalText,
  tags: optionalText,
  notes: optionalText,
});

export const leadSchema = z.object({
  name: z.string().trim().min(2, "نام لازم است").max(120),
  email: z.string().trim().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  phone: optionalText,
  companyName: optionalText,
  source: z.enum(["manual", "website", "referral", "campaign", "inbound"]).default("manual"),
  status: z.enum(["new", "contacted", "qualified", "unqualified", "converted"]).default("new"),
  score: z.coerce.number().int().min(0).max(100).default(0),
  notes: optionalText,
  ownerId: optionalText,
});

export const dealSchema = z.object({
  title: z.string().trim().min(2, "عنوان معامله لازم است").max(160),
  companyId: optionalText,
  contactId: optionalText,
  stageId: optionalText,
  amount: z.string().default("0"),
  currency: z.string().default("IRR"),
  probability: z.coerce.number().int().min(0).max(100).default(0),
  expectedCloseDate: optionalText,
  ownerId: optionalText,
});

export const taskSchema = z.object({
  title: z.string().trim().min(2, "عنوان وظیفه لازم است").max(160),
  description: optionalText,
  dueDate: optionalText,
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  status: z.enum(["open", "done", "cancelled"]).default("open"),
  assigneeId: optionalText,
  dealId: optionalText,
  contactId: optionalText,
});

export const activitySchema = z.object({
  type: z.enum(["call", "meeting", "email", "note", "stage_change", "system"]),
  subject: z.string().trim().min(1).max(200),
  body: optionalText,
  dealId: optionalText,
  contactId: optionalText,
  companyId: optionalText,
});

export type CompanyInput = z.infer<typeof companySchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type DealInput = z.infer<typeof dealSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
