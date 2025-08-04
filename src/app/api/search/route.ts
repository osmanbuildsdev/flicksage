import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';


const isContentAppropriate = (movie: any) => {
  const title = movie.title?.toLowerCase() || '';
  const overview = movie.overview?.toLowerCase() || '';
  
  const inappropriateKeywords = [
    'porn', 'xxx', 'erotic', 'nude', 'naked', 'sex', 'sexual', 'intimate',
    'stripper', 'prostitute', 'brothel', 'escort', 'affair', 'mistress',
    'lust', 'desire', 'temptation', 'forbidden', 'sensual', 'steamy', 'kinky', 'fetish', 'bdsm', 'explicit', 'graphic'
  ];
  
  const hasInappropriateContent = inappropriateKeywords.some(keyword => 
    title.includes(keyword) || overview.includes(keyword)
  );
  

  if (movie.genre_ids && movie.genre_ids.includes(10749)) {
    const romanceBlacklist = [
      'fifty shades', 'after', 'magic mike', 'showgirls', 'basic instinct',
      '365 days', '365 dni', 'nymphomaniac', 'blue is the warmest'
    ];
    
    const hasInappropriateRomance = romanceBlacklist.some(term => 
      title.includes(term) || overview.includes(term)
    );
    
    if (hasInappropriateRomance) return false;
  }
  
  if (movie.vote_average < 4.0 && movie.vote_count > 50) return false;
  if (!movie.poster_path) return false;
  
  return !hasInappropriateContent;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = searchParams.get('page') || '1';

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    if (!TMDB_API_KEY) {
      return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
    }


    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false&language=en-US`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    const data = await response.json();


    const filteredResults = data.results.filter(isContentAppropriate);

    return NextResponse.json({
      results: filteredResults,
      total_pages: data.total_pages,
      total_results: filteredResults.length,
      page: parseInt(page),
      query,
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search movies' },
      { status: 500 }
    );
  }
}
