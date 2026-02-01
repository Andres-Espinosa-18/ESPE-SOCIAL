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
  NEWS_DETAIL = 'NEWS_DETAIL',
  PROFILE = 'PROFILE'
}

export interface User {
  id: number;
  name: string;
  student_id: string;
  email: string;
  role: 'student' | 'admin';
  bio?: string;
  phone?: string;
  avatar?: string;
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

export interface Announcement {
  id: number;
  type: 'ACADEMICO' | 'ADMIN' | 'EVENTOS';
  title: string;
  date: string;
  content: string;
}

export interface ForumComment {
    id: number;
    user_id: number;
    author_name: string;
    content: string;
    created_at: string;
}

export interface ForumPost {
  id: string;
  user_id: number;
  author: string;
  timeAgo: string; // Calculated or from DB string
  avatar: string; // Placeholder mostly
  content: string;
  image?: string;
  commentsCount: number;
  likesCount: number;
  sharesCount: number;
}

export interface Club {
  id: number;
  title: string;
  description: string;
  image: string;
  icon_name: string;
  color_class: string;
}

export interface StudyGroup {
  id: string;
  title: string;
  description: string;
  date: string;
  createdBy: string;
  members: number;
  topic: string;
}

export interface StudyGroupMember {
    user_id: number;
    name: string;
    role: string; // 'Creador' or 'Miembro'
}

export interface NotificationItem {
  id: number;
  type: 'AVISOS' | 'FOROS' | 'EVENTOS' | 'SISTEMA';
  title: string;
  time_ago: string;
  is_read: boolean;
  color_class?: string; // Helper for frontend
}

export interface UserEvent {
    id: number;
    title: string;
    event_date: string; // YYYY-MM-DD
    event_time: string;
    location: string;
    type_label: string;
    color: string;
    is_global?: boolean;
}