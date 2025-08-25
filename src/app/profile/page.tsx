'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Paper,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  Badge,
  LinearProgress,
  Alert,
  Skeleton,
  useMediaQuery,
  useTheme as useMuiTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Movie,
  Favorite,
  Bookmark,
  Star,
  Timeline,
  Security,
  Language,
  Help,
  Info,
  Logout,
  CameraAlt,
  Share,
  TrendingUp,
  LocalMovies,
  AutoAwesome,
  AccessTime,
  Visibility,
  ThumbUp,
  EmojiEvents,
  MovieFilter,
  Analytics,
  History,
  PersonAdd,
  Shield,
  VpnKey,
  Lock,
  Delete,
  CloudUpload,
  CloudDownload,
} from '@mui/icons-material';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { PROFILE_AVATARS } from '@/utils/avatars';


const PROFILE_PICTURES = PROFILE_AVATARS;

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const ProfilePage: React.FC = () => {
  const { mode, toggleColorMode } = useTheme();
  const { 
    isAuthenticated, 
    logout, 
    user, 
    token, 
    updateUser,
    favorites, 
    watchlist,
    activeProfile,
    refreshWatchlist,
    refreshFavorites
  } = useAuth();
  const router = useRouter();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  

  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    joinDate: '',
    avatar: '',
  });
  const [editData, setEditData] = useState(profileData);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showProfilePictureDialog, setShowProfilePictureDialog] = useState(false);
  

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
  });
  

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [profilePictureLoading, setProfilePictureLoading] = useState(false);


  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importError, setImportError] = useState<string>('');


  const [userStats, setUserStats] = useState({
    moviesWatched: 0,
    favoriteMovies: 0,
    watchlistItems: 0,
    averageRating: 0,
    genresExplored: 0,
    hoursWatched: 0,
    friendsCount: 0,
    totalItems: 0,
    moviesThisMonth: 0,
    monthlyGoal: 15,
  });


  const [recentActivities, setRecentActivities] = useState<any[]>([]);


  const [settings, setSettings] = useState({
    privacy: {},
  });


  const fetchProfileData = useCallback(async () => {
    if (!token) return;
    
    try {
      setDataLoading(true);
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const result = await response.json();
      if (result.success) {
        const { user: userData, stats, recentActivity } = result.data;
        

        setProfileData({
          name: userData.name,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: '', // Not in DB yet
          location: '', // Not in DB yet
          bio: 'Movie enthusiast exploring different genres and discovering hidden gems.', // Default bio
          joinDate: userData.joinDate,
          avatar: '', // Not implemented yet
        });


        setUserStats(stats);


        setRecentActivities(recentActivity);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [token]);


  const updateProfileData = async (updatedData: { firstName: string; lastName: string; email: string }) => {
    if (!token) return false;
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };


  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (token) {
      fetchProfileData();
    }
  }, [isAuthenticated, router, token, fetchProfileData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const success = await updateProfileData({
        firstName: editData.firstName,
        lastName: editData.lastName,
        email: editData.email,
      });

      if (success) {
        setProfileData({
          ...profileData,
          name: `${editData.firstName} ${editData.lastName}`,
          firstName: editData.firstName,
          lastName: editData.lastName,
          email: editData.email,
        });
        setIsEditing(false);

      } else {

        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };


  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setShowPasswordDialog(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('An error occurred while changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    if (!emailForm.newEmail || !emailForm.password) {
      alert('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    setEmailLoading(true);
    try {
      const response = await fetch('/api/auth/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          password: emailForm.password,
        }),
      });

      if (response.ok) {
        alert('Email updated successfully!');
        setShowEmailDialog(false);
        setEmailForm({ newEmail: '', password: '' });

        fetchProfileData();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update email');
      }
    } catch (error) {
      console.error('Email update error:', error);
      alert('An error occurred while updating email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!activeProfile) {
      alert('Please select an active profile first');
      return;
    }

    setExportLoading(true);
    try {
      const response = await fetch('/api/user/export-data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-profile-id': activeProfile.id,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flick-sage-data-${activeProfile.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setShowExportDialog(false);
        alert('Data exported successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to export data');
      }
    } catch (error) {
      console.error('Data export error:', error);
      alert('An error occurred while exporting data');
    } finally {
      setExportLoading(false);
    }
  };


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setImportError('Please select a valid JSON file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setImportError('File size too large. Maximum 10MB allowed.');
      return;
    }

    setImportFile(file);
    setImportError('');


    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        setImportPreview(content);
      } catch (error) {
        setImportError('Invalid JSON file format');
        setImportFile(null);
        setImportPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImportData = async () => {
    if (!importFile || !importPreview || !activeProfile) {
      setImportError('Please select a valid file and ensure you have an active profile');
      return;
    }

    setImportLoading(true);
    setImportError('');

    try {
      const response = await fetch('/api/user/import-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-profile-id': activeProfile.id,
        },
        body: JSON.stringify({
          data: importPreview,
          mergeStrategy: 'add', // Add new items, keep existing ones
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setShowImportDialog(false);
        setImportFile(null);
        setImportPreview(null);
        

        if (refreshWatchlist) refreshWatchlist();
        

        if (refreshFavorites) refreshFavorites();
        
        alert(`Data imported successfully!\nWatchlist: ${result.watchlistAdded || 0} items added\nFavorites: ${result.favoritesAdded || 0} items added`);
      } else {
        const error = await response.json();
        setImportError(error.message || 'Failed to import data');
      }
    } catch (error) {
      console.error('Data import error:', error);
      setImportError('An error occurred while importing data');
    } finally {
      setImportLoading(false);
    }
  };

  const handleProfilePictureSelect = async (pictureUrl: string) => {
    setProfilePictureLoading(true);
    try {
      const response = await fetch('/api/user/update-profile-picture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          profilePicture: pictureUrl,
        }),
      });

      if (response.ok) {

        setProfileData(prev => ({ ...prev, profilePicture: pictureUrl }));
        setEditData(prev => ({ ...prev, profilePicture: pictureUrl }));
        

        updateUser({ profilePicture: pictureUrl });
        
        setShowProfilePictureDialog(false);
        alert('Profile picture updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Profile picture update error:', error);
      alert('An error occurred while updating profile picture');
    } finally {
      setProfilePictureLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(false);

    console.log('Account deletion requested');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'watched': return <Visibility color="primary" />;
      case 'favorite': return <Favorite color="error" />;
      case 'watchlist': return <Bookmark color="warning" />;
      default: return <Movie />;
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'watched': return `Watched "${activity.title}"`;
      case 'favorite': return `Added "${activity.title}" to favorites`;
      case 'watchlist': return `Added "${activity.title}" to watchlist`;
      default: return activity.title;
    }
  };

  const formatActivityDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };


  const getAchievements = () => {
    const achievements = [];


    if (userStats.moviesWatched >= 50) {
      achievements.push({
        icon: <EmojiEvents sx={{ color: 'warning.main' }} />,
        title: 'Movie Buff',
        description: `Watched ${userStats.moviesWatched}+ movies`,
        unlocked: true
      });
    }


    if (userStats.moviesWatched >= 10 && userStats.moviesWatched < 50) {
      achievements.push({
        icon: <Movie sx={{ color: 'primary.main' }} />,
        title: 'Getting Started',
        description: `Watched ${userStats.moviesWatched} movies`,
        unlocked: true
      });
    }


    if (userStats.moviesWatched >= 1 && userStats.moviesWatched < 10) {
      achievements.push({
        icon: <LocalMovies sx={{ color: 'info.main' }} />,
        title: 'First Steps',
        description: `Watched ${userStats.moviesWatched} movies`,
        unlocked: true
      });
    }


    if (userStats.favoriteMovies >= 20) {
      achievements.push({
        icon: <Favorite sx={{ color: 'error.main' }} />,
        title: 'Favorites Collector',
        description: `Added ${userStats.favoriteMovies}+ movies to favorites`,
        unlocked: true
      });
    }


    if (userStats.favoriteMovies >= 5 && userStats.favoriteMovies < 20) {
      achievements.push({
        icon: <Favorite sx={{ color: 'pink.main' }} />,
        title: 'Favorites Starter',
        description: `Added ${userStats.favoriteMovies} movies to favorites`,
        unlocked: true
      });
    }


    if (userStats.watchlistItems >= 30) {
      achievements.push({
        icon: <Bookmark sx={{ color: 'warning.main' }} />,
        title: 'Watchlist Curator',
        description: `Built a watchlist of ${userStats.watchlistItems}+ movies`,
        unlocked: true
      });
    }


    if (userStats.watchlistItems >= 10 && userStats.watchlistItems < 30) {
      achievements.push({
        icon: <Bookmark sx={{ color: 'orange.main' }} />,
        title: 'Watchlist Builder',
        description: `Built a watchlist of ${userStats.watchlistItems} movies`,
        unlocked: true
      });
    }


    if (userStats.hoursWatched >= 100) {
      achievements.push({
        icon: <AccessTime sx={{ color: 'success.main' }} />,
        title: 'Time Invested',
        description: `Watched ${userStats.hoursWatched}+ hours of movies`,
        unlocked: true
      });
    }


    if (userStats.averageRating >= 7.5 && userStats.moviesWatched >= 10) {
      achievements.push({
        icon: <Star sx={{ color: 'warning.main' }} />,
        title: 'Quality Seeker',
        description: `Maintains ${userStats.averageRating}+ average rating`,
        unlocked: true
      });
    }


    if (userStats.moviesThisMonth >= userStats.monthlyGoal) {
      achievements.push({
        icon: <TrendingUp sx={{ color: 'success.main' }} />,
        title: 'Monthly Goal Achiever',
        description: 'Reached this month\'s watching goal',
        unlocked: true
      });
    }


    if (userStats.genresExplored >= 10) {
      achievements.push({
        icon: <AutoAwesome sx={{ color: 'primary.main' }} />,
        title: 'Genre Explorer',
        description: `Explored ${userStats.genresExplored} different genres`,
        unlocked: true
      });
    }


    if (userStats.moviesWatched < 100) {
      achievements.push({
        icon: <EmojiEvents sx={{ color: 'grey.400' }} />,
        title: 'Cinema Legend',
        description: `Watch ${100 - userStats.moviesWatched} more movies to unlock`,
        unlocked: false
      });
    }

    if (userStats.favoriteMovies < 50) {
      achievements.push({
        icon: <Favorite sx={{ color: 'grey.400' }} />,
        title: 'Favorites Master',
        description: `Add ${50 - userStats.favoriteMovies} more favorites to unlock`,
        unlocked: false
      });
    }

    return achievements.slice(0, 6); // Show max 6 achievements
  };

  if (!isAuthenticated || dataLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress size={48} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            border: '1px solid', 
            borderColor: 'divider',
            borderRadius: 3,
            background: mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user?.profilePicture || ''}
                sx={{
                  width: isMobile ? 100 : 120,
                  height: isMobile ? 100 : 120,
                  border: '4px solid',
                  borderColor: 'primary.main',
                  boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
                }}
              >
                <Person sx={{ fontSize: 48 }} />
              </Avatar>
              <IconButton
                onClick={() => setShowProfilePictureDialog(true)}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 36,
                  height: 36,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
                size="small"
              >
                <CameraAlt sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            
            <Box sx={{ flex: 1, minWidth: 200 }}>
              {isEditing ? (
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Bio"
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    variant="outlined"
                    size="small"
                    multiline
                    rows={2}
                  />
                </Stack>
              ) : (
                <>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {profileData.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {profileData.bio}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip
                      icon={<Email />}
                      label={profileData.email}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      icon={<CalendarToday />}
                      label={`Joined ${new Date(profileData.joinDate).toLocaleDateString()}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </>
              )}
            </Box>

            
            <Box sx={{ display: 'flex', gap: 1, flexDirection: isMobile ? 'row' : 'column' }}>
              {isEditing ? (
                <>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : <Save />}
                    onClick={handleSave}
                    disabled={loading}
                    size="small"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={loading}
                    size="small"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={handleEdit}
                    size="small"
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    size="small"
                  >
                    Share
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Paper>

        
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 4 
          }}
        >
          <Card sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
            <LocalMovies sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={700}>
              {userStats.moviesWatched}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Movies Watched
            </Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
            <Favorite sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={700}>
              {userStats.favoriteMovies}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Favorites
            </Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
            <Bookmark sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={700}>
              {userStats.watchlistItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Watchlist
            </Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
            <Star sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={700}>
              {userStats.averageRating}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Rating
            </Typography>
          </Card>
        </Box>

        
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'fullWidth'}
              scrollButtons="auto"
            >
              <Tab 
                label="Activity" 
                icon={<Timeline />} 
                iconPosition="start"
                {...a11yProps(0)} 
              />
              <Tab 
                label="Stats" 
                icon={<Analytics />} 
                iconPosition="start"
                {...a11yProps(1)} 
              />
              <Tab 
                label="Privacy" 
                icon={<Shield />} 
                iconPosition="start"
                {...a11yProps(2)} 
              />
            </Tabs>
          </Box>

          
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Recent Activity
            </Typography>
            {dataLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : recentActivities.length > 0 ? (
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={getActivityText(activity)}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatActivityDate(activity.date)}
                            </Typography>
                            {activity.rating && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  •
                                </Typography>
                                <Star sx={{ fontSize: 12, color: 'warning.main' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {activity.rating}/10
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No recent activity found. Start watching movies to see your activity here!
                </Typography>
              </Box>
            )}
          </TabPanel>

          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Your Movie Statistics
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Watching Progress
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Movies This Month</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {userStats.moviesThisMonth}/{userStats.monthlyGoal}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((userStats.moviesThisMonth / userStats.monthlyGoal) * 100, 100)} 
                    sx={{ height: 8, borderRadius: 4 }} 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {userStats.moviesThisMonth >= userStats.monthlyGoal 
                      ? "Congratulations! You've reached your monthly goal!" 
                      : `${userStats.monthlyGoal - userStats.moviesThisMonth} more to reach your goal!`
                    }
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Hours</Typography>
                    <Typography variant="body2" fontWeight={600}>{userStats.hoursWatched}h</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Genres Explored</Typography>
                    <Typography variant="body2" fontWeight={600}>{userStats.genresExplored}/20</Typography>
                  </Box>
                </Stack>
              </Card>
              <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Achievements
                </Typography>
                <Stack spacing={2}>
                  {getAchievements().map((achievement, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      opacity: achievement.unlocked ? 1 : 0.6
                    }}>
                      {achievement.icon}
                      <Box>
                        <Typography 
                          variant="body2" 
                          fontWeight={600}
                          color={achievement.unlocked ? 'text.primary' : 'text.secondary'}
                        >
                          {achievement.title}
                          {achievement.unlocked && (
                            <Chip 
                              label="Unlocked" 
                              size="small" 
                              color="success" 
                              sx={{ ml: 1, fontSize: '0.6rem', height: 18 }} 
                            />
                          )}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color={achievement.unlocked ? 'text.secondary' : 'text.disabled'}
                        >
                          {achievement.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Box>
          </TabPanel>

          
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Privacy & Security
            </Typography>
            <Stack spacing={3}>
              
              <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  <VpnKey sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Security
                </Typography>
                <Stack spacing={2}>
                  <Button 
                    variant="outlined" 
                    startIcon={<VpnKey />} 
                    fullWidth
                    onClick={() => setShowPasswordDialog(true)}
                  >
                    Change Password
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Email />} 
                    fullWidth
                    onClick={() => setShowEmailDialog(true)}
                  >
                    Update Email
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<CloudUpload />} 
                    fullWidth
                    onClick={() => setShowExportDialog(true)}
                    disabled={exportLoading}
                  >
                    {exportLoading ? 'Exporting...' : 'Export Data'}
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<CloudDownload />} 
                    fullWidth
                    onClick={() => setShowImportDialog(true)}
                    disabled={importLoading}
                  >
                    {importLoading ? 'Importing...' : 'Import Data'}
                  </Button>
                </Stack>
              </Card>

              
              <Card sx={{ 
                p: 3, 
                border: '2px solid', 
                borderColor: 'error.main',
                bgcolor: 'error.50',
                '&:hover': {
                  borderColor: 'error.dark',
                  bgcolor: 'error.100'
                }
              }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom color="error.main">
                  <Delete sx={{ mr: 1, verticalAlign: 'middle' }} />
                  ⚠️ Danger Zone
                </Typography>
                <Typography variant="body2" color="error.dark" fontWeight={500} sx={{ mb: 2 }}>
                  Once you delete your account, there is no going back. Please be certain.
                </Typography>
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<Delete />}
                  onClick={() => setShowDeleteDialog(true)}
                  sx={{
                    fontWeight: 600,
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                >
                  Delete Account
                </Button>
              </Card>

              
              <Box sx={{ pt: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Logout />}
                  onClick={handleLogout}
                  fullWidth
                  size="large"
                >
                  Sign Out
                </Button>
              </Box>
            </Stack>
          </TabPanel>
        </Paper>
      </Container>

      
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Delete color="error" />
            Delete Account
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </Typography>
          </Alert>
          <Typography variant="body2">
            Are you absolutely sure you want to delete your account? Please type <strong>DELETE</strong> to confirm.
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            placeholder="Type DELETE to confirm"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error" 
            variant="contained"
            startIcon={<Delete />}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Current Password"
              type="password"
              variant="outlined"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              variant="outlined"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              fullWidth
            />
            <TextField
              label="Confirm New Password"
              type="password"
              variant="outlined"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordChange} 
            variant="contained"
            color="primary"
            startIcon={passwordLoading ? <CircularProgress size={16} /> : <Save />}
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      
      <Dialog
        open={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Email</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="New Email"
              type="email"
              variant="outlined"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              value={emailForm.password}
              onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEmailDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleEmailUpdate} 
            variant="contained"
            color="primary"
            startIcon={emailLoading ? <CircularProgress size={16} /> : <Save />}
            disabled={emailLoading}
          >
            {emailLoading ? 'Updating...' : 'Update Email'}
          </Button>
        </DialogActions>
      </Dialog>

      
      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Your Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Download data for your current profile "{activeProfile?.name}" including watchlist, favorites, and activity history.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The data will be exported as a JSON file that you can save and import to other profiles.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExportData} 
            variant="contained"
            color="primary"
            startIcon={exportLoading ? <CircularProgress size={16} /> : <CloudUpload />}
            disabled={exportLoading}
          >
            {exportLoading ? 'Exporting...' : 'Export Data'}
          </Button>
        </DialogActions>
      </Dialog>

      
      <Dialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Your Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Import your previously exported data to the current profile ({activeProfile?.name}). 
            This will add new watchlist items and favorites to your current profile.
          </Typography>
          
          
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudDownload />}
              fullWidth
              sx={{ height: 56 }}
            >
              {importFile ? importFile.name : 'Select JSON File'}
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleFileSelect}
              />
            </Button>
          </Box>

          
          {importError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {importError}
            </Alert>
          )}

          
          {importPreview && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Data Preview:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Watchlist Items:</strong> {importPreview.watchlist?.length || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Favorites:</strong> {importPreview.favorites?.length || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Export Date:</strong> {importPreview.exportDate ? new Date(importPreview.exportDate).toLocaleDateString() : 'Unknown'}
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Importing data will add new items to your current profile. 
              Existing items with the same movie ID will be skipped to prevent duplicates.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowImportDialog(false);
              setImportFile(null);
              setImportPreview(null);
              setImportError('');
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImportData} 
            variant="contained"
            color="primary"
            startIcon={importLoading ? <CircularProgress size={16} /> : <CloudDownload />}
            disabled={importLoading || !importPreview || !activeProfile}
          >
            {importLoading ? 'Importing...' : 'Import Data'}
          </Button>
        </DialogActions>
      </Dialog>

      
      <Dialog
        open={showProfilePictureDialog}
        onClose={() => setShowProfilePictureDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Choose Profile Picture
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a profile picture from the options below:
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: 2,
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {PROFILE_PICTURES.map((pictureUrl, index) => (
              <Box
                key={index}
                onClick={() => handleProfilePictureSelect(pictureUrl)}
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: 2,
                  overflow: 'hidden',
                  aspectRatio: '1',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.2s ease-in-out',
                  border: user?.profilePicture === pictureUrl ? '3px solid' : '2px solid',
                  borderColor: user?.profilePicture === pictureUrl ? 'primary.main' : 'divider',
                }}
              >
                <Avatar
                  src={pictureUrl}
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 2,
                  }}
                >
                  <Person />
                </Avatar>
                {user?.profilePicture === pictureUrl && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✓
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProfilePictureDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
