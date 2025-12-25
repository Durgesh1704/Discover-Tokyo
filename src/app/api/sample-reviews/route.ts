import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const sampleReviews = [
  {
    rating: 5,
    comment: "Absolutely breathtaking experience! The view from the top is incredible and the staff was very helpful. I went during sunset and it was magical. Highly recommend getting the fast pass to skip lines.",
    userId: 'user1',
    attractionId: '1', // Assuming this is Senso-ji Temple
    verified: true
  },
  {
    rating: 4,
    comment: "Beautiful temple with lots of history. The surrounding area has great traditional shops and street food. It can get very crowded on weekends, so try to visit early morning.",
    userId: 'user2',
    attractionId: '1',
    verified: false
  },
  {
    rating: 5,
    comment: "The most impressive structure I've ever seen! The observation decks offer panoramic views of Tokyo. The digital art installations inside are also amazing. Worth every yen!",
    userId: 'user3',
    attractionId: '2', // Assuming this is Tokyo Skytree
    verified: true
  },
  {
    rating: 3,
    comment: "Great views but very expensive. The lines can be incredibly long, especially during peak tourist season. The food options at the top are limited and overpriced.",
    userId: 'user4',
    attractionId: '2',
    verified: false
  },
  {
    rating: 5,
    comment: "A peaceful oasis in the middle of bustling Tokyo. The walk through the forest to the shrine is incredibly serene. Don't miss the weekend markets and festivals!",
    userId: 'user5',
    attractionId: '3', // Assuming this is Meiji Shrine
    verified: true
  }
]

export async function POST(request: NextRequest) {
  try {
    // First, create some sample users
    const users = [
      { id: 'user1', name: 'Sarah Johnson', email: 'sarah@example.com' },
      { id: 'user2', name: 'Mike Chen', email: 'mike@example.com' },
      { id: 'user3', name: 'Emily Davis', email: 'emily@example.com' },
      { id: 'user4', name: 'Alex Kim', email: 'alex@example.com' },
      { id: 'user5', name: 'Maria Rodriguez', email: 'maria@example.com' }
    ]

    for (const user of users) {
      await db.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      })
    }

    // Clear existing reviews
    await db.review.deleteMany({})

    // Add sample reviews
    const createdReviews = await db.review.createMany({
      data: sampleReviews
    })

    // Update attraction ratings
    const attractionIds = [...new Set(sampleReviews.map(r => r.attractionId))]
    for (const attractionId of attractionIds) {
      const reviews = await db.review.findMany({
        where: { attractionId },
        select: { rating: true }
      })
      
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
        const averageRating = totalRating / reviews.length
        
        await db.attraction.update({
          where: { id: attractionId },
          data: { 
            rating: Math.round(averageRating * 10) / 10,
            reviewCount: reviews.length
          }
        })
      }
    }

    return NextResponse.json({ 
      message: `Successfully added ${createdReviews.count} sample reviews`,
      count: createdReviews.count
    })
  } catch (error) {
    console.error('Error adding sample reviews:', error)
    return NextResponse.json(
      { error: 'Failed to add sample reviews' },
      { status: 500 }
    )
  }
}