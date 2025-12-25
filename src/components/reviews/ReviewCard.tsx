'use client'

import { useState } from 'react'
import { Star, ThumbsUp, Calendar, CheckCircle, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { markReviewHelpful } from '@/lib/actions/reviews'

interface ReviewCardProps {
  review: {
    id: string
    rating: number
    comment: string
    helpful: number
    verified: boolean
    response?: string
    createdAt: string
    user: {
      id: string
      name: string
      avatar?: string
    }
  }
  showOwnerResponse?: boolean
}

export default function ReviewCard({ review, showOwnerResponse = false }: ReviewCardProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful)
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    )
  }

  const handleHelpful = async () => {
    if (hasMarkedHelpful || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const result = await markReviewHelpful(review.id)
      if (result.success) {
        setHelpfulCount(prev => prev + 1)
        setHasMarkedHelpful(true)
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user.avatar} alt={review.user.name} />
              <AvatarFallback className="bg-orange-100 text-orange-600">
                {getUserInitials(review.user.name)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                {review.verified && (
                  <CheckCircle className="h-4 w-4 text-green-500" title="Verified visit" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {renderStars(review.rating)}
                <span>•</span>
                <span>{formatDate(review.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHelpful}
              disabled={hasMarkedHelpful || isSubmitting}
              className={`gap-2 ${hasMarkedHelpful ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'}`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>Helpful</span>
              {helpfulCount > 0 && (
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {helpfulCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {showOwnerResponse && review.response && (
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-orange-600" />
              <span className="font-semibold text-orange-900">Response from Tokyo Travel Hub</span>
            </div>
            <p className="text-gray-700">{review.response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}