import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Validation schema
function validateReviewData(data: any) {
  const errors: string[] = []
  
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.push('Rating must be between 1 and 5')
  }
  
  if (!data.comment || data.comment.trim().length < 10) {
    errors.push('Comment must be at least 10 characters long')
  }
  
  if (data.comment && data.comment.length > 1000) {
    errors.push('Comment must be less than 1000 characters')
  }
  
  if (!data.userId || !data.attractionId) {
    errors.push('User ID and Attraction ID are required')
  }
  
  return errors
}

// Calculate new average rating for an attraction
async function updateAttractionRating(attractionId: string) {
  const reviews = await db.review.findMany({
    where: { attractionId },
    select: { rating: true }
  })
  
  if (reviews.length === 0) {
    await db.attraction.update({
      where: { id: attractionId },
      data: { rating: 0, reviewCount: 0 }
    })
    return
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / reviews.length
  
  await db.attraction.update({
    where: { id: attractionId },
    data: { 
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviews.length
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const attractionId = searchParams.get('attractionId')
    const userId = searchParams.get('userId')
    
    if (attractionId) {
      // Get reviews for a specific attraction
      const reviews = await db.review.findMany({
        where: { attractionId },
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(reviews)
    } else if (userId) {
      // Get reviews by a specific user
      const reviews = await db.review.findMany({
        where: { userId },
        include: {
          attraction: {
            select: { id: true, name: true, image: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(reviews)
    } else {
      // Get all reviews with pagination
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const skip = (page - 1) * limit
      
      const reviews = await db.review.findMany({
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          },
          attraction: {
            select: { id: true, name: true, image: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
      
      const total = await db.review.count()
      
      return NextResponse.json({
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    }
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rating, comment, images, userId, attractionId, verified } = body
    
    // Validate input
    const validationErrors = validateReviewData(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }
    
    // Check if user already reviewed this attraction
    const existingReview = await db.review.findUnique({
      where: {
        userId_attractionId: {
          userId,
          attractionId
        }
      }
    })
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this attraction' },
        { status: 409 }
      )
    }
    
    // Create the review
    const review = await db.review.create({
      data: {
        rating,
        comment: comment.trim(),
        images: images ? JSON.stringify(images) : null,
        userId,
        attractionId,
        verified: verified || false
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        attraction: {
          select: { id: true, name: true }
        }
      }
    })
    
    // Update attraction's average rating
    await updateAttractionRating(attractionId)
    
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewId, action, userId } = body
    
    if (action === 'helpful') {
      // Increment helpful count
      const review = await db.review.update({
        where: { id: reviewId },
        data: { helpful: { increment: 1 } },
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          },
          attraction: {
            select: { id: true, name: true }
          }
        }
      })
      
      return NextResponse.json(review)
    } else if (action === 'respond') {
      // Add owner response
      const { response } = body
      const review = await db.review.update({
        where: { id: reviewId },
        data: { response },
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          },
          attraction: {
            select: { id: true, name: true }
          }
        }
      })
      
      return NextResponse.json(review)
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}