import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
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

    const { profilePicture } = await request.json();

    if (!profilePicture) {
      return NextResponse.json({ error: 'Profile picture URL is required' }, { status: 400 });
    }


    try {
      new URL(profilePicture);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid profile picture URL' }, { status: 400 });
    }


    await db
      .update(users)
      .set({ 
        profilePicture: profilePicture,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ 
      success: true, 
      message: 'Profile picture updated successfully',
      profilePicture: profilePicture
    });

  } catch (error) {
    console.error('Update profile picture API error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile picture' },
      { status: 500 }
    );
  }
}
