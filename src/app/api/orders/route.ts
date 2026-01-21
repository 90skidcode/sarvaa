import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    const orders = await db.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, items, phone, address, notes } = body

    if (!userId || !items || !phone || !address || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate total
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

    // Generate order number
    const orderCount = await db.order.count()
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        total,
        userId,
        phone,
        address,
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    })

    // Clear cart
    await db.cartItem.deleteMany({
      where: { userId }
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
