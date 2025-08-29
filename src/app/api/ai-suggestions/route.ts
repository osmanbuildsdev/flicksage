import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { users, profiles, favorites } from '../../../lib/db/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }


    const userProfiles = await db.select()
      .from(profiles)
      .where(eq(profiles.userId, decoded.userId))
      .limit(1);

    if (!userProfiles.length) {
      return NextResponse.json({ error: 'No profile found' }, { status: 404 });
    }


    const userFavorites = await db.select()
      .from(favorites)
      .where(eq(favorites.profileId, userProfiles[0].id));


    const favoriteMovies = userFavorites.map(fav => {
      const year = fav.movieReleaseDate ? new Date(fav.movieReleaseDate).getFullYear() : 'N/A';
      return `${fav.movieTitle} (${year})`;
    }).join(', ');


    const aiResponse = await generateAISuggestions(prompt, favoriteMovies);

    return NextResponse.json({ suggestions: aiResponse });

  } catch (error) {
    console.error('AI suggestions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateAISuggestions(userPrompt: string, favoriteMovies: string): Promise<any[]> {
  try {

    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const systemPrompt = `You are a movie recommendation expert. User's favorite movies: ${favoriteMovies || 'No favorite movies yet'}. 
    Based on the user's request and their favorite movies, recommend similar or requested genre movies. 
    Provide exactly 3 movie recommendations in pure JSON format without any markdown formatting.
    Each recommendation should include: title, year, description (brief explanation why it's recommended)

    IMPORTANT: Return ONLY the JSON array, no markdown code blocks, no backticks, no additional text or formatting.

    Format your response exactly like this:
    [
      {"title": "Movie Title", "year": 2023, "description": "Brief description why recommended"},
      {"title": "Another Movie", "year": 2022, "description": "Brief description why recommended"},
      {"title": "Third Movie", "year": 2021, "description": "Brief description why recommended"}
    ]

    Always respond in English. Return pure JSON only.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser request: ${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Failed to get AI response: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      
      try {

        let cleanText = text.trim();

        cleanText = cleanText.replace(/```json[\r\n]?/gi, '');
        cleanText = cleanText.replace(/```/g, '');
        cleanText = cleanText.replace(/\u0060\u0060\u0060/g, ''); // Remove any stray backticks
        cleanText = cleanText.trim();



        const firstBracket = cleanText.indexOf('[');
        const lastBracket = cleanText.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          cleanText = cleanText.substring(firstBracket, lastBracket + 1);
        }

        const parsedSuggestions = JSON.parse(cleanText);
        if (Array.isArray(parsedSuggestions)) {
          return parsedSuggestions.slice(0, 3);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        console.error('Raw response text:', text);

        const suggestions = text.split('\n').filter((line: string) => line.trim().length > 0);
        return suggestions.slice(0, 5).map((suggestion: string, index: number) => ({
          title: `Recommendation ${index + 1}`,
          year: 2024,
          description: suggestion
        }));
      }
    }

    return [{ title: 'Unable to get AI response', year: 2024, description: 'Please try again.' }];

  } catch (error) {
    console.error('Gemini AI error:', error);
    return [{ title: 'Error getting movie recommendations', year: 2024, description: 'Please try again later.' }];
  }
}
