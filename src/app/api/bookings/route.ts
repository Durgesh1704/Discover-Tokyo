import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      attractionId,
      userName,
      userEmail,
      visitDate,
      visitors,
      totalPrice,
      specialRequests
    } = body

    // First get the attraction to calculate total price if not provided
    const attraction = await db.attraction.findUnique({
      where: { id: attractionId }
    })

    if (!attraction) {
      return NextResponse.json(
        { error: 'Attraction not found' },
        { status: 404 }
      )
    }

    const finalTotalPrice = totalPrice || attraction.price * visitors

    const booking = await db.booking.create({
      data: {
        attractionId,
        userName,
        userEmail,
        visitDate,
        visitors,
        totalPrice: finalTotalPrice,
        specialRequests
      },
      include: {
        attraction: true
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      const bookings = await db.booking.findMany({
        where: { userEmail: email },
        include: {
          attraction: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return NextResponse.json(bookings)
    } else {
      const bookings = await db.booking.findMany({
        include: {
          attraction: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return NextResponse.json(bookings)
    }
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}