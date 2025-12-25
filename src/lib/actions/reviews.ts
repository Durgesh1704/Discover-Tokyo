'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

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

export async function submitReview(formData: FormData) {
  try {
    const rating = parseInt(formData.get('rating') as string)
    const comment = formData.get('comment') as string
    const images = formData.get('images') as string
    const userId = formData.get('userId') as string
    const attractionId = formData.get('attractionId') as string
    const verified = formData.get('verified') === 'true'
    
    // Validate input
    const validationErrors = validateReviewData({
      rating,
      comment,
      userId,
      attractionId
    })
    
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: 'Validation failed',
        details: validationErrors
      }
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
      return {
        success: false,
        error: 'You have already reviewed this attraction'
      }
    }
    
    // Create the review
    const review = await db.review.create({
      data: {
        rating,
        comment: comment.trim(),
        images: images ? JSON.stringify(JSON.parse(images)) : null,
        userId,
        attractionId,
        verified
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
    
    // Revalidate the attraction page to show new review
    revalidatePath(`/attractions/${attractionId}`)
    
    return {
      success: true,
      data: review
    }
  } catch (error) {
    console.error('Error submitting review:', error)
    return {
      success: false,
      error: 'Failed to submit review'
    }
  }
}

export async function markReviewHelpful(reviewId: string) {
  try {
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
    
    return {
      success: true,
      data: review
    }
  } catch (error) {
    console.error('Error marking review as helpful:', error)
    return {
      success: false,
      error: 'Failed to mark review as helpful'
    }
  }
}

export async function addOwnerResponse(reviewId: string, response: string) {
  try {
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
    
    return {
      success: true,
      data: review
    }
  } catch (error) {
    console.error('Error adding owner response:', error)
    return {
      success: false,
      error: 'Failed to add owner response'
    }
  }
}

export async function getReviews(attractionId?: string, userId?: string) {
  try {
    if (attractionId) {
      const reviews = await db.review.findMany({
        where: { attractionId },
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return {
        success: true,
        data: reviews
      }
    } else if (userId) {
      const reviews = await db.review.findMany({
        where: { userId },
        include: {
          attraction: {
            select: { id: true, name: true, image: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return {
        success: true,
        data: reviews
      }
    } else {
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
        take: 20
      })
      return {
        success: true,
        data: reviews
      }
    }
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return {
      success: false,
      error: 'Failed to fetch reviews'
    }
  }
}