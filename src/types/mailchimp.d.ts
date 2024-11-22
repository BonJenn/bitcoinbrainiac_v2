declare module '@mailchimp/mailchimp_marketing' {
  interface MailchimpConfig {
    apiKey: string | undefined;
    server: string | undefined;
  }

  interface Campaign {
    id: string;
    type: string;
    status: string;
    settings: any;
    recipients: any;
  }

  interface MailchimpClient {
    setConfig: (config: MailchimpConfig) => void;
    lists: {
      getListMember: (listId: string, email: string) => Promise<any>;
      updateListMember: (listId: string, email: string, data: any) => Promise<any>;
      addListMember: (listId: string, data: any) => Promise<any>;
      deleteListMember: (listId: string, subscriberHash: string) => Promise<any>;
    };
    campaigns: {
      create: (data: any) => Promise<Campaign>;
      setContent: (campaignId: string, data: { html: string }) => Promise<any>;
      send: (campaignId: string) => Promise<any>;
    };
    messages: {
      send: (data: any) => Promise<any>;
    };
  }

  const mailchimp: MailchimpClient;
  export default mailchimp;
}