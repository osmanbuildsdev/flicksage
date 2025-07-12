'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Watchlist, Profile } from '@/lib/db/schema';

interface WatchlistItem {
  id: string;
  movieId: number;
  movieTitle: string;
  moviePoster?: string | null;
  movieReleaseDate?: string | null;
  movieGenres?: string | null;
  movieOverview?: string | null;
  movieRating?: string | null;
  status: 'to_watch' | 'watched';
  addedAt: Date;
  watchedAt?: Date | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeProfile: Profile | null;
  profiles: Profile[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsProfileSelection?: boolean }>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; error?: string; needsProfileSelection?: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
  setActiveProfile: (profile: Profile) => void;
  refreshProfiles: () => Promise<void>;
  favorites: number[];
  addToFavorites: (movieId: number, movieData?: any) => Promise<boolean>;
  removeFromFavorites: (movieId: number) => Promise<boolean>;
  isInFavorites: (movieId: number) => boolean;
  watchlist: WatchlistItem[];
  addToWatchlist: (movie: any, status?: 'to_watch' | 'watched') => Promise<boolean>;
  removeFromWatchlist: (movieId: number) => Promise<boolean>;
  updateWatchlistStatus: (movieId: number, status: 'to_watch' | 'watched') => Promise<boolean>;
  isInWatchlist: (movieId: number) => boolean;
  getWatchlistStatus: (movieId: number) => 'to_watch' | 'watched' | null;
  refreshWatchlist: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {  
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    setMounted(true);
    

    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    const storedProfile = localStorage.getItem('active_profile');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        

        if (storedProfile) {
          setActiveProfile(JSON.parse(storedProfile));
        }
        

        setTimeout(() => {
          refreshFavorites();
          refreshWatchlist();
        }, 100);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('active_profile');
      }
    }    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        setProfiles(data.profiles || []);
        
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        

        if (data.profiles && data.profiles.length === 1) {
          handleSetActiveProfile(data.profiles[0], false); // Login sırasında sayfa yenileme
          setTimeout(() => {
            refreshWatchlist();
            refreshFavorites();
          }, 100);
          return { success: true };
        } else {
          return { success: true, needsProfileSelection: true };
        }
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Bağlantı hatası oluştu' };
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        setProfiles(data.profiles || []);
        
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        

        if (data.profiles && data.profiles.length > 0) {
          handleSetActiveProfile(data.profiles[0], false); // Register sırasında sayfa yenileme
        } else if (data.defaultProfile) {

          handleSetActiveProfile(data.defaultProfile, false);
          setProfiles([data.defaultProfile]);
        }
        
        setTimeout(() => {
          refreshWatchlist();
          refreshFavorites();
        }, 100);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Bağlantı hatası oluştu' };
    }
  };  const logout = async () => {
    try {

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    

    setUser(null);
    setToken(null);
    setActiveProfile(null);
    setProfiles([]);
    setFavorites([]);
    setWatchlist([]);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('active_profile');
    localStorage.removeItem('user_favorites');
  };

  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const addToFavorites = async (movieId: number, movieData?: any): Promise<boolean> => {
    if (!isAuthenticated || !token || !activeProfile) return false;
    
    try {

      let movie = movieData;
      if (!movie) {
        const tmdbResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
        if (tmdbResponse.ok) {
          movie = await tmdbResponse.json();
        }
      }

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-profile-id': activeProfile.id,
        },
        body: JSON.stringify({
          movieId,
          movieTitle: movie?.title || `Movie ${movieId}`,
          moviePoster: movie?.poster_path,
          movieReleaseDate: movie?.release_date,
          movieGenres: movie?.genres ? movie.genres.map((g: any) => g.name).join(',') : '',
          movieOverview: movie?.overview,
          movieRating: movie?.vote_average?.toString(),
        }),
      });

      if (response.ok) {
        await refreshFavorites();
        return true;
      } else {
        const errorData = await response.json();
        if (errorData.error === 'Movie already in favorites') {

          await refreshFavorites();
          return true;
        }
        console.error('Error adding to favorites:', errorData);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
    return false;
  };

  const removeFromFavorites = async (movieId: number): Promise<boolean> => {
    if (!isAuthenticated || !token || !activeProfile) return false;
    
    try {
      const response = await fetch(`/api/favorites?movieId=${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-profile-id': activeProfile.id,
        },
      });

      if (response.ok) {
        await refreshFavorites();
        return true;
      } else {
        console.error('Error removing from favorites:', await response.json());
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
    return false;
  };
  const isInFavorites = (movieId: number): boolean => {
    return favorites.includes(movieId);
  };



  const addToWatchlist = async (movie: any, status: 'to_watch' | 'watched' = 'to_watch'): Promise<boolean> => {
    if (!isAuthenticated || !activeProfile) {
      console.log('User not authenticated or profile not selected for watchlist');
      return false;
    }
    
    console.log('Adding to watchlist:', { movieId: movie.id, movieTitle: movie.title, user: user?.email, profile: activeProfile.name });
    
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-profile-id': activeProfile.id,
        },
        credentials: 'include',
        body: JSON.stringify({
          movieId: movie.id,
          movieTitle: movie.title,
          moviePoster: movie.poster_path,
          movieReleaseDate: movie.release_date,
          movieGenres: movie.genre_ids ? movie.genre_ids.join(',') : '',
          movieOverview: movie.overview,
          movieRating: movie.vote_average?.toString(),
          status,
        }),
      });

      console.log('Watchlist API response status:', response.status);
      
      if (response.ok) {
        await refreshWatchlist();
        console.log('Successfully added to watchlist');
        return true;
      } else {
        const errorData = await response.text();
        console.error('Watchlist API error:', response.status, errorData);
        if (response.status === 401) {
          console.log('Authentication failed - user needs to login again');

        }
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
    return false;
  };

  const removeFromWatchlist = async (movieId: number): Promise<boolean> => {
    if (!isAuthenticated || !activeProfile) return false;
    
    try {
      const response = await fetch(`/api/watchlist?movieId=${movieId}`, {
        method: 'DELETE',
        headers: {
          'x-profile-id': activeProfile.id,
        },
        credentials: 'include',
      });

      if (response.ok) {
        setWatchlist(prev => prev.filter(item => item.movieId !== movieId));
        return true;
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
    return false;
  };

  const updateWatchlistStatus = async (movieId: number, status: 'to_watch' | 'watched'): Promise<boolean> => {
    if (!isAuthenticated || !activeProfile) return false;
    
    try {
      const response = await fetch('/api/watchlist', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-profile-id': activeProfile.id,
        },
        credentials: 'include',
        body: JSON.stringify({ movieId, status }),
      });

      if (response.ok) {
        setWatchlist(prev => prev.map(item => 
          item.movieId === movieId 
            ? { ...item, status, watchedAt: status === 'watched' ? new Date() : null }
            : item
        ));
        return true;
      }
    } catch (error) {
      console.error('Error updating watchlist status:', error);
    }
    return false;
  };

  const isInWatchlist = (movieId: number): boolean => {
    return watchlist.some(item => item.movieId === movieId);
  };

  const getWatchlistStatus = (movieId: number): 'to_watch' | 'watched' | null => {
    const item = watchlist.find(item => item.movieId === movieId);
    return item ? item.status : null;
  };
  const isAuthenticated = !!user && !!token;


  const refreshWatchlist = useCallback(async () => {
    if (!user || !token || !activeProfile) return; // Daha spesifik kontrol
    
    try {
      const response = await fetch('/api/watchlist', {
        method: 'GET',
        headers: {
          'x-profile-id': activeProfile.id,
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data.watchlist.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
          watchedAt: item.watchedAt ? new Date(item.watchedAt) : null,
        })));
      }
    } catch (error) {
      console.error('Error refreshing watchlist:', error);
    }
  }, [user, token, activeProfile]); // user, token ve activeProfile'a bağlı


  const refreshFavorites = useCallback(async () => {
    if (!token || !activeProfile) return;
    
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-profile-id': activeProfile.id,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const favoriteIds = data.favorites.map((fav: any) => fav.movieId);
        setFavorites(favoriteIds);
        localStorage.setItem('user_favorites', JSON.stringify(favoriteIds));
      }
    } catch (error) {
      console.error('Error refreshing favorites:', error);
    }
  }, [token, activeProfile]);

  const refreshProfiles = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/profiles', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Error refreshing profiles:', error);
    }
  }, [token]);

  const handleSetActiveProfile = useCallback((profile: Profile, shouldReload = true) => {
    setActiveProfile(profile);
    localStorage.setItem('active_profile', JSON.stringify(profile));
    

    setWatchlist([]);
    setFavorites([]);
    

    setTimeout(() => {
      refreshFavorites();
      refreshWatchlist();
      if (shouldReload) {
        setTimeout(() => {
          window.location.reload();
        }, 200);
      }
    }, 100);
  }, [refreshFavorites, refreshWatchlist]);

  return (
    <AuthContext.Provider 
      value={{
        user,
        token,
        activeProfile,
        profiles,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated,
        updateUser,
        setActiveProfile: handleSetActiveProfile,
        favorites,
        addToFavorites,
        removeFromFavorites,
        isInFavorites,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        updateWatchlistStatus,
        isInWatchlist,
        getWatchlistStatus,
        refreshWatchlist,
        refreshFavorites,
        refreshProfiles,
      }}
    >
      {mounted ? children : null}
    </AuthContext.Provider>
  );
};
