import { useState, useEffect } from 'react';
import { NewsItem } from '../types';
import { worldCities } from '../data/cities';
import { generateRandomNewsItem, generateRandomVote } from '../utils/mockData';

export const useLiveNewsFeed = (initialNews: NewsItem[]) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNews);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewsItems(prevItems => {
        let updatedItems = [...prevItems];
        const actionChance = Math.random();

        // 30% chance to add a new news item
        if (actionChance < 0.3 && updatedItems.length < 20) { // Cap at 20 items
          const newNews = generateRandomNewsItem(worldCities);
          updatedItems = [newNews, ...updatedItems];
        } 
        // 70% chance to add a burst of votes to an existing item
        else if (updatedItems.length > 0) {
          const itemIndex = Math.floor(Math.random() * updatedItems.length);
          const itemToUpdate = { ...updatedItems[itemIndex] };
          
          // Add a burst of 1 to 3 votes
          const voteCount = Math.floor(Math.random() * 3) + 1;
          const newVotes = Array.from({ length: voteCount }, () => generateRandomVote(worldCities));
          
          itemToUpdate.votes = [...itemToUpdate.votes, ...newVotes];
          updatedItems[itemIndex] = itemToUpdate;
        }

        return updatedItems;
      });
    }, 5000); // Update every 5 seconds as requested

    return () => clearInterval(interval);
  }, []);

  return { newsItems, setNewsItems };
};