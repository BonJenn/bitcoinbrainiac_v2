import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  try {
    await connectToDatabase();
    
    // Sample data for 3 newsletters
    const sampleNewsletters = [
      {
        id: uuidv4(),
        title: 'Bitcoin Breaks $50K: Market Analysis',
        subtitle: 'Institutional investors drive the latest rally',
        content: `Bitcoin has surged past $50,000 for the first time in recent months, marking a significant milestone in its recovery. **Institutional adoption continues to grow**, with several major firms announcing new Bitcoin investments.\n\nMarket analysts point to decreased selling pressure and increased accumulation by long-term holders as key factors behind the rally. **Technical indicators suggest** this could be the beginning of a sustained upward trend.\n\nMeanwhile, on-chain metrics show healthy network activity, with daily transactions reaching new highs.`,
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
        bitcoinPrice: 50420,
        priceChange: 5.2
      },
      {
        id: uuidv4(),
        title: 'Lightning Network Capacity Hits All-Time High',
        subtitle: 'Bitcoin\'s scaling solution shows remarkable growth',
        content: `The Lightning Network has reached a new milestone, with total capacity exceeding 5,000 BTC. **This represents a significant achievement** for Bitcoin's layer-2 scaling solution.\n\nMajor companies are increasingly integrating Lightning payments, demonstrating growing confidence in the technology. **User adoption continues to rise**, with more wallets adding Lightning support.\n\nDevelopers are also introducing new features to improve the user experience and security of Lightning payments.`,
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        bitcoinPrice: 48150,
        priceChange: 2.8
      },
      {
        id: uuidv4(),
        title: 'Mining Difficulty Reaches New Heights',
        subtitle: 'Network security continues to strengthen',
        content: `Bitcoin's mining difficulty has adjusted upward for the sixth consecutive time, reaching an all-time high. **This indicates growing network security** and continued investment in mining infrastructure.\n\nThe increase in difficulty comes as miners deploy more efficient hardware and expand operations globally. **Hash rate distribution** shows improving decentralization across different mining pools.\n\nEnergy efficiency improvements in mining operations are also contributing to the sector's sustainability.`,
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
        bitcoinPrice: 47200,
        priceChange: -1.2
      }
    ];

    // Clear existing newsletters (optional)
    await Newsletter.deleteMany({});

    // Insert sample newsletters
    await Newsletter.insertMany(sampleNewsletters);

    return NextResponse.json({ 
      success: true, 
      message: 'Sample newsletters created successfully',
      count: sampleNewsletters.length
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to seed newsletters' },
      { status: 500 }
    );
  }
}
