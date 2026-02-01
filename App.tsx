import React, { useState } from 'react';
import { ViewState, StudyGroup, NewsItem } from './types';
import Layout from './components/Layout';
import AuthScreen from './components/screens/AuthScreen';
import Dashboard from './components/screens/Dashboard';
import { CalendarScreen } from './components/screens/CalendarScreen';
import { ForumsScreen, CreateForumScreen, StudyGroupsScreen, StudyGroupDetailScreen, CreateStudyGroupScreen } from './components/screens/SocialScreens';
import { NotificationsScreen, SuggestionsScreen, NewsDetailScreen, ClubsScreen, ProfileScreen } from './components/screens/SecondaryScreens';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.AUTH);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const handleLogin = () => {
    setView(ViewState.HOME);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setView(ViewState.AUTH);
  };

  const handleNavigate = (newView: ViewState) => {
    setView(newView);
  };

  const handleSelectGroup = (group: StudyGroup) => {
    setSelectedGroup(group);
    setView(ViewState.STUDY_GROUP_DETAIL);
  };

  const handleSelectNews = (news: NewsItem) => {
    setSelectedNews(news);
    setView(ViewState.NEWS_DETAIL);
  }

  // Render Auth completely separate from Layout
  if (view === ViewState.AUTH) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <Layout currentView={view} onNavigate={handleNavigate} onLogout={handleLogout}>
      {view === ViewState.HOME && <Dashboard onNavigate={handleNavigate} onSelectNews={handleSelectNews} />}
      {view === ViewState.CALENDAR && <CalendarScreen />}
      {view === ViewState.FORUMS && <ForumsScreen onNavigate={handleNavigate} />}
      {view === ViewState.CREATE_FORUM && <CreateForumScreen onBack={() => setView(ViewState.FORUMS)} />}
      
      {view === ViewState.STUDY_GROUPS && (
        <StudyGroupsScreen 
          onSelect={handleSelectGroup} 
          onCreate={() => setView(ViewState.CREATE_STUDY_GROUP)} 
        />
      )}
      {view === ViewState.CREATE_STUDY_GROUP && (
        <CreateStudyGroupScreen onBack={() => setView(ViewState.STUDY_GROUPS)} />
      )}
      {view === ViewState.STUDY_GROUP_DETAIL && (
        <StudyGroupDetailScreen group={selectedGroup} onBack={() => setView(ViewState.STUDY_GROUPS)} />
      )}
      
      {view === ViewState.CLUBS && <ClubsScreen />}
      {view === ViewState.NOTIFICATIONS && (
        <NotificationsScreen onNavigate={handleNavigate} onSelectGroup={handleSelectGroup} />
      )}
      {view === ViewState.SUGGESTIONS && <SuggestionsScreen />}
      {view === ViewState.PROFILE && <ProfileScreen />}
      {view === ViewState.NEWS_DETAIL && selectedNews && (
         <NewsDetailScreen news={selectedNews} onBack={() => setView(ViewState.HOME)} />
      )}
    </Layout>
  );
};

export default App;