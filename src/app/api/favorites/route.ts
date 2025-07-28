import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { favorites, profiles } from '@/lib/db/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
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
        eq(profiles.userId, decoded.userId)
      ))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ error: 'Profile not found or not accessible' }, { status: 403 });
    }


    const userFavorites = await db
      .select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, decoded.userId),
        eq(favorites.profileId, profileId)
      ))
      .orderBy(favorites.addedAt);

    return NextResponse.json({
      favorites: userFavorites,
      total: userFavorites.length
    });

  } catch (error) {
    console.error('Favorites API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
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
        eq(profiles.userId, decoded.userId)
      ))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ error: 'Profile not found or not accessible' }, { status: 403 });
    }

    const body = await request.json();
    const { movieId, movieTitle, moviePoster, movieReleaseDate, movieGenres, movieOverview, movieRating } = body;

    if (!movieId || !movieTitle) {
      return NextResponse.json(
        { error: 'Movie ID and title are required' },
        { status: 400 }
      );
    }


    const existing = await db
      .select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, decoded.userId),
        eq(favorites.profileId, profileId),
        eq(favorites.movieId, movieId)
      ));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Movie already in favorites' },
        { status: 409 }
      );
    }


    const newFavorite = await db
      .insert(favorites)
      .values({
        userId: decoded.userId,
        profileId,
        movieId,
        movieTitle,
        moviePoster,
        movieReleaseDate,
        movieGenres,
        movieOverview,
        movieRating,
      })
      .returning();

    return NextResponse.json({ 
      message: 'Movie added to favorites',
      favorite: newFavorite[0]
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
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
        eq(profiles.userId, decoded.userId)
      ))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ error: 'Profile not found or not accessible' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');

    if (!movieId) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }


    await db
      .delete(favorites)
      .where(and(
        eq(favorites.userId, decoded.userId),
        eq(favorites.profileId, profileId),
        eq(favorites.movieId, parseInt(movieId))
      ));

    return NextResponse.json({ 
      message: 'Movie removed from favorites'
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
