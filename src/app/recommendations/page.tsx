'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Stack,
  useMediaQuery,
  useTheme as useMuiTheme,
  Paper,
  Fade,
} from '@mui/material';
import {
  PlayArrow,
  Favorite,
  FavoriteBorder,
  BookmarkBorder,
  Bookmark,
  Share,
  Star,
  ArrowForward,
  Info,
  Refresh,
  MovieFilter,
  LocalFireDepartment,
  Clear,
  Casino,
  Shuffle,
} from '@mui/icons-material';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';


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
  genres?: { id: number; name: string }[];
}

interface Genre {
  id: number;
  name: string;
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const RecommendationsPage: React.FC = () => {
  const { mode } = useTheme();
  const { 
    isAuthenticated, 
    favorites, 
    addToFavorites, 
    removeFromFavorites, 
    isInFavorites,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    getWatchlistStatus,
    watchlist
  } = useAuth();
  const router = useRouter();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [recommendedMovies, setRecommendedMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [genresLoading, setGenresLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState<Record<number, boolean>>({});
  const [isAddingToFavorites, setIsAddingToFavorites] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedMovies, setDisplayedMovies] = useState<TMDBMovie[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const MOVIES_PER_PAGE = 12;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchGenres();
  }, [isAuthenticated, router]);


  const fetchGenres = async () => {
    if (!TMDB_API_KEY) {
      setError('TMDB API key is not configured');
      setGenresLoading(false);
      return;
    }

    try {
      setGenresLoading(true);
      const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
      
      if (response.ok) {
        const data = await response.json();
        setGenres(data.genres);
      } else {
        setError('Failed to load genres');
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
      setError('Failed to load genres');
    } finally {
      setGenresLoading(false);
    }
  };


  const fetchMoviesByGenre = async (genreId: number, page: number = 1, isLoadMore: boolean = false) => {
    if (!TMDB_API_KEY) return;

    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setDisplayedMovies([]);
        setHasMore(true);
      }
      setError(null);

      const response = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}&include_adult=false&language=en-US&sort_by=popularity.desc`
      );

      if (response.ok) {
        const data = await response.json();
        let movies = data.results;


        const watchedMovieIds = watchlist
          .filter(item => item.status === 'watched')
          .map(item => item.movieId);

        movies = movies.filter((movie: TMDBMovie) => !watchedMovieIds.includes(movie.id));

        if (isLoadMore) {
          setDisplayedMovies(prev => [...prev, ...movies]);
        } else {
          setDisplayedMovies(movies);
        }
        
        setRecommendedMovies(movies); // Keep for compatibility
        setCurrentPage(page);
        setHasMore(data.page < data.total_pages && movies.length > 0);
      } else {
        setError('Failed to load movie recommendations');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movie recommendations');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };


  const loadMoreMovies = async () => {
    if (!selectedGenre || !hasMore || loadingMore) return;
    
    const nextPage = currentPage + 1;
    await fetchMoviesByGenre(selectedGenre.id, nextPage, true);
  };


  const fetchRandomMovies = async () => {
    if (!selectedGenre || !TMDB_API_KEY) return;

    try {
      setLoadingMovies(true);
      setError(null);


      const randomPage = Math.floor(Math.random() * 20) + 1;
      const response = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${selectedGenre.id}&page=${randomPage}&include_adult=false&language=en-US&sort_by=popularity.desc&vote_count.gte=100`
      );

