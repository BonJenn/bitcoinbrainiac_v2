import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    variables: {
      hasXApiKey: !!process.env.X_API_KEY,
      xApiKeyLength: process.env.X_API_KEY?.length || 0,
      hasXApiSecret: !!process.env.X_API_SECRET,
      xApiSecretLength: process.env.X_API_SECRET?.length || 0,
      hasXAccessToken: !!process.env.X_ACCESS_TOKEN,
      xAccessTokenLength: process.env.X_ACCESS_TOKEN?.length || 0,
      hasXAccessSecret: !!process.env.X_ACCESS_SECRET,
      xAccessSecretLength: process.env.X_ACCESS_SECRET?.length || 0,
    },
    // Show first 4 chars of each to verify content
    prefixes: {
      xApiKey: process.env.X_API_KEY?.slice(0, 4) + '...',
      xApiSecret: process.env.X_API_SECRET?.slice(0, 4) + '...',
      xAccessToken: process.env.X_ACCESS_TOKEN?.slice(0, 4) + '...',
      xAccessSecret: process.env.X_ACCESS_SECRET?.slice(0, 4) + '...',
    }
  });
} 