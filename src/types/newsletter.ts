export interface Newsletter {
    id: string;
    title: string;
    subtitle: string;
    content: string;
    sentAt: Date;
    bitcoinPrice: number;
    priceChange: number;
    campaignId: string;
    fearGreedIndex: {
        value: number;
        classification: string;
    };
}