import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    return NextResponse.json({ cartItems, total })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, quantity } = body

    if (!userId || !productId || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const existingItem = await db.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    })

    let cartItem

    if (existingItem) {
      // Update quantity
      cartItem = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      })
    } else {
      // Create new cart item
      cartItem = await db.cartItem.create({
        data: {
          userId,
          productId,
          quantity
        },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      })
    }

    return NextResponse.json({ cartItem }, { status: 201 })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}
