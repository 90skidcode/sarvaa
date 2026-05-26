import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    let contactInfo = await db.contactInfo.findFirst()

    if (!contactInfo) {
      // Create default contact info if it doesn't exist
      contactInfo = await db.contactInfo.create({
        data: {
          phoneNumber: '+91-9876543210',
          whatsappNumber: '+91-9876543210',
          email: 'admin@sarvaasweets.com',
          address: '123, T. Nagar Main Road',
          city: 'Chennai',
          postalCode: '600017',
          state: 'Tamil Nadu',
          country: 'India',
          hoursMonSat: '9:00 AM - 8:00 PM',
          hoursSunday: '10:00 AM - 6:00 PM',
          responseTime: '24 hours'
        }
      })
    }

    const response = NextResponse.json(contactInfo)

    // Cache contact info for 30 minutes (almost never changes)
    response.headers.set("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600")
    return response
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact info' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Get existing contact info or update the first one
    let contactInfo = await db.contactInfo.findFirst()

    if (!contactInfo) {
      contactInfo = await db.contactInfo.create({
        data: body
      })
    } else {
      contactInfo = await db.contactInfo.update({
        where: { id: contactInfo.id },
        data: body
      })
    }

    return NextResponse.json(contactInfo)
  } catch (error) {
    console.error('Error updating contact info:', error)
    return NextResponse.json(
      { error: 'Failed to update contact info' },
      { status: 500 }
    )
  }
}
