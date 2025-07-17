'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme as useMuiTheme,
  Fade,
  Slide,
  Zoom,
  Grow,
  Paper,
} from '@mui/material';
import {
  Movie,
  Star,
  Favorite,
  BookmarkBorder,
  AutoAwesome,
  TrendingUp,
  People,
  Security,
  Devices,
  ArrowForward,
  PlayArrow,
  Search,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { mode, toggleColorMode } = useTheme();
  const router = useRouter();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [animateCards, setAnimateCards] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {

    if (isAuthenticated) {
      router.push('/homepage');
      return;
    }


    const timer1 = setTimeout(() => setAnimateCards(true), 500);
    const timer2 = setTimeout(() => setAnimateStats(true), 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isAuthenticated, router]);

  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 40 }} />,
      title: 'Smart Recommendations',
      description: 'Get personalized movie suggestions based on your preferences and viewing history.',
      color: '#FF6B6B',
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: 'Family Profiles',
      description: 'Create separate profiles for each family member with customized watchlists.',
      color: '#4ECDC4',
    },
    {
      icon: <BookmarkBorder sx={{ fontSize: 40 }} />,
      title: 'Personal Collections',
      description: 'Build your watchlist and favorites collection to track movies you love.',
      color: '#45B7D1',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Trending Content',
      description: 'Discover what\'s popular and trending in the movie world right now.',
      color: '#96CEB4',
    },
    {
      icon: <Search sx={{ fontSize: 40 }} />,
      title: 'Advanced Search',
      description: 'Find any movie with our powerful search and filtering capabilities.',
      color: '#FFEAA7',
    },
    {
      icon: <Devices sx={{ fontSize: 40 }} />,
      title: 'Responsive Design',
      description: 'Enjoy seamless experience across all your devices - mobile, tablet, and desktop.',
      color: '#DDA0DD',
    },
  ];

  const movieCards = [
    {
      title: 'Inception',
      year: '2010',
      rating: 8.8,
      poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      genre: 'Sci-Fi',
    },
    {
      title: 'The Dark Knight',
      year: '2008', 
      rating: 9.0,
      poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      genre: 'Action',
    },
    {
      title: 'Interstellar',
      year: '2014',
      rating: 8.6,
      poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      genre: 'Drama',
    },
  ];

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: mode === 'dark' ? '#0a0a0a' : '#f8f9fa',
      position: 'relative',
      overflow: 'hidden',
    }}>
      
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          opacity: 0.1,
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
          opacity: 0.1,
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 3,
        position: 'relative',
        zIndex: 2,
      }}>
        <Fade in timeout={800}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 70,
                height: 70,
                borderRadius: 2,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                },
              }}
            >
              <Image
                src="/flick-sage-logo.png"
                alt="Flick Sage Logo"
                width={55}
                height={55}
                style={{ 
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Box>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                sx={{ 
                  color: mode === 'dark' ? '#000000' : '#000000' // Always black
                }}
              >
                Flick Sage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your Movie Discovery Platform
              </Typography>
            </Box>
          </Box>
        </Fade>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={toggleColorMode} sx={{ 
            '&:hover': { transform: 'scale(1.1)' },
            transition: 'transform 0.2s ease',
          }}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Slide in direction="left" timeout={1000}>
            <Button
              variant="outlined"
              onClick={() => router.push('/login')}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': { transform: 'translateY(-2px)' },
                transition: 'transform 0.2s ease',
              }}
            >
              Sign In
            </Button>
          </Slide>
          <Slide in direction="left" timeout={1200}>
            <Button
              variant="contained"
              onClick={() => router.push('/register')}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Get Started
            </Button>
          </Slide>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        
        <Box sx={{ 
          textAlign: 'center', 
          py: { xs: 6, md: 10 },
          px: 2,
        }}>
          <Fade in timeout={1000}>
            <Typography 
              variant={isMobile ? 'h3' : 'h2'} 
              fontWeight={700} 
              gutterBottom
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
              }}
            >
              Discover Your Next
              <br />
              Favorite Movie
            </Typography>
          </Fade>

          <Fade in timeout={1200}>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
            >
              Join thousands of movie lovers who trust Flick Sage to discover amazing films, 
              build personal collections, and get recommendations tailored just for them.
            </Typography>
          </Fade>

          <Zoom in timeout={1400}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={() => router.push('/register')}
              sx={{
                textTransform: 'none',
                fontSize: '1.1rem',
                py: 1.5,
                px: 4,
                borderRadius: 3,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(33, 150, 243, 0.4)',
                },
                transition: 'all 0.3s ease',
                mb: 8,
              }}
            >
              Start Exploring Movies
            </Button>
          </Zoom>

          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2,
            flexWrap: 'wrap',
            mb: 8,
          }}>
            {movieCards.map((movie, index) => (
              <Grow
                key={movie.title}
                in={animateCards}
                timeout={1000 + index * 200}
                style={{ transformOrigin: '0 0 0' }}
              >
                <Card
                  sx={{
                    width: 180,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px) scale(1.02)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      style={{
                        width: '100%',
                        height: 240,
                        objectFit: 'cover',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Star sx={{ fontSize: 14, color: '#FFD700' }} />
                      <Typography variant="caption" fontWeight={600}>
                        {movie.rating}
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {movie.title}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {movie.year}
                      </Typography>
                      <Chip 
                        label={movie.genre} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          fontSize: '0.7rem',
                        }} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            ))}
          </Box>
        </Box>

        
        <Paper
          elevation={0}
          sx={{
            mb: 8,
            p: 4,
            borderRadius: 4,
            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 4,
            justifyItems: 'center',
          }}>
            {[
              { number: '50K+', label: 'Movies in Database', icon: <Movie /> },
              { number: '10K+', label: 'Active Users', icon: <People /> },
              { number: '1M+', label: 'Recommendations Made', icon: <AutoAwesome /> },
              { number: '99%', label: 'User Satisfaction', icon: <Star /> },
            ].map((stat, index) => (
              <Zoom key={stat.label} in={animateStats} timeout={800 + index * 200}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      color: 'white',
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                    {stat.number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Zoom>
            ))}
          </Box>
        </Paper>

        
        <Box sx={{ mb: 8 }}>
          <Fade in timeout={1500}>
            <Typography 
              variant="h3" 
              fontWeight={700} 
              textAlign="center" 
              gutterBottom
              sx={{ mb: 6 }}
            >
              Why Choose Flick Sage?
            </Typography>
          </Fade>

          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 4,
          }}>
            {features.map((feature, index) => (
              <Slide 
                key={feature.title}
                in={animateCards} 
                direction="up" 
                timeout={1000 + index * 150}
              >
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '1px solid transparent',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: feature.color,
                      boxShadow: `0 12px 30px ${feature.color}25`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, height: '100%' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 2,
                        bgcolor: `${feature.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        color: feature.color,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Slide>
            ))}
          </Box>
        </Box>

        
        <Paper
          elevation={0}
          sx={{
            mb: 8,
            p: 6,
            borderRadius: 4,
            textAlign: 'center',
            background: mode === 'dark' 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)',
              animation: 'float 10s ease-in-out infinite',
            }}
          />
          <Fade in timeout={2000}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Ready to Start Your Movie Journey?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Join Flick Sage today and discover movies you'll love
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => router.push('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Create Free Account
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/login')}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Paper>
      </Container>

      
      <Box sx={{ 
        textAlign: 'center', 
        py: 4, 
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      }}>
        <Typography variant="body2" color="text.secondary">
          © 2025 Flick Sage. Made with ❤️ for movie lovers everywhere.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
