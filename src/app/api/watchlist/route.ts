import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { watchlist, users, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}


export async function GET(request: NextRequest) {
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

    const userWatchlist = await db
      .select()
      .from(watchlist)
      .where(and(
        eq(watchlist.userId, userId),
        eq(watchlist.profileId, profileId)
      ))
      .orderBy(watchlist.addedAt);

    return NextResponse.json({ watchlist: userWatchlist });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const { 
      movieId, 
      movieTitle, 
      moviePoster, 
      movieReleaseDate, 
      movieGenres, 
      movieOverview, 
      movieRating,
      status = 'to_watch' 
    } = body;

    if (!movieId || !movieTitle) {
      return NextResponse.json({ error: 'Movie ID and title are required' }, { status: 400 });
    }


    const existingEntry = await db
      .select()
      .from(watchlist)
      .where(and(
        eq(watchlist.userId, userId),
        eq(watchlist.profileId, profileId),
        eq(watchlist.movieId, movieId)
      ))
      .limit(1);

    if (existingEntry.length > 0) {
      return NextResponse.json({ error: 'Movie already in watchlist' }, { status: 409 });
    }

    const newEntry = await db
      .insert(watchlist)
      .values({
        userId,
        profileId,
        movieId: parseInt(movieId),
        movieTitle,
        moviePoster,
        movieReleaseDate,
        movieGenres,
        movieOverview,
        movieRating,
        status,
        watchedAt: status === 'watched' ? new Date() : null,
      })
      .returning();

    return NextResponse.json({ watchlist: newEntry[0] }, { status: 201 });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function PUT(request: NextRequest) {
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
    const { movieId, status } = body;

    if (!movieId || !status) {
      return NextResponse.json({ error: 'Movie ID and status are required' }, { status: 400 });
    }

    if (status !== 'to_watch' && status !== 'watched') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedEntry = await db
      .update(watchlist)
      .set({
        status,
        watchedAt: status === 'watched' ? new Date() : null,
      })
      .where(and(
        eq(watchlist.userId, userId),
        eq(watchlist.profileId, profileId),
        eq(watchlist.movieId, parseInt(movieId))
      ))
      .returning();

    if (updatedEntry.length === 0) {
      return NextResponse.json({ error: 'Movie not found in watchlist' }, { status: 404 });
    }

    return NextResponse.json({ watchlist: updatedEntry[0] });
  } catch (error) {
    console.error('Error updating watchlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }

    const deletedEntry = await db
      .delete(watchlist)
      .where(and(
        eq(watchlist.userId, userId),
        eq(watchlist.profileId, profileId),
        eq(watchlist.movieId, parseInt(movieId))
      ))
      .returning();

    if (deletedEntry.length === 0) {
      return NextResponse.json({ error: 'Movie not found in watchlist' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Movie removed from watchlist' });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
