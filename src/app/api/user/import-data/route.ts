import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { watchlist, favorites, profiles } from '@/lib/db/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const body = await request.json();
    const { data, mergeStrategy = 'add' } = body;

    if (!data) {
      return NextResponse.json({ error: 'Import data is required' }, { status: 400 });
    }

    let watchlistAdded = 0;
    let favoritesAdded = 0;


    if (data.watchlist && Array.isArray(data.watchlist)) {
      for (const item of data.watchlist) {
        try {

          const existing = await db
            .select()
            .from(watchlist)
            .where(and(
              eq(watchlist.userId, userId),
              eq(watchlist.profileId, profileId),
              eq(watchlist.movieId, item.movieId)
            ))
            .limit(1);

          if (existing.length === 0) {
            await db
              .insert(watchlist)
              .values({
                userId,
                profileId,
                movieId: item.movieId,
                movieTitle: item.movieTitle,
                moviePoster: item.moviePoster,
                movieReleaseDate: item.movieReleaseDate,
                movieGenres: item.movieGenres,
                movieOverview: item.movieOverview,
                movieRating: item.movieRating,
                status: item.status || 'to_watch',
                watchedAt: item.watchedAt ? new Date(item.watchedAt) : null,
              });
            watchlistAdded++;
          }
        } catch (error) {
          console.error('Error importing watchlist item:', error);
        }
      }
    }


    if (data.favorites && Array.isArray(data.favorites)) {
      for (const item of data.favorites) {
        try {

          const existing = await db
            .select()
            .from(favorites)
            .where(and(
              eq(favorites.userId, userId),
              eq(favorites.profileId, profileId),
              eq(favorites.movieId, item.movieId)
            ))
            .limit(1);

          if (existing.length === 0) {
            await db
              .insert(favorites)
              .values({
                userId,
                profileId,
                movieId: item.movieId,
                movieTitle: item.movieTitle || item.title || '',
                moviePoster: item.moviePoster || item.poster || '',
                movieReleaseDate: item.movieReleaseDate || item.releaseDate || '',
                movieGenres: item.movieGenres || '',
                movieOverview: item.movieOverview || '',
                movieRating: item.movieRating || item.rating || '',
              });
            favoritesAdded++;
          }
        } catch (error) {
          console.error('Error importing favorites item:', error);
        }
      }
    }

    return NextResponse.json({
      message: 'Data imported successfully',
      watchlistAdded,
      favoritesAdded,
      totalProcessed: (data.watchlist?.length || 0) + (data.favorites?.length || 0),
    });

  } catch (error) {
    console.error('Import data error:', error);
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    );
  }
}
