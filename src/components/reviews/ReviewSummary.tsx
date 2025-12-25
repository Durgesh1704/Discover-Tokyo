'use client'

import { Progress } from '@/components/ui/progress'
import { Star } from 'lucide-react'

interface ReviewSummaryProps {
  reviews: Array<{
    rating: number
  }>
  averageRating: number
  totalReviews: number
}

export default function ReviewSummary({ reviews, averageRating, totalReviews }: ReviewSummaryProps) {
  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return { rating, count, percentage }
  })

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Guest Reviews</h3>
          <p className="text-gray-600 mt-1">What our visitors are saying</p>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </div>
          {renderStars(Math.round(averageRating))}
          <div className="text-sm text-gray-600 mt-1">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {ratingDistribution.map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-16">
              {renderStars(rating, 'sm')}
              <span className="text-sm text-gray-600 ml-1">{rating}</span>
            </div>
            
            <div className="flex-1">
              <Progress 
                value={percentage} 
                className="h-2"
                // Custom color for progress bar
                style={{
                  '--progress-background': 'rgb(251 146 60)',
                } as React.CSSProperties}
              />
            </div>
            
            <div className="w-12 text-right">
              <span className="text-sm font-medium text-gray-900">{count}</span>
            </div>
            
            <div className="w-12 text-right">
              <span className="text-sm text-gray-600">{percentage.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>

      {totalReviews === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
        </div>
      )}
    </div>
  )
}