declare module '@mailchimp/mailchimp_marketing' {
  interface MailchimpConfig {
    apiKey: string | undefined;
    server: string | undefined;
  }

  interface MailchimpClient {
    setConfig: (config: MailchimpConfig) => void;
    lists: {
      getListMember: (listId: string, email: string) => Promise<any>;
      updateListMember: (listId: string, email: string, data: any) => Promise<any>;
    };
  }

  const mailchimp: MailchimpClient;
  export default mailchimp;
}