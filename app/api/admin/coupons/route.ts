import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/coupons/auth";
import { redeemUrl } from "@/lib/coupons/check";
import { claimCoupon, countByState, listCoupons, refreshCoupon } from "@/lib/coupons/queries";
import type { CouponCodeRow } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Action =
  | { action: "list"; batch?: string; state?: "claimable" | "sent" | "redeemed" | "all"; limit?: number }
  | { action: "stats"; batch?: string }
  | { action: "check"; code: string }
  | { action: "claim"; batch: string; sentTo?: string };

function present(row: CouponCodeRow) {
  return {
    code: row.code,
    batch: row.batch,
    valueUsd: row.valueCents / 100,
    redeemUrl: redeemUrl(row.code),
    sentAt: row.sentAt,
    sentTo: row.sentTo,
    redeemedAt: row.redeemedAt,
    checkedAt: row.checkedAt,
    checkStatus: row.checkStatus,
  };
}

export async function POST(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Action;
  try {
    body = (await request.json()) as Action;
  } catch {
    return NextResponse.json({ error: "body must be JSON" }, { status: 400 });
  }

  switch (body.action) {
    case "list": {
      const rows = await listCoupons({ batch: body.batch, state: body.state, limit: body.limit });
      return NextResponse.json({ coupons: rows.map(present) });
    }

    case "stats": {
      return NextResponse.json({ batches: await countByState(body.batch) });
    }

    case "check": {
      if (!body.code?.trim()) return NextResponse.json({ error: "code is required" }, { status: 400 });
      const { status, valueCents, title, row } = await refreshCoupon(body.code.trim());
      return NextResponse.json({
        code: body.code.trim(),
        status,
        valueUsd: valueCents === null ? null : valueCents / 100,
        title,
        known: row !== null, // false = the code isn't one of ours
      });
    }

    case "claim": {
      if (!body.batch?.trim()) return NextResponse.json({ error: "batch is required" }, { status: 400 });
      const row = await claimCoupon({ batch: body.batch.trim(), sentTo: body.sentTo?.trim() || null });
      if (!row) {
        return NextResponse.json({ error: "no claimable coupons left in that batch" }, { status: 409 });
      }
      return NextResponse.json({ coupon: present(row) });
    }

    default:
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }
}
