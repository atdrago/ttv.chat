export interface Message {
  date: Date;
  id: string;
  channelUserName: string;
  displayName: string;
  color: string | undefined;
  html: string;
  badgeHtml: string;
}
