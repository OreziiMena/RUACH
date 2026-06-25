import { Resend } from "resend";

const API_KEY = process.env.RESEND_API_KEY || "re_dummy_key_for_testing";
export const resend = new Resend(API_KEY);