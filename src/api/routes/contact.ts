import { Hono } from "hono";
import { z } from "zod";
import { validate } from "../middleware/validate";

const contactRoutes = new Hono();

// ============================================================================
// Simple in-memory rate limiter: 1 request per 60 seconds per IP
// Cleanup happens lazily during requests (no setInterval in Workers global scope)
// ============================================================================
const rateLimitStore = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60_000;
let lastCleanup = Date.now();

function cleanupRateLimit() {
  const now = Date.now();
  // Only cleanup every 5 minutes to avoid overhead
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  for (const [key, timestamp] of rateLimitStore) {
    if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
}

// Validation schema
const contactSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre no puede superar 120 caracteres"),
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("El email no tiene un formato válido"),
  courseId: z.string().uuid().optional(),
  message: z
    .string()
    .min(1, "El mensaje es obligatorio")
    .max(5000, "El mensaje no puede superar 5000 caracteres"),
});

// ============================================================================
// POST /api/contact — public contact form submission
// ============================================================================
contactRoutes.post("/", validate({ body: contactSchema }), async (c) => {
  try {
    // Run lazy cleanup
    cleanupRateLimit();

    // Rate limiting by IP
    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      c.req.header("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const lastRequest = rateLimitStore.get(ip);

    if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW_MS) {
      return c.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.",
          },
        },
        429
      );
    }

    rateLimitStore.set(ip, now);

    const body = await c.req.json();
    const { name, email, courseId, message } = contactSchema.parse(body);

    // Look up course title if courseId provided
    let courseName = "";
    if (courseId) {
      try {
        const { db } = await import("../../infra/db");
        const { course } = await import("../../infra/schema/course");
        const { eq } = await import("drizzle-orm");

        const [courseRecord] = await db
          .select({ title: course.title })
          .from(course)
          .where(eq(course.id, courseId))
          .limit(1);

        courseName = courseRecord?.title || "";
      } catch {
        // Course not found — continue without course info
      }
    }

    // Send email via Resend — read directly from c.env (Workers bindings)
    const env = c.env as Record<string, string>;
    const resendApiKey = env?.RESEND_API_KEY;
    const contactEmail = env?.CONTACT_EMAIL;
    const contactFrom = env?.CONTACT_FROM;

    // Validate contact email configuration
    const emailConfig = {
      resendApiKey: !!resendApiKey,
      contactEmail: !!contactEmail,
      contactFrom: !!contactFrom,
    };

    if (!resendApiKey || !contactEmail || !contactFrom) {
      console.warn("[contact] Email configuration incomplete:", JSON.stringify(emailConfig));
      return c.json(
        {
          success: false,
          error: {
            code: "EMAIL_NOT_CONFIGURED",
            message: "El servicio de correo no está configurado. Inténtalo de nuevo más tarde.",
          },
        },
        503
      );
    }

    const { ResendEmailProvider } = await import("../../infra/providers/resend-email");
    const emailProvider = new ResendEmailProvider(resendApiKey, contactFrom);

    const courseLine = courseName
      ? `Curso de interés: ${courseName}\n`
      : "";

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Nueva solicitud de contacto</h2>
        <p>Se ha recibido una nueva consulta a través del formulario de contacto.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${courseName ? `<p><strong>Curso de interés:</strong> ${courseName}</p>` : ""}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <p><strong>Mensaje:</strong></p>
        <p style="white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 8px;">${message}</p>
      </div>
    `;

    // send() now throws on Resend error — will be caught below
    const result = await emailProvider.send({
      to: contactEmail,
      subject: "Nueva solicitud de contacto — Plataforma Cursos",
      html: emailHtml,
      replyTo: email,
    });

    console.log(`[contact] Email sent successfully — id: ${result.id}`);

    return c.json({
      success: true,
      data: { message: "Mensaje enviado correctamente" },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Datos de formulario inválidos",
          },
        },
        400
      );
    }

    console.error("Contact form error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "No se ha podido enviar el mensaje. Inténtalo de nuevo.",
        },
      },
      500
    );
  }
});

export default contactRoutes;
