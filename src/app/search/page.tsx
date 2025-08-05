'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  Button,
  Pagination,
  useMediaQuery,
  useTheme as useMuiTheme,
  Stack,
  Divider,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Movie,
  TrendingUp,
  LocalFireDepartment,
  Close,
  Star,
  PlayArrow,
  Bookmark,
  BookmarkBorder,
  Favorite,
  Add,
  Share,
  Info,
  ArrowForward,
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

interface SearchResult {
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
  page: number;
  query: string;
}

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';


const SearchPageContent: React.FC = () => {
  const { mode } = useTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);


  const popularSearches = [
    'Spider-Man', 'Avengers', 'Star Wars', 'Batman', 'Marvel',
    'Disney', 'Horror', 'Comedy', 'Action', 'Drama'
  ];

  useEffect(() => {
    setMounted(true);
    const query = searchParams?.get('q');
    const page = searchParams?.get('page');
    
    if (query) {
      setSearchQuery(query);
      setCurrentPage(page ? parseInt(page) : 1);
      performSearch(query, page ? parseInt(page) : 1);
    }
  }, [searchParams]);

  const performSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}`);
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data);
        setCurrentPage(page);
        

        const newUrl = `/search?q=${encodeURIComponent(query)}${page > 1 ? `&page=${page}` : ''}`;
        window.history.replaceState({}, '', newUrl);
      } else {
        setError(data.error || 'Search failed');
        setSearchResults(null);
      }
    } catch (err) {
      setError('Network error occurred');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(1);
      performSearch(searchQuery.trim(), 1);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    performSearch(searchQuery, value);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    performSearch(suggestion, 1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setError(null);
    router.push('/search');
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Header />
      <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', pt: 10 }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              fontWeight={700} 
              gutterBottom
              sx={{
                background: mode === 'dark' 
                  ? 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)'
                  : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Search Movies
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Discover your next favorite film
            </Typography>

            
            <Paper
              component="form"
              onSubmit={handleSearch}
              elevation={0}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                maxWidth: 600,
                mx: 'auto',
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 4,
                background: mode === 'dark' 
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        onClick={clearSearch}
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        <Close fontSize="small" />
                      </Button>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& input': {
                    fontSize: '1.1rem',
                    fontWeight: 500,
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!searchQuery.trim() || loading}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  minWidth: 100,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Search'
                )}
              </Button>
            </Paper>
          </Box>

          
          {!searchResults && !loading && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                <LocalFireDepartment sx={{ mr: 1, verticalAlign: 'middle', color: 'error.main' }} />
                Popular Searches
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {popularSearches.map((search, index) => (
                  <Chip
                    key={index}
                    label={search}
                    onClick={() => handleSuggestionClick(search)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          
          {searchResults && (
            <Box>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Search Results for "{searchResults.query}"
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Found {searchResults.total_results.toLocaleString()} movies
                </Typography>
                <Divider sx={{ mt: 2 }} />
              </Box>

              
              {searchResults.results.length > 0 ? (
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
                      mb: 6,
                    }}
                  >
                    {searchResults.results.map((movie) => (
                      <MovieSearchCard key={movie.id} movie={movie} />
                    ))}
                  </Box>

                  
                  {searchResults.total_pages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                      <Pagination
                        count={Math.min(searchResults.total_pages, 500)} // TMDB limit
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size={isMobile ? "small" : "medium"}
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Movie sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No movies found for "{searchResults.query}"
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Try different keywords or check the spelling
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={clearSearch}
                    startIcon={<Search />}
                  >
                    Try New Search
                  </Button>
                </Box>
              )}
            </Box>
          )}

          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={48} />
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};


const MovieSearchCard: React.FC<{ movie: TMDBMovie }> = ({ movie }) => {
  const { mode } = useTheme();
  const { 
    isAuthenticated, 
    addToFavorites, 
    removeFromFavorites, 
    isInFavorites,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist 
  } = useAuth();
  const router = useRouter();
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatYear = (dateString: string) => {
    return dateString ? new Date(dateString).getFullYear() : 'TBA';
  };

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
  };

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
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
        >
          <Tooltip title={isInWatchlist(movie.id) ? "Remove from Watchlist" : "Add to Watchlist"} arrow>
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
            {formatYear(movie.release_date)} • {movie.vote_count > 1000 ? `${(movie.vote_count / 1000).toFixed(1)}k` : movie.vote_count} votes
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


const SearchPage: React.FC = () => {
  return (
    <Suspense fallback={
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress size={48} />
      </Box>
    }>
      <SearchPageContent />
    </Suspense>
  );
};

export default SearchPage;
