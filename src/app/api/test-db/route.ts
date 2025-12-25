import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test basic database connection
    const count = await db.attraction.count()
    console.log('Attraction count:', count)
    
    // Test simple query
    const attractions = await db.attraction.findMany({
      take: 1,
      select: { id: true, name: true }
    })
    console.log('Sample attraction:', attractions[0])
    
    return NextResponse.json({ 
      count,
      sample: attractions[0]
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { error: 'Database test failed', details: error.message },
      { status: 500 }
    )
  }
}