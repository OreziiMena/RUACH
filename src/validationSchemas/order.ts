import z from "zod";

export const createOrderSchema = z.object({
  streetAddress: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string().optional(),
  country: z.string(),
  contactName: z.string(),
  contactPhone: z.string(),
  contactEmail: z.string(),
  note: z.string().max(500).optional(),
  shippingMethod: z.enum(['within_port_harcourt', 'outside_port_harcourt_doors', 'outside_port_harcourt_pickup']),
})

export const adminUpdateOrder = z.object({
  status: z.enum(['SHIPPED', 'DELIVERED', 'CANCELLED']),
  note: z.string().max(500).optional(),
})