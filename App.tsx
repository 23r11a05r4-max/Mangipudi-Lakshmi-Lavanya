import React, { useState, useCallback, useContext, useEffect } from 'react';
import { NewsItem, Vote, Evidence, VerificationStatus, ResponseItem, User } from './types';
import { useGeolocation } from './hooks/useGeolocation';
import Header from './components/Header';
import SubmitNewsForm from './components/SubmitNewsForm';
import NewsFeed from './components/NewsFeed';
import { findNearestCity } from './utils/locationUtils';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import Toast from './components/Toast';
import { useLiveNewsFeed } from './hooks/useLiveNewsFeed';

const INITIAL_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Cyclone Causes Eruptions in Karimnagar?',
    description: "Reports are circulating online about a powerful cyclone named 'Amman Tower' causing unusual volcanic eruptions in the Karimnagar district. Officials have not confirmed these reports, and many are skeptical.",
    imageUrl: 'https://picsum.photos/800/400?random=1',
    location: 'Karimnagar',
    category: 'Environment',
    votes: [
      { id: 'v1', isReal: true, location: 'Karimnagar', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'v2', isReal: true, location: 'Karimnagar', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
      { id: 'v3', isReal: false, location: 'Hyderabad', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
    ],
    evidence: [],
    clicks: 105,
    verification: {
      status: VerificationStatus.DILEMMA,
      confidence: 55,
      reasoning: "While social media buzz is high, there is no official confirmation or geological data to support claims of volcanic activity in this region due to a cyclone.",
      isAiGenerated: false,
    },
    userVote: null,
    userVoteId: null,
    userVoteCount: 0,
    sharedByUser: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: '2',
    title: 'New Metro Line Announced for Old City',
    description: 'The city council has just approved plans for a new metro line that will connect the historic Old City with the IT corridor, aiming to reduce traffic congestion significantly.',
    imageUrl: 'https://picsum.photos/800/400?random=2',
    location: 'Hyderabad',
    category: 'Society',
    votes: [],
    evidence: [],
    clicks: 42,
    verification: {
      status: VerificationStatus.UNVERIFIED,
    },
    userVote: null,
    userVoteId: null,
    userVoteCount: 0,
    sharedByUser: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

const MainApplication: React.FC = () => {
  const { newsItems, setNewsItems } = useLiveNewsFeed(INITIAL_NEWS);
  const { location, error: geoError } = useGeolocation();
  const { user, updateCredits } = useContext(AuthContext);

  const handleAddNews = (newsItem: Omit<NewsItem, 'id' | 'votes' | 'evidence' | 'clicks' | 'userVote' | 'userVoteId' | 'userVoteCount' | 'sharedByUser'| 'createdAt'>) => {
    
    // Penalize for submitting news that AI determines is fake
    if (newsItem.verification.status === VerificationStatus.FAKE) {
      updateCredits(-10);
    }

    const newNews: NewsItem = {
      ...newsItem,
      id: new Date().toISOString(),
      votes: [],
      evidence: [],
      clicks: 1,
      userVote: null,
      userVoteId: null,
      userVoteCount: 0,
      sharedByUser: false,
      createdAt: new Date().toISOString(),
    };
    setNewsItems(prevItems => [newNews, ...prevItems]);
  };

  const handleVote = useCallback((newsId: string, isReal: boolean) => {
    setNewsItems(prevItems =>
      prevItems.map(item => {
        if (item.id === newsId) {
          const voteLocation = location?.latitude && location?.longitude
            ? findNearestCity(location.latitude, location.longitude)
            : 'Unknown';

          // Credit Logic
          const isVerdictOfficial = item.verification.status === VerificationStatus.REAL || item.verification.status === VerificationStatus.FAKE;
          if (isVerdictOfficial) {
              const verdictIsReal = item.verification.status === VerificationStatus.REAL;
              const isFirstVote = item.userVoteCount === 0;

              if (isFirstVote) {
                  // First time voting
                  if (isReal === verdictIsReal) updateCredits(5); // Correct vote
                  else updateCredits(-5); // Incorrect vote
              } else {
                  // This is a re-vote
                  const wasPreviousVoteCorrect = item.userVote === verdictIsReal;
                  // 1. Invalidate previous credits
                  if (wasPreviousVoteCorrect) updateCredits(-5); // Remove points for previously correct vote
                  else updateCredits(5); // Remove penalty for previously incorrect vote

                  // 2. Add new credits at half value
                  if (isReal === verdictIsReal) updateCredits(2.5); // Correct re-vote (half points)
                  else updateCredits(-5); // Incorrect re-vote (full penalty)
              }
          }

          let updatedVotes = [...item.votes];
          if (item.userVoteId) {
              updatedVotes = updatedVotes.filter(v => v.id !== item.userVoteId);
          }

          const newVote: Vote = {
            id: new Date().toISOString(),
            isReal,
            location: voteLocation,
            timestamp: new Date().toISOString(),
          };
          
          updatedVotes.push(newVote);
          
          return { 
            ...item, 
            votes: updatedVotes, 
            userVote: isReal,
            userVoteId: newVote.id,
            userVoteCount: item.userVoteCount + 1,
          };
        }
        return item;
      })
    );
  }, [location, updateCredits, setNewsItems]);

  const handleAddEvidence = useCallback((newsId: string, evidence: Omit<Evidence, 'id' | 'authorLocation' | 'likes' | 'responses'>) => {
    updateCredits(15); // Award points for submitting evidence
    setNewsItems(prevItems =>
      prevItems.map(item => {
        if (item.id === newsId) {
           const authorLocation = location?.latitude && location?.longitude
            ? findNearestCity(location.latitude, location.longitude)
            : 'Unknown';
          const newEvidence: Evidence = {
            ...evidence,
            id: new Date().toISOString(),
            authorLocation: authorLocation,
            likes: [],
            responses: [],
          };
          return { ...item, evidence: [newEvidence, ...item.evidence] };
        }
        return item;
      })
    );
  }, [location, updateCredits, setNewsItems]);
  
  const handleIncrementClicks = useCallback((newsId: string) => {
     setNewsItems(prevItems =>
      prevItems.map(item => 
        item.id === newsId ? { ...item, clicks: item.clicks + 1 } : item
      )
    );
  }, [setNewsItems]);

  const handleShare = useCallback((newsId: string) => {
    setNewsItems(prevItems => prevItems.map(item => {
        if (item.id === newsId && !item.sharedByUser) {
            updateCredits(5);
            return { ...item, sharedByUser: true };
        }
        return item;
    }));
  }, [updateCredits, setNewsItems]);

  const handleLikeEvidence = useCallback((newsId: string, evidenceId: string) => {
      if (!user) return;
      setNewsItems(prevItems => prevItems.map(item => {
          if (item.id !== newsId) return item;
          const updatedEvidence = item.evidence.map(e => {
              if (e.id !== evidenceId) return e;
              const hasLiked = e.likes.includes(user.id);
              const newLikes = hasLiked ? e.likes.filter(id => id !== user.id) : [...e.likes, user.id];
              return { ...e, likes: newLikes };
          });
          return { ...item, evidence: updatedEvidence };
      }));
  }, [user, setNewsItems]);

  const handleRespondToEvidence = useCallback((newsId: string, evidenceId: string, text: string) => {
      if (!user) return;
      setNewsItems(prevItems => prevItems.map(item => {
          if (item.id !== newsId) return item;
          const updatedEvidence = item.evidence.map(e => {
              if (e.id !== evidenceId) return e;
              const newResponse: ResponseItem = {
                  id: new Date().toISOString(),
                  authorId: user.id,
                  authorUsername: user.username,
                  text,
              };
              return { ...e, responses: [...e.responses, newResponse] };
          });
          return { ...item, evidence: updatedEvidence };
      }));
  }, [user, setNewsItems]);

  return (
    <>
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        {geoError && <div className="bg-red-800 border border-red-600 text-white px-4 py-3 rounded-lg relative mb-4" role="alert">{geoError}</div>}
        <SubmitNewsForm onAddNews={handleAddNews} />
        <NewsFeed 
          newsItems={newsItems} 
          onVote={handleVote}
          onAddEvidence={handleAddEvidence}
          onCardVisible={handleIncrementClicks}
          onShare={handleShare}
          onLikeEvidence={handleLikeEvidence}
          onRespondToEvidence={handleRespondToEvidence}
          userLocation={location}
        />
      </main>
    </>
  );
};

const AppContent: React.FC = () => {
    const { user } = useContext(AuthContext);
    return user ? <MainApplication /> : <AuthPage />;
};

const App: React.FC = () => {
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <AuthProvider showToast={showToast}>
        <AppContent />
      </AuthProvider>
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
};

export default App;