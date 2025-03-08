export interface Movie {
  id: string
  title: string
  poster: string
  rating: number
  duration: string
  releaseDate?: string
  genre: string[]
}

export interface Offer {
  id: string
  title: string
  description: string
  gradient: string
  code: string
  expiryDate: string
} 