
import React from 'react';
import { Vote, GeolocationState } from '../types';
import { LocationIcon } from './icons';

interface PollResultsProps {
  votes: Vote[];
  newsLocation: string;
  userLocation: GeolocationState;
}

// A simple heuristic to check if a vote is "local"
// In a real app, this would use a proper geocoding/distance service.
const isLocal = (voteLocation: string, newsLocation: string): boolean => {
    return voteLocation.toLowerCase().includes(newsLocation.toLowerCase()) || newsLocation.toLowerCase().includes(voteLocation.toLowerCase());
}

const PollResults: React.FC<PollResultsProps> = ({ votes, newsLocation }) => {
  const totalVotes = votes.length;
  if (totalVotes === 0) {
    return <p className="text-center text-sm text-gray-400 mt-2">No votes yet. Be the first to weigh in!</p>;
  }

  const realVotes = votes.filter(v => v.isReal).length;
  const fakeVotes = totalVotes - realVotes;
  const realPercentage = totalVotes > 0 ? (realVotes / totalVotes) * 100 : 0;
  const fakePercentage = 100 - realPercentage;

  const localVotes = votes.filter(v => isLocal(v.location, newsLocation));
  const totalLocalVotes = localVotes.length;
  const localRealVotes = localVotes.filter(v => v.isReal).length;
  const localRealPercentage = totalLocalVotes > 0 ? (localRealVotes / totalLocalVotes) * 100 : 0;

  return (
    <div className="space-y-3 text-sm">
      <div>
        <div className="flex justify-between items-center mb-1 text-gray-300">
          <span>Overall Results</span>
          <span className="text-xs font-mono">{totalVotes} vote(s)</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-5 flex overflow-hidden">
          <div className="bg-green-500 h-full flex items-center justify-center text-white font-bold" style={{ width: `${realPercentage}%` }}>
            {realPercentage > 10 && `${realPercentage.toFixed(0)}%`}
          </div>
          <div className="bg-red-500 h-full flex items-center justify-center text-white font-bold" style={{ width: `${fakePercentage}%` }}>
             {fakePercentage > 10 && `${fakePercentage.toFixed(0)}%`}
          </div>
        </div>
      </div>

      {totalLocalVotes > 0 && (
         <div>
            <div className="flex justify-between items-center mb-1 text-blue-300">
                <span className="flex items-center"><LocationIcon className="h-4 w-4 mr-1"/> Local Votes ({newsLocation})</span>
                <span className="text-xs font-mono">{totalLocalVotes} vote(s)</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-400 h-full" style={{ width: `${localRealPercentage}%` }}></div>
            </div>
            <p className="text-right text-xs mt-1 text-blue-300">{localRealPercentage.toFixed(0)}% of locals say it's real.</p>
         </div>
      )}
    </div>
  );
};

export default PollResults;
