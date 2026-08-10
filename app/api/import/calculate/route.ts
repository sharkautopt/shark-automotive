import { NextRequest, NextResponse } from "next/server"
import { calculateImportCosts } from "@/lib/import/calculate-costs"

export async function POST(req: NextRequest) {
  try {
    const { vehiclePrice, isv } = await req.json()

    if (typeof vehiclePrice !== "number" || vehiclePrice < 0) {
      return NextResponse.json({ error: "Valid vehiclePrice is required" }, { status: 400 })
    }

    const isvAmount = typeof isv === "number" && isv >= 0 ? isv : 0
    const costs = calculateImportCosts(vehiclePrice, isvAmount, true)

    return NextResponse.json(costs)
  } catch (error) {
    console.error("[v0] calculate error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
