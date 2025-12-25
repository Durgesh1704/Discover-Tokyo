import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const attractions = await db.attraction.findMany({
      orderBy: {
        rating: 'desc'
      }
    })
    
    // Ensure we always return an array, even on error
    return NextResponse.json(attractions)
  } catch (error) {
    console.error('Error fetching attractions:', error)
    // Return empty array on error to prevent app crashes
    return NextResponse.json([], { 
      status: 500,
      error: 'Failed to fetch attractions'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const attraction = await db.attraction.create({
      data: body
    })

    return NextResponse.json(attraction, { status: 201 })
  } catch (error) {
    console.error('Error creating attraction:', error)
    return NextResponse.json(
      { error: 'Failed to create attraction' },
      { status: 500 }
    )
  }
}