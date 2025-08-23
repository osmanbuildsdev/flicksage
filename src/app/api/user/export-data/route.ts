import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, watchlist, favorites, profiles } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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


    const profileId = request.headers.get('x-profile-id');
    
    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
    }


    const profile = await db
      .select()
      .from(profiles)
      .where(and(
        eq(profiles.id, profileId),
        eq(profiles.userId, userId)
      ))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ error: 'Profile not found or not accessible' }, { status: 403 });
    }


    const userData = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userData.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }


    const watchlistData = await db
      .select({
        id: watchlist.id,
        movieId: watchlist.movieId,
        movieTitle: watchlist.movieTitle,
        moviePoster: watchlist.moviePoster,
        movieRating: watchlist.movieRating,
        movieReleaseDate: watchlist.movieReleaseDate,
        movieGenres: watchlist.movieGenres,
        movieOverview: watchlist.movieOverview,
        status: watchlist.status,
        addedAt: watchlist.addedAt,
        watchedAt: watchlist.watchedAt,
      })
      .from(watchlist)
      .where(and(
        eq(watchlist.userId, userId),
        eq(watchlist.profileId, profileId)
      ))
      .orderBy(desc(watchlist.addedAt));


    const favoritesData = await db
      .select({
        id: favorites.id,
        movieId: favorites.movieId,
        movieTitle: favorites.movieTitle,
        moviePoster: favorites.moviePoster,
        movieRating: favorites.movieRating,
        movieReleaseDate: favorites.movieReleaseDate,
        movieGenres: favorites.movieGenres,
        movieOverview: favorites.movieOverview,
        addedAt: favorites.addedAt,
      })
      .from(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.profileId, profileId)
      ))
      .orderBy(desc(favorites.addedAt));


    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        exportedBy: 'Flick Sage',
        dataVersion: '1.0',
      },
      profile: {
        id: userData[0].id,
        firstName: userData[0].firstName,
        lastName: userData[0].lastName,
        email: userData[0].email,
        emailVerified: userData[0].emailVerified,
        accountCreated: userData[0].createdAt,
        lastUpdated: userData[0].updatedAt,
        currentProfile: {
          id: profile[0].id,
          name: profile[0].name,
          avatar: profile[0].avatar,
          isKidsProfile: profile[0].isKidsProfile,
          language: profile[0].language,
        },
      },
      statistics: {
        totalWatchlistItems: watchlistData.length,
        totalFavorites: favoritesData.length,
        moviesWatched: watchlistData.filter(item => item.status === 'watched').length,
        moviesToWatch: watchlistData.filter(item => item.status === 'to-watch').length,
      },
      watchlist: watchlistData.map(item => ({
        movieId: item.movieId,
        movieTitle: item.movieTitle,
        moviePoster: item.moviePoster,
        movieRating: item.movieRating,
        movieReleaseDate: item.movieReleaseDate,
        movieGenres: item.movieGenres,
        movieOverview: item.movieOverview,
        status: item.status,
        addedAt: item.addedAt,
        watchedAt: item.watchedAt,
      })),
      favorites: favoritesData.map(item => ({
        movieId: item.movieId,
        movieTitle: item.movieTitle,
        moviePoster: item.moviePoster,
        movieRating: item.movieRating,
        movieReleaseDate: item.movieReleaseDate,
        movieGenres: item.movieGenres,
        movieOverview: item.movieOverview,
        addedAt: item.addedAt,
      })),
    };


    const jsonString = JSON.stringify(exportData, null, 2);
    const buffer = Buffer.from(jsonString, 'utf8');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="flick-sage-data-${new Date().toISOString().split('T')[0]}.json"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Export data API error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
