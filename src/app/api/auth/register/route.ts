import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { users, profiles } from '@/lib/db/schema';
import { hashPassword, validateEmail, validatePassword, generateToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, confirmPassword } = body;


    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Tüm alanlar gereklidir' },
        { status: 400 }
      );
    }

    if (firstName.length < 2 || lastName.length < 2) {
      return NextResponse.json(
        { error: 'Ad ve soyad en az 2 karakter olmalıdır' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi girin' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Şifreler eşleşmiyor' },
        { status: 400 }
      );
    }


    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda' },
        { status: 409 }
      );
    }


    const hashedPassword = await hashPassword(password);


    const newUser = await db.insert(users).values({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    }).returning({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      createdAt: users.createdAt,
    });


    const defaultProfile = await db.insert(profiles).values({
      userId: newUser[0].id,
      name: firstName, // Use first name as default profile name
      avatar: null,
      isKidsProfile: false,
      language: 'tr',
      isActive: true,
    }).returning();


    const userProfiles = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, newUser[0].id))
      .orderBy(profiles.createdAt);


    const token = generateToken(newUser[0]);


    const response = NextResponse.json({
      message: 'Hesap başarıyla oluşturuldu',
      user: newUser[0],
      token,
      profiles: userProfiles, // Include all profiles (should be just the default one)
      defaultProfile: defaultProfile[0], // Keep for backward compatibility
    }, { status: 201 });


    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
