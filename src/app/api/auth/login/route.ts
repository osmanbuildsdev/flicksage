import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, profiles } from '@/lib/db/schema';
import { comparePassword, validateEmail, generateToken } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;


    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi girin' },
        { status: 400 }
      );
    }


    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { status: 401 }
      );
    }

    const user = userResult[0];


    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { status: 401 }
      );
    }


    const token = generateToken(user);


    const userProfiles = await db
      .select()
      .from(profiles)
      .where(and(
        eq(profiles.userId, user.id),
        eq(profiles.isActive, true)
      ))
      .orderBy(profiles.createdAt);


    const { password: _, ...userWithoutPassword } = user;
    const response = NextResponse.json({
      message: 'Giriş başarılı',
      user: userWithoutPassword,
      profiles: userProfiles, // Include user's profiles
      token,
    }, { status: 200 });


    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
