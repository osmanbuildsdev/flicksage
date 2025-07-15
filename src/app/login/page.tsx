'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Link,
  Divider,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

const LoginPage: React.FC = () => {
  const { mode, toggleColorMode } = useTheme();
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  React.useEffect(() => {
    setMounted(true);
  }, []);


  React.useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push('/homepage');
    }
  }, [isAuthenticated, router, mounted]);


  if (!mounted) {
    return <div>Loading...</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        if (result.needsProfileSelection) {
          router.push('/profiles');
        } else {
          router.push('/homepage');
        }
      } else {
        setError(result.error || 'An error occurred during login');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
      <Container maxWidth="sm">
        <Card 
          elevation={12}
          sx={{ 
            borderRadius: 4,
            backdropFilter: 'blur(10px)',
            backgroundColor: mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(255, 255, 255, 0.95)',
            border: mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : 'none',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  mx: 'auto',
                }}
              >
                <Image
                  src="/flick-sage-logo.png"
                  alt="Flick Sage Logo"
                  width={64}
                  height={64}
                  style={{ 
                    objectFit: 'contain'
                  }}
                />
              </Box>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  background: mode === 'dark'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome Back
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Sign in to Flick Sage
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
              >
                Continue your movie discovery journey
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                
                {error && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  variant="outlined"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />

                
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                
                <Box sx={{ textAlign: 'right' }}>
                  <Link 
                    href="#" 
                    variant="body2" 
                    color="primary" 
                    underline="hover"
                    sx={{ fontWeight: 500 }}
                  >
                    Forgot your password?
                  </Link>
                </Box>

                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                
                <Typography variant="body2" align="center" sx={{ pt: 2 }}>
                  Don't have an account?{' '}
                  <Link 
                    href="/register" 
                    color="primary" 
                    underline="hover"
                    sx={{ fontWeight: 600 }}
                  >
                    Sign up here
                  </Link>
                </Typography>
              </Stack>
            </Box>          </CardContent>
        </Card>
      </Container>
    </Box>
    </>
  );
};

export default LoginPage;
