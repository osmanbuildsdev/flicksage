'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Grid,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Fade,
  Slide,
  useMediaQuery,
  useTheme as useMuiTheme,
  Badge,
  Tooltip,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  PlayArrow,
  Favorite,
  Add,
  BookmarkBorder,
  Bookmark,
  Share,
  Star,
  KeyboardArrowRight,
  ArrowBackIos,
  ArrowForwardIos,
  ArrowForward,
  FiberManualRecord,
  Category,
  LocalFireDepartment,
  AutoAwesome,
  Explore,
  Whatshot,
  NewReleases,
  MovieFilter,
  Analytics,
  Recommend,
  TrendingUp,
  CalendarToday,
  PersonAdd,
  AccessTime,
  DateRange,
  ThumbUp,
  Visibility,
  Info,
  Casino,
  Person,
  History,
  Timeline,
  FilterList,
  SortByAlpha,
  Sort,
  ViewList,
  ViewModule,
  GridView,
} from '@mui/icons-material';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';


const filterInappropriateContent = (movies: TMDBMovie[]): TMDBMovie[] => {

  const inappropriateKeywords = [
    'erotic', 'sexual', 'seduction', 'affair', 'temptation', 'forbidden',
    'passion', 'intimate', 'sensual', 'desire', 'lust', 'steamy',
    'nude', 'naked', 'strip', 'bedroom', 'mature', 'explicit',
    'provocative', 'sultry', 'heated', 'burning', 'fire', 'wild',
    'dangerous', 'obsession', 'addiction', 'sin', 'guilty', 'secret',
    'unleashed', 'raw', 'primal', 'carnal', 'flesh', 'skin',
    'night', 'dark', 'shadow', 'whisper', 'touch', 'caress','sex'
  ];
  

  const suspiciousTitlePatterns = [
    /\b(fifty|50)\s+shades?\b/i,
    /\b(love|sex|desire)\s+(story|affair|game)\b/i,
    /\bnaughty\b/i,
    /\bsexy\b/i,
    /\bhot\b/i,
    /\bwild\b/i,
    /\bsex\b/i,
    /\bborgasm(ic)?\b/i,

  ];
  
  return movies.filter(movie => {

    const titleLower = movie.title.toLowerCase();
    const overviewLower = movie.overview.toLowerCase();
    

    const hasInappropriateKeywords = inappropriateKeywords.some(keyword => 
      titleLower.includes(keyword) || overviewLower.includes(keyword)
    );
    

    const hasSuspiciousTitle = suspiciousTitlePatterns.some(pattern => 
      pattern.test(movie.title)
    );
    

    const hasLowRating = movie.vote_average < 5.5;
    

    const hasLowVoteCount = movie.vote_count < 100;
    

    const shouldKeep = !hasInappropriateKeywords && 
                      !hasSuspiciousTitle && 
                      !hasLowRating && 
                      !hasLowVoteCount;
    

    if (!shouldKeep) {
      console.log(`Filtered out movie: ${movie.title} - Rating: ${movie.vote_average}, Votes: ${movie.vote_count}`);
    }
    
    return shouldKeep;
  });
};


interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBResponse {
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

interface TMDBGenresResponse {
  genres: TMDBGenre[];
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';


const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'popularity.asc', label: 'Least Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'vote_average.asc', label: 'Lowest Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
  { value: 'title.asc', label: 'A-Z' },
  { value: 'title.desc', label: 'Z-A' },
];

const AllGenresPage: React.FC = () => {
  const { mode } = useTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mounted, setMounted] = useState(false);


  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedGenreName, setSelectedGenreName] = useState<string>('All Genres');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [loading, setLoading] = useState(false);
  const [genresLoading, setGenresLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);


  const getGenreIcon = (genreName: string): React.ReactElement => {
    const genreIcons: { [key: string]: React.ReactElement } = {
      'Action': <LocalFireDepartment />,
      'Comedy': <AutoAwesome />,
      'Drama': <Explore />,
      'Horror': <Whatshot />,
      'Science Fiction': <NewReleases />,
      'Thriller': <Analytics />,
      'Adventure': <Explore />,
      'Animation': <AutoAwesome />,
      'Crime': <Analytics />,
      'Documentary': <Visibility />,
      'Family': <Person />,
      'Fantasy': <Casino />,
      'History': <History />,
      'Music': <AutoAwesome />,
      'Mystery': <Analytics />,
      'Romance': <Favorite />,
      'War': <Timeline />,
      'Western': <Explore />,
    };
    return genreIcons[genreName] || <MovieFilter />;
  };

  const getGenreColor = (genreName: string) => {
    const genreColors: { [key: string]: string } = {
      'Action': 'error.main',
      'Comedy': 'warning.main',
      'Drama': 'primary.main',
      'Horror': 'secondary.main',
      'Science Fiction': 'success.main',
      'Thriller': 'info.main',
      'Adventure': 'success.main',
      'Animation': 'warning.main',
      'Crime': 'error.dark',
      'Documentary': 'info.main',
      'Family': 'success.light',
      'Fantasy': 'secondary.light',
      'History': 'primary.dark',
      'Music': 'warning.light',
      'Mystery': 'secondary.dark',
      'Romance': 'error.light',
      'War': 'primary.dark',
      'Western': 'warning.dark',
    };
    return genreColors[genreName] || 'primary.main';
  };


  const fetchGenres = useCallback(async () => {
    try {
      setGenresLoading(true);
      const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&include_adult=false`);
      if (!response.ok) throw new Error('Failed to fetch genres');
      
      const data: TMDBGenresResponse = await response.json();
      setGenres(data.genres);
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError('Failed to load genres. Please try again.');
    } finally {
      setGenresLoading(false);
    }
  }, []);


  const fetchMoviesByGenre = useCallback(async (genreId: number | null, sortBy: string, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&sort_by=${sortBy}&page=${page}`;
      
      if (genreId) {
        url += `&with_genres=${genreId}`;
        

        if (genreId === 10749) { // Romance genre ID
          url += '&certification_country=US&certification.lte=PG-13';
          url += '&vote_count.gte=200'; // Higher vote count requirement
          url += '&vote_average.gte=6.0'; // Minimum rating requirement
          url += '&primary_release_date.gte=2000-01-01'; // Only modern movies (better moderation)
        }
        

        if ([80, 53, 9648].includes(genreId)) { // Crime, Thriller, Mystery
          url += '&vote_count.gte=100';
          url += '&vote_average.gte=5.5';
        }
      }
      

      if (sortBy.includes('vote_average')) {
        url += '&vote_count.gte=200'; // Increased from 100
      }
      

      if (!genreId) {
        url += '&vote_count.gte=150'; // Minimum vote count for general browsing
        url += '&vote_average.gte=5.0'; // Minimum rating
      }
      

      console.log('TMDB API Call:', url);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch movies');
      
      const data: TMDBResponse = await response.json();
      

      let filteredResults = data.results;
      

      if (genreId === 10749 || [80, 53, 9648, 18].includes(genreId || 0)) { 

        filteredResults = filterInappropriateContent(data.results);
        console.log(`Original results: ${data.results.length}, After filtering: ${filteredResults.length}`);
      }
      
      if (page === 1) {
        setMovies(filteredResults);
      } else {
        setMovies(prev => [...prev, ...filteredResults]);
      }
      
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to load movies. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);


  const handleGenreSelect = (genreId: number | null, genreName: string) => {
    setSelectedGenre(genreId);
    setSelectedGenreName(genreName);
    setPage(1);
    fetchMoviesByGenre(genreId, sortBy, 1);
    

    const params = new URLSearchParams();
    if (genreId) {
      params.set('genre', genreId.toString());
    }
    if (sortBy !== 'popularity.desc') {
      params.set('sort', sortBy);
    }
    router.push(`/all-genres${params.toString() ? '?' + params.toString() : ''}`);
  };


  const handleSortChange = (event: SelectChangeEvent) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);
    setPage(1);
    fetchMoviesByGenre(selectedGenre, newSortBy, 1);
    

    const params = new URLSearchParams();
    if (selectedGenre) {
      params.set('genre', selectedGenre.toString());
    }
    if (newSortBy !== 'popularity.desc') {
      params.set('sort', newSortBy);
    }
    router.push(`/all-genres${params.toString() ? '?' + params.toString() : ''}`);
  };


  const loadMoreMovies = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMoviesByGenre(selectedGenre, sortBy, nextPage);
    }
  };


  const toggleWatchlist = (movieId: number) => {
    setWatchlist(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  const toggleFavorites = (movieId: number) => {
    setFavorites(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };


  useEffect(() => {
    setMounted(true);
    
    const genreParam = searchParams.get('genre');
    const sortParam = searchParams.get('sort');
    
    if (genreParam && !isNaN(Number(genreParam))) {
      setSelectedGenre(Number(genreParam));
    }
    
    if (sortParam && SORT_OPTIONS.some(option => option.value === sortParam)) {
      setSortBy(sortParam);
    }
  }, [searchParams]);


  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);


  useEffect(() => {
    if (mounted) {

      if (selectedGenre && genres.length > 0) {
        const genre = genres.find(g => g.id === selectedGenre);
        if (genre) {

          const genreNameMap: { [key: string]: string } = {
            'Science Fiction': 'Sci-Fi'
          };
          setSelectedGenreName(genreNameMap[genre.name] || genre.name);
        }
      }
      
      fetchMoviesByGenre(selectedGenre, sortBy, 1);
    }
  }, [mounted, selectedGenre, sortBy, genres, fetchMoviesByGenre]);


  const MovieCard: React.FC<{ movie: TMDBMovie }> = ({ movie }) => {
    const isInWatchlist = watchlist.includes(movie.id);
    const isInFavorites = favorites.includes(movie.id);

    const getYear = (dateString: string) => {
      return dateString ? new Date(dateString).getFullYear().toString() : 'TBA';
    };

    return (
      <Card
        onClick={() => router.push(`/movie/${movie.id}`)}
        sx={{
          height: 480,
          borderRadius: 2.5,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          overflow: 'hidden',
          position: 'relative',
          background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
          border: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
          boxShadow: mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)' 
            : '0 4px 20px rgba(0,0,0,0.08)',
          '&:hover': {
            transform: 'translateY(-6px) scale(1.01)',
            boxShadow: mode === 'dark' 
              ? '0 12px 40px rgba(0,0,0,0.5)' 
              : '0 12px 40px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'primary.main',
            '& .movie-poster': {
              transform: 'scale(1.05)',
            },
            '& .play-overlay': {
              opacity: 1,
            },
            '& .action-buttons': {
              transform: 'translateY(0)',
              opacity: 1,
            },
            '& .card-content': {
              background: mode === 'light' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            },
            '& .movie-title': {
              color: 'white',
            },
            '& .movie-year': {
              color: 'rgba(255,255,255,0.8)',
            },
            '& .movie-overview': {
              color: 'rgba(255,255,255,0.7)',
            },
          },
        }}
      >
        
        <Box sx={{ 
          position: 'relative', 
          height: 280,
          overflow: 'hidden',
        }}>
          <CardMedia
            className="movie-poster"
            component="img"
            height="100%"
            image={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder-movie.jpg'}
            alt={movie.title}
            sx={{ 
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              width: '100%',
            }}
          />
          
          
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.3) 100%)',
            }}
          />

          
          <Box
            className="play-overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.6)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              backdropFilter: 'blur(2px)',
            }}
          >
            <IconButton
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                width: 56,
                height: 56,
                boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <PlayArrow sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>

          
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: movie.vote_average >= 7 ? 'success.main' : movie.vote_average >= 5 ? 'warning.main' : 'error.main',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <Star sx={{ fontSize: 12 }} />
            <Typography variant="caption" fontWeight={700} fontSize="0.75rem">
              {movie.vote_average.toFixed(1)}
            </Typography>
          </Box>

          
          <Box
            className="action-buttons"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              transform: 'translateY(-10px)',
              opacity: 0,
              transition: 'all 0.3s ease',
            }}
          >
            
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorites(movie.id);
              }}
              sx={{
                bgcolor: isInFavorites ? '#FF6B6B' : 'rgba(255,255,255,0.9)',
                color: isInFavorites ? 'white' : '#FF6B6B',
                width: 36,
                height: 36,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: isInFavorites ? '#FF5252' : 'white',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Favorite sx={{ fontSize: 18 }} />
            </IconButton>

            
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(movie.id);
              }}
              sx={{
                bgcolor: isInWatchlist ? 'primary.main' : 'rgba(255,255,255,0.9)',
                color: isInWatchlist ? 'white' : 'primary.main',
                width: 36,
                height: 36,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: isInWatchlist ? 'primary.dark' : 'white',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {isInWatchlist ? <Bookmark sx={{ fontSize: 18 }} /> : <BookmarkBorder sx={{ fontSize: 18 }} />}
            </IconButton>
          </Box>

          
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="caption" fontSize="0.7rem">
              {movie.vote_count > 1000 ? `${(movie.vote_count / 1000).toFixed(1)}k` : movie.vote_count} votes
            </Typography>
          </Box>
        </Box>

        
        <CardContent 
          className="card-content"
          sx={{
            p: 2.5,
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.3s ease',
            background: mode === 'light' 
              ? '#ffffff'
              : 'rgba(255,255,255,0.02)',
          }}
        >
          
          <Box sx={{ mb: 1.5 }}>
            <Typography
              className="movie-title"
              variant="h6"
              fontWeight={600}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 0.5,
                fontSize: '1rem',
                color: 'text.primary',
                transition: 'color 0.3s ease',
              }}
            >
              {movie.title}
            </Typography>
            
            <Typography
              className="movie-year"
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                transition: 'color 0.3s ease',
              }}
            >
              {getYear(movie.release_date)}
            </Typography>
          </Box>

          
          <Typography
            className="movie-overview"
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              fontSize: '0.85rem',
              transition: 'color 0.3s ease',
              mb: 2,
            }}
          >
            {movie.overview}
          </Typography>

          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: movie.vote_average >= 7 ? 'success.main' : movie.vote_average >= 5 ? 'warning.main' : 'error.main',
                }}
              />
              <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                {movie.vote_average >= 7 ? 'Highly Rated' : movie.vote_average >= 5 ? 'Good' : 'Mixed'}
              </Typography>
            </Box>
            
            <ArrowForward 
              sx={{ 
                fontSize: 16, 
                color: 'text.disabled',
                transition: 'all 0.3s ease',
              }} 
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight={700}
            gutterBottom
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            <MovieFilter sx={{ mr: 2, verticalAlign: 'middle', color: 'primary.main' }} />
            All Genres
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Discover movies by genre and explore our complete collection
          </Typography>
        </Box>

        
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
            Browse by Genre
          </Typography>
          
          {genresLoading ? (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {[...Array(10)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
          ) : (
            <>
              
              <Box sx={{ mb: 2 }}>
                <Chip
                  label="All Genres"
                  icon={<MovieFilter />}
                  onClick={() => handleGenreSelect(null, 'All Genres')}
                  variant={selectedGenre === null ? 'filled' : 'outlined'}
                  color={selectedGenre === null ? 'primary' : 'default'}
                  sx={{
                    mr: 1,
                    mb: 1,
                    height: 40,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: 2,
                    },
                  }}
                />
              </Box>
              
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {genres.map((genre) => (
                  <Chip
                    key={genre.id}
                    label={genre.name}
                    icon={getGenreIcon(genre.name)}
                    onClick={() => handleGenreSelect(genre.id, genre.name)}
                    variant={selectedGenre === genre.id ? 'filled' : 'outlined'}
                    color={selectedGenre === genre.id ? 'primary' : 'default'}
                    sx={{
                      mr: 1,
                      mb: 1,
                      height: 36,
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 1,
                        bgcolor: selectedGenre === genre.id ? 'primary.main' : 'action.hover',
                      },
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Paper>

        
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {selectedGenreName}
              {movies.length > 0 && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  ({movies.length} movies)
                </Typography>
              )}
            </Typography>
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
              startAdornment={<Sort sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        
        {loading && movies.length === 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
                xl: 'repeat(5, 1fr)',
              },
              gap: 3,
            }}
          >
            {[...Array(15)].map((_, index) => (
              <Card key={index} sx={{ height: 480, borderRadius: 2.5 }}>
                <Skeleton variant="rectangular" height={280} />
                <CardContent sx={{ p: 2.5 }}>
                  <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={16} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={14} />
                  <Skeleton variant="text" height={14} />
                  <Skeleton variant="text" height={14} width="70%" />
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : movies.length > 0 ? (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                  xl: 'repeat(5, 1fr)',
                },
                gap: 3,
              }}
            >
              {filterInappropriateContent(movies).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </Box>

            
            {page < totalPages && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={loadMoreMovies}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <KeyboardArrowRight />}
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                  {loading ? 'Loading...' : 'Load More Movies'}
                </Button>
              </Box>
            )}
          </>
        ) : !loading && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <MovieFilter sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              No movies found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try selecting a different genre or changing the sort order.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AllGenresPage;
