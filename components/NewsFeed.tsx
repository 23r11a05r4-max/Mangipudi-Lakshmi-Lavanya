
import React from 'react';
import { NewsItem, Evidence, GeolocationState } from '../types';
import NewsCard from './NewsCard';

interface NewsFeedProps {
  newsItems: NewsItem[];
  onVote: (newsId: string, isReal: boolean) => void;
  onAddEvidence: (newsId:string, evidence: Omit<Evidence, 'id' | 'authorLocation'>) => void;
  onCardClick: (newsId: string) => void;
  userLocation: GeolocationState;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ newsItems, onVote, onAddEvidence, onCardClick, userLocation }) => {
  return (
    <div className="space-y-6">
      {newsItems.length > 0 ? (
        newsItems.map(item => (
          <NewsCard 
            key={item.id} 
            item={item} 
            onVote={onVote}
            onAddEvidence={onAddEvidence}
            onCardClick={onCardClick}
            userLocation={userLocation}
          />
        ))
      ) : (
        <div className="text-center py-10 bg-gray-800 rounded-lg">
          <p className="text-gray-400">No news reports submitted yet. Be the first!</p>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
