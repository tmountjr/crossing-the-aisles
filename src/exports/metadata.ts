export type Announcement = {
  title: string;
  description: string;
  link?: string;
  date: number;
  expires: number;
};

export type SiteMetadata = {
  announcements: Announcement[];
};
