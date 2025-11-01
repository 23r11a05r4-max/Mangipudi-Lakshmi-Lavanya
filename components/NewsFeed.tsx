
import React, { useMemo, useContext } from 'react';
import { NewsItem, Evidence, GeolocationState } from '../types';
import NewsCard from './NewsCard';
import { AuthContext } from '../contexts/AuthContext';

interface NewsFeedProps {
  newsItems: NewsItem[];
  onVote: (newsId: string, isReal: boolean) => void;
  onAddEvidence: (newsId:string, evidence: Omit<Evidence, 'id' | 'authorLocation' | 'likes' | 'responses'>) => void;
  onCardVisible: (newsId: string) => void;
  userLocation: GeolocationState;
  onShare: (newsId: string) => void;
  onLikeEvidence: (newsId: string, evidenceId: string) => void;
  onRespondToEvidence: (newsId: string, evidenceId: string, text: string) => void;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ newsItems, onVote, onAddEvidence, onCardVisible, userLocation, onShare, onLikeEvidence, onRespondToEvidence }) => {
  const { user } = useContext(AuthContext);

  const sortedNewsItems = useMemo(() => {
    if (!user?.preferredCategories || user.preferredCategories.length === 0) {
      return newsItems;
    }
    return [...newsItems].sort((a, b) => {
      const aIsPreferred = user.preferredCategories.includes(a.category);
      const bIsPreferred = user.preferredCategories.includes(b.category);
      if (aIsPreferred && !bIsPreferred) return -1;
      if (!aIsPreferred && bIsPreferred) return 1;
      return 0;
    });
  }, [newsItems, user]);

  return (
    <div className="space-y-6">
      {sortedNewsItems.length > 0 ? (
        sortedNewsItems.map(item => (
          <NewsCard 
            key={item.id} 
            item={item} 
            onVote={onVote}
            onAddEvidence={onAddEvidence}
            onCardVisible={onCardVisible}
            userLocation={userLocation}
            onShare={onShare}
            onLikeEvidence={onLikeEvidence}
            onRespondToEvidence={onRespondToEvidence}
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
