export interface Newsletter {
    id: string;
    title: string;
    subtitle: string;
    content: string;
    sentAt: Date;
    bitcoinPrice: number;
    priceChange: number;
    subject?: string;
  }