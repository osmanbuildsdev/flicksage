'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
  ChildCare,
  Movie,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { PROFILE_AVATARS } from '@/utils/avatars';
import { Profile } from '@/lib/db/schema';

const ProfileSelectionPage: React.FC = () => {
  const { user, token, isAuthenticated, setActiveProfile, profiles: authProfiles, refreshProfiles } = useAuth();
  const router = useRouter();
  const { mode } = useTheme();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    avatar: '',
    isKidsProfile: false,
    language: 'en',
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    

    if (authProfiles && authProfiles.length > 0) {
      setProfiles(authProfiles);
      setLoading(false);
    } else {

      fetchProfiles();
    }
  }, [isAuthenticated, router, authProfiles]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profiles', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles);
      } else {
        console.error('Failed to fetch profiles');
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (profile: Profile) => {
    try {
      const response = await fetch('/api/profiles/select', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId: profile.id }),
      });

      if (response.ok) {

        setActiveProfile(profile);
        router.push('/homepage');
      } else {
        console.error('Failed to select profile');
      }
    } catch (error) {
      console.error('Error selecting profile:', error);
    }
  };

  const handleCreateProfile = async () => {
    if (!profileForm.name.trim()) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        await fetchProfiles();
        await refreshProfiles(); // Update profiles in AuthContext
        setShowCreateDialog(false);
        setProfileForm({ name: '', avatar: '', isKidsProfile: false, language: 'en' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('An error occurred while creating profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProfile = async () => {
    if (!editingProfile || !profileForm.name.trim()) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/profiles', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: editingProfile.id,
          ...profileForm,
        }),
      });

      if (response.ok) {
        await fetchProfiles();
        await refreshProfiles(); // Update profiles in AuthContext
        setShowEditDialog(false);
        setEditingProfile(null);
        setProfileForm({ name: '', avatar: '', isKidsProfile: false, language: 'en' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProfile = async (profile: Profile) => {
    if (!confirm(`Are you sure you want to delete "${profile.name}" profile?`)) return;

    try {
      const response = await fetch(`/api/profiles?profileId=${profile.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchProfiles();
        await refreshProfiles(); // Update profiles in AuthContext
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete profile');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('An error occurred while deleting profile');
    }
  };

  const openEditDialog = (profile: Profile) => {
    setEditingProfile(profile);
    setProfileForm({
      name: profile.name,
      avatar: profile.avatar || '',
      isKidsProfile: profile.isKidsProfile ?? false,
      language: profile.language ?? 'en',
    });
    setShowEditDialog(true);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: mode === 'dark' ? '#141414' : '#f5f5f5',
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              mb: 3,
            }}
          >
            <Movie sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h3" fontWeight={700} color="text.primary">
              Flick Sage
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Who's watching?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select a profile to continue
          </Typography>
        </Box>

        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {profiles.map((profile) => (
            <Box key={profile.id}>
              <Card
                sx={{
                  width: 200,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  bgcolor: mode === 'dark' ? '#1f1f1f' : 'white',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    borderColor: 'primary.main',
                    boxShadow: `0 8px 25px rgba(33, 150, 243, 0.3)`,
                  },
                }}
                onClick={() => handleSelectProfile(profile)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Avatar
                      src={profile.avatar || undefined}
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: profile.isKidsProfile ? 'warning.main' : 'primary.main',
                        fontSize: '3rem',
                      }}
                    >
                      {profile.isKidsProfile ? (
                        <ChildCare sx={{ fontSize: 60 }} />
                      ) : (
                        <Person sx={{ fontSize: 60 }} />
                      )}
                    </Avatar>
                    
                    {profile.isKidsProfile && (
                      <Chip
                        label="Kids"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 20,
                          bgcolor: 'warning.main',
                          color: 'white',
                        }}
                      />
                    )}
                  </Box>
                  
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {profile.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(profile);
                      }}
                      sx={{ color: 'text.secondary' }}
                    >
                      <Edit />
                    </IconButton>
                    {profiles.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProfile(profile);
                        }}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}

          
          {profiles.length < 5 && (
            <Box>
              <Card
                sx={{
                  width: 200,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px dashed',
                  borderColor: 'divider',
                  bgcolor: 'transparent',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'scale(1.05)',
                  },
                }}
                onClick={() => setShowCreateDialog(true)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'action.hover',
                      border: '2px dashed',
                      borderColor: 'text.secondary',
                    }}
                  >
                    <Add sx={{ fontSize: 60, color: 'text.secondary' }} />
                  </Avatar>
                  <Typography variant="h6" color="text.secondary">
                    Add Profile
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>

        
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body2" color="text.secondary">
            Account: {user?.email}
          </Typography>
          <Button
            variant="text"
            color="error"
            onClick={() => router.push('/login')}
            sx={{ mt: 1 }}
          >
            Switch Account
          </Button>
        </Box>
      </Container>

      
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Profile Name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              fullWidth
              required
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Choose Avatar
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 200, overflow: 'auto' }}>
                {PROFILE_AVATARS.map((avatar, index) => (
                  <Avatar
                    key={index}
                    src={avatar}
                    sx={{
                      width: 50,
                      height: 50,
                      cursor: 'pointer',
                      border: profileForm.avatar === avatar ? '3px solid' : '2px solid transparent',
                      borderColor: profileForm.avatar === avatar ? 'primary.main' : 'transparent',
                    }}
                    onClick={() => setProfileForm({ ...profileForm, avatar })}
                  />
                ))}
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={profileForm.isKidsProfile}
                  onChange={(e) => setProfileForm({ ...profileForm, isKidsProfile: e.target.checked })}
                />
              }
              label="Kids Profile"
            />

            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={profileForm.language}
                onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                label="Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="tr">Türkçe</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateProfile}
            variant="contained"
            disabled={!profileForm.name.trim() || actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Profile Name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              fullWidth
              required
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Choose Avatar
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 200, overflow: 'auto' }}>
                {PROFILE_AVATARS.map((avatar, index) => (
                  <Avatar
                    key={index}
                    src={avatar}
                    sx={{
                      width: 50,
                      height: 50,
                      cursor: 'pointer',
                      border: profileForm.avatar === avatar ? '3px solid' : '2px solid transparent',
                      borderColor: profileForm.avatar === avatar ? 'primary.main' : 'transparent',
                    }}
                    onClick={() => setProfileForm({ ...profileForm, avatar })}
                  />
                ))}
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={profileForm.isKidsProfile}
                  onChange={(e) => setProfileForm({ ...profileForm, isKidsProfile: e.target.checked })}
                />
              }
              label="Kids Profile"
            />

            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={profileForm.language}
                onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                label="Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="tr">Türkçe</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleEditProfile}
            variant="contained"
            disabled={!profileForm.name.trim() || actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileSelectionPage;
