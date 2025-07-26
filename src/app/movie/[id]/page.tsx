'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  IconButton,
  Paper,
  Avatar,
  Divider,
  Rating,
  useMediaQuery,
  useTheme as useMuiTheme,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Favorite,
  FavoriteBorder,
  Share,
  ArrowBack,
  Star,
  CalendarToday,
  AccessTime,
  Language,
  AttachMoney,
  Movie,
  Person,
  BookmarkBorder,
  Bookmark,
} from '@mui/icons-material';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';


interface TMDBMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  budget: number;
  revenue: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { iso_639_1: string; name: string }[];
  status: string;
  tagline: string;
  homepage: string;
}

interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

interface TMDBCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

interface TMDBCredits {
  cast: TMDBCast[];
  crew: TMDBCrew[];
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

const MovieDetailsPage: React.FC = () => {
  const { mode } = useTheme();
  const { 
    isAuthenticated, 
    addToFavorites, 
    removeFromFavorites, 
    isInFavorites,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    getWatchlistStatus
  } = useAuth();
  const router = useRouter();
  const params = useParams();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [videos, setVideos] = useState<TMDBVideo[]>([]);
  const [credits, setCredits] = useState<TMDBCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [mounted, setMounted] = useState(false);

  const movieId = params?.id as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && movieId) {
      fetchMovieDetails();
    }
  }, [mounted, movieId]);

  const fetchMovieDetails = async () => {
    if (!TMDB_API_KEY) {
      setError('TMDB API key is not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [movieResponse, videosResponse, creditsResponse] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&include_adult=false`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&include_adult=false`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&include_adult=false`)
      ]);

      if (!movieResponse.ok) {
        throw new Error('Movie not found');
      }

      const [movieData, videosData, creditsData] = await Promise.all([
        movieResponse.json() as Promise<TMDBMovieDetails>,
        videosResponse.json() as Promise<{ results: TMDBVideo[] }>,
        creditsResponse.json() as Promise<TMDBCredits>
      ]);

      setMovie(movieData);
      setVideos(videosData.results.filter(video => video.site === 'YouTube'));
      setCredits(creditsData);
    } catch (err) {
      setError('Failed to fetch movie details');
      console.error('Movie details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!movie) return;

    setIsAddingToFavorites(true);
    try {
      if (isInFavorites(movie.id)) {
        await removeFromFavorites(movie.id);
      } else {
        await addToFavorites(movie.id);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  const handleWatchlistClick = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!movie) return;

    setIsAddingToWatchlist(true);
    try {
      if (isInWatchlist(movie.id)) {
        await removeFromWatchlist(movie.id);
      } else {
        await addToWatchlist(movie);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrailer = () => {
    return videos.find(video => 
      video.type === 'Trailer' && video.official
    ) || videos.find(video => video.type === 'Trailer') || videos[0];
  };

  const getDirector = () => {
    return credits?.crew.find(person => person.job === 'Director');
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <>
        <Header />
        <Box
          sx={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <CircularProgress size={48} />
          <Typography variant="h6" color="text.secondary">
            Loading movie details...
          </Typography>
        </Box>
      </>
    );
  }

  if (error || !movie) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error || 'Movie not found'}
          </Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{ mb: 2 }}
          >
            Go Back
          </Button>
        </Container>
      </>
    );
  }

  const trailer = getTrailer();
  const director = getDirector();

  return (
    <>
      <Header />
      <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>        
        <Box
          sx={{
            position: 'relative',
            height: { xs: 500, md: 700 },
            background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%), url(${TMDB_BACKDROP_BASE_URL}${movie.backdrop_path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
              zIndex: 1,
            },
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
            <IconButton
              onClick={() => router.back()}
              sx={{
                position: 'absolute',
                top: { xs: -40, md: -60 },
                left: { xs: -20, md: -40 },
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.9)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ArrowBack />
            </IconButton>            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
              
              <Box sx={{ flex: { xs: 'none', md: '0 0 auto' } }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                  }}
                >
                  <Card
                    elevation={8}
                    sx={{
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder-movie.jpg'}
                      alt={movie.title}
                      sx={{
                        width: { xs: 280, md: 320 },
                        height: { xs: 420, md: 480 },
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </Card>
                </Box>
              </Box>

              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ color: 'white' }}>
                  <Typography 
                    variant={isMobile ? 'h3' : 'h1'} 
                    component="h1" 
                    fontWeight={800} 
                    gutterBottom
                    sx={{
                      fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                      lineHeight: { xs: 1.1, md: 1.2 },
                      color: 'white',
                      mb: 2,
                      letterSpacing: { xs: '-0.02em', md: '-0.03em' },
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    }}
                  >
                    {movie.title}
                  </Typography>

                  {movie.tagline && (
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 3, 
                        fontStyle: 'italic',
                        fontWeight: 500,
                        fontSize: { xs: '1.1rem', md: '1.4rem' },
                        color: 'rgba(255,255,255,0.9)',
                      }}
                    >
                      "{movie.tagline}"
                    </Typography>
                  )}
                  <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
                    <Chip
                      icon={<Star />}
                      label={`⭐ ${movie.vote_average.toFixed(1)}/10`}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        '& .MuiChip-icon': { color: 'warning.main' },
                      }}
                    />
                    <Chip
                      icon={<CalendarToday />}
                      label={new Date(movie.release_date).getFullYear()}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                    <Chip
                      icon={<AccessTime />}
                      label={formatRuntime(movie.runtime)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                    <Chip
                      label={`${movie.vote_count.toLocaleString()} votes`}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                  </Stack>

                  
                  <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap">
                    {movie.genres.map((genre) => (
                      <Chip
                        key={genre.id}
                        label={genre.name}
                        size="small"
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          mb: 1,
                        }}
                      />
                    ))}
                  </Stack>

                  <Typography
                    variant="body1"
                    sx={{
                      mb: 4,
                      lineHeight: 1.6,
                      maxWidth: '80%',
                    }}
                  >
                    {movie.overview}
                  </Typography>

                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {trailer && (
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<PlayArrow />}
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                        sx={{
                          px: 4,
                          py: 1.5,
                          bgcolor: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        Watch Trailer
                      </Button>
                    )}
                    
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={
                        isAddingToFavorites ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <Favorite 
                            sx={{ 
                              color: isInFavorites(movie.id) ? '#FF6B6B' : 'rgba(255,255,255,0.7)',
                            }} 
                          />
                        )
                      }
                      onClick={handleFavoriteClick}
                      disabled={isAddingToFavorites}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderColor: isInFavorites(movie.id) ? '#FF6B6B' : 'rgba(255,255,255,0.6)',
                        color: isInFavorites(movie.id) ? '#FF6B6B' : 'white',
                        bgcolor: isInFavorites(movie.id) ? 'rgba(255, 107, 107, 0.1)' : 'transparent',
                        '&:hover': {
                          borderColor: '#FF6B6B',
                          bgcolor: 'rgba(255, 107, 107, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {isInFavorites(movie.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={
                        isAddingToWatchlist ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : isInWatchlist(movie.id) ? (
                          <Bookmark />
                        ) : (
                          <BookmarkBorder />
                        )
                      }
                      onClick={handleWatchlistClick}
                      disabled={isAddingToWatchlist}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderColor: isInWatchlist(movie.id) ? 'primary.main' : 'rgba(255,255,255,0.6)',
                        color: isInWatchlist(movie.id) ? 'primary.main' : 'white',
                        bgcolor: isInWatchlist(movie.id) ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                        '&:hover': {
                          borderColor: isInWatchlist(movie.id) ? 'primary.light' : 'primary.main',
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {isInWatchlist(movie.id) ? 'In Watchlist' : 'Add to Watchlist'}
                    </Button>

                    <Tooltip title="Share Movie" arrow>
                      <IconButton
                        size="large"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.3)',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <Share />
                      </IconButton>
                    </Tooltip>                  </Stack>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            
            <Box sx={{ flex: { xs: 1, md: 2 } }}>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(156, 39, 176, 0.02) 100%)',
                  transition: 'box-shadow 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Typography 
                  variant="h4" 
                  fontWeight={700} 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2,
                    color: 'primary.main',
                  }}
                >
                  <Movie sx={{ mr: 2, fontSize: 32 }} />
                  Overview
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.8, 
                    fontSize: '1.1rem',
                    color: 'text.primary',
                    mb: 2,
                  }}
                >
                  {movie.overview}
                </Typography>
                
                
                {director && (
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'action.hover', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderWidth: '2px',
                  }}>
                    <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                      🎬 Directed by
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {director.name}
                    </Typography>
                  </Box>
                )}
              </Paper>              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.02) 0%, rgba(255, 193, 7, 0.02) 100%)',
                }}
              >
                <Typography 
                  variant="h4" 
                  fontWeight={700} 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2,
                    color: 'success.main',
                  }}
                >
                  <Star sx={{ mr: 2, fontSize: 32 }} />
                  Movie Details
                </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                  
                  <Box>
                    <Card 
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        border: '2px solid',
                        borderColor: 'warning.main',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <Typography variant="h3" fontWeight={700} color="warning.main" gutterBottom>
                        {movie.vote_average.toFixed(1)}
                      </Typography>
                      <Rating
                        value={movie.vote_average / 2}
                        readOnly
                        precision={0.1}
                        size="large"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Based on {movie.vote_count.toLocaleString()} reviews
                      </Typography>
                    </Card>
                  </Box>

                  
                  <Box>
                    <Card 
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(21, 101, 192, 0.1) 100%)',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <CalendarToday sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {new Date(movie.release_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Release Date
                      </Typography>
                    </Card>
                  </Box>

                  
                  <Box>
                    <Card 
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        border: '2px solid',
                        borderColor: 'secondary.main',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(142, 36, 170, 0.1) 100%)',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <AccessTime sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {formatRuntime(movie.runtime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                    </Card>
                  </Box>
                </Box>

                                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                    {movie.budget > 0 && (
                      <Box>
                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            💰 Budget
                          </Typography>
                          <Typography variant="h6" fontWeight={600}>
                            {formatCurrency(movie.budget)}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {movie.revenue > 0 && (
                      <Box>
                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            💵 Box Office
                          </Typography>
                          <Typography variant="h6" fontWeight={600}>
                            {formatCurrency(movie.revenue)}
                          </Typography>
                          {movie.budget > 0 && (
                            <Typography variant="caption" color="success.main">
                              {((movie.revenue / movie.budget - 1) * 100).toFixed(0)}% profit
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}

                    <Box>
                      <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          🌍 Languages
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {movie.spoken_languages.map(lang => lang.name).join(', ')}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          📊 Status
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {movie.status}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    🎭 Genres
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {movie.genres.map((genre) => (
                      <Chip
                        key={genre.id}
                        label={genre.name}
                        sx={{
                          mb: 1,
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Paper>              
              {credits?.cast && credits.cast.length > 0 && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.02) 0%, rgba(103, 58, 183, 0.02) 100%)',
                  }}
                >
                  <Typography 
                    variant="h4" 
                    fontWeight={700} 
                    gutterBottom 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 2,
                      color: 'secondary.main',
                    }}
                  >
                    <Person sx={{ mr: 2, fontSize: 32 }} />
                    Cast & Characters
                  </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
                    {credits.cast.slice(0, 12).map((actor) => (
                      <Box key={actor.id}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                              borderColor: 'secondary.main',
                              transform: 'translateY(-8px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            },
                          }}
                        >
                          <Avatar
                            src={actor.profile_path ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}` : undefined}
                            sx={{
                              width: 80,
                              height: 80,
                              mx: 'auto',
                              mb: 1.5,
                              border: '3px solid',
                              borderColor: 'secondary.main',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            }}
                          >
                            <Person sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: '0.9rem' }}>
                            {actor.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            as {actor.character}
                          </Typography>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                  
                  {credits.cast.length > 12 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="large"
                        sx={{
                          px: 4,
                          textTransform: 'none',
                          borderRadius: 3,
                        }}
                      >
                        View Full Cast ({credits.cast.length} actors)
                      </Button>
                    </Box>
                  )}
                </Paper>
              )}              
              {trailer && (                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.02) 0%, rgba(255, 87, 34, 0.02) 100%)',
                  }}
                >
                  <Typography 
                    variant="h4" 
                    fontWeight={700} 
                    gutterBottom 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 2,
                      color: 'error.main',
                    }}
                  >
                    <PlayArrow sx={{ mr: 2, fontSize: 32 }} />
                    Official Trailer
                  </Typography>
                  
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    {trailer.name}
                  </Typography>                  <Card
                    elevation={4}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      background: 'linear-gradient(145deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        paddingBottom: '56.25%', // 16:9 aspect ratio
                        height: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1`}
                        title={trailer.name}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </Box>
                  </Card>                </Paper>
              )}
            </Box>

            
            <Box sx={{ flex: { xs: 1, md: 1 } }}>
              {credits?.crew && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4, 
                    mb: 4, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.02) 0%, rgba(103, 58, 183, 0.02) 100%)',
                  }}
                >
                  <Typography 
                    variant="h5" 
                    fontWeight={700} 
                    gutterBottom 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 3,
                      color: 'primary.main',
                    }}
                  >
                    <Person sx={{ mr: 2, fontSize: 28 }} />
                    Key Crew
                  </Typography>
                  
                  {director && (
                    <Card 
                      elevation={0}
                      sx={{ 
                        mb: 3, 
                        p: 3, 
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, rgba(25, 118, 210, 1) 0%, rgba(21, 101, 192, 1) 100%)',
                      }}
                    >
                      <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
                        🎬 Director
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {director.name}
                      </Typography>
                    </Card>
                  )}                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {credits.crew
                      .filter(person => ['Producer', 'Executive Producer', 'Screenplay', 'Writer', 'Director of Photography', 'Music', 'Editor'].includes(person.job))
                      .slice(0, 15)
                      .map((person, index) => (
                        <Card 
                          key={`${person.id}-${index}`} 
                          elevation={0}
                          sx={{ 
                            mb: 2, 
                            p: 2.5, 
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s ease',
                            '&:hover': { 
                              borderColor: 'primary.main',
                              bgcolor: 'action.hover',
                              transform: 'translateX(4px)',
                            },
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="body1" fontWeight={700}>
                                {person.name}
                              </Typography>
                              <Typography variant="body2" color="primary.main" fontWeight={600}>
                                {person.job}
                              </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                              <Person sx={{ fontSize: 18 }} />
                            </Avatar>
                          </Stack>
                        </Card>
                      ))}
                  </Box>
                </Paper>
              )}              
              {movie.production_companies.length > 0 && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4, 
                    mb: 4, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.02) 0%, rgba(139, 195, 74, 0.02) 100%)',
                  }}
                >
                  <Typography 
                    variant="h5" 
                    fontWeight={700} 
                    gutterBottom 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 3,
                      color: 'success.main',
                    }}
                  >
                    <Movie sx={{ mr: 2, fontSize: 28 }} />
                    Production Studios
                  </Typography>
                  <Stack spacing={2}>
                    {movie.production_companies.slice(0, 5).map((company) => (
                      <Card
                        key={company.id}
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          border: '2px solid',
                          borderColor: 'success.main',
                          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'success.dark',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)',
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                            <Movie />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={700} color="success.dark">
                              {company.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Production Company
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Paper>
              )}

              
              {videos.length > 1 && (                <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PlayArrow sx={{ mr: 1 }} />
                    More Videos
                  </Typography>                  <Stack spacing={1} sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    {videos.slice(0, 5).map((video) => (
                      <Button
                        key={video.id}
                        variant="outlined"
                        size="small"
                        startIcon={<PlayArrow />}
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.key}`, '_blank')}
                        sx={{
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          width: '100%',
                          textTransform: 'none',
                          p: 1.5,
                          borderRadius: 2,
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {video.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {video.type}
                          </Typography>
                        </Box>
                      </Button>
                    ))}
                  </Stack>                </Paper>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default MovieDetailsPage;
