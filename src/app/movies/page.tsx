'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Button,
  Paper,
  Chip,
  useMediaQuery,
  useTheme as useMuiTheme,
  Fade,
  Tab,
  Tabs,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import {
  PlayArrow,
  Favorite,
  BookmarkBorder,
  Bookmark,
  Share,
  Star,
  ArrowForward,
  Info,
  Add,
  TrendingUp,
  CalendarToday,
  LocalFireDepartment,
  NewReleases,
  Whatshot,
  AccessTime,
  Schedule,
  Search,
  FilterList,
  Sort,
  Movie,
  Category,
  AutoAwesome,
  Explore,
  Analytics,
  FavoriteOutlined,
} from '@mui/icons-material';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
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

interface TMDBResponse {
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`movies-tabpanel-${index}`}
      aria-labelledby={`movies-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `movies-tab-${index}`,
    'aria-controls': `movies-tabpanel-${index}`,
  };
}

const MoviesPage: React.FC = () => {
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
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));


  const [activeTab, setActiveTab] = useState(0);
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<TMDBMovie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<TMDBMovie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState<Record<number, boolean>>({});
  const [isAddingToFavorites, setIsAddingToFavorites] = useState<Record<number, boolean>>({});


  const fetchMovies = async () => {
    if (!TMDB_API_KEY) {
      setError('TMDB API key is not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [trending, upcoming, nowPlaying, topRated] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&include_adult=false&page=1`),
        fetch(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&include_adult=false&page=1`),
        fetch(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&include_adult=false&page=1`),
        fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&include_adult=false&page=1`)
      ]);

      const [trendingData, upcomingData, nowPlayingData, topRatedData] = await Promise.all([
        trending.json() as Promise<TMDBResponse>,
        upcoming.json() as Promise<TMDBResponse>,
        nowPlaying.json() as Promise<TMDBResponse>,
        topRated.json() as Promise<TMDBResponse>
      ]);

      setTrendingMovies(trendingData.results.filter(isContentAppropriate).slice(0, 20));
      setUpcomingMovies(upcomingData.results.filter(isContentAppropriate).slice(0, 20));
      setNowPlayingMovies(nowPlayingData.results.filter(isContentAppropriate).slice(0, 20));
      setTopRatedMovies(topRatedData.results.filter(isContentAppropriate).slice(0, 20));
      
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);


  const getYear = (dateString: string) => {
    return dateString ? new Date(dateString).getFullYear().toString() : 'TBA';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isUpcoming = (dateString: string) => {
    if (!dateString) return false;
    return new Date(dateString) > new Date();
  };

  const handleMovieClick = (movieId: number) => {
    router.push(`/movie/${movieId}`);
  };

  const handleFavoriteClick = async (e: React.MouseEvent, movieId: number) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
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
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
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


  const MovieCard: React.FC<{ movie: TMDBMovie; showReleaseInfo?: boolean }> = ({ 
    movie, 
    showReleaseInfo = false 
  }) => {
    return (
      <Card
        onClick={() => handleMovieClick(movie.id)}
        sx={{
          height: 420,
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
          height: 260,
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

          
          {showReleaseInfo && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                zIndex: 2,
              }}
            >
              {isUpcoming(movie.release_date) ? (
                <Chip
                  icon={<Schedule />}
                  label="Coming Soon"
                  size="small"
                  sx={{
                    bgcolor: 'info.main',
                    color: 'white',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                  }}
                />
              ) : (
                <Chip
                  icon={<PlayArrow />}
                  label="Now Playing"
                  size="small"
                  sx={{
                    bgcolor: 'success.main',
                    color: 'white',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                  }}
                />
              )}
            </Box>
          )}
        </Box>

        
        <CardContent 
          className="card-content"
          sx={{
            p: 3,
            height: 160,
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
              {showReleaseInfo ? (
                <>
                  {isUpcoming(movie.release_date) ? `Releases: ${formatDate(movie.release_date)}` : `Released: ${getYear(movie.release_date)}`}
                  {' • '}
                  {movie.vote_count > 1000 ? `${(movie.vote_count / 1000).toFixed(1)}k` : movie.vote_count} votes
                </>
              ) : (
                `${getYear(movie.release_date)} • ${movie.vote_count > 1000 ? `${(movie.vote_count / 1000).toFixed(1)}k` : movie.vote_count} votes`
              )}
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };


  const FeaturedTrendingSection: React.FC = () => {
    if (trendingMovies.length === 0) return null;
    
    const featuredMovie = trendingMovies[0];

    return (
      <Box
        sx={{
          position: 'relative',
          height: { xs: 400, sm: 500, md: 600 },
          borderRadius: 4,
          overflow: 'hidden',
          mb: 6,
          background: `linear-gradient(
            135deg,
            rgba(0,0,0,0.7) 0%,
            rgba(0,0,0,0.3) 40%,
            rgba(0,0,0,0.7) 100%
          ), url(${TMDB_BACKDROP_BASE_URL}${featuredMovie.backdrop_path})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          <Box sx={{ maxWidth: { xs: '100%', md: '60%' }, color: 'white' }}>
            <Chip
              icon={<TrendingUp />}
              label="Trending Now #1"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                mb: 2,
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            />
            
            <Typography
              variant={isMobile ? 'h4' : 'h2'}
              component="h1"
              onClick={() => handleMovieClick(featuredMovie.id)}
              sx={{
                fontWeight: 700,
                mb: 2,
                lineHeight: 1.2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {featuredMovie.title}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Chip
                icon={<Star />}
                label={`${featuredMovie.vote_average.toFixed(1)} Rating`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  '& .MuiChip-icon': { color: 'warning.main' },
                }}
              />
              <Chip
                label={getYear(featuredMovie.release_date)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                }}
              />
              <Chip
                icon={<Whatshot />}
                label="Trending"
                sx={{
                  bgcolor: 'rgba(255,107,107,0.3)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  '& .MuiChip-icon': { color: '#FF6B6B' },
                }}
              />
            </Stack>

            <Typography
              variant={isMobile ? 'body1' : 'h6'}
              sx={{
                mb: 4,
                opacity: 0.95,
                lineHeight: 1.6,
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: isMobile ? 3 : 4,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {featuredMovie.overview}
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={() => handleMovieClick(featuredMovie.id)}
                sx={{
                  px: 4,
                  py: 1.5,
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.5)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                View Details
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<Add />}
                onClick={(e) => handleWatchlistClick(e, featuredMovie)}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderColor: 'rgba(255,255,255,0.6)',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Add to Watchlist
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    );
  };


  const isContentAppropriate = (movie: TMDBMovie) => {
    const title = movie.title.toLowerCase();
    const overview = movie.overview?.toLowerCase() || '';
    

    const inappropriateKeywords = [
      'adult', 'porn', 'xxx', 'erotic', 'nude', 'naked', 'sex', 'sexual', 'intimate', 'seduction',
      'stripper', 'prostitute', 'brothel', 'escort', 'affair', 'mistress', 'lover', 'passion',
      'lust', 'desire', 'temptation', 'forbidden', 'sensual', 'steamy', 'hot', 'wild',
      'naughty', 'dirty', 'kinky', 'fetish', 'bdsm', 'dominant', 'submissive', 'bondage',
      'explicit', 'graphic', 'provocative', 'suggestive', 'arousing', 'seductive', 'sultry'
    ];
    
    const hasInappropriateContent = inappropriateKeywords.some(keyword => 
      title.includes(keyword) || overview.includes(keyword)
    );
    

    if (movie.genre_ids && movie.genre_ids.includes(10749)) {
      const romanceBlacklist = [
        'fifty shades', 'after', 'magic mike', 'showgirls', 'basic instinct',
        '365 days', '365 dni', 'nymphomaniac', 'blue is the warmest'
      ];
      
      const hasInappropriateRomance = romanceBlacklist.some(term => 
        title.includes(term) || overview.includes(term)
      );
      
      if (hasInappropriateRomance) return false;
    }
    
    if (movie.vote_average < 5.0 && movie.vote_count > 50) return false;
    if (movie.vote_count < 10) return false;
    if (!movie.poster_path) return false;
    
    return !hasInappropriateContent;
  };


  const filteredTrendingMovies = useMemo(() => 
    trendingMovies.filter(isContentAppropriate), [trendingMovies]
  );
  const filteredUpcomingMovies = useMemo(() => 
    upcomingMovies.filter(isContentAppropriate), [upcomingMovies]
  );
  const filteredNowPlayingMovies = useMemo(() => 
    nowPlayingMovies.filter(isContentAppropriate), [nowPlayingMovies]
  );
  const filteredTopRatedMovies = useMemo(() => 
    topRatedMovies.filter(isContentAppropriate), [topRatedMovies]
  );

  return (
    <>
      <Header />
      <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          
          <Box sx={{ mb: 6 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <LocalFireDepartment sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h3" fontWeight={700}>
                Trending Movies
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Discover what's hot right now and coming soon to theaters
            </Typography>
          </Box>

          
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

          
          {!loading && !error && (
            <>
              
              <FeaturedTrendingSection />

              
              <Paper 
                elevation={0}
                sx={{ 
                  mb: 4, 
                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  border: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 3,
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  centered
                  sx={{
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderRadius: 1.5,
                    },
                  }}
                >
                  <Tab 
                    icon={<TrendingUp />} 
                    label="This Week's Trending" 
                    {...a11yProps(0)}
                    sx={{ 
                      textTransform: 'none', 
                      fontWeight: 600,
                      '&.Mui-selected': {
                        color: 'primary.main',
                      },
                    }}
                  />
                  <Tab 
                    icon={<CalendarToday />} 
                    label="Coming Soon" 
                    {...a11yProps(1)}
                    sx={{ 
                      textTransform: 'none', 
                      fontWeight: 600,
                      '&.Mui-selected': {
                        color: 'primary.main',
                      },
                    }}
                  />
                  <Tab 
                    icon={<NewReleases />} 
                    label="Now Playing" 
                    {...a11yProps(2)}
                    sx={{ 
                      textTransform: 'none', 
                      fontWeight: 600,
                      '&.Mui-selected': {
                        color: 'primary.main',
                      },
                    }}
                  />
                  <Tab 
                    icon={<Star />} 
                    label="Top Rated" 
                    {...a11yProps(3)}
                    sx={{ 
                      textTransform: 'none', 
                      fontWeight: 600,
                      '&.Mui-selected': {
                        color: 'primary.main',
                      },
                    }}
                  />
                </Tabs>
              </Paper>

              
              <TabPanel value={activeTab} index={0}>
                <Fade in={activeTab === 0} timeout={800}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                      <TrendingUp sx={{ color: 'primary.main' }} />
                      <Typography variant="h5" fontWeight={600}>
                        This Week's Most Trending ({filteredTrendingMovies.length})
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, 1fr)',
                          md: 'repeat(3, 1fr)',
                          lg: 'repeat(4, 1fr)',
                          xl: 'repeat(5, 1fr)',
                        },
                        gap: 3,
                      }}
                    >
                      {filteredTrendingMovies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </Box>
                  </Box>
                </Fade>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Fade in={activeTab === 1} timeout={800}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                      <CalendarToday sx={{ color: 'info.main' }} />
                      <Typography variant="h5" fontWeight={600}>
                        Coming Soon to Theaters ({filteredUpcomingMovies.length})
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, 1fr)',
                          md: 'repeat(3, 1fr)',
                          lg: 'repeat(4, 1fr)',
                          xl: 'repeat(5, 1fr)',
                        },
                        gap: 3,
                      }}
                    >
                      {filteredUpcomingMovies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} showReleaseInfo={true} />
                      ))}
                    </Box>
                  </Box>
                </Fade>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Fade in={activeTab === 2} timeout={800}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                      <NewReleases sx={{ color: 'success.main' }} />
                      <Typography variant="h5" fontWeight={600}>
                        Now Playing in Theaters ({filteredNowPlayingMovies.length})
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, 1fr)',
                          md: 'repeat(3, 1fr)',
                          lg: 'repeat(4, 1fr)',
                          xl: 'repeat(5, 1fr)',
                        },
                        gap: 3,
                      }}
                    >
                      {filteredNowPlayingMovies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} showReleaseInfo={true} />
                      ))}
                    </Box>
                  </Box>
                </Fade>
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                <Fade in={activeTab === 3} timeout={800}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                      <Star sx={{ color: 'warning.main' }} />
                      <Typography variant="h5" fontWeight={600}>
                        Top Rated Movies ({filteredTopRatedMovies.length})
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, 1fr)',
                          md: 'repeat(3, 1fr)',
                          lg: 'repeat(4, 1fr)',
                          xl: 'repeat(5, 1fr)',
                        },
                        gap: 3,
                      }}
                    >
                      {filteredTopRatedMovies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </Box>
                  </Box>
                </Fade>
              </TabPanel>
            </>
          )}
        </Container>
      </Box>
    </>
  );
};

export default MoviesPage;
