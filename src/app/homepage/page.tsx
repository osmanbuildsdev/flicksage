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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
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
  Recommend as SimilarMovies,
  Timeline,
  SmartToy,
  Close,
  Send,
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

interface TMDBResponse {
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

const HomePage: React.FC = () => {
  const { mode } = useTheme();
  const { isAuthenticated, token, favorites } = useAuth();
  const router = useRouter();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mounted, setMounted] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [popularMovies, setPopularMovies] = useState<TMDBMovie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMovie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<TMDBMovie[]>([]);
  const [dailyPicks, setDailyPicks] = useState<TMDBMovie[]>([]); // Günün filmleri
  const [recommendedMovies, setRecommendedMovies] = useState<TMDBMovie[]>([]);
  const [actionMovies, setActionMovies] = useState<TMDBMovie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<TMDBMovie[]>([]);
  const [dramaMovies, setDramaMovies] = useState<TMDBMovie[]>([]);
  const [horrorMovies, setHorrorMovies] = useState<TMDBMovie[]>([]);
  const [sciFiMovies, setSciFiMovies] = useState<TMDBMovie[]>([]);

  const [similarMovies, setSimilarMovies] = useState<TMDBMovie[]>([]);
  const [moviesBy80s, setMoviesBy80s] = useState<TMDBMovie[]>([]);
  const [moviesBy90s, setMoviesBy90s] = useState<TMDBMovie[]>([]);
  const [moviesBy2000s, setMoviesBy2000s] = useState<TMDBMovie[]>([]);
  const [moviesBy2010s, setMoviesBy2010s] = useState<TMDBMovie[]>([]);
  const [randomMovies, setRandomMovies] = useState<TMDBMovie[]>([]);
  const [actorMovies, setActorMovies] = useState<{ actorName: string; movies: TMDBMovie[] }>({ actorName: '', movies: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [aiMovies, setAiMovies] = useState<TMDBMovie[]>([]);
  

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchMovies();
    }
  }, [mounted]);  const fetchMovies = async () => {
    if (!TMDB_API_KEY) {
      setError('TMDB API key is not configured. Please add your TMDB API key to .env.local');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      

      const today = new Date();
      const seedNumber = Math.floor(today.getTime() / (12 * 60 * 60 * 1000)); // Her 12 saatte bir değişir
      
      const [trending, popular, topRated, upcoming, nowPlaying, action, comedy, drama, horror, sciFi, movies80s, movies90s, movies2000s, movies2010s, randomPage] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&include_adult=false`),
        fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&include_adult=false`),
        fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&include_adult=false`),
        fetch(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&include_adult=false`),
        fetch(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&include_adult=false&page=${((seedNumber % 3) + 1)}`),

        fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&with_genres=28&sort_by=popularity.desc`),
        fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&with_genres=35&sort_by=popularity.desc`),
        fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&with_genres=18&sort_by=vote_average.desc&vote_count.gte=1000`),
        fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&with_genres=27&sort_by=popularity.desc`),
        fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&with_genres=878&sort_by=popularity.desc`),

        fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&primary_release_date.gte=1980-01-01&primary_release_date.lte=1989-12-31&sort_by=popularity.desc`),
        fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&primary_release_date.gte=1990-01-01&primary_release_date.lte=1999-12-31&sort_by=popularity.desc`),
        fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31&sort_by=popularity.desc`),
        fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&primary_release_date.gte=2010-01-01&primary_release_date.lte=2019-12-31&sort_by=popularity.desc`),

        fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&sort_by=popularity.desc&page=${Math.floor(Math.random() * 10) + 1}`)
      ]);

      const [trendingData, popularData, topRatedData, upcomingData, nowPlayingData, actionData, comedyData, dramaData, horrorData, sciFiData, movies80sData, movies90sData, movies2000sData, movies2010sData, randomData] = await Promise.all([
        trending.json() as Promise<TMDBResponse>,
        popular.json() as Promise<TMDBResponse>,
        topRated.json() as Promise<TMDBResponse>,
        upcoming.json() as Promise<TMDBResponse>,
        nowPlaying.json() as Promise<TMDBResponse>,
        action.json() as Promise<TMDBResponse>,
        comedy.json() as Promise<TMDBResponse>,
        drama.json() as Promise<TMDBResponse>,
        horror.json() as Promise<TMDBResponse>,
        sciFi.json() as Promise<TMDBResponse>,
        movies80s.json() as Promise<TMDBResponse>,
        movies90s.json() as Promise<TMDBResponse>,
        movies2000s.json() as Promise<TMDBResponse>,
        movies2010s.json() as Promise<TMDBResponse>,
        randomPage.json() as Promise<TMDBResponse>
      ]);

      setTrendingMovies(trendingData.results.filter(isContentAppropriate).slice(0, 8));
      setPopularMovies(popularData.results.filter(isContentAppropriate).slice(0, 8));
      setTopRatedMovies(topRatedData.results.filter(isContentAppropriate).slice(0, 8));
      setUpcomingMovies(upcomingData.results.filter(isContentAppropriate).slice(0, 8));
      setActionMovies(actionData.results.filter(isContentAppropriate).slice(0, 8));
      setComedyMovies(comedyData.results.filter(isContentAppropriate).slice(0, 8));
      setDramaMovies(dramaData.results.filter(isContentAppropriate).slice(0, 8));
      setHorrorMovies(horrorData.results.filter(isContentAppropriate).slice(0, 8));
      setSciFiMovies(sciFiData.results.filter(isContentAppropriate).slice(0, 8));
      

      setMoviesBy80s(movies80sData.results.filter(isContentAppropriate).slice(0, 8));
      setMoviesBy90s(movies90sData.results.filter(isContentAppropriate).slice(0, 8));
      setMoviesBy2000s(movies2000sData.results.filter(isContentAppropriate).slice(0, 8));
      setMoviesBy2010s(movies2010sData.results.filter(isContentAppropriate).slice(0, 8));
      setRandomMovies(randomData.results.filter(isContentAppropriate).slice(0, 8));
      

      const similarCombined = [
        ...actionData.results.filter(isContentAppropriate).slice(0, 3),
        ...dramaData.results.filter(isContentAppropriate).slice(0, 3),
        ...comedyData.results.filter(isContentAppropriate).slice(0, 2)
      ];
      setSimilarMovies(shuffleArrayWithSeed(similarCombined, seedNumber + 2).slice(0, 8));
      


      const mockActorName = "Popular Actors Collection";
      setActorMovies({
        actorName: mockActorName,
        movies: popularData.results.slice(8, 16) // Different slice for variety
      });
      

      const recommendedCombined = [
        ...popularData.results.slice(0, 6),
        ...topRatedData.results.slice(0, 6),
        ...trendingData.results.slice(0, 4)
      ];
      const shuffledRecommended = shuffleArrayWithSeed(recommendedCombined, seedNumber + 1);
      const uniqueRecommended = shuffledRecommended.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );
      setRecommendedMovies(uniqueRecommended.slice(0, 8));
      

      const allDailyMovies = [
        ...trendingData.results.slice(0, 10),
        ...nowPlayingData.results.slice(0, 10),
        ...popularData.results.slice(0, 5)
      ];
      

      const shuffled = shuffleArrayWithSeed(allDailyMovies, seedNumber);
      const uniqueMovies = shuffled.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );
      
      setDailyPicks(uniqueMovies.slice(0, 5));
      
    } catch (err) {
      setError('Failed to fetch movies from TMDB');
      console.error('TMDB API Error:', err);
    } finally {
      setLoading(false);
    }
  };


  const shuffleArrayWithSeed = (array: TMDBMovie[], seed: number) => {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    let temporaryValue, randomIndex;


    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    while (0 !== currentIndex) {
      randomIndex = Math.floor(seededRandom(seed + currentIndex) * currentIndex);
      currentIndex -= 1;

      temporaryValue = shuffled[currentIndex];
      shuffled[currentIndex] = shuffled[randomIndex];
      shuffled[randomIndex] = temporaryValue;
    }

    return shuffled;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  const getYear = (dateString: string) => {
    return new Date(dateString).getFullYear();  };  const MovieCard: React.FC<{ movie: TMDBMovie; isLarge?: boolean }> = ({ movie, isLarge = false }) => {
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
    const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
    const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    const handleFavoriteClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
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
    };    const handleWatchlistClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login');
        router.push('/login');
        return;
      }
      
      setIsAddingToWatchlist(true);
      try {
        let success = false;
        if (isInWatchlist(movie.id)) {
          success = await removeFromWatchlist(movie.id);
        } else {
          success = await addToWatchlist(movie);
        }
        
        if (!success) {
          console.error('Watchlist operation failed');

          alert('İşlem başarısız. Lütfen tekrar giriş yapın.');
        }
      } catch (error) {
        console.error('Error updating watchlist:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setIsAddingToWatchlist(false);
      }
    };

    return (
      <Card
        elevation={0}
        onClick={() => router.push(`/movie/${movie.id}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: isLarge ? 480 : 420,
          width: '100%',
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
            ? '0 4px 20px rgba(0,0,0,0.06)'
            : '0 4px 20px rgba(0,0,0,0.3)',
          '&:hover': {
            transform: 'translateY(-12px) scale(1.02)',
            boxShadow: mode === 'light'
              ? '0 20px 60px rgba(0,0,0,0.15)'
              : '0 20px 60px rgba(0,0,0,0.5)',
            borderColor: 'primary.main',
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
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'linear-gradient(135deg, #434343 0%, #000000 100%)',
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
                onClick={handleWatchlistClick}
                disabled={isAddingToWatchlist}
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
                {isAddingToWatchlist ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  isInWatchlist(movie.id) ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />
                )}
              </IconButton>

              
              <IconButton
                onClick={handleFavoriteClick}
                disabled={isAddingToFavorites}
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
                {isAddingToFavorites ? (
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
          >            <Tooltip title={isInWatchlist(movie.id) ? "Remove from Watchlist" : "Add to Watchlist"} arrow>
              <IconButton
                size="small"
                onClick={handleWatchlistClick}
                disabled={isAddingToWatchlist}
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
                {isAddingToWatchlist ? (
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
  const MovieSection: React.FC<{
    title: string;
    movies: TMDBMovie[];
    icon: React.ReactNode;
    color?: string;
    showMore?: boolean;
  }> = ({ title, movies, icon, color = 'primary.main', showMore = true }) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(true);

    const checkScrollButtons = useCallback(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    }, []);

    const scrollLeft = () => {
      if (scrollContainerRef.current) {
        const cardWidth = isMobile ? 220 : 300; // Approximate card width with gap
        scrollContainerRef.current.scrollBy({
          left: -cardWidth * 2, // Scroll 2 cards at a time
          behavior: 'smooth',
        });
      }
    };

    const scrollRight = () => {
      if (scrollContainerRef.current) {
        const cardWidth = isMobile ? 220 : 300; // Approximate card width with gap
        scrollContainerRef.current.scrollBy({
          left: cardWidth * 2, // Scroll 2 cards at a time
          behavior: 'smooth',
        });
      }
    };

    React.useEffect(() => {
      checkScrollButtons();
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', checkScrollButtons);
        return () => scrollContainer.removeEventListener('scroll', checkScrollButtons);
      }
    }, [checkScrollButtons, movies]);

    return (
      <Box sx={{ mb: 6 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ color }}>{icon}</Box>
            <Typography variant="h5" fontWeight={600} color="text.primary">
              {title}
            </Typography>
          </Stack>
          {showMore && (
            <Button
              endIcon={<KeyboardArrowRight />}
              sx={{ textTransform: 'none' }}
            >
              View All
            </Button>
          )}
        </Stack>
        
        
        <Box sx={{ position: 'relative' }}>
          
          <IconButton
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            sx={{
              position: 'absolute',
              left: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
              color: mode === 'dark' ? 'white' : 'black',
              width: 40,
              height: 40,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,1)',
                transform: 'translateY(-50%) scale(1.1)',
              },
              '&:disabled': {
                opacity: 0.3,
                cursor: 'not-allowed',
              },
              transition: 'all 0.2s ease-in-out',
              display: { xs: 'none', md: 'flex' }, // Only show on desktop
            }}
          >
            <ArrowBackIos sx={{ fontSize: 18 }} />
          </IconButton>

          
          <IconButton
            onClick={scrollRight}
            disabled={!canScrollRight}
            sx={{
              position: 'absolute',
              right: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
              color: mode === 'dark' ? 'white' : 'black',
              width: 40,
              height: 40,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,1)',
                transform: 'translateY(-50%) scale(1.1)',
              },
              '&:disabled': {
                opacity: 0.3,
                cursor: 'not-allowed',
              },
              transition: 'all 0.2s ease-in-out',
              display: { xs: 'none', md: 'flex' }, // Only show on desktop
            }}
          >
            <ArrowForwardIos sx={{ fontSize: 18 }} />
          </IconButton>

                    <Box
            ref={scrollContainerRef}
            sx={{
              display: 'flex',
              overflowX: 'auto',
              overflowY: 'hidden',
              gap: 3,
              pb: 2,
              scrollbarWidth: 'none', // Firefox
              '&::-webkit-scrollbar': { // Chrome/Safari
                display: 'none',
              },

              '@media (max-width: 900px)': {
                '&::-webkit-scrollbar': {
                  height: 8,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  borderRadius: 4,
                },
              },
            }}
          >
            {movies.map((movie, index) => (
              <Box 
                key={`${title.replace(/\s+/g, '-').toLowerCase()}-${movie.id}-${index}`} 
                className="movie-card-container"
                sx={{ 
                  minWidth: { xs: 200, sm: 250, md: 280 },
                  maxWidth: { xs: 220, sm: 270, md: 300 },
                  flexShrink: 0,
                }}
              >
                <MovieCard movie={movie} isLarge={false} />
              </Box>
            ))}
          </Box>

          
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
              mt: 2,
            }}
          >
            <Chip
              label="Swipe to explore →"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: 'text.secondary',
              }}
            />
          </Box>
        </Box>
      </Box>
    );

  };

  const FeaturedSection: React.FC<{ movie: TMDBMovie }> = ({ movie }) => (
    <Box
      sx={{
        position: 'relative',
        height: 500,
        borderRadius: 3,
        overflow: 'hidden',
        mb: 6,
        background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${TMDB_BACKDROP_BASE_URL}${movie.backdrop_path})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',          zIndex: 2,
        }}
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Box sx={{ color: 'white', maxWidth: '66%' }}>
            <Chip
              label="Featured Movie"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                mb: 2,
              }}
            />
            <Typography variant="h2" component="h1" fontWeight={700} gutterBottom>
              {movie.title}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Chip
                icon={<Star />}
                label={`${movie.vote_average.toFixed(1)} Rating`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                label={formatDate(movie.release_date)}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Stack>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.9,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {movie.overview}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                sx={{ px: 4, py: 1.5 }}
              >
                Watch Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Add />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Add to List
              </Button>            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );


  const nextSlide = useCallback(() => {
    if (dailyPicks.length === 0) return;
    setSlideDirection('right');
    setCurrentSlide((prev) => (prev + 1) % dailyPicks.length);
  }, [dailyPicks.length]);

  const prevSlide = useCallback(() => {
    if (dailyPicks.length === 0) return;
    setSlideDirection('left');
    setCurrentSlide((prev) => (prev - 1 + dailyPicks.length) % dailyPicks.length);
  }, [dailyPicks.length]);

  const goToSlide = useCallback((index: number) => {
    if (dailyPicks.length === 0) return;
    setSlideDirection(index > currentSlide ? 'right' : 'left');
    setCurrentSlide(index);
  }, [currentSlide, dailyPicks.length]);


  useEffect(() => {
    if (!isAutoPlaying || dailyPicks.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // 5 saniyede bir değişir

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, dailyPicks.length]);


  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);


  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [prevSlide, nextSlide]);  // Animasyonlu Daily Picks Slider Component
  const DailyPicksSlider: React.FC = () => {
    if (dailyPicks.length === 0) return null;
    
    const { 
      isAuthenticated, 
      addToFavorites, 
      removeFromFavorites, 
      isInFavorites,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist 
    } = useAuth();
    const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
    const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);

    const currentMovie = dailyPicks[currentSlide];

    const handleAddToFavorites = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      setIsAddingToFavorites(true);
      try {
        if (isInFavorites(currentMovie.id)) {
          await removeFromFavorites(currentMovie.id);
        } else {
          await addToFavorites(currentMovie.id);
        }
      } catch (error) {
        console.error('Error updating favorites:', error);
      } finally {
        setIsAddingToFavorites(false);
      }
    };

    const handleAddToWatchlist = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      setIsAddingToWatchlist(true);
      try {
        if (isInWatchlist(currentMovie.id)) {
          await removeFromWatchlist(currentMovie.id);
        } else {
          await addToWatchlist(currentMovie);
        }
      } catch (error) {
        console.error('Error updating watchlist:', error);
      } finally {
        setIsAddingToWatchlist(false);
      }
    };

    return (
      <Box
        sx={{
          position: 'relative',
          height: { xs: 400, sm: 500, md: 600 },
          borderRadius: 4,
          overflow: 'hidden',
          mb: 6,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        
        <Box sx={{ position: 'relative', height: '100%' }}>          {dailyPicks.map((movie, index) => (
            <Fade
              key={`daily-pick-${movie.id}-${index}`}
              in={index === currentSlide}
              timeout={800}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: index === currentSlide ? 1 : 0,
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(
                    135deg,
                    rgba(0,0,0,0.7) 0%,
                    rgba(0,0,0,0.3) 40%,
                    rgba(0,0,0,0.7) 100%
                  ), url(${TMDB_BACKDROP_BASE_URL}${movie.backdrop_path})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                }}
              />
            </Fade>
          ))}
        </Box>

        
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            p: { xs: 2, sm: 4, md: 6 },
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ maxWidth: { xs: '100%', md: '60%' }, color: 'white' }}>
              
              <Slide direction={slideDirection === 'right' ? 'left' : 'right'} in={true} timeout={600}>
                <Chip
                  label={`Today's Pick #${currentSlide + 1}`}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    mb: 2,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    '& .MuiChip-label': {
                      px: 2,
                    },
                  }}
                />
              </Slide>              
              <Slide direction={slideDirection === 'right' ? 'left' : 'right'} in={true} timeout={700}>
                <Typography
                  variant={isMobile ? 'h4' : 'h2'}
                  component="h1"
                  onClick={() => router.push(`/movie/${currentMovie.id}`)}
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
                  {currentMovie.title}
                </Typography>
              </Slide>

              
              <Slide direction={slideDirection === 'right' ? 'left' : 'right'} in={true} timeout={800}>
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <Chip
                    icon={<Star />}
                    label={`${currentMovie.vote_average.toFixed(1)} Rating`}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      '& .MuiChip-icon': { color: 'warning.main' },
                    }}
                  />
                  <Chip
                    label={formatDate(currentMovie.release_date)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                  <Chip
                    label={`${currentMovie.vote_count} votes`}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                </Stack>
              </Slide>

              
              <Slide direction={slideDirection === 'right' ? 'left' : 'right'} in={true} timeout={900}>
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
                  {currentMovie.overview}
                </Typography>
              </Slide>

              
              <Slide direction={slideDirection === 'right' ? 'left' : 'right'} in={true} timeout={1000}>
                <Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrow />}
                      onClick={() => router.push(`/movie/${currentMovie.id}`)}
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
                      startIcon={isAddingToWatchlist ? <CircularProgress size={20} color="inherit" /> : (isInWatchlist(currentMovie.id) ? <Bookmark /> : <BookmarkBorder />)}
                      onClick={handleAddToWatchlist}
                      disabled={isAddingToWatchlist}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderColor: isInWatchlist(currentMovie.id) ? 'primary.main' : 'rgba(255,255,255,0.6)',
                        color: isInWatchlist(currentMovie.id) ? 'primary.main' : 'white',
                        bgcolor: isInWatchlist(currentMovie.id) ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          borderColor: isInWatchlist(currentMovie.id) ? 'primary.dark' : 'white',
                          bgcolor: isInWatchlist(currentMovie.id) ? 'rgba(25, 118, 210, 0.2)' : 'rgba(255,255,255,0.1)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {isInWatchlist(currentMovie.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={isAddingToFavorites ? <CircularProgress size={20} color="inherit" /> : <Favorite />}
                      onClick={handleAddToFavorites}
                      disabled={isAddingToFavorites}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderColor: isInFavorites(currentMovie.id) ? '#FF6B6B' : 'rgba(255,255,255,0.6)',
                        color: isInFavorites(currentMovie.id) ? '#FF6B6B' : 'white',
                        bgcolor: isInFavorites(currentMovie.id) ? 'rgba(255, 107, 107, 0.1)' : 'transparent',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          borderColor: isInFavorites(currentMovie.id) ? '#FF5252' : '#FF6B6B',
                          bgcolor: isInFavorites(currentMovie.id) ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 107, 107, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {isInFavorites(currentMovie.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </Button>
                  </Stack>
                </Box>
              </Slide>
            </Box>
          </Container>
        </Box>

        
        <IconButton
          onClick={prevSlide}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.7)',
              transform: 'translateY(-50%) scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <ArrowBackIos />
        </IconButton>

        <IconButton
          onClick={nextSlide}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.7)',
              transform: 'translateY(-50%) scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <ArrowForwardIos />
        </IconButton>

        
        <Box
          sx={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            display: 'flex',
            gap: 1,
          }}
        >            {dailyPicks.map((_, index) => (
            <IconButton
              key={`slide-indicator-${index}`}
              onClick={() => goToSlide(index)}
              sx={{
                p: 0.5,
                color: index === currentSlide ? 'primary.main' : 'rgba(255,255,255,0.5)',
                '&:hover': {
                  color: 'primary.light',
                  transform: 'scale(1.2)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <FiberManualRecord sx={{ fontSize: 12 }} />
            </IconButton>
          ))}
        </Box>
      </Box>
    );
  };  // Quick Categories Component
  const QuickCategories: React.FC = () => (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }} color="text.primary">
        <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
        Browse by Genre
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(6, 1fr)',
          },
          gap: 2,
        }}
      >
        {[
          { 
            name: 'Action', 
            icon: <LocalFireDepartment />, 
            color: 'error.main', 
            count: actionMovies.length > 0 ? `${actionMovies.length}+` : '100+',
            movies: actionMovies.slice(0, 2)
          },
          { 
            name: 'Comedy', 
            icon: <AutoAwesome />, 
            color: 'warning.main', 
            count: comedyMovies.length > 0 ? `${comedyMovies.length}+` : '85+',
            movies: comedyMovies.slice(0, 2)
          },
          { 
            name: 'Drama', 
            icon: <Explore />, 
            color: 'primary.main', 
            count: dramaMovies.length > 0 ? `${dramaMovies.length}+` : '120+',
            movies: dramaMovies.slice(0, 2)
          },
          { 
            name: 'Horror', 
            icon: <Whatshot />, 
            color: 'secondary.main', 
            count: horrorMovies.length > 0 ? `${horrorMovies.length}+` : '60+',
            movies: horrorMovies.slice(0, 2)
          },
          { 
            name: 'Sci-Fi', 
            icon: <NewReleases />, 
            color: 'success.main', 
            count: sciFiMovies.length > 0 ? `${sciFiMovies.length}+` : '75+',
            movies: sciFiMovies.slice(0, 2)
          },
          { 
            name: 'All Genres', 
            icon: <MovieFilter />, 
            color: 'info.main', 
            count: '500+',
            movies: [...trendingMovies.slice(0, 1), ...popularMovies.slice(0, 1)]
          },
        ].map((category, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 2,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              overflow: 'hidden',
              position: 'relative',
              minHeight: 160,
              background: category.movies.length > 0 && category.movies[0]?.backdrop_path 
                ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${TMDB_BACKDROP_BASE_URL}${category.movies[0].backdrop_path})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&:hover': {
                borderColor: category.color,
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
              },
            }}
            onClick={() => {
              if (category.name === 'All Genres') {
                router.push('/all-genres');
              } else {

                const genreIdMap: { [key: string]: number } = {
                  'Action': 28,
                  'Comedy': 35,
                  'Drama': 18,
                  'Horror': 27,
                  'Sci-Fi': 878,
                };
                const genreId = genreIdMap[category.name];
                if (genreId) {
                  router.push(`/all-genres?genre=${genreId}`);
                } else {
                  router.push('/all-genres');
                }
              }
            }}
          >
            
            <Box 
              sx={{ 
                position: 'relative',
                zIndex: 2,
                color: category.movies.length > 0 && category.movies[0]?.backdrop_path ? 'white' : 'inherit',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box sx={{ color: category.color, mb: 1, fontSize: '2rem' }}>
                {category.icon}
              </Box>
              <Typography 
                variant="body2" 
                fontWeight={600} 
                gutterBottom
                sx={{
                  textShadow: category.movies.length > 0 && category.movies[0]?.backdrop_path 
                    ? '1px 1px 2px rgba(0,0,0,0.8)' 
                    : 'none'
                }}
              >
                {category.name}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{
                  color: category.movies.length > 0 && category.movies[0]?.backdrop_path 
                    ? 'rgba(255,255,255,0.9)' 
                    : 'text.secondary',
                  textShadow: category.movies.length > 0 && category.movies[0]?.backdrop_path 
                    ? '1px 1px 2px rgba(0,0,0,0.8)' 
                    : 'none'
                }}
              >
                {category.count} movies
              </Typography>

              
              {category.movies.length > 0 && (
                <Box sx={{ mt: 1 }}>                  {category.movies.slice(0, 2).map((movie, movieIndex) => (
                    <Typography 
                      key={`category-${index}-movie-${movie.id}-${movieIndex}`}
                      variant="caption" 
                      sx={{
                        display: 'block',
                        opacity: 0.8,
                        fontSize: '0.65rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        color: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      {movieIndex === 0 ? '• ' : '• '}{movie.title}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>

            
            {category.movies.length > 0 && category.movies[0]?.backdrop_path && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)',
                  zIndex: 1,
                }}
              />
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );// Trending Stats Component
  const TrendingStats: React.FC = () => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 6,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(26, 35, 126, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(26, 35, 126, 0.02) 100%)',
      }}
    >
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }} color="text.primary">
        <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
        Trending Now
      </Typography>
      
      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {trendingMovies.length > 0 ? trendingMovies[0]?.vote_average.toFixed(1) : '8.5'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Top Rated
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} color="success.main">
            {popularMovies.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Popular Movies
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} color="warning.main">
            {upcomingMovies.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coming Soon
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} color="secondary.main">
            24hrs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Updated
          </Typography>
        </Box>
      </Box>

      
      {trendingMovies.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }} color="text.primary">
            🔥 This Week's Hottest Movies
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >            {trendingMovies.slice(0, 3).map((movie, index) => (              <Box
                key={`trending-now-${movie.id}-${index}`}
                onClick={() => router.push(`/movie/${movie.id}`)}
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: 180,
                    background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${TMDB_BACKDROP_BASE_URL}${movie.backdrop_path})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'flex-end',
                    p: 2,
                  }}
                >
                  
                  <Chip
                    label={`#${index + 1}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                    }}
                  />

                  
                  <Chip
                    icon={<Star sx={{ fontSize: 14 }} />}
                    label={movie.vote_average.toFixed(1)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      '& .MuiChip-icon': { color: 'warning.main' },
                    }}
                  />

                  
                  <Box sx={{ color: 'white', width: '100%' }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: 0.5,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                      }}
                    >
                      {movie.title}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.9,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                      }}
                    >
                      {formatDate(movie.release_date)} • {movie.vote_count} votes
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Paper>
  );

  const FeaturedToday: React.FC = () => {
    if (trendingMovies.length === 0) return null;
    
    const { isAuthenticated, addToFavorites, removeFromFavorites, isInFavorites } = useAuth();
    const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
    
    const featuredMovie = trendingMovies[0];

    const handleSaveLater = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      setIsAddingToFavorites(true);
      try {
        if (isInFavorites(featuredMovie.id)) {
          await removeFromFavorites(featuredMovie.id);
        } else {
          await addToFavorites(featuredMovie.id);
        }
      } catch (error) {
        console.error('Error updating favorites:', error);
      } finally {
        setIsAddingToFavorites(false);
      }
    };
    
    return (
      <Paper
        elevation={0}
        sx={{
          p: 0,
          mb: 6,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          height: 300,
          background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${TMDB_BACKDROP_BASE_URL}${featuredMovie.backdrop_path})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            p: 4,
          }}
        >
          <Box sx={{ color: 'white', maxWidth: '60%' }}>
            <Chip
              label="⭐ Featured Today"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                mb: 2,
                fontWeight: 600,
              }}
            />            <Typography 
              variant="h4" 
              fontWeight={700} 
              gutterBottom
              onClick={() => router.push(`/movie/${featuredMovie.id}`)}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {featuredMovie.title}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                opacity: 0.9,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {featuredMovie.overview}
            </Typography>
            <Stack direction="row" spacing={2}>              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={() => router.push(`/movie/${featuredMovie.id}`)}
                sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                View Details
              </Button><Button
                variant="outlined"
                size="large"
                               startIcon={isAddingToFavorites ? <CircularProgress size={20} color="inherit" /> : (isInFavorites(featuredMovie.id) ? <Favorite /> : <BookmarkBorder />)}
                onClick={handleSaveLater}
                disabled={isAddingToFavorites}
                sx={{ 
                  borderColor: isInFavorites(featuredMovie.id) ? 'primary.main' : 'white',
                  color: isInFavorites(featuredMovie.id) ? 'primary.main' : 'white',
                  bgcolor: isInFavorites(featuredMovie.id) ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { 
                    borderColor: isInFavorites(featuredMovie.id) ? 'primary.light' : 'white', 
                    bgcolor: 'rgba(255,255,255,0.1)' 
                  }
                }}
              >
                {isInFavorites(featuredMovie.id) ? 'Remove from Favorites' : 'Save Later'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Paper>
    );
  };


  const handleAIButtonClick = () => {
    setShowAIDialog(true);
    if (favorites.length > 0) {
      setUserPrompt('Recommend movies similar to my favorites');
    }
  };

  const handleAISuggestionRequest = async () => {
    if (!userPrompt.trim()) return;

    setAiLoading(true);
    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.suggestions);
        

        const moviePromises = data.suggestions.map(async (suggestion: any) => {
          try {
            const searchResponse = await fetch(
              `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(suggestion.title)}&year=${suggestion.year}`
            );
            const searchData = await searchResponse.json();
            return searchData.results[0]; // Get first match
          } catch (error) {
            console.error('TMDB search error for:', suggestion.title);
            return null;
          }
        });
        
        const foundMovies = await Promise.all(moviePromises);
        const validMovies = foundMovies.filter(movie => movie !== null);
        setAiMovies(validMovies);
      } else {
        setAiSuggestions([{ title: 'Unable to get movie recommendations at this time', year: 2024, description: 'Please try again.' }]);
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
      setAiSuggestions([{ title: 'Connection error', year: 2024, description: 'Please try again later.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCloseAIDialog = () => {
    setShowAIDialog(false);
    setAiSuggestions([]);
    setAiMovies([]);
    setUserPrompt('');
  };


  const isContentAppropriate = (movie: TMDBMovie) => {
    const title = movie.title.toLowerCase();
    const overview = movie.overview?.toLowerCase() || '';
    

    const inappropriateKeywords = [

      'adult', 'porn', 'xxx', 'erotic', 'nude', 'naked', 'sex', 'sexual', 'intimate', 'seduction',
      'stripper', 'prostitute', 'brothel', 'escort', 'affair', 'mistress', 'lover', 'passion',
      'lust', 'desire', 'temptation', 'forbidden', 'sensual', 'steamy', 'hot', 'wild',
      'naughty', 'dirty', 'kinky', 'fetish', 'bdsm', 'dominant', 'submissive', 'bondage',
      'explicit', 'graphic', 'provocative', 'suggestive', 'arousing', 'seductive', 'sultry',

      'brutal', 'torture', 'massacre', 'slaughter', 'gore', 'bloody', 'violent', 'murder',
      'kill', 'death', 'revenge', 'vengeance', 'assassin', 'hitman', 'sadistic', 'psychopath',

      'drug', 'cocaine', 'heroin', 'addict', 'dealer', 'cartel', 'mafia', 'gang',

      'perversion', 'deviant', 'taboo', 'scandal', 'controversial', 'shocking',
      'disturbing', 'twisted', 'dark', 'sinister', 'evil', 'corrupt'
    ];
    

    const hasInappropriateContent = inappropriateKeywords.some(keyword => 
      title.includes(keyword) || overview.includes(keyword)
    );
    

    if (movie.genre_ids && movie.genre_ids.includes(10749)) {
      const romanceBlacklist = [
        'fifty shades', 'after', 'magic mike', 'showgirls', 'basic instinct',
        '365 days', '365 dni', 'nymphomaniac', 'blue is the warmest', 'adele', 'emmanuelle',
        'secretary', 'crash', 'shame', 'the handmaiden', 'call me by your name',
        'black swan', 'eyes wide shut', 'unfaithful', 'fatal attraction'
      ];
      
      const hasInappropriateRomance = romanceBlacklist.some(term => 
        title.includes(term) || overview.includes(term)
      );
      
      if (hasInappropriateRomance) return false;
    }
    

    if (movie.vote_average < 5.0 && movie.vote_count > 50) {
      return false;
    }
    
    if (movie.vote_count < 10) {
      return false;
    }
    
    if (!movie.poster_path) {
      return false;
    }
    
    return !hasInappropriateContent;
  };

  const filteredTrendingMovies = trendingMovies.filter(isContentAppropriate);
  const filteredPopularMovies = popularMovies.filter(isContentAppropriate);
  const filteredTopRatedMovies = topRatedMovies.filter(isContentAppropriate);
  const filteredUpcomingMovies = upcomingMovies.filter(isContentAppropriate);
  const filteredDailyPicks = dailyPicks.filter(isContentAppropriate);
  const filteredRecommendedMovies = recommendedMovies.filter(isContentAppropriate);
  const filteredActionMovies = actionMovies.filter(isContentAppropriate);
  const filteredComedyMovies = comedyMovies.filter(isContentAppropriate);
  const filteredDramaMovies = dramaMovies.filter(isContentAppropriate);
  const filteredHorrorMovies = horrorMovies.filter(isContentAppropriate);
  const filteredSciFiMovies = sciFiMovies.filter(isContentAppropriate);
  const filteredSimilarMovies = similarMovies.filter(isContentAppropriate);
  const filteredMoviesBy80s = moviesBy80s.filter(isContentAppropriate);
  const filteredMoviesBy90s = moviesBy90s.filter(isContentAppropriate);
  const filteredMoviesBy2000s = moviesBy2000s.filter(isContentAppropriate);
  const filteredMoviesBy2010s = moviesBy2010s.filter(isContentAppropriate);
  const filteredRandomMovies = randomMovies.filter(isContentAppropriate);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <>
        <Header />
        <Box
          sx={{
            minHeight: { xs: 'calc(100vh - 134px)', sm: 'calc(100vh - 134px)', md: 'calc(100vh - 64px)', lg: 'calc(100vh - 64px)', xl: 'calc(100vh - 64px)' }, // Mobile: 64px header + 70px bottom nav = 134px
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
            pt: { xs: 0, sm: 0, md: 8, lg: 8, xl: 8 } // Masaüstünde header için padding
          }}
        >
          <CircularProgress size={48} />
          <Typography variant="h6" color="text.secondary">
            Loading amazing movies...
          </Typography>
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
        pt: { xs: 0, sm: 0, md: 8, lg: 8, xl: 8 } // Masaüstünde header için padding
      }}>
        
        
        <DailyPicksSlider />

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}          
          {!isAuthenticated && (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 6,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                textAlign: 'center',
                background: mode === 'dark' 
                  ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(26, 35, 126, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(26, 35, 126, 0.02) 100%)',
              }}
            >
              <Typography variant="h4" fontWeight={600} gutterBottom>
                Welcome to Flick Sage
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Discover your next favorite movie with personalized recommendations
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PersonAdd />}
                  onClick={() => router.push('/register')}
                  sx={{ px: 4 }}
                >
                  Join Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ px: 4 }}
                >
                  Learn More
                </Button>
              </Stack>
            </Paper>
          )}

          
          <FeaturedToday />

          
          <TrendingStats />

          
          <QuickCategories />

          
          {filteredRecommendedMovies.length > 0 && (
            <MovieSection
              title="Recommended for You"
              movies={filteredRecommendedMovies}
              icon={<Recommend />}
              color="info.main"
            />
          )}

          
          <MovieSection
            title="Trending This Week"
            movies={filteredTrendingMovies}
            icon={<TrendingUp />}
            color="primary.main"
          />

          <MovieSection
            title="Most Popular"
            movies={filteredPopularMovies}
            icon={<Favorite />}
            color="secondary.main"
          />

          <MovieSection
            title="Top Rated Movies"
            movies={filteredTopRatedMovies}
            icon={<Star />}
            color="warning.main"
          />

          
          {filteredActionMovies.length > 0 && (
            <MovieSection
              title="Action Movies"
              movies={filteredActionMovies}
              icon={<LocalFireDepartment />}
              color="error.main"
            />
          )}

          {filteredComedyMovies.length > 0 && (
            <MovieSection
              title="Comedy Movies"
              movies={filteredComedyMovies}
              icon={<AutoAwesome />}
              color="warning.main"
            />
          )}

          {filteredDramaMovies.length > 0 && (
            <MovieSection
              title="Drama Movies"
              movies={filteredDramaMovies}
              icon={<Explore />}
              color="primary.main"
            />
          )}

          {filteredSciFiMovies.length > 0 && (
            <MovieSection
              title="Sci-Fi Movies"
              movies={filteredSciFiMovies}
              icon={<NewReleases />}
              color="success.main"
            />
          )}

          {filteredHorrorMovies.length > 0 && (
            <MovieSection
              title="Horror Movies"
              movies={filteredHorrorMovies}
              icon={<Whatshot />}
              color="secondary.main"
            />
          )}

          
          
          {filteredSimilarMovies.length > 0 && (
            <MovieSection
              title="If You Liked These Movies"
              movies={filteredSimilarMovies}
              icon={<SimilarMovies />}
              color="info.main"
            />
          )}

          
          {filteredRandomMovies.length > 0 && (
            <MovieSection
              title="Discover Randomly"
              movies={filteredRandomMovies}
              icon={<Casino />}
              color="purple"
            />
          )}

          
          {filteredMoviesBy80s.length > 0 && (
            <MovieSection
              title="80s Classics"
              movies={filteredMoviesBy80s}
              icon={<History />}
              color="orange"
            />
          )}

          {filteredMoviesBy90s.length > 0 && (
            <MovieSection
              title="90s Best Movies"
              movies={filteredMoviesBy90s}
              icon={<Timeline />}
              color="cyan"
            />
          )}

          {filteredMoviesBy2000s.length > 0 && (
            <MovieSection
              title="2000s Unforgettables"
              movies={filteredMoviesBy2000s}
              icon={<DateRange />}
              color="green"
            />
          )}

          {filteredMoviesBy2010s.length > 0 && (
            <MovieSection
              title="2010s Favorites"
              movies={filteredMoviesBy2010s}
              icon={<AccessTime />}
              color="red"
            />
          )}

          
          {actorMovies.movies.length > 0 && (
            <MovieSection
              title={`Popular Actors Collection`}
              movies={actorMovies.movies}
              icon={<Person />}
              color="pink"
            />
          )}

          <MovieSection
            title="Coming Soon"
            movies={filteredUpcomingMovies}
            icon={<CalendarToday />}
            color="success.main"
          />
        </Container>

        
        <Fab
          color="primary"
          onClick={handleAIButtonClick}
          sx={{
            position: 'fixed',
            bottom: { xs: 86, sm: 86, md: 24 }, // 70px (bottom nav height) + 16px margin = 86px on mobile
            left: { xs: 'auto', sm: 'auto', md: 24 },
            right: { xs: 16, sm: 16, md: 'auto' },
            zIndex: 1201,
            width: { xs: 56, sm: 56, md: 64 },
            height: { xs: 56, sm: 56, md: 64 },
            background: mode === 'dark' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: mode === 'dark'
                ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
            animation: 'pulse 2s infinite',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '120%',
              background: 'rgba(102, 126, 234, 0.2)',
              borderRadius: '50%',
              zIndex: -1,
              animation: 'pulse-ring 2s infinite',
            },
            '@keyframes pulse-ring': {
              '0%': {
                transform: 'translate(-50%, -50%) scale(0.8)',
                opacity: 1,
              },
              '100%': {
                transform: 'translate(-50%, -50%) scale(1.4)',
                opacity: 0,
              },
            },
          }}
        >
          <SmartToy sx={{ 
            fontSize: 30,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }} />
        </Fab>

        
        <Dialog
          open={showAIDialog}
          onClose={handleCloseAIDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
              background: mode === 'light' 
                ? 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
                : 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
              color: mode === 'light' ? '#000000' : '#ffffff',
              boxShadow: mode === 'light'
                ? '0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)'
                : '0 12px 40px rgba(0,0,0,0.4), 0 4px 12px rgba(255,255,255,0.05)',
              border: mode === 'light' 
                ? '1px solid rgba(102, 126, 234, 0.1)'
                : '1px solid rgba(118, 75, 162, 0.2)',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                zIndex: 1,
              }
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            color: mode === 'light' ? '#000000' : '#ffffff',
            pb: 3,
            pt: 4,
            px: 4,
            borderBottom: mode === 'light' 
              ? '1px solid rgba(102, 126, 234, 0.1)'
              : '1px solid rgba(118, 75, 162, 0.2)',
            position: 'relative',
          }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flex: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: '-2px',
                    padding: '2px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'xor',
                    WebkitMaskComposite: 'xor',
                    zIndex: -1,
                  }
                }}
              >
                <SmartToy sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ 
                  color: mode === 'light' ? '#1a1a1a' : '#ffffff',
                  background: mode === 'light' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  AI Movie Recommendations
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
                  mt: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      animation: 'pulse 2s infinite',
                    }}
                  />
                  Powered by Gemini AI
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseAIDialog}
              sx={{ 
                color: mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
                backgroundColor: mode === 'light' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(118, 75, 162, 0.15)',
                width: 44,
                height: 44,
                borderRadius: '12px',
                border: mode === 'light' 
                  ? '1px solid rgba(102, 126, 234, 0.2)'
                  : '1px solid rgba(118, 75, 162, 0.3)',
                '&:hover': { 
                  backgroundColor: mode === 'light' ? 'rgba(102, 126, 234, 0.15)' : 'rgba(118, 75, 162, 0.25)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ 
            color: mode === 'light' ? '#000000' : '#ffffff',
            py: 4,
            px: 4,
            background: mode === 'light' 
              ? 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
              : 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
            position: 'relative',
          }}>
            <Box sx={{ 
              mb: 4,
              p: 3,
              borderRadius: '16px',
              background: mode === 'light' 
                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: mode === 'light' 
                ? '1px solid rgba(102, 126, 234, 0.1)'
                : '1px solid rgba(118, 75, 162, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              }
            }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                color: mode === 'light' ? '#1a1a1a' : '#ffffff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  ?
                </Box>
                What kind of movies are you in the mood for?
              </Typography>
              <Typography variant="body1" sx={{ 
                mb: 0, 
                color: mode === 'light' ? 'rgba(26, 26, 26, 0.7)' : 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
                fontSize: '0.95rem',
              }}>
                {favorites.length > 0 
                  ? `Based on your ${favorites.length} favorite movies, I can suggest personalized recommendations just for you!`
                  : 'Tell me what genre or type of movie you\'re looking for, and I\'ll find the perfect match.'
                }
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={favorites.length > 0 
                ? "e.g., 'Horror movies like my favorites', 'Comedy films', 'Action movies with great plots'"
                : "e.g., 'Suggest thriller movies', 'Romantic comedies', 'Sci-fi films', 'Classic movies'"
              }
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: mode === 'light' ? '#1a1a1a' : '#ffffff',
                  backgroundColor: mode === 'light' 
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                  border: mode === 'light' 
                    ? '2px solid rgba(102, 126, 234, 0.1)'
                    : '2px solid rgba(118, 75, 162, 0.2)',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    border: mode === 'light' 
                      ? '2px solid rgba(102, 126, 234, 0.2)'
                      : '2px solid rgba(118, 75, 162, 0.3)',
                    backgroundColor: mode === 'light' 
                      ? 'rgba(255, 255, 255, 0.9)'
                      : 'rgba(255,255,255,0.08)',
                  },
                  '&.Mui-focused': {
                    border: '2px solid #667eea',
                    backgroundColor: mode === 'light' 
                      ? 'rgba(255, 255, 255, 1)'
                      : 'rgba(255,255,255,0.1)',
                    boxShadow: mode === 'light' 
                      ? '0 0 0 4px rgba(102, 126, 234, 0.1)'
                      : '0 0 0 4px rgba(118, 75, 162, 0.2)',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '16px 20px',
                  fontSize: '1rem',
                  '&::placeholder': {
                    color: mode === 'light' ? 'rgba(26, 26, 26, 0.5)' : 'rgba(255,255,255,0.5)',
                    opacity: 1,
                  }
                }
              }}
            />

            {aiMovies.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: mode === 'light' ? '#1a1a1a' : '#ffffff',
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5 
                }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                    }}
                  >
                    🎬
                  </Box>
                  Your Personalized Movie Recommendations
                </Typography>
                
                
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)', 
                    md: 'repeat(3, 1fr)'
                  },
                  gap: 3
                }}>
                  {aiMovies.map((movie, index) => (
                    <Box key={movie.id || index}>
                      <Card
                        elevation={0}
                        onClick={() => router.push(`/movie/${movie.id}`)}
                        sx={{
                          height: 320,
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          position: 'relative',
                          background: mode === 'light' 
                            ? 'rgba(255, 255, 255, 0.9)' 
                            : 'rgba(26, 26, 26, 0.9)',
                          border: '1px solid',
                          borderColor: mode === 'light' 
                            ? 'rgba(102, 126, 234, 0.2)' 
                            : 'rgba(118, 75, 162, 0.3)',
                          boxShadow: mode === 'light'
                            ? '0 4px 20px rgba(102, 126, 234, 0.1)'
                            : '0 4px 20px rgba(0,0,0,0.3)',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: mode === 'light'
                              ? '0 12px 40px rgba(102, 126, 234, 0.2)'
                              : '0 12px 40px rgba(0,0,0,0.5)',
                            borderColor: mode === 'light' 
                              ? 'rgba(102, 126, 234, 0.4)' 
                              : 'rgba(118, 75, 162, 0.5)',
                            '& .movie-poster': {
                              transform: 'scale(1.05)',
                            },
                            '& .card-content': {
                              background: mode === 'light' 
                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' 
                                : 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                            },
                          },
                        }}
                      >
                        
                        <Box sx={{ 
                          position: 'relative', 
                          height: 200,
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
                              top: 12,
                              left: 12,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              px: 2,
                              py: 0.5,
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                            }}
                          >
                            <SmartToy sx={{ fontSize: 14 }} />
                            AI Pick
                          </Box>

                          
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              bgcolor: movie.vote_average >= 7 ? 'success.main' : movie.vote_average >= 5 ? 'warning.main' : 'error.main',
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            <Star sx={{ fontSize: 12 }} />
                            {movie.vote_average?.toFixed(1) || 'N/A'}
                          </Box>
                        </Box>

                        
                        <CardContent 
                          className="card-content"
                          sx={{
                            p: 2,
                            height: 120,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <Box>
                            <Typography
                              variant="subtitle1"
                              fontWeight={700}
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                mb: 0.5,
                                color: mode === 'light' ? '#1a1a1a' : '#ffffff',
                              }}
                            >
                              {movie.title}
                            </Typography>
                            
                            <Typography
                              variant="body2"
                              sx={{
                                color: mode === 'light' ? 'rgba(26, 26, 26, 0.7)' : 'rgba(255,255,255,0.7)',
                                mb: 1,
                              }}
                            >
                              {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                            </Typography>

                            
                            <Typography
                              variant="body2"
                              sx={{
                                color: mode === 'light' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255,255,255,0.6)',
                                lineHeight: 1.4,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                fontSize: '0.8rem',
                              }}
                            >
                              {aiSuggestions[index]?.description || movie.overview}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 4, 
            borderTop: mode === 'light' 
              ? '1px solid rgba(102, 126, 234, 0.1)'
              : '1px solid rgba(118, 75, 162, 0.2)',
            background: mode === 'light' 
              ? 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
              : 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
            gap: 2,
          }}>
            <Button
              onClick={handleCloseAIDialog}
              sx={{ 
                color: mode === 'light' ? 'rgba(26, 26, 26, 0.7)' : 'rgba(255,255,255,0.7)',
                borderColor: mode === 'light' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(118, 75, 162, 0.3)',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 100,
                background: mode === 'light' 
                  ? 'rgba(102, 126, 234, 0.05)'
                  : 'rgba(118, 75, 162, 0.1)',
                '&:hover': {
                  borderColor: mode === 'light' ? 'rgba(102, 126, 234, 0.4)' : 'rgba(118, 75, 162, 0.5)',
                  backgroundColor: mode === 'light' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(118, 75, 162, 0.2)',
                  transform: 'translateY(-1px)',
                }
              }}
              variant="outlined"
            >
              Close
            </Button>
            <Button
              onClick={handleAISuggestionRequest}
              disabled={!userPrompt.trim() || aiLoading}
              startIcon={aiLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                px: 5,
                py: 1.5,
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                minWidth: 160,
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.5)',
                },
                '&:disabled': {
                  background: mode === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)',
                  color: mode === 'light' ? 'rgba(0,0,0,0.26)' : 'rgba(255,255,255,0.3)',
                  boxShadow: 'none',
                  transform: 'none',
                },
                transition: 'all 0.3s ease'
              }}
              variant="contained"
            >
              {aiLoading ? 'Getting Recommendations...' : 'Get Recommendations'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default HomePage;
