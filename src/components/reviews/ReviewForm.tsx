'use client'

import { useState } from 'react'
import { Star, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { submitReview } from '@/lib/actions/reviews'
import { useRouter } from 'next/navigation'

interface ReviewFormProps {
  attractionId: string
  attractionName: string
  userId: string
  userName: string
  onReviewSubmitted?: () => void
}

export default function ReviewForm({ 
  attractionId, 
  attractionName, 
  userId, 
  userName,
  onReviewSubmitted 
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const renderStars = (interactive = true) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-8 w-8 cursor-pointer transition-colors ${
              star <= (interactive ? hoveredRating || rating : rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200 hover:text-yellow-300'
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          />
        ))}
      </div>
    )
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // In a real implementation, you would upload these to a service like Cloudinary
    // For now, we'll simulate the upload with local URLs
    const newImages = Array.from(files).map(file => URL.createObjectURL(file))
    setUploadedImages(prev => [...prev, ...newImages].slice(0, 5)) // Max 5 images
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    
    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters for your review')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('rating', rating.toString())
      formData.append('comment', comment)
      formData.append('images', JSON.stringify(uploadedImages))
      formData.append('userId', userId)
      formData.append('attractionId', attractionId)
      formData.append('verified', 'false') // In a real app, this would be based on booking history

      const result = await submitReview(formData)
      
      if (result.success) {
        setSuccess(true)
        setRating(0)
        setComment('')
        setUploadedImages([])
        onReviewSubmitted?.()
        
        // Refresh the page to show the new review
        router.refresh()
      } else {
        setError(result.error || 'Failed to submit review')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <div className="text-green-600 mb-4">
            <Star className="h-12 w-12 mx-auto fill-current" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Thank you for your review!
          </h3>
          <p className="text-gray-600">
            Your feedback helps other travelers make informed decisions.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Share Your Experience</CardTitle>
        <p className="text-gray-600">
          Tell us about your visit to {attractionName}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Overall Rating *
            </Label>
            <div className="flex items-center gap-3">
              {renderStars()}
              <span className="text-gray-600">
                {rating > 0 && (
                  rating === 5 ? 'Excellent' :
                  rating === 4 ? 'Very Good' :
                  rating === 3 ? 'Good' :
                  rating === 2 ? 'Fair' : 'Poor'
                )}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-base font-semibold mb-3 block">
              Your Review *
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this attraction. What did you like? What could be improved?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              maxLength={1000}
              className="resize-none"
            />
            <div className="text-sm text-gray-500 mt-1">
              {comment.length}/1000 characters
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Photos (Optional)
            </Label>
            <div className="space-y-3">
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (Max 5 photos)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}