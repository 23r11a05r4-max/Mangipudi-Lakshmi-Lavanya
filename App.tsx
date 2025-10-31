
import React, { useState, useCallback } from 'react';
import { NewsItem, Vote, Evidence, VerificationStatus } from './types';
import { useGeolocation } from './hooks/useGeolocation';
import Header from './components/Header';
import SubmitNewsForm from './components/SubmitNewsForm';
import NewsFeed from './components/NewsFeed';

const INITIAL_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Cyclone Causes Eruptions in Karimnagar?',
    description: "Reports are circulating online about a powerful cyclone named 'Amman Tower' causing unusual volcanic eruptions in the Karimnagar district. Officials have not confirmed these reports, and many are skeptical.",
    imageUrl: 'https://picsum.photos/800/400?random=1',
    location: 'Karimnagar',
    votes: [
      { id: 'v1', isReal: true, location: 'Karimnagar' },
      { id: 'v2', isReal: true, location: 'Karimnagar' },
      { id: 'v3', isReal: false, location: 'Hyderabad' },
    ],
    evidence: [],
    clicks: 105,
    verification: {
      status: VerificationStatus.DILEMMA,
      confidence: 55,
      reasoning: "While social media buzz is high, there is no official confirmation or geological data to support claims of volcanic activity in this region due to a cyclone.",
      isAiGenerated: false,
    },
    userHasVoted: false,
  },
  {
    id: '2',
    title: 'New Metro Line Announced for Old City',
    description: 'The city council has just approved plans for a new metro line that will connect the historic Old City with the IT corridor, aiming to reduce traffic congestion significantly.',
    imageUrl: 'https://picsum.photos/800/400?random=2',
    location: 'Hyderabad',
    votes: [],
    evidence: [],
    clicks: 42,
    verification: {
      status: VerificationStatus.UNVERIFIED,
    },
    userHasVoted: false,
  }
];

const App: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(INITIAL_NEWS);
  const { location, error: geoError } = useGeolocation();

  const handleAddNews = (newsItem: Omit<NewsItem, 'id' | 'votes' | 'evidence' | 'clicks' | 'userHasVoted'>) => {
    const newNews: NewsItem = {
      ...newsItem,
      id: new Date().toISOString(),
      votes: [],
      evidence: [],
      clicks: 1,
      userHasVoted: false,
    };
    setNewsItems(prevItems => [newNews, ...prevItems]);
  };

  const handleVote = useCallback((newsId: string, isReal: boolean) => {
    setNewsItems(prevItems =>
      prevItems.map(item => {
        if (item.id === newsId && !item.userHasVoted) {
          const newVote: Vote = {
            id: new Date().toISOString(),
            isReal,
            location: location?.latitude ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` : 'Unknown',
          };
          return { ...item, votes: [...item.votes, newVote], clicks: item.clicks + 1, userHasVoted: true };
        }
        return item;
      })
    );
  }, [location]);

  const handleAddEvidence = useCallback((newsId: string, evidence: Omit<Evidence, 'id' | 'authorLocation'>) => {
    setNewsItems(prevItems =>
      prevItems.map(item => {
        if (item.id === newsId) {
          const newEvidence: Evidence = {
            ...evidence,
            id: new Date().toISOString(),
            authorLocation: location?.latitude ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` : 'Unknown',
          };
          return { ...item, evidence: [newEvidence, ...item.evidence] };
        }
        return item;
      })
    );
  }, [location]);
  
  const handleIncrementClicks = useCallback((newsId: string) => {
     setNewsItems(prevItems =>
      prevItems.map(item => 
        item.id === newsId ? { ...item, clicks: item.clicks + 1 } : item
      )
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        {geoError && <div className="bg-red-800 border border-red-600 text-white px-4 py-3 rounded-lg relative mb-4" role="alert">{geoError}</div>}
        <SubmitNewsForm onAddNews={handleAddNews} />
        <NewsFeed 
          newsItems={newsItems} 
          onVote={handleVote}
          onAddEvidence={handleAddEvidence}
          onCardClick={handleIncrementClicks}
          userLocation={location}
        />
      </main>
    </div>
  );
};

export default App;
