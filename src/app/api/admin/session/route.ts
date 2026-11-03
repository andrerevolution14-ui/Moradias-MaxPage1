import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/server-utils";
import { emailStatus, smsEnabled } from "@/lib/notify";
import { capiEnabled } from "@/lib/meta";
import { META_PIXEL_ID } from "@/lib/config";

export async function GET(req: NextRequest) {
  const admin = isAdmin(req);
  return NextResponse.json(
    admin
      ? {
          admin,
          sms: smsEnabled(),
          config: {
            email: emailStatus(),
            meta: { pixelId: META_PIXEL_ID, capi: capiEnabled(), testCode: Boolean(process.env.META_TEST_EVENT_CODE) },
            database: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
            siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
          },
        }
      : { admin },
    { headers: { "Cache-Control": "no-store" } },
  );
}
