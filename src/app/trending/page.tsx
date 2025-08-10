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
  LinearProgress,
  Avatar,
  Divider,
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
  Timeline,
  BarChart,
  ShowChart,
  FlashOn,
  MovieFilter,
  Visibility,
  ThumbUp,
  EmojiEvents,
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
  popularity: number;
}

interface TMDBResponse {
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

interface TrendingStats {
  totalMovies: number;
  averageRating: number;
  topGenres: { id: number; name: string; count: number }[];
  popularityTrend: number;
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';


const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};


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
      id={`trending-tabpanel-${index}`}
      aria-labelledby={`trending-tab-${index}`}
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
    id: `trending-tab-${index}`,
    'aria-controls': `trending-tabpanel-${index}`,
  };
}

const TrendingPage: React.FC = () => {
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
  const [dailyTrending, setDailyTrending] = useState<TMDBMovie[]>([]);
  const [weeklyTrending, setWeeklyTrending] = useState<TMDBMovie[]>([]);
  const [monthlyTrending, setMonthlyTrending] = useState<TMDBMovie[]>([]);
  const [allTimeTrending, setAllTimeTrending] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState<Record<number, boolean>>({});
  const [isAddingToFavorites, setIsAddingToFavorites] = useState<Record<number, boolean>>({});
  const [trendingStats, setTrendingStats] = useState<TrendingStats | null>(null);


  const fetchTrendingMovies = useCallback(async () => {
    if (!TMDB_API_KEY) {
      setError('TMDB API key is not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [daily, weekly, popular, topRated] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&include_adult=false&page=1`),
        fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&include_adult=false&page=1`),
        fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&include_adult=false&page=1`),
        fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&include_adult=false&page=1`)
      ]);

      const [dailyData, weeklyData, popularData, topRatedData] = await Promise.all([
        daily.json() as Promise<TMDBResponse>,
        weekly.json() as Promise<TMDBResponse>,
        popular.json() as Promise<TMDBResponse>,
        topRated.json() as Promise<TMDBResponse>
      ]);

      setDailyTrending(dailyData.results.slice(0, 20));
      setWeeklyTrending(weeklyData.results.slice(0, 20));
      setMonthlyTrending(popularData.results.slice(0, 20));
      setAllTimeTrending(topRatedData.results.slice(0, 20));


      const allMovies = [...dailyData.results, ...weeklyData.results];
      const genreCounts: Record<number, number> = {};
      let totalRating = 0;
      let totalPopularity = 0;

      allMovies.forEach(movie => {
        totalRating += movie.vote_average;
        totalPopularity += movie.popularity;
        movie.genre_ids.forEach(genreId => {
          genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
        });
      });

      const topGenres = Object.entries(genreCounts)
        .map(([id, count]) => ({
          id: parseInt(id),
          name: GENRE_MAP[parseInt(id)] || 'Unknown',
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTrendingStats({
        totalMovies: allMovies.length,
        averageRating: totalRating / allMovies.length,
        topGenres,
        popularityTrend: totalPopularity / allMovies.length
      });
      
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      setError('Failed to fetch trending movies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingMovies();
  }, [fetchTrendingMovies]);


  const getYear = (dateString: string) => {
    return dateString ? new Date(dateString).getFullYear().toString() : 'TBA';
  };

  const getTrendingIcon = (index: number) => {
    if (index === 0) return <EmojiEvents sx={{ color: '#FFD700' }} />;
    if (index === 1) return <EmojiEvents sx={{ color: '#C0C0C0' }} />;
    if (index === 2) return <EmojiEvents sx={{ color: '#CD7F32' }} />;
    return <ShowChart sx={{ color: 'primary.main' }} />;
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


  const TrendingMovieCard: React.FC<{ 
    movie: TMDBMovie; 
    rank?: number; 
    showTrendingInfo?: boolean;
  }> = ({ movie, rank, showTrendingInfo = false }) => {
    return (
      <Card
        onClick={() => handleMovieClick(movie.id)}
        sx={{
          height: 450,
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
                bgcolor: rank !== undefined && rank < 3 
                  ? (rank === 0 ? '#FFD700' : rank === 1 ? '#C0C0C0' : '#CD7F32')
                  : movie.vote_average >= 7 ? 'success.main' : movie.vote_average >= 5 ? 'warning.main' : 'error.main',
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
              {rank !== undefined ? (
                <>
                  {getTrendingIcon(rank)}
                  <Typography variant="body2" fontWeight={700} fontSize="0.8rem">
                    #{rank + 1}
                  </Typography>
                </>
              ) : (
                <>
                  <Star sx={{ fontSize: 14 }} />
                  <Typography variant="body2" fontWeight={700} fontSize="0.8rem">
                    {movie.vote_average.toFixed(1)}
                  </Typography>
                </>
              )}
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

          
          {showTrendingInfo && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                zIndex: 2,
              }}
            >
              <Chip
                icon={<TrendingUp />}
                label={`${movie.popularity.toFixed(0)} Popularity`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,107,107,0.9)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                }}
              />
            </Box>
          )}
        </Box>

        
        <CardContent 
          className="card-content"
          sx={{
            p: 3,
            height: 170,
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };


  const TrendingAnalytics: React.FC = () => {
    if (!trendingStats) return null;

    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 6,
          borderRadius: 4,
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)'
            : 'linear-gradient(135deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.04) 100%)',
          border: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(33,150,243,0.1)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <BarChart sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>
            Trending Analytics
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 4,
            mb: 4,
          }}
        >
          
          <Box
            sx={{
              textAlign: 'center',
              p: 3,
              borderRadius: 3,
              bgcolor: mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
            }}
          >
            <MovieFilter sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} color="success.main">
              {trendingStats.totalMovies}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trending Movies
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              p: 3,
              borderRadius: 3,
              bgcolor: mode === 'dark' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
              border: '1px solid rgba(255, 152, 0, 0.2)',
            }}
          >
            <Star sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} color="warning.main">
              {trendingStats.averageRating.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Rating
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              p: 3,
              borderRadius: 3,
              bgcolor: mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
            }}
          >
            <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {trendingStats.popularityTrend.toFixed(0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Popularity
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              p: 3,
              borderRadius: 3,
              bgcolor: mode === 'dark' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(156, 39, 176, 0.05)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
            }}
          >
            <FlashOn sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} color="secondary.main">
              {trendingStats.topGenres.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Top Genres
            </Typography>
          </Box>
        </Box>


      </Paper>
    );
  };


  const currentMovies = useMemo(() => {
    switch (activeTab) {
      case 0: return dailyTrending;
      case 1: return weeklyTrending;
      case 2: return monthlyTrending;
      case 3: return allTimeTrending;
      default: return [];
    }
  }, [activeTab, dailyTrending, weeklyTrending, monthlyTrending, allTimeTrending]);

  return (
    <>
      <Header />
      <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          
          <Box sx={{ mb: 6 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h3" fontWeight={700}>
                Trending Analysis
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Deep dive into what's trending across different time periods with detailed analytics
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
              
              <TrendingAnalytics />

              
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
                    icon={<AccessTime />} 
                    label="Today's Trending" 
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
                    label="This Week" 
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
                    icon={<Timeline />} 
                    label="This Month" 
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
                    icon={<EmojiEvents />} 
                    label="All Time Popular" 
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
                      <AccessTime sx={{ color: 'primary.main' }} />
                      <Typography variant="h5" fontWeight={600}>
                        Today's Hottest Movies ({dailyTrending.length})
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
                      {dailyTrending.map((movie, index) => (
                        <TrendingMovieCard 
                          key={movie.id} 
                          movie={movie} 
                          rank={index}
                          showTrendingInfo={true}
                        />
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
                        This Week's Trending ({weeklyTrending.length})
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
                      {weeklyTrending.map((movie, index) => (
                        <TrendingMovieCard 
                          key={movie.id} 
                          movie={movie} 
                          rank={index}
                          showTrendingInfo={true}
                        />
                      ))}
                    </Box>
                  </Box>
                </Fade>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Fade in={activeTab === 2} timeout={800}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                      <Timeline sx={{ color: 'success.main' }} />
                      <Typography variant="h5" fontWeight={600}>
                        Most Popular This Month ({monthlyTrending.length})
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
                      {monthlyTrending.map((movie, index) => (
                        <TrendingMovieCard 
                          key={movie.id} 
                          movie={movie} 
                          rank={index}
                          showTrendingInfo={true}
                        />
                      ))}
                    </Box>
                  </Box>
                </Fade>
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                <Fade in={activeTab === 3} timeout={800}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                      <EmojiEvents sx={{ color: 'warning.main' }} />
                      <Typography variant="h5" fontWeight={600}>
                        All Time Popular Movies ({allTimeTrending.length})
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
                      {allTimeTrending.map((movie, index) => (
                        <TrendingMovieCard 
                          key={movie.id} 
                          movie={movie} 
                          rank={index}
                        />
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

export default TrendingPage;
