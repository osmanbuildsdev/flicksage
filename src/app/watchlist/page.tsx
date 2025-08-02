'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  Button, 
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  CircularProgress,
  Paper
} from '@mui/material';
import { 
  PlaylistRemove,
  Visibility,
  VisibilityOff,
  Star,
  CalendarToday,
  Movie,
  PlayArrow,
  Bookmark,
  BookmarkBorder,
  Favorite,
  Share,
  Info,
  ArrowForward
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

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
      id={`watchlist-tabpanel-${index}`}
      aria-labelledby={`watchlist-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `watchlist-tab-${index}`,
    'aria-controls': `watchlist-tabpanel-${index}`,
  };
}

const WatchlistPage: React.FC = () => {
  const { user, isAuthenticated, watchlist, removeFromWatchlist, updateWatchlistStatus, refreshWatchlist, isInFavorites, addToFavorites, removeFromFavorites } = useAuth();
  const { mode } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  

  const [toWatchPage, setToWatchPage] = useState(1);
  const [watchedPage, setWatchedPage] = useState(1);
  const ITEMS_PER_PAGE = 12; // 3 satır × 4 kolun = 12 item

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    

    const loadWatchlist = async () => {
      if (watchlist.length === 0) { // Sadece watchlist boşsa yükle
        setPageLoading(true);
        await refreshWatchlist();
      }
      setPageLoading(false);
    };
    
    loadWatchlist();
  }, [isAuthenticated, router]); // refreshWatchlist dependency'sini kaldırdık


  const handleLoadMoreToWatch = () => {
    setToWatchPage(prev => prev + 1);
  };

  const handleLoadMoreWatched = () => {
    setWatchedPage(prev => prev + 1);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);

    if (newValue === 0) {
      setToWatchPage(1);
    } else {
      setWatchedPage(1);
    }
  };


  const { toWatchMovies, watchedMovies, displayedToWatch, displayedWatched, hasMoreToWatch, hasMoreWatched } = useMemo(() => {
    const toWatch = watchlist.filter(item => item.status === 'to_watch');
    const watched = watchlist.filter(item => item.status === 'watched');
    
    return {
      toWatchMovies: toWatch,
      watchedMovies: watched,
      displayedToWatch: toWatch.slice(0, toWatchPage * ITEMS_PER_PAGE),
      displayedWatched: watched.slice(0, watchedPage * ITEMS_PER_PAGE),
      hasMoreToWatch: toWatch.length > toWatchPage * ITEMS_PER_PAGE,
      hasMoreWatched: watched.length > watchedPage * ITEMS_PER_PAGE,
    };
  }, [watchlist, toWatchPage, watchedPage, ITEMS_PER_PAGE]);


  const handleRemoveFromWatchlistCallback = useCallback(async (movieId: number) => {
    setLoading(true);
    await removeFromWatchlist(movieId);
    setLoading(false);
  }, [removeFromWatchlist]);

  const handleToggleWatchStatusCallback = useCallback(async (movieId: number, currentStatus: 'to_watch' | 'watched') => {
    setLoading(true);
    const newStatus = currentStatus === 'to_watch' ? 'watched' : 'to_watch';
    await updateWatchlistStatus(movieId, newStatus);
    setLoading(false);
  }, [updateWatchlistStatus]);

  const handleFavoriteToggleCallback = useCallback(async (movieId: number) => {
    if (isInFavorites(movieId)) {
      await removeFromFavorites(movieId);
    } else {
      await addToFavorites(movieId);
    }
  }, [isInFavorites, addToFavorites, removeFromFavorites]);


  const renderMovieCard = useCallback((movie: any) => (
    <Box
      key={movie.id}
      sx={{ 
        minWidth: { xs: 260, sm: 280, md: 300 },
        maxWidth: { xs: 280, sm: 300, md: 320 },
        flexShrink: 0,
      }}
    >
      <Card
        elevation={0}
        onClick={() => router.push(`/movie/${movie.movieId}`)}
        sx={{
          height: 420,
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
          height: 260,
          overflow: 'hidden',
        }}>
          <CardMedia
            className="movie-poster"
            component="img"
            height="100%"
            image={movie.moviePoster ? `https://image.tmdb.org/t/p/w500${movie.moviePoster}` : '/placeholder-movie.jpg'}
            alt={movie.movieTitle}
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
                bgcolor: movie.movieRating >= 7 ? 'success.main' : movie.movieRating >= 5 ? 'warning.main' : 'error.main',
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
                {movie.movieRating ? parseFloat(movie.movieRating).toFixed(1) : 'N/A'}
              </Typography>
            </Box>

            
            <Box sx={{ display: 'flex', gap: 1 }}>
              
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleWatchStatusCallback(movie.movieId, movie.status);
                }}
                disabled={loading}
                sx={{
                  bgcolor: movie.status === 'watched' ? 'success.main' : 'primary.main',
                  color: 'white',
                  width: 40,
                  height: 40,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: movie.status === 'watched' ? 'success.dark' : 'primary.dark',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : movie.status === 'watched' ? (
                  <Visibility fontSize="small" />
                ) : (
                  <VisibilityOff fontSize="small" />
                )}
              </IconButton>

              
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavoriteToggleCallback(movie.movieId);
                }}
                sx={{
                  bgcolor: isInFavorites(movie.movieId) ? '#FF6B6B' : 'rgba(255,255,255,0.9)',
                  color: isInFavorites(movie.movieId) ? 'white' : 'text.primary',
                  width: 40,
                  height: 40,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: isInFavorites(movie.movieId) ? '#FF5252' : 'white',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Favorite 
                  fontSize="small" 
                  sx={{ 
                    color: isInFavorites(movie.movieId) ? 'white' : '#FF6B6B',
                    filter: isInFavorites(movie.movieId) ? 'none' : 'grayscale(100%)',
                    opacity: isInFavorites(movie.movieId) ? 1 : 0.6
                  }} 
                />
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
            <Tooltip title="Remove from Watchlist" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFromWatchlistCallback(movie.movieId);
                }}
                disabled={loading}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: 'error.main',
                  width: 36,
                  height: 36,
                  backdropFilter: 'blur(10px)',
                  '&:hover': { 
                    bgcolor: 'error.main',
                    color: 'white',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <PlaylistRemove fontSize="small" />
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
            minHeight: 160,
            display: 'flex',
            flexDirection: 'column',
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
              {movie.movieTitle}
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
              {movie.movieReleaseDate ? new Date(movie.movieReleaseDate).getFullYear() : 'Unknown'} • {movie.status === 'watched' ? 'Watched' : 'To Watch'}
            </Typography>
          </Box>

          
          <Typography
            className="movie-overview"
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.5,
              fontSize: '0.9rem',
              transition: 'color 0.4s ease',
              mb: 2,
              flex: 1,
            }}
          >
            {movie.movieOverview || 'No description available.'}
          </Typography>

          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 'auto',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: movie.status === 'watched' ? 'success.main' : 'primary.main',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {movie.status === 'watched' ? 'Completed' : 'Planned'}
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
    </Box>
  ), [router, mode, handleRemoveFromWatchlistCallback, handleToggleWatchStatusCallback, handleFavoriteToggleCallback, isInFavorites]);

  if (!isAuthenticated) {
    return null;
  }

  if (pageLoading) {
    return (
      <>
        <Header />
        <Box sx={{ 
          bgcolor: 'background.default', 
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={48} />
            <Typography variant="h6" color="text.secondary">
              Loading your watchlist...
            </Typography>
          </Stack>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header />
      <Box sx={{ 
        bgcolor: 'background.default', 
        minHeight: 'calc(100vh - 64px)',
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
                ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
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
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              }
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
              <Movie sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h3" component="h1" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}>
                  My Watchlist
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {user?.firstName}, manage your movie collection
                </Typography>
              </Box>
            </Stack>
            
            <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<Bookmark />}
                label={`${toWatchMovies.length} To Watch`}
                color="primary"
                variant={activeTab === 0 ? "filled" : "outlined"}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                icon={<Visibility />}
                label={`${watchedMovies.length} Watched`}
                color="success"
                variant={activeTab === 1 ? "filled" : "outlined"}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                icon={<Star />}
                label={`${toWatchMovies.length + watchedMovies.length} Total`}
                color="secondary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
          </Paper>

          
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              mb: 4,
            }}
          >
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="watchlist tabs"
              sx={{
                px: 2,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 64,
                }
              }}
            >
              <Tab 
                label={`To Watch (${toWatchMovies.length})`} 
                icon={<BookmarkBorder />}
                iconPosition="start"
                {...a11yProps(0)} 
              />
              <Tab 
                label={`Watched (${watchedMovies.length})`} 
                icon={<Visibility />}
                iconPosition="start"
                {...a11yProps(1)} 
              />
            </Tabs>
          </Paper>

          
          <TabPanel value={activeTab} index={0}>
            {toWatchMovies.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: mode === 'light'
                    ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.02) 0%, rgba(21, 101, 192, 0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(21, 101, 192, 0.05) 100%)',
                }}
              >
                <BookmarkBorder sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h5" gutterBottom color="text.primary" fontWeight={600}>
                  Your watchlist is empty
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Start building your movie collection by adding films from the homepage.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/homepage')}
                  sx={{ px: 4 }}
                >
                  Explore Movies
                </Button>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                    xl: 'repeat(4, 1fr)', // 5'ten 4'e düşürdük
                  },
                  gap: { xs: 2, sm: 3 },
                  px: { xs: 1, sm: 0 },
                }}
              >
                {displayedToWatch.map(renderMovieCard)}
              </Box>
            )}
            
            
            {toWatchMovies.length > 0 && hasMoreToWatch && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleLoadMoreToWatch}
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
                      boxShadow: '0 8px 20px rgba(33, 150, 243, 0.3)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  Load More ({toWatchMovies.length - displayedToWatch.length} more)
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {watchedMovies.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: mode === 'light'
                    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.02) 0%, rgba(56, 142, 60, 0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.05) 100%)',
                }}
              >
                <Visibility sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h5" gutterBottom color="text.primary" fontWeight={600}>
                  No watched movies yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Mark movies as watched to track your viewing history and build your collection.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/homepage')}
                  sx={{ px: 4 }}
                >
                  Find Movies
                </Button>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                    xl: 'repeat(4, 1fr)', // 5'ten 4'e düşürdük
                  },
                  gap: { xs: 2, sm: 3 },
                  px: { xs: 1, sm: 0 },
                }}
              >
                {displayedWatched.map(renderMovieCard)}
              </Box>
            )}
            
            
            {watchedMovies.length > 0 && hasMoreWatched && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleLoadMoreWatched}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: 'success.main',
                    color: 'success.main',
                    '&:hover': {
                      bgcolor: 'success.main',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(76, 175, 80, 0.3)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  Load More ({watchedMovies.length - displayedWatched.length} more)
                </Button>
              </Box>
            )}
          </TabPanel>
        </Container>
      </Box>
    </>
  );
};

export default React.memo(WatchlistPage);
