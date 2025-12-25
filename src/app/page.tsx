'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, Users, Star, Clock, DollarSign, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import ReviewsSection from '@/components/reviews/ReviewsSection'

interface Attraction {
  id: string
  name: string
  description: string
  category: string
  location: string
  price: number
  duration: string
  image: string
  rating: number
  reviewCount: number
  tags: string[]
}

interface BookingForm {
  attractionId: string
  userName: string
  userEmail: string
  visitDate: string
  visitors: number
  specialRequests: string
}

export default function Home() {
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null)
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    attractionId: '',
    userName: '',
    userEmail: '',
    visitDate: '',
    visitors: 1,
    specialRequests: ''
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showAllAttractions, setShowAllAttractions] = useState(false)

  useEffect(() => {
    fetchAttractions()
  }, [])

  const fetchAttractions = async () => {
    try {
      const response = await fetch('/api/attractions')
      const data = await response.json()
      
      // Robust type guard to ensure we always have an array
      if (Array.isArray(data)) {
        setAttractions(data)
      } else {
        console.error('API returned non-array data:', data)
        setAttractions([])
      }
    } catch (error) {
      console.error('Error fetching attractions:', error)
      setAttractions([])
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async (attraction: Attraction) => {
    setSelectedAttraction(attraction)
    setBookingForm({
      attractionId: attraction.id,
      userName: '',
      userEmail: '',
      visitDate: '',
      visitors: 1,
      specialRequests: ''
    })
    setBookingDialogOpen(true)
  }

  const submitBooking = async () => {
    if (!selectedAttraction) return
    
    setBookingLoading(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...bookingForm,
          totalPrice: selectedAttraction.price * bookingForm.visitors
        })
      })
      
      if (response.ok) {
        alert('Booking confirmed! Check your email for details.')
        setBookingDialogOpen(false)
        setBookingForm({
          attractionId: '',
          userName: '',
          userEmail: '',
          visitDate: '',
          visitors: 1,
          specialRequests: ''
        })
      } else {
        alert('Booking failed. Please try again.')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Booking failed. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  const filteredAttractions = Array.isArray(attractions) ? attractions.filter(attraction => {
    const matchesSearch = attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attraction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || attraction.category === selectedCategory
    return matchesSearch && matchesCategory
  }) : []

  const displayAttractions = showAllAttractions ? filteredAttractions : filteredAttractions.slice(0, 6)

  const categories = ['all', 'temples', 'museums', 'parks', 'shopping', 'entertainment', 'food', 'cultural']

  // Ensure displayAttractions is always an array for mapping
  const safeDisplayAttractions = Array.isArray(displayAttractions) ? displayAttractions : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-400 to-pink-400 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover Tokyo's Amazing Attractions
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Book unforgettable experiences in Japan's vibrant capital city
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2 shadow-xl max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search attractions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 focus:ring-0 text-gray-900"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="bg-orange-500 hover:bg-orange-600 px-8">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Attractions */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Popular Tokyo Attractions</h2>
          <p className="text-xl text-gray-600">Explore the most iconic destinations in Tokyo</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Array.isArray(attractions) && attractions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {safeDisplayAttractions.map((attraction) => (
                <Card key={attraction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${attraction.image})` }}>
                    <div className="h-full bg-black/20 flex items-end">
                      <Badge className="m-4 bg-orange-500">{attraction.category}</Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{attraction.name}</span>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{attraction.rating}</span>
                        <span className="text-gray-500">({attraction.reviewCount})</span>
                      </div>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {attraction.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-2">{attraction.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{attraction.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{attraction.price === 0 ? 'Free' : `$${attraction.price}`}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => handleBooking(attraction)}
                    >
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {filteredAttractions.length > 6 && (
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllAttractions(!showAllAttractions)}
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  {showAllAttractions ? 'Show Less' : `Show All ${filteredAttractions.length} Attractions`}
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {safeDisplayAttractions.map((attraction, index) => (
                <Card key={attraction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${attraction.image})` }}>
                    <div className="h-full bg-black/20 flex items-end">
                      <Badge className="m-4 bg-orange-500">{attraction.category}</Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{attraction.name}</span>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{attraction.rating}</span>
                        <span className="text-gray-500">({attraction.reviewCount})</span>
                      </div>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {attraction.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-2">{attraction.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{attraction.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{attraction.price === 0 ? 'Free' : `$${attraction.price}`}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => handleBooking(attraction)}
                    >
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {safeDisplayAttractions.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No attractions found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Why Choose Tokyo Travel Hub</h2>
            <p className="text-xl text-gray-600">Your gateway to authentic Japanese experiences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">Simple and secure online booking process with instant confirmation</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Experts</h3>
              <p className="text-gray-600">Curated experiences led by knowledgeable local guides</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing with no hidden fees</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section - Show reviews for the top rated attraction */}
      {Array.isArray(attractions) && attractions.length > 0 && (
        <section className="bg-white py-16">
          <ReviewsSection
            attractionId={attractions[0].id} // Show reviews for the highest-rated attraction
            attractionName={attractions[0].name}
            averageRating={attractions[0].rating}
            totalReviews={attractions[0].reviewCount}
            currentUserId="demo-user"
            currentUserName="Demo User"
          />
        </section>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Your Experience</DialogTitle>
            <DialogDescription>
              {selectedAttraction && (
                <span className="font-semibold text-orange-600">{selectedAttraction.name}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userName">Name *</Label>
              <Input
                id="userName"
                value={bookingForm.userName}
                onChange={(e) => setBookingForm({...bookingForm, userName: e.target.value})}
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="userEmail">Email *</Label>
              <Input
                id="userEmail"
                type="email"
                value={bookingForm.userEmail}
                onChange={(e) => setBookingForm({...bookingForm, userEmail: e.target.value})}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="visitDate">Visit Date *</Label>
              <Input
                id="visitDate"
                type="date"
                value={bookingForm.visitDate}
                onChange={(e) => setBookingForm({...bookingForm, visitDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="visitors">Number of Visitors *</Label>
              <Select 
                value={bookingForm.visitors.toString()} 
                onValueChange={(value) => setBookingForm({...bookingForm, visitors: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Visitor' : 'Visitors'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                value={bookingForm.specialRequests}
                onChange={(e) => setBookingForm({...bookingForm, specialRequests: e.target.value})}
                placeholder="Any special requirements or preferences..."
                rows={3}
              />
            </div>
            
            {selectedAttraction && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Price:</span>
                  <span className="text-xl font-bold text-orange-600">
                    {selectedAttraction.price === 0 ? 'Free' : `$${(selectedAttraction.price * bookingForm.visitors).toFixed(2)}`}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setBookingDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={submitBooking}
              disabled={bookingLoading || !bookingForm.userName || !bookingForm.userEmail || !bookingForm.visitDate}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {bookingLoading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Tokyo Travel Hub</h3>
              <p className="text-gray-400">Your gateway to amazing Tokyo experiences</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Temples & Shrines</a></li>
                <li><a href="#" className="hover:text-white">Museums</a></li>
                <li><a href="#" className="hover:text-white">Shopping</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tokyo Travel Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}