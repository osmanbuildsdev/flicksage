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
  FormControlLabel,
  Checkbox,
  LinearProgress,
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

const RegisterPage: React.FC = () => {
  const { mode, toggleColorMode } = useTheme();
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };
  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 25) return 'Very Weak';
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Medium';
    return 'Strong';
  };
  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 25) return 'error';
    if (strength < 50) return 'warning';
    if (strength < 75) return 'info';
    return 'success';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!formData.firstName || !formData.lastName || !formData.email ||
      !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions');
      setLoading(false);
      return;
    }
    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      
      if (result.success) {

        router.push('/homepage');
      } else {
        setError(result.error || 'An error occurred during registration');
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  
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
                Join Flick Sage
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Discover your next favorite movie
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
              >
                Create your account to get personalized recommendations
              </Typography>
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    variant="outlined"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    variant="outlined"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </Stack>

                
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
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

                
                <Box>
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
                  {formData.password && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={passwordStrength}
                        color={getPasswordStrengthColor(passwordStrength) as 'error' | 'warning' | 'info' | 'success'}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Typography
                        variant="caption"
                        color={getPasswordStrengthColor(passwordStrength)}
                        sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}
                      >
                        Password strength: {getPasswordStrengthText(passwordStrength)}
                      </Typography>
                    </Box>
                  )}
                </Box>

                
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  variant="outlined"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  error={!!(formData.confirmPassword && formData.password !== formData.confirmPassword)}
                  helperText={
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'Passwords do not match'
                      : ''
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      name="acceptTerms"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" color="textSecondary">
                      I have read and agree to the{' '}
                      <Link href="#" color="primary" underline="hover">
                        Terms and Conditions
                      </Link>
                      {' '}and{' '}
                      <Link href="#" color="primary" underline="hover">
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />

                
                {error && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                
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
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                
                <Typography variant="body2" align="center" sx={{ pt: 2 }}>
                  Already have an account?{' '}
                  <Link 
                    href="/login" 
                    color="primary" 
                    underline="hover"
                    sx={{ fontWeight: 600 }}
                  >
                    Sign in here
                  </Link>
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
    </>
  );
};

export default RegisterPage;