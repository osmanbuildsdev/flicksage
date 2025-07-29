'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Stack,
  useMediaQuery,
  useTheme as useMuiTheme,
  Button,
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
  Add,
  MovieFilter,
  LocalFireDepartment,
  Clear,
  Delete,
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
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const FavoritesPage: React.FC = () => {
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
    getWatchlistStatus
  } = useAuth();
  const router = useRouter();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [favoriteMovies, setFavoriteMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState<Record<number, boolean>>({});
  const [isAddingToFavorites, setIsAddingToFavorites] = useState<Record<number, boolean>>({});
  

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12; // 3 satır × 4 kolon = 12 item


  const fetchFavoriteMovies = async () => {
    if (!TMDB_API_KEY) {
      setError('TMDB API key is not configured');
      setLoading(false);
      return;
    }

    if (favorites.length === 0) {
      setFavoriteMovies([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);


      const moviePromises = favorites.map(async (movieId) => {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&include_adult=false`);
        if (response.ok) {
          return await response.json();
        }
        return null;
      });

      const movieResults = await Promise.all(moviePromises);
      const validMovies = movieResults.filter(movie => movie !== null);
      
      setFavoriteMovies(validMovies);
    } catch (error) {
      console.error('Error fetching favorite movies:', error);
      setError('Failed to load favorite movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavoriteMovies();

      setCurrentPage(1);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, favorites]);


  const getYear = (dateString: string) => {
    return dateString ? new Date(dateString).getFullYear().toString() : 'TBA';
  };


  const displayedMovies = favoriteMovies.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMoreMovies = favoriteMovies.length > currentPage * ITEMS_PER_PAGE;

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
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
    return (
      <Card
        onClick={() => handleMovieClick(movie.id)}
        sx={{
          height: isLarge ? 480 : 420,
          borderRadius: 3,
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: mode === 'dark' 
            ? '0 8px 40px rgba(0,0,0,0.4)' 
            : '0 8px 40px rgba(0,0,0,0.1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: mode === 'dark' 
              ? '0 20px 60px rgba(0,0,0,0.6)' 
              : '0 20px 60px rgba(0,0,0,0.15)',
            '& .movie-poster': {
              transform: 'scale(1.1)',
            },
            '& .play-button': {
              opacity: 1,
              transform: 'translate(-50%, -50%) scale(1)',
            },
            '& .hover-actions': {
              opacity: 1,
              transform: 'translateY(0)',
            },
            '& .card-content': {
              background: mode === 'light' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #2C3E50 0%, #4A6741 100%)',
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
          height: isLarge ? 300 : 260,
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
              background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
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
                color: 'primary.main',
                width: 56,
                height: 56,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: 'white',
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
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              }}
            >
              <Star sx={{ fontSize: 14 }} />
              <Typography variant="body2" fontWeight={700} fontSize="0.8rem">
                {movie.vote_average.toFixed(1)}
              </Typography>
            </Box>

            
            <Box sx={{ display: 'flex', gap: 1 }}>
              
              <IconButton
                onClick={(e) => handleWatchlistClick(e, movie)}
                disabled={isAddingToWatchlist[movie.id]}
                sx={{
                  bgcolor: isInWatchlist(movie.id) ? 'primary.main' : 'rgba(255,255,255,0.9)',
                  color: isInWatchlist(movie.id) ? 'white' : 'text.primary',
                  width: 40,
                  height: 40,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: isInWatchlist(movie.id) ? 'primary.dark' : 'white',
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

              
              <IconButton
                onClick={(e) => handleFavoriteClick(e, movie.id)}
                disabled={isAddingToFavorites[movie.id]}
                sx={{
                  bgcolor: isInFavorites(movie.id) ? '#FF6B6B' : 'rgba(255,255,255,0.9)',
                  color: isInFavorites(movie.id) ? 'white' : 'text.primary',
                  width: 40,
                  height: 40,
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
            <Tooltip title={isInWatchlist(movie.id) ? "Remove from Watchlist" : "Add to Watchlist"} arrow>
              <IconButton
                size="small"
                onClick={(e) => handleWatchlistClick(e, movie)}
                disabled={isAddingToWatchlist[movie.id]}
                sx={{
                  bgcolor: isInWatchlist(movie.id) ? 'primary.main' : 'rgba(255,255,255,0.9)',
                  color: isInWatchlist(movie.id) ? 'white' : 'text.primary',
                  width: 36,
                  height: 36,
                  backdropFilter: 'blur(10px)',
                  '&:hover': { 
                    bgcolor: isInWatchlist(movie.id) ? 'primary.dark' : 'primary.main',
                    color: 'white',
                  },
                }}
              >
                {isAddingToWatchlist[movie.id] ? (
                  <CircularProgress size={16} color="inherit" />
                ) : isInWatchlist(movie.id) ? (
                  <Bookmark fontSize="small" />
                ) : (
                  <Add fontSize="small" />
                )}
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
          </Box>
        </Box>

        
        <CardContent 
          className="card-content"
          sx={{
            p: 3,
            height: isLarge ? 180 : 160,
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
                fontSize: '1.1rem',
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
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              fontSize: '0.9rem',
              transition: 'color 0.4s ease',
            }}
          >
            {movie.overview}
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
              <Typography variant="caption" color="text.secondary">
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
      <>
        <Header />
        <Box sx={{ 
          bgcolor: 'background.default', 
          minHeight: { xs: 'calc(100vh - 134px)', sm: 'calc(100vh - 134px)', md: 'calc(100vh - 64px)', lg: 'calc(100vh - 64px)', xl: 'calc(100vh - 64px)' }, // Mobile: 64px header + 70px bottom nav = 134px
          pb: { xs: 10, lg: 4 } // Mobil bottom navigation için extra padding
        }}>
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 8, 
                textAlign: 'center',
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderRadius: 4,
                border: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <LocalFireDepartment sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Login Required
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Please login to view your favorite movies.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/login')}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                }}
              >
                Go to Login
              </Button>
            </Paper>
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header />
      <Box sx={{ 
        bgcolor: 'background.default', 
        minHeight: { xs: 'calc(100vh - 134px)', sm: 'calc(100vh - 134px)', md: 'calc(100vh - 64px)', lg: 'calc(100vh - 64px)', xl: 'calc(100vh - 64px)' }, // Mobile: 64px header + 70px bottom nav = 134px
        pb: { xs: 10, lg: 4 } // Mobil bottom navigation için extra padding
      }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              mb: 4,
              borderRadius: 4,
              background: mode === 'light'
                ? 'linear-gradient(135deg, rgba(255, 105, 135, 0.05) 0%, rgba(255, 20, 147, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(255, 105, 135, 0.1) 0%, rgba(255, 20, 147, 0.1) 100%)',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #FF6B87 0%, #FF1493 100%)',
              }
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
              <LocalFireDepartment sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h3" component="h1" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}>
                  My Favorites
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Your curated collection of favorite movies
                </Typography>
              </Box>
            </Stack>
            
            <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: 'wrap', gap: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                <Favorite sx={{ fontSize: 18 }} />
                {favoriteMovies.length} {favoriteMovies.length === 1 ? 'Movie' : 'Movies'}
              </Box>
              {favoriteMovies.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 107, 135, 0.1)',
                    color: 'text.secondary',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 107, 135, 0.2)',
                  }}
                >
                  <Star sx={{ fontSize: 18 }} />
                  Showing {Math.min(displayedMovies.length, favoriteMovies.length)} of {favoriteMovies.length}
                </Box>
              )}
            </Stack>
          </Paper>

          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          )}

          
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          
          {!loading && !error && favoriteMovies.length === 0 && (
            <Fade in timeout={800}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 8, 
                  textAlign: 'center',
                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderRadius: 4,
                  border: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                }}
              >
                <MovieFilter sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  No Favorites Yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Start adding movies to your favorites to see them here.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/homepage')}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                  }}
                >
                  Discover Movies
                </Button>
              </Paper>
            </Fade>
          )}

          
          {!loading && !error && favoriteMovies.length > 0 && (
            <>
              <Fade in timeout={800}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)',
                      xl: 'repeat(4, 1fr)', // 5'ten 4'e düşürdük
                    },
                    gap: { xs: 2, sm: 3 },
                    px: { xs: 1, sm: 0 },
                  }}
                >
                  {displayedMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </Box>
              </Fade>
              
              
              {hasMoreMovies && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleLoadMore}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(255, 107, 135, 0.3)',
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    Load More ({favoriteMovies.length - displayedMovies.length} more)
                  </Button>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </>
  );
};

export default FavoritesPage;
