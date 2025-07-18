import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { profiles, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
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


    const userProfiles = await db
      .select()
      .from(profiles)
      .where(and(
        eq(profiles.userId, userId),
        eq(profiles.isActive, true)
      ))
      .orderBy(profiles.createdAt);

    return NextResponse.json({
      success: true,
      profiles: userProfiles
    });

  } catch (error) {
    console.error('Get profiles API error:', error);
    return NextResponse.json(
      { error: 'Failed to get profiles' },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
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

    const { name, avatar, isKidsProfile, language } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Profile name is required' }, { status: 400 });
    }


    const existingProfiles = await db
      .select()
      .from(profiles)
      .where(and(
        eq(profiles.userId, userId),
        eq(profiles.isActive, true)
      ));

    if (existingProfiles.length >= 5) {
      return NextResponse.json({ 
        error: 'Maximum 5 profiles allowed per account' 
      }, { status: 400 });
    }


    const duplicateName = existingProfiles.find(p => 
      p.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (duplicateName) {
      return NextResponse.json({ 
        error: 'Profile name already exists' 
      }, { status: 400 });
    }


    const newProfile = await db
      .insert(profiles)
      .values({
        userId,
        name: name.trim(),
        avatar: avatar || null,
        isKidsProfile: isKidsProfile || false,
        language: language || 'tr',
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      profile: newProfile[0],
      message: `${name} profili başarıyla oluşturuldu!`
    });

  } catch (error) {
    console.error('Create profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
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

    const { profileId, name, avatar, isKidsProfile, language } = await request.json();

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }


    const existingProfile = await db
      .select()
      .from(profiles)
      .where(and(
        eq(profiles.id, profileId),
        eq(profiles.userId, userId),
        eq(profiles.isActive, true)
      ))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }


    const updatedProfile = await db
      .update(profiles)
      .set({
        name: name?.trim(),
        avatar,
        isKidsProfile,
        language,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profileId))
      .returning();

    return NextResponse.json({
      success: true,
      profile: updatedProfile[0],
      message: 'Profil başarıyla güncellendi!'
    });

  } catch (error) {
    console.error('Update profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}


export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url);
    const profileId = url.searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }


    const userProfiles = await db
      .select()
      .from(profiles)
      .where(and(
        eq(profiles.userId, userId),
        eq(profiles.isActive, true)
      ));

    if (userProfiles.length <= 1) {
      return NextResponse.json({ 
        error: 'At least one profile must remain active' 
      }, { status: 400 });
    }


    const deletedProfile = await db
      .update(profiles)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(
        eq(profiles.id, profileId),
        eq(profiles.userId, userId)
      ))
      .returning();

    if (deletedProfile.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profil başarıyla silindi!'
    });

  } catch (error) {
    console.error('Delete profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}
