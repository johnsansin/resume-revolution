export type LetterStyle = 'cover' | 'motivation';

export interface LetterData {
  style: LetterStyle;
  date: string;
  recipientName: string;
  recipientTitle: string;
  company: string;
  companyAddress: string;
  salutation: string;
  subject: string;
  opening: string;
  body: string;
  closing: string;
  signOff: string;
  signerName: string;
}
