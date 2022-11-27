export type Message = {
  date: Date;
  id: string;
  displayName: string;
  color: string | undefined;
  html: string;
  badgeHtml: string;
} & (
  | {
      kind: "normal";
    }
  | {
      kind: "subscription";
      systemMessage: string;
    }
);
