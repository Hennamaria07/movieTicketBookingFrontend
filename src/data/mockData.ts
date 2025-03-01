import { Movie, Offer } from '../types/movie'

export const nowShowingMovies: Movie[] = [
  {
    id: '1',
    title: 'The Dark Knight',
    poster: 'https://www.themoviedb.org/t/p/original/2Ka2nOtSlwuFlsHtrtfHKMIjldC.jpg',
    rating: 4.8,
    duration: '2h 32m',
    genre: ['Action', 'Crime', 'Drama'],
    releaseDate: '2024-02-28'
  },
  {
    id: '2',
    title: 'Poor Things',
    posterPath: '/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
    rating: 4.3,
    duration: '141 min',
    genre: ['Comedy', 'Drama', 'Sci-Fi'],
    releaseDate: '2024-01-12'
  },
  {
    id: '3',
    title: 'Kung Fu Panda 4',
    posterPath: '/kDp1vUBnMpe8ak4rjgl3cLELqld.jpg',
    rating: 4.0,
    duration: '94 min',
    genre: ['Animation', 'Action', 'Adventure'],
    releaseDate: '2024-03-08'
  },
  {
    id: '4',
    title: 'Madame Web',
    posterPath: '/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg',
    rating: 3.8,
    duration: '116 min',
    genre: ['Action', 'Sci-Fi'],
    releaseDate: '2024-02-14'
  },
  // Add more movies...
]

export const comingSoonMovies: Movie[] = [
  {
    id: '5',
    title: 'Godzilla x Kong: The New Empire',
    posterPath: '/tMefBSflR6PGQLv7WvFPpKfhHKw.jpg',
    rating: 0,
    duration: '115 min',
    genre: ['Action', 'Sci-Fi', 'Adventure'],
    releaseDate: '2024-03-29'
  },
  {
    id: '6',
    title: 'Civil War',
    posterPath: '/mXLOvGjQyzUWQKrGwrDY7rOYUGC.jpg',
    rating: 0,
    duration: '109 min',
    genre: ['Action', 'Drama'],
    releaseDate: '2024-04-12'
  },
  {
    id: '7',
    title: 'Ghostbusters: Frozen Empire',
    posterPath: '/5Nk5dwuWKUYuEHqzb0jgYVrwkaM.jpg',
    rating: 0,
    duration: '115 min',
    genre: ['Comedy', 'Fantasy', 'Adventure'],
    releaseDate: '2024-03-22'
  },
  {
    id: '8',
    title: 'Mickey 17',
    posterPath: '/8oWiw6nN0UKhPnNQhYBHVT7UhSH.jpg',
    rating: 0,
    duration: 'TBA',
    genre: ['Sci-Fi', 'Adventure'],
    releaseDate: '2024-03-29'
  },
  // Add more movies...
]

export const offers: Offer[] = [
  {
    id: '1',
    title: 'Student Discount',
    description: 'Get 20% off on all movie tickets with valid student ID',
    gradient: 'from-pink-500 to-rose-500',
    code: 'STUDENT20',
    expiryDate: '2024-12-31'
  },
  // Add more offers...
]

// Add banner images data
export const bannerImages = [
  {
    id: '1',
    title: 'Dune: Part Two',
    posterPath: '/jXJxMcVoEuXzym3vFnjqDW4ifo6.jpg',
    backdropPath: '/jXJxMcVoEuXzym3vFnjqDW4ifo6.jpg',
  },
  {
    id: '2',
    title: 'Poor Things',
    posterPath: '/7I6VUdPj6tQECNHdviJkUHD2u89.jpg',
    backdropPath: '/7I6VUdPj6tQECNHdviJkUHD2u89.jpg',
  },
  {
    id: '3',
    title: 'Godzilla x Kong',
    posterPath: '/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg',
    backdropPath: '/uUiIGztTrfDhPdAFJpr6m4UBMAd.jpg', // Godzilla x Kong backdrop
  }
] 