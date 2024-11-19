declare module '@mailchimp/mailchimp_marketing' {
    interface MailchimpClient {
      setConfig: (config: { apiKey: string; server: string }) => void;
      lists: {
        getListMember: (listId: string, email: string) => Promise<any>;
        updateListMember: (listId: string, email: string, data: any) => Promise<any>;
      };
    }
  
    const mailchimp: MailchimpClient;
    export default mailchimp;
  }