import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const tokyoAttractions = [
  {
    name: "Senso-ji Temple",
    description: "Tokyo's oldest temple, dating back to 628 AD. This ancient Buddhist temple features the iconic Thunder Gate and traditional shopping streets.",
    category: "temples",
    location: "Asakusa",
    price: 0,
    duration: "1-2 hours",
    image: "https://images.unsplash.com/photo-1551036351-fb34e1bb59e3?w=800&h=600&fit=crop",
    rating: 4.7,
    reviewCount: 15420,
    tags: '["temple", "historic", "free", "cultural", "photography"]'
  },
  {
    name: "Tokyo Skytree",
    description: "The tallest structure in Japan and second tallest in the world. Enjoy breathtaking 360-degree views of Tokyo from the observation decks.",
    category: "entertainment",
    location: "Sumida",
    price: 2100,
    duration: "2-3 hours",
    image: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&h=600&fit=crop",
    rating: 4.6,
    reviewCount: 28930,
    tags: '["observation", "cityscape", "modern", "photography", "family-friendly"]'
  },
  {
    name: "Meiji Shrine",
    description: "A peaceful oasis dedicated to Emperor Meiji and Empress Shoken. Walk through the forested grounds and experience traditional Japanese spirituality.",
    category: "temples",
    location: "Shibuya",
    price: 0,
    duration: "1-2 hours",
    image: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop",
    rating: 4.8,
    reviewCount: 22150,
    tags: '["shrine", "nature", "free", "spiritual", "peaceful"]'
  },
  {
    name: "Tokyo National Museum",
    description: "Japan's oldest and largest museum, housing over 110,000 cultural artifacts including samurai swords, ceramics, and traditional art.",
    category: "museums",
    location: "Ueno",
    price: 1000,
    duration: "3-4 hours",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    rating: 4.5,
    reviewCount: 12890,
    tags: '["art", "history", "culture", "educational", "indoor"]'
  },
  {
    name: "Shibuya Crossing",
    description: "The world's busiest pedestrian crossing. Experience the organized chaos as thousands cross simultaneously in this iconic Tokyo spectacle.",
    category: "entertainment",
    location: "Shibuya",
    price: 0,
    duration: "30 minutes",
    image: "https://images.unsplash.com/photo-1551036351-fb34e1bb59e3?w=800&h=600&fit=crop",
    rating: 4.4,
    reviewCount: 35670,
    tags: '["free", "iconic", "urban", "photography", "people-watching"]'
  },
  {
    name: "Ueno Park",
    description: "A spacious public park home to several museums, a zoo, and beautiful cherry blossoms in spring. Perfect for picnics and strolls.",
    category: "parks",
    location: "Ueno",
    price: 0,
    duration: "2-3 hours",
    image: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=600&fit=crop",
    rating: 4.6,
    reviewCount: 18760,
    tags: '["free", "nature", "family-friendly", "seasonal", "relaxing"]'
  },
  {
    name: "Tsukiji Outer Market",
    description: "A bustling marketplace famous for fresh seafood, street food, and traditional Japanese culinary delights. A food lover's paradise!",
    category: "food",
    location: "Chuo",
    price: 0,
    duration: "2-3 hours",
    image: "https://images.unsplash.com/photo-1559847260-dc66d52bef19?w=800&h=600&fit=crop",
    rating: 4.7,
    reviewCount: 24380,
    tags: '["food", "free-entry", "seafood", "street-food", "cultural"]'
  },
  {
    name: "Tokyo Disneyland",
    description: "The magical world of Disney in Tokyo. Experience thrilling rides, enchanting shows, and meet your favorite Disney characters.",
    category: "entertainment",
    location: "Maihama",
    price: 8200,
    duration: "Full day",
    image: "https://images.unsplash.com/photo-1590144662036-33bf0ebd2c6d?w=800&h=600&fit=crop",
    rating: 4.8,
    reviewCount: 45230,
    tags: '["theme-park", "family-friendly", "entertainment", "disney", "magical"]'
  },
  {
    name: "Imperial Palace East Garden",
    description: "The former site of Edo Castle, now beautiful gardens offering a glimpse into Japan's feudal history amidst modern Tokyo.",
    category: "parks",
    location: "Chiyoda",
    price: 0,
    duration: "1-2 hours",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    rating: 4.5,
    reviewCount: 12670,
    tags: '["free", "historic", "gardens", "nature", "photography"]'
  },
  {
    name: "Ginza Shopping District",
    description: "Tokyo's premier shopping area featuring luxury brands, department stores, and exclusive boutiques. A paradise for fashion enthusiasts.",
    category: "shopping",
    location: "Ginza",
    price: 0,
    duration: "3-4 hours",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    rating: 4.3,
    reviewCount: 19840,
    tags: '["free-entry", "shopping", "luxury", "fashion", "urban"]'
  },
  {
    name: "Akihabara Electric Town",
    description: "The center of anime, manga, and electronics culture. Explore multi-story arcades, themed cafes, and cutting-edge technology stores.",
    category: "shopping",
    location: "Akihabara",
    price: 0,
    duration: "2-3 hours",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    rating: 4.6,
    reviewCount: 31250,
    tags: '["free-entry", "anime", "electronics", "gaming", "pop-culture"]'
  },
  {
    name: "TeamLab Borderless",
    description: "An immersive digital art museum where boundaries between art and visitor dissolve. Interactive projections create a magical experience.",
    category: "entertainment",
    location: "Odaiba",
    price: 3200,
    duration: "2-3 hours",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    rating: 4.7,
    reviewCount: 28960,
    tags: '["digital-art", "immersive", "modern", "photography", "family-friendly"]'
  }
]

export async function POST(request: NextRequest) {
  try {
    // Clear existing attractions
    await db.attraction.deleteMany({})
    
    // Add new attractions
    const createdAttractions = await db.attraction.createMany({
      data: tokyoAttractions
    })

    return NextResponse.json({ 
      message: `Successfully added ${createdAttractions.count} Tokyo attractions`,
      count: createdAttractions.count
    })
  } catch (error) {
    console.error('Error seeding attractions:', error)
    return NextResponse.json(
      { error: 'Failed to seed attractions' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const count = await db.attraction.count()
    return NextResponse.json({ 
      message: `Database contains ${count} attractions`,
      count: count
    })
  } catch (error) {
    console.error('Error checking attractions:', error)
    return NextResponse.json(
      { error: 'Failed to check attractions' },
      { status: 500 }
    )
  }
}