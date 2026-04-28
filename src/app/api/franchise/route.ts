import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const franchiseSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  message: z.string().min(10).max(1000).optional(),
  businessType: z.enum(['retail', 'wholesale', 'both']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = franchiseSchema.parse(body)

    // Store franchise inquiry in settings (or create a dedicated table)
    const inquiry = {
      type: 'franchise_inquiry',
      timestamp: new Date().toISOString(),
      ...validatedData
    }

    // Save to database using Settings table
    await db.settings.create({
      data: {
        key: `franchise_inquiry_${Date.now()}`,
        value: JSON.stringify(inquiry),
        description: `Franchise inquiry from ${validatedData.name} (${validatedData.email})`
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Franchise inquiry submitted successfully. We will contact you soon!',
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

    console.error('Error submitting franchise inquiry:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit franchise inquiry'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Fetch all franchise inquiries (admin only)
    const inquiries = await db.settings.findMany({
      where: {
        key: {
          startsWith: 'franchise_inquiry_'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const parsedInquiries = inquiries.map(inquiry => ({
      id: inquiry.id,
      ...JSON.parse(inquiry.value)
    }))

    return NextResponse.json({ inquiries: parsedInquiries })
  } catch (error) {
    console.error('Error fetching franchise inquiries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch franchise inquiries' },
      { status: 500 }
    )
  }
}
