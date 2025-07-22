'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  useMediaQuery,
  useTheme as useMuiTheme,
  Fade,
  Paper,
  Stack,
  CircularProgress,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import {
  Movie,
  Brightness4,
  Brightness7,
  Login,
  PersonAdd,
  Home,
  Person,
  Settings,
  ExitToApp,
  Search,
  Favorite,
  LocalMovies,
  Menu as MenuIcon,
  Close,
  BookmarkBorder,
  Star,
  People,
  AutoAwesome,
} from '@mui/icons-material';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const { mode, toggleColorMode } = useTheme();
  const { user, isAuthenticated, logout, activeProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setSearchQuery('');
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };


  const debounceSearch = useCallback((query: string) => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 2) {
        fetchSearchSuggestions(query.trim());
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return timeoutId;
  }, []);

  const fetchSearchSuggestions = async (query: string) => {
    setSearchLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=1`);
      const data = await response.json();
      
      if (response.ok && data.results) {
        setSearchSuggestions(data.results.slice(0, 5)); // İlk 5 sonucu göster
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Search suggestions error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length > 2) {
      const timeoutId = debounceSearch(value);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (movie: any) => {
    router.push(`/movie/${movie.id}`);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };
  const handleLogout = () => {
    logout();
    handleMenuClose();
    router.push('/');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    handleMenuClose();
    setMobileDrawerOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };
  const navigationItems = [
    { label: 'Home', path: '/homepage', icon: <Home />, highlight: false },
    { label: 'Movies', path: '/movies', icon: <LocalMovies />, highlight: false },
    { label: 'Recommendations', path: '/recommendations', icon: <AutoAwesome />, highlight: false },
    { label: 'Search', path: '/search', icon: <Search />, highlight: false },
    { label: 'Watchlist', path: '/watchlist', icon: <BookmarkBorder />, highlight: false },
    { label: 'Favorites', path: '/favorites', icon: <Favorite />, highlight: false },
  ];

  const userMenuItems = [
    { label: 'Profile', path: '/profile', icon: <Person /> },
    { label: 'Settings', path: '/settings', icon: <Settings /> },
  ];

  const handleSwitchProfile = () => {
    handleMenuClose();
    router.push('/profiles');
  };
  return (
    <>
      
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: mode === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          zIndex: 1100,
          height: 64,
          minHeight: 64,
          display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' }, // Sadece mobil/tablet'te göster
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
            onClick={() => router.push('/')}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Image 
                src="/flick-sage-logo.png" 
                alt="Flick Sage Logo"
                width={50}
                height={50}
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#000000', // Always black for mobile header
                  fontWeight: 700,
                  lineHeight: 1.2 
                }}
              >
                Flick Sage
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ lineHeight: 1 }}
              >
                Discover Movies
              </Typography>
            </Box>
          </Box>

          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            
            <IconButton
              onClick={handleSearchToggle}
              sx={{
                color: 'text.primary',
                '&:hover': {
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Search />
            </IconButton>

            
            <IconButton
              onClick={toggleColorMode}
              sx={{
                color: 'text.primary',
                '&:hover': {
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            
            {!isAuthenticated ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => router.push('/register')}
                  size="small"
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                    minWidth: 40,
                    px: 1,
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <PersonAdd />
                </Button>
                <IconButton
                  onClick={() => router.push('/login')}
                  sx={{
                    color: 'text.primary',
                    border: '1px solid',
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 2,
                    width: 40,
                    height: 32,
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                    },
                  }}
                >
                  <Login />
                </IconButton>
              </Stack>
            ) : (
              
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  p: 0.5,
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Avatar
                  src={activeProfile?.avatar || user?.profilePicture || undefined}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'primary.main',
                    fontSize: '1rem',
                    fontWeight: 600,
                    border: '2px solid',
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {activeProfile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            )}
          </Box>
        </Toolbar>

        
        <Fade in={searchOpen} timeout={300}>
          <Box sx={{ 
            display: searchOpen ? 'block' : 'none', 
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mx: 2, 
            mt: 1,
            zIndex: 1200,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            p: 2,
          }}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleSearchToggle}>
                        <Close />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                    },
                    '&.Mui-focused': {
                      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    }
                  }
                }}
                autoFocus
              />
            </form>

            
            {showSuggestions && (searchSuggestions.length > 0 || searchLoading) && (
              <Paper
                elevation={8}
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1300,
                  mt: 1,
                  maxHeight: 400,
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                {searchLoading ? (
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {searchSuggestions.map((movie, index) => (
                      <ListItem
                        key={movie.id}
                        disablePadding
                        sx={{
                          borderBottom: index < searchSuggestions.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                        }}
                      >
                        <ListItemButton
                          onClick={() => handleSuggestionClick(movie)}
                          sx={{
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                        <Box
                          sx={{
                            width: 40,
                            height: 60,
                            borderRadius: 1,
                            overflow: 'hidden',
                            mr: 2,
                            bgcolor: 'grey.200',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {movie.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w154${movie.poster_path}`}
                              alt={movie.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          ) : (
                            <Movie sx={{ color: 'text.disabled' }} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {movie.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Star sx={{ fontSize: 14, color: 'warning.main', mr: 0.5 }} />
                            <Typography variant="caption">
                              {movie.vote_average?.toFixed(1) || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                        </ListItemButton>
                      </ListItem>
                    ))}
                    
                    {searchQuery.trim() && (
                      <ListItem
                        disablePadding
                      >
                        <ListItemButton
                          onClick={handleSearch}
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                            },
                          }}
                        >
                          <ListItemIcon sx={{ color: 'white' }}>
                            <Search />
                          </ListItemIcon>
                          <ListItemText
                            primary={`Search for "${searchQuery}"`}
                            secondary="View all results"
                            secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                          />
                        </ListItemButton>
                      </ListItem>
                    )}
                  </List>
                )}
              </Paper>
            )}
          </Box>
        </Fade>
      </AppBar>

      
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: mode === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          zIndex: 1100,
          height: searchOpen && isMobile ? 'auto' : 64,
          minHeight: 64,
          display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' }, // Sadece masaüstünde göster
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 1,
                display: { xs: 'flex', sm: 'none' }, // Sadece en küçük ekranlarda göster
                '&:hover': {
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
            onClick={() => router.push('/')}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Image 
                src="/flick-sage-logo.png" 
                alt="Flick Sage Logo"
                width={50}
                height={50}
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#000000', // Always black for desktop header
                  fontWeight: 700,
                  lineHeight: 1.2 
                }}
              >
                Flick Sage
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ lineHeight: 1 }}
              >
                Discover Movies
              </Typography>
            </Box>
          </Box>

          
          <Fade in={searchOpen} timeout={300}>
            <Box sx={{ 
              display: searchOpen ? 'block' : 'none', 
              position: { xs: 'absolute', md: 'relative' },
              top: { xs: '100%', md: 'auto' },
              left: { xs: 0, md: 'auto' },
              right: { xs: 0, md: 'auto' },
              mx: { xs: 2, md: 2 }, 
              mt: { xs: 1, md: 0 },
              flex: { xs: 'none', md: 1 }, 
              maxWidth: { xs: 'none', md: 400 }, 
              zIndex: 1200,
              bgcolor: { xs: 'background.paper', md: 'transparent' },
              borderRadius: { xs: 2, md: 0 },
              boxShadow: { xs: 3, md: 0 },
              p: { xs: 2, md: 0 },
            }}>
              <form onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleSearchToggle}>
                          <Close />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                      },
                      '&.Mui-focused': {
                        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      }
                    }
                  }}
                  autoFocus
                />
              </form>

              
              {showSuggestions && (searchSuggestions.length > 0 || searchLoading) && (
                <Paper
                  elevation={8}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: { xs: 0, md: 0 },
                    right: { xs: 0, md: 0 },
                    zIndex: 1300,
                    mt: 1,
                    maxHeight: 400,
                    overflow: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  {searchLoading ? (
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {searchSuggestions.map((movie, index) => (
                        <ListItem
                          key={movie.id}
                          disablePadding
                          sx={{
                            borderBottom: index < searchSuggestions.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                          }}
                        >
                          <ListItemButton
                            onClick={() => handleSuggestionClick(movie)}
                            sx={{
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                          <Box
                            sx={{
                              width: { xs: 40, md: 50 },
                              height: { xs: 60, md: 75 },
                              borderRadius: 1,
                              overflow: 'hidden',
                              mr: 2,
                              bgcolor: 'grey.200',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {movie.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w154${movie.poster_path}`}
                                alt={movie.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <Movie sx={{ color: 'text.disabled' }} />
                            )}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {movie.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Star sx={{ fontSize: 14, color: 'warning.main', mr: 0.5 }} />
                              <Typography variant="caption">
                                {movie.vote_average?.toFixed(1) || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                          </ListItemButton>
                        </ListItem>
                      ))}
                      
                      {searchQuery.trim() && (
                        <ListItem
                          disablePadding
                        >
                          <ListItemButton
                            onClick={handleSearch}
                            sx={{
                              bgcolor: 'primary.main',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'primary.dark',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ color: 'white' }}>
                              <Search />
                            </ListItemIcon>
                            <ListItemText
                              primary={`Search for "${searchQuery}"`}
                              secondary="View all results"
                              secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                            />
                          </ListItemButton>
                        </ListItem>
                      )}
                    </List>
                  )}
                </Paper>
              )}
            </Box>
          </Fade>

          
          {!isMobile && !searchOpen && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {navigationItems.map((item) => {
                const isActive = pathname === item.path || 
                  (item.path === '/homepage' && pathname === '/');
                
                return (
                  <Button
                    key={item.path}
                    startIcon={item.icon}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      color: isActive ? 'primary.main' : 'text.primary',
                      bgcolor: isActive ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: isActive ? 600 : 500,
                      position: 'relative',
                      '&:hover': {
                        bgcolor: isActive 
                          ? 'rgba(33, 150, 243, 0.15)' 
                          : mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.08)' 
                            : 'rgba(0, 0, 0, 0.08)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {item.label}
                    {item.highlight && (
                      <Chip
                        label="Hot"
                        size="small"
                        sx={{
                          ml: 1,
                          height: 16,
                          fontSize: '0.7rem',
                          bgcolor: 'error.main',
                          color: 'white',
                          '& .MuiChip-label': { px: 0.5 }
                        }}
                      />
                    )}
                  </Button>
                );
              })}
            </Box>
          )}

          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            
            {!searchOpen && (
              <IconButton
                onClick={handleSearchToggle}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Search />
              </IconButton>
            )}

            
            <IconButton
              onClick={toggleColorMode}
              sx={{
                color: 'text.primary',
                '&:hover': {
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            
            {!isAuthenticated ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<Login />}
                  onClick={() => router.push('/login')}
                  size="small"
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    textTransform: 'none',
                    borderRadius: 2,
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  startIcon={isMobile ? undefined : <PersonAdd />}
                  onClick={() => router.push('/register')}
                  size="small"
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                    minWidth: { xs: 40, sm: 'auto' },
                    px: { xs: 1, sm: 2 },
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {isMobile ? <PersonAdd /> : 'Sign Up'}
                </Button>
                
                {isMobile && (
                  <IconButton
                    onClick={() => router.push('/login')}
                    sx={{
                      color: 'text.primary',
                      border: '1px solid',
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                      borderRadius: 2,
                      width: 40,
                      height: 32,
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Login />
                  </IconButton>
                )}
              </Stack>
            ) : (
              
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  p: 0.5,
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Avatar
                  src={activeProfile?.avatar || user?.profilePicture || undefined}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'primary.main',
                    fontSize: '1rem',
                    fontWeight: 600,
                    border: '2px solid',
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {activeProfile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 45,
                height: 45,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Image 
                src="/flick-sage-logo.png" 
                alt="Flick Sage Logo"
                width={35}
                height={35}
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="h6" fontWeight={600} sx={{ color: '#000000' }}>
              Flick Sage
            </Typography>
          </Box>
        </Box>

        <List sx={{ px: 2, py: 1 }}>
          {navigationItems.map((item) => {
            const isActive = pathname === item.path || 
              (item.path === '/homepage' && pathname === '/');
            
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    color: isActive ? 'primary.main' : 'text.primary',
                    bgcolor: isActive ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: isActive 
                        ? 'rgba(33, 150, 243, 0.15)' 
                        : 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                  {item.highlight && (
                    <Chip
                      label="Hot"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor: 'error.main',
                        color: 'white',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {isAuthenticated && (
          <>
            <Divider sx={{ mx: 2 }} />
            <List sx={{ px: 2, py: 1 }}>
              {userMenuItems.map((item) => (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      color: pathname === item.path ? 'primary.main' : 'text.primary',
                      bgcolor: pathname === item.path ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                      '&:hover': {
                        bgcolor: pathname === item.path 
                          ? 'rgba(33, 150, 243, 0.15)' 
                          : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 2,
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'rgba(244, 67, 54, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    <ExitToApp />
                  </ListItemIcon>
                  <ListItemText primary="Sign Out" />
                </ListItemButton>
              </ListItem>
            </List>
          </>
        )}

        {!isAuthenticated && (
          <Box sx={{ p: 2, mt: 'auto' }}>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Login />}
                onClick={() => handleNavigation('/login')}
                fullWidth
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => handleNavigation('/register')}
                fullWidth
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Sign Up
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>

      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              mx: 1,
              my: 0.5,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={activeProfile?.avatar || user?.profilePicture || undefined}
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {activeProfile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {activeProfile ? activeProfile.name : 'Signed in as'}
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {activeProfile ? user?.email : user?.email}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {userMenuItems.map((item) => (
          <MenuItem
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              color: pathname === item.path ? 'primary.main' : 'text.primary',
              bgcolor: pathname === item.path ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </MenuItem>
        ))}
        
        <Divider sx={{ my: 1 }} />
        
        <MenuItem onClick={handleSwitchProfile}>
          <ListItemIcon>
            <People />
          </ListItemIcon>
          <ListItemText primary="Change Profile" />
        </MenuItem>
        
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'inherit' }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </MenuItem>
      </Menu>

      
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          minWidth: 0,
          zIndex: 1100,
          display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' },
          borderTop: '1px solid',
          borderColor: 'divider',
        }} 
        elevation={8}
      >
        <BottomNavigation
          value={pathname}
          onChange={(event, newValue) => handleNavigation(newValue)}
          showLabels
          sx={{
            height: 70,
            width: '100vw',
            minWidth: 0,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 12px 8px',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 500,
            },
          }}
        >
          {navigationItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              value={item.path}
              icon={item.icon}
              sx={{
                color: (pathname === item.path || (item.path === '/homepage' && pathname === '/')) 
                  ? 'primary.main' 
                  : 'text.secondary',
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>

      
      <Box sx={{ display: { xs: 'none', sm: 'none', md: 'block', lg: 'block', xl: 'block' } }}>
        <Toolbar />
      </Box>
      
      
      <Box sx={{ display: { xs: 'block', sm: 'block', md: 'none', lg: 'none', xl: 'none' } }}>
        <Toolbar />
      </Box>
      
      
      <Box sx={{ height: 70, width: '100vw', display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' } }} />
    </>
  );
};

export default Header;
