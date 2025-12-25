'use client'

import { useState, useEffect } from 'react'
import { getReviews } from '@/lib/actions/reviews'
import ReviewSummary from './ReviewSummary'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ReviewsSectionProps {
  attractionId: string
  attractionName: string
  averageRating: number
  totalReviews: number
  currentUserId?: string
  currentUserName?: string
}

export default function ReviewsSection({
  attractionId,
  attractionName,
  averageRating,
  totalReviews,
  currentUserId = 'demo-user', // In a real app, this would come from authentication
  currentUserName = 'Demo User'
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const result = await getReviews(attractionId)
      if (result.success) {
        setReviews(result.data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [attractionId])

  const handleReviewSubmitted = () => {
    fetchReviews()
    setShowReviewForm(false)
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    // Sort by helpful count first, then by date
    if (b.helpful !== a.helpful) {
      return b.helpful - a.helpful
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reviews & Ratings</h2>
        <p className="text-gray-600">See what other travelers are saying about {attractionName}</p>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="reviews">All Reviews</TabsTrigger>
          <TabsTrigger value="write">Write Review</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <ReviewSummary
            reviews={reviews}
            averageRating={averageRating}
            totalReviews={totalReviews}
          />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-6">
            {/* Sort Options */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReviews([...reviews].sort((a, b) => b.helpful - a.helpful))
                  }}
                >
                  Most Helpful
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReviews([...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
                  }}
                >
                  Most Recent
                </Button>
              </div>
            </div>

            {/* Reviews List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-100 h-32 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : sortedReviews.length > 0 ? (
              sortedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  showOwnerResponse={true}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No reviews yet.</p>
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Be the First to Review
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="write" className="mt-6">
          <ReviewForm
            attractionId={attractionId}
            attractionName={attractionName}
            userId={currentUserId}
            userName={currentUserName}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}