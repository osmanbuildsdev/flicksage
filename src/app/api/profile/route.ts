import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, watchlist, favorites } from '@/lib/db/schema';
import { eq, count, and, desc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface JWTPayload {
  userId: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }


    const userProfile = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profilePicture: users.profilePicture,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userProfile.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userProfile[0];


    const watchlistStats = await db
      .select({
        total: count(),
      })
      .from(watchlist)
      .where(eq(watchlist.userId, userId));

    const watchedMoviesStats = await db
      .select({
        watched: count(),
      })
      .from(watchlist)
      .where(and(
        eq(watchlist.userId, userId),
        eq(watchlist.status, 'watched')
      ));

    const toWatchStats = await db
      .select({
        toWatch: count(),
      })
      .from(watchlist)
      .where(and(
        eq(watchlist.userId, userId),
        eq(watchlist.status, 'to_watch')
      ));


    const favoritesStats = await db
      .select({
        total: count(),
      })
      .from(favorites)
      .where(eq(favorites.userId, userId));


    const recentWatchlistActivity = await db
      .select({
        id: watchlist.id,
        movieId: watchlist.movieId,
        movieTitle: watchlist.movieTitle,
        moviePoster: watchlist.moviePoster,
        movieRating: watchlist.movieRating,
        status: watchlist.status,
        addedAt: watchlist.addedAt,
        watchedAt: watchlist.watchedAt,
      })
      .from(watchlist)
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.addedAt))
      .limit(5);

    const recentFavoritesActivity = await db
      .select({
        id: favorites.id,
        movieId: favorites.movieId,
        movieTitle: favorites.movieTitle,
        moviePoster: favorites.moviePoster,
        movieRating: favorites.movieRating,
        addedAt: favorites.addedAt,
      })
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.addedAt))
      .limit(5);


    const allActivities = [
      ...recentWatchlistActivity.map(item => ({
        id: item.id,
        type: item.status === 'watched' ? 'watched' : 'watchlist',
        movieId: item.movieId,
        title: item.movieTitle,
        poster: item.moviePoster,
        rating: item.movieRating,
        date: item.status === 'watched' ? item.watchedAt : item.addedAt,
        timestamp: item.addedAt,
      })),
      ...recentFavoritesActivity.map(item => ({
        id: item.id,
        type: 'favorite',
        movieId: item.movieId,
        title: item.movieTitle,
        poster: item.moviePoster,
        rating: item.movieRating,
        date: item.addedAt,
        timestamp: item.addedAt,
      }))
    ].sort((a, b) => {
      const dateA = new Date(a.timestamp as unknown as string).getTime();
      const dateB = new Date(b.timestamp as unknown as string).getTime();
      return dateB - dateA;
    }).slice(0, 10);


    const watchedMovies = await db
      .select({
        movieRating: watchlist.movieRating,
      })
      .from(watchlist)
      .where(and(
        eq(watchlist.userId, userId),
        eq(watchlist.status, 'watched')
      ));


    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const moviesThisMonthStats = await db
      .select({
        thisMonth: count(),
      })
      .from(watchlist)
      .where(and(
        eq(watchlist.userId, userId),
        eq(watchlist.status, 'watched')
      ));
    


    const moviesThisMonth = Math.min(watchedMovies.length, 12); // Mock data for this month

    let averageRating = 0;
    if (watchedMovies.length > 0) {
      const ratingsSum = watchedMovies.reduce((sum, movie) => {
        const rating = parseFloat(movie.movieRating || '0');
        return sum + rating;
      }, 0);
      averageRating = ratingsSum / watchedMovies.length;
    }


    const profileData = {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
        joinDate: user.createdAt,
        lastUpdate: user.updatedAt,
      },
      stats: {
        moviesWatched: watchedMoviesStats[0]?.watched || 0,
        watchlistItems: toWatchStats[0]?.toWatch || 0,
        totalItems: watchlistStats[0]?.total || 0,
        favoriteMovies: favoritesStats[0]?.total || 0,
        averageRating: Math.round(averageRating * 10) / 10,

        hoursWatched: Math.round((watchedMoviesStats[0]?.watched || 0) * 2.1),

        moviesThisMonth: moviesThisMonth,
        monthlyGoal: 15, // Default monthly goal, can be made configurable per user

        genresExplored: 0, // Will calculate from movie genres in the future
        friendsCount: 0, // Will be implemented when friends/social features are added
      },
      recentActivity: allActivities,
    };

    return NextResponse.json({ success: true, data: profileData });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email } = body;


    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }


    const updatedUser = await db
      .update(users)
      .set({
        firstName,
        lastName,
        email,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        updatedAt: users.updatedAt,
      });

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        user: updatedUser[0],
        message: 'Profile updated successfully'
      }
    });

  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
