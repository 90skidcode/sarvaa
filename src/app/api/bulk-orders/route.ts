import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const bulkOrderSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  company: z.string().min(2).max(100).optional(),
  quantity: z.number().int().min(100).max(100000),
  description: z.string().min(10).max(1000),
  deliveryLocation: z.string().min(5).max(200),
  estimatedDeliveryDate: z.string().optional(),
  notes: z.string().max(500).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = bulkOrderSchema.parse(body)

    // Store bulk order inquiry
    const order = {
      type: 'bulk_order',
      timestamp: new Date().toISOString(),
      status: 'pending',
      ...validatedData
    }

    // Save to database using Settings table
    await db.settings.create({
      data: {
        key: `bulk_order_${Date.now()}`,
        value: JSON.stringify(order),
        description: `Bulk order from ${validatedData.name} (${validatedData.email}) - Qty: ${validatedData.quantity}`
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Bulk order inquiry submitted successfully. Our team will contact you with a quote shortly!',
        data: validatedData
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('Error submitting bulk order:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit bulk order inquiry'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Fetch all bulk orders (admin only)
    const orders = await db.settings.findMany({
      where: {
        key: {
          startsWith: 'bulk_order_'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const parsedOrders = orders.map(order => ({
      id: order.id,
      ...JSON.parse(order.value)
    }))

    return NextResponse.json({ orders: parsedOrders })
  } catch (error) {
    console.error('Error fetching bulk orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bulk orders' },
      { status: 500 }
    )
  }
}