      if (response.ok) {
        const data = await response.json();
        let movies = data.results;


        const watchedMovieIds = watchlist
          .filter(item => item.status === 'watched')
          .map(item => item.movieId);

        movies = movies.filter((movie: TMDBMovie) => !watchedMovieIds.includes(movie.id));

        if (movies.length > 0) {

          const shuffledMovies = shuffleArray(movies);
          setRecommendedMovies([shuffledMovies[0]]);
        } else {

          const anotherRandomPage = Math.floor(Math.random() * 10) + 1;
          fetchMoviesByGenre(selectedGenre.id, anotherRandomPage);
        }
      } else {
        setError('Failed to load movie recommendation');
      }
    } catch (error) {
      console.error('Error fetching random movie:', error);
      setError('Failed to load movie recommendation');
    } finally {
      setLoadingMovies(false);
    }
  };


  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };


  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
    setDisplayedMovies([]);
    setHasMore(true);
    fetchMoviesByGenre(genre.id, 1);
  };


  const getYear = (dateString: string) => {
    return dateString ? new Date(dateString).getFullYear().toString() : 'TBA';
  };

  const handleMovieClick = (movieId: number) => {
    router.push(`/movie/${movieId}`);
  };

  const handleFavoriteClick = async (e: React.MouseEvent, movieId: number) => {
    e.stopPropagation();
    
    setIsAddingToFavorites(prev => ({ ...prev, [movieId]: true }));
    
    try {
      if (isInFavorites(movieId)) {
        await removeFromFavorites(movieId);
      } else {
        await addToFavorites(movieId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsAddingToFavorites(prev => ({ ...prev, [movieId]: false }));
    }
  };

  const handleWatchlistClick = async (e: React.MouseEvent, movie: TMDBMovie) => {
    e.stopPropagation();
    
    setIsAddingToWatchlist(prev => ({ ...prev, [movie.id]: true }));
    
    try {
      if (isInWatchlist(movie.id)) {
        await removeFromWatchlist(movie.id);
      } else {
        await addToWatchlist(movie);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setIsAddingToWatchlist(prev => ({ ...prev, [movie.id]: false }));
    }
  };


  const MovieCard: React.FC<{ movie: TMDBMovie; isLarge?: boolean }> = ({ movie, isLarge = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Card
        elevation={0}
        onClick={() => handleMovieClick(movie.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: isLarge ? { xs: 480, md: 520 } : 420,
          width: isLarge ? { xs: 320, md: 420 } : { xs: 280, md: 300 },
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          background: mode === 'light' 
            ? '#ffffff' 
            : '#1a1a1a',
          border: '1px solid',
          borderColor: mode === 'light' 
            ? 'rgba(0,0,0,0.08)' 
            : 'rgba(255,255,255,0.12)',
          boxShadow: mode === 'light'
            ? '0 4px 20px rgba(0,0,0,0.08)'
            : '0 4px 20px rgba(0,0,0,0.3)',
          '&:hover': {
            transform: 'translateY(-12px) scale(1.02)',
            boxShadow: mode === 'light'
              ? '0 25px 70px rgba(0,0,0,0.2)'
              : '0 25px 70px rgba(0,0,0,0.6)',
            borderColor: 'secondary.main',
            '& .movie-poster': {
              transform: 'scale(1.08)',
            },
            '& .hover-actions': {
              opacity: 1,
              transform: 'translateY(0)',
            },
            '& .play-button': {
              opacity: 1,
              transform: 'translate(-50%, -50%) scale(1)',
            },
            '& .card-content': {
              background: mode === 'light' 
                ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' 
                : 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
              color: 'white',
            },
            '& .movie-title': {
              color: 'white',
            },
            '& .movie-stats': {
              color: 'rgba(255,255,255,0.9)',
            },
            '& .movie-overview': {
              color: 'rgba(255,255,255,0.8)',
            },
          },
        }}
      >
        
        <Box sx={{ 
          position: 'relative', 
          height: isLarge ? { xs: 280, md: 320 } : 260,
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
              transition: 'transform 0.4s ease',
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
              background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
            }}
          />

          
          <Box
            className="play-button"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) scale(0.8)',
              opacity: 0,
              transition: 'all 0.3s ease',
              zIndex: 3,
            }}
          >
            <IconButton
              sx={{
                bgcolor: 'rgba(255,255,255,0.95)',
                color: 'secondary.main',
                width: { xs: 56, md: 64 },
                height: { xs: 56, md: 64 },
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <PlayArrow sx={{ fontSize: { xs: 28, md: 32 } }} />
            </IconButton>
          </Box>

          
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              right: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              zIndex: 2,
            }}
          >
            
            <Box
              sx={{
                bgcolor: movie.vote_average >= 7 ? 'success.main' : movie.vote_average >= 5 ? 'warning.main' : 'error.main',
                color: 'white',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              }}
            >
              <Star sx={{ fontSize: 16 }} />
              <Typography variant="body2" fontWeight={700} fontSize="0.85rem">
                {movie.vote_average.toFixed(1)}
              </Typography>
            </Box>

            
            <Box sx={{ display: 'flex', gap: 1 }}>
              
              <IconButton
                onClick={(e) => handleFavoriteClick(e, movie.id)}
                disabled={isAddingToFavorites[movie.id]}
                sx={{
                  bgcolor: isInFavorites(movie.id) ? '#FF6B6B' : 'rgba(255,255,255,0.9)',
                  color: isInFavorites(movie.id) ? 'white' : 'text.primary',
                  width: { xs: 38, md: 42 },
                  height: { xs: 38, md: 42 },
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: isInFavorites(movie.id) ? '#FF5252' : 'white',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {isAddingToFavorites[movie.id] ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <Favorite 
                    fontSize="small" 
                    sx={{ 
                      color: isInFavorites(movie.id) ? 'white' : '#FF6B6B',
                      filter: isInFavorites(movie.id) ? 'none' : 'grayscale(100%)',
                      opacity: isInFavorites(movie.id) ? 1 : 0.6
                    }} 
                  />
                )}
              </IconButton>

              
              <IconButton
                onClick={(e) => handleWatchlistClick(e, movie)}
                disabled={isAddingToWatchlist[movie.id]}
                sx={{
                  bgcolor: isInWatchlist(movie.id) ? 'secondary.main' : 'rgba(255,255,255,0.9)',
                  color: isInWatchlist(movie.id) ? 'white' : 'text.primary',
                  width: { xs: 38, md: 42 },
                  height: { xs: 38, md: 42 },
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: isInWatchlist(movie.id) ? 'secondary.dark' : 'white',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {isAddingToWatchlist[movie.id] ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  isInWatchlist(movie.id) ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>

          
          <Box
            className="hover-actions"
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'all 0.3s ease',
              display: 'flex',
              gap: 1,
              zIndex: 2,
            }}
          >
            <Tooltip title="More Info" arrow>
              <IconButton
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: 'text.primary',
                  width: 36,
                  height: 36,
                  backdropFilter: 'blur(10px)',
                  '&:hover': { 
                    bgcolor: 'info.main',
                    color: 'white',
                  },
                }}
              >
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Share" arrow>
              <IconButton
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: 'text.primary',
                  width: 36,
                  height: 36,
                  backdropFilter: 'blur(10px)',
                  '&:hover': { 
                    bgcolor: 'secondary.main',
                    color: 'white',
                  },
                }}
              >
                <Share fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        
        <CardContent 
          className="card-content"
          sx={{
            p: { xs: 2.5, md: 3 },
            height: isLarge ? { xs: 200, md: 200 } : 160,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.4s ease',
            background: mode === 'light' 
              ? '#ffffff'
              : '#1a1a1a',
          }}
        >
          
          <Box sx={{ mb: 2 }}>
            <Typography
              className="movie-title"
              variant="h6"
              fontWeight={700}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 0.5,
                fontSize: { xs: '1.05rem', md: '1.15rem' },
                color: 'text.primary',
                transition: 'color 0.4s ease',
              }}
            >
              {movie.title}
            </Typography>
            
            <Typography
              className="movie-stats"
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                transition: 'color 0.4s ease',
                fontSize: { xs: '0.8rem', md: '0.875rem' },
              }}
            >
              {getYear(movie.release_date)} • {movie.vote_count > 1000 ? `${(movie.vote_count / 1000).toFixed(1)}k` : movie.vote_count} votes
            </Typography>
          </Box>

          
          <Typography
            className="movie-overview"
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: isLarge ? { xs: 3, md: 4 } : 3,
              WebkitBoxOrient: 'vertical',
              fontSize: { xs: '0.85rem', md: '0.9rem' },
              transition: 'color 0.4s ease',
            }}
          >
            {movie.overview || 'No overview available'}
          </Typography>

          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 2,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: movie.vote_average >= 7 ? 'success.main' : movie.vote_average >= 5 ? 'warning.main' : 'error.main',
                }}
              />
              <Typography variant="caption" color="text.secondary" fontSize={{ xs: '0.7rem', md: '0.75rem' }}>
                {movie.vote_average >= 7 ? 'Highly Rated' : movie.vote_average >= 5 ? 'Good' : 'Mixed Reviews'}
              </Typography>
            </Box>
            
            <ArrowForward 
              sx={{ 
                fontSize: 18, 
                color: 'text.disabled',
                transition: 'all 0.3s ease',
              }} 
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: mode === 'dark' ? '#0a0a0a' : '#f8f9fa',
          pt: 4,
          pb: 6,
        }}
      >
        <Container maxWidth="xl">
          
          {genresLoading ? (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Loading categories...
              </Typography>
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 2,
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid',
                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MovieFilter />
                Choose a Category
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {genres.map((genre) => (
                  <Chip
                    key={genre.id}
                    label={genre.name}
                    onClick={() => handleGenreSelect(genre)}
                    variant={selectedGenre?.id === genre.id ? 'filled' : 'outlined'}
                    color={selectedGenre?.id === genre.id ? 'primary' : 'default'}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )}

          
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 4 }}
              action={
                <Button color="inherit" size="small" onClick={() => setError(null)}>
                  Close
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          
          {selectedGenre && (
            <Box>
              <Typography 
                variant="h5" 
                fontWeight={600} 
                sx={{ mb: 4, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
              >
                <LocalFireDepartment sx={{ color: 'primary.main' }} />
                Our {selectedGenre.name} Recommendation
              </Typography>

              {loading ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CircularProgress size={60} />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Preparing your movie recommendation...
                  </Typography>
                </Box>
              ) : recommendedMovies.length === 0 ? (
                <Paper
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    No unwatched movies found in this category
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try selecting a different category
                  </Typography>
                </Paper>
              ) : (
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '70vh',
                  gap: { xs: 4, md: 8 },
                  px: 2,
                }}>
                  
                  <Fade in={true} timeout={500}>
                    <Box sx={{ flex: '0 0 auto' }}>
                      <MovieCard movie={recommendedMovies[0]} isLarge />
                    </Box>
                  </Fade>
                  
                  
                  <Box sx={{ flex: '0 0 auto', textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={fetchRandomMovies}
                      disabled={loadingMovies}
                      sx={{
                        width: { xs: 80, md: 120 },
                        height: { xs: 80, md: 120 },
                        borderRadius: '50%',
                        minWidth: 'unset',
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontSize: '2rem',
                        boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                          transform: 'scale(1.1)',
                          boxShadow: '0 12px 35px rgba(33, 150, 243, 0.4)',
                        },
                        '&:disabled': {
                          bgcolor: 'action.disabled',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {loadingMovies ? (
                        <CircularProgress size={40} color="inherit" />
                      ) : (
                        <Shuffle sx={{ fontSize: { xs: 40, md: 60 } }} />
                      )}
                    </Button>
                    <Typography 
                      variant="h6" 
                      fontWeight={600}
                      sx={{ 
                        mt: 2, 
                        color: loadingMovies ? 'text.disabled' : 'primary.main',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      New Suggestion
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontStyle: 'italic'
                      }}
                    >
                      Unwatched movies
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          
          {!selectedGenre && !genresLoading && (
            <Paper
              sx={{
                p: 8,
                textAlign: 'center',
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
              }}
            >
              <Casino sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2 }}>
                Choose a Category
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Select a category above to get personalized movie recommendations
              </Typography>
            </Paper>
          )}
        </Container>
      </Box>
    </>
  );
};

export default RecommendationsPage;
