import { TwitterApi } from 'twitter-api-v2';

if (!process.env.X_API_KEY) throw new Error('X_API_KEY is not defined');
if (!process.env.X_API_SECRET) throw new Error('X_API_SECRET is not defined');
if (!process.env.X_ACCESS_TOKEN) throw new Error('X_ACCESS_TOKEN is not defined');
if (!process.env.X_ACCESS_SECRET) throw new Error('X_ACCESS_SECRET is not defined');

export const xClient = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_SECRET,
});