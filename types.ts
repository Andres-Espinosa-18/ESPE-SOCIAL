export enum ViewState {
  AUTH = 'AUTH',
  HOME = 'HOME',
  CALENDAR = 'CALENDAR',
  FORUMS = 'FORUMS',
  CREATE_FORUM = 'CREATE_FORUM',
  STUDY_GROUPS = 'STUDY_GROUPS',
  CREATE_STUDY_GROUP = 'CREATE_STUDY_GROUP',
  STUDY_GROUP_DETAIL = 'STUDY_GROUP_DETAIL',
  CLUBS = 'CLUBS',
  NOTIFICATIONS = 'NOTIFICATIONS',
  SUGGESTIONS = 'SUGGESTIONS',
  NEWS_DETAIL = 'NEWS_DETAIL'
}

export interface NewsItem {
  id: string;
  title: string;
  image: string;
  date: string;
  author: string;
  summary: string;
  content: string;
}

export interface ForumPost {
  id: string;
  author: string;
  timeAgo: string;
  avatar: string;
  content: string;
  image?: string;
  commentsCount: number;
  likesCount: number;
  sharesCount: number;
}

export interface StudyGroup {
  id: string;
  title: string;
  description: string;
  date: string;
  createdBy: string;
  members: number;
}

export interface CalendarEvent {
  day: number;
  title: string;
  type: 'exam' | 'holiday' | 'generic';
}

export interface NotificationItem {
  id: string;
  type: 'group' | 'forum' | 'system';
  title: string;
  timeAgo: string;
  read: boolean;
}