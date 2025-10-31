
import React, { useState } from 'react';
import { NewsItem, Evidence, VerificationStatus, GeolocationState } from '../types';
import { ThumbsUpIcon, ThumbsDownIcon, TrendingIcon, LocationIcon, CheckCircleIcon, CrossCircleIcon, QuestionMarkCircleIcon, AiIcon } from './icons';
import PollResults from './PollResults';
import EvidenceSection from './EvidenceSection';

interface NewsCardProps {
  item: NewsItem;
  onVote: (newsId: string, isReal: boolean) => void;
  onAddEvidence: (newsId: string, evidence: Omit<Evidence, 'id'| 'authorLocation'>) => void;
  onCardClick: (newsId: string) => void;
  userLocation: GeolocationState;
}

const VerificationBadge: React.FC<{ verification: NewsItem['verification'] }> = ({ verification }) => {
  const { status, confidence, isAiGenerated } = verification;

  const badgeStyles = {
    [VerificationStatus.REAL]: 'bg-green-700 border-green-500',
    [VerificationStatus.FAKE]: 'bg-red-700 border-red-500',
    [VerificationStatus.DILEMMA]: 'bg-yellow-700 border-yellow-500',
    [VerificationStatus.VERIFYING]: 'bg-blue-700 border-blue-500 animate-pulse',
    [VerificationStatus.UNVERIFIED]: 'bg-gray-600 border-gray-500',
  };

  const icons = {
    [VerificationStatus.REAL]: <CheckCircleIcon className="h-5 w-5" />,
    [VerificationStatus.FAKE]: <CrossCircleIcon className="h-5 w-5" />,
    [VerificationStatus.DILEMMA]: <QuestionMarkCircleIcon className="h-5 w-5" />,
    [VerificationStatus.VERIFYING]: <QuestionMarkCircleIcon className="h-5 w-5" />,
    [VerificationStatus.UNVERIFIED]: <QuestionMarkCircleIcon className="h-5 w-5" />,
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className={`flex items-center space-x-2 text-sm font-semibold text-white px-3 py-1 rounded-full border ${badgeStyles[status]}`}>
        {icons[status]}
        <span>
          AI Verdict: {status}
          {confidence !== undefined && ` (${confidence.toFixed(0)}% confident)`}
        </span>
      </div>
      {isAiGenerated && (
        <div className="flex items-center space-x-2 text-sm font-semibold text-white px-3 py-1 rounded-full border bg-purple-700 border-purple-500">
          <AiIcon className="h-5 w-5" />
          <span>AI-Generated Image</span>
        </div>
      )}
    </div>
  );
};


const NewsCard: React.FC<NewsCardProps> = ({ item, onVote, onAddEvidence, onCardClick, userLocation }) => {
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  const handleVoteClick = (isReal: boolean) => {
    if (!item.userHasVoted) {
      onVote(item.id, isReal);
      if (isReal) {
        setShowEvidenceForm(true);
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700" onClick={() => onCardClick(item.id)}>
      {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />}
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
           <div className="flex items-center text-sm text-gray-400">
              <LocationIcon className="h-4 w-4 mr-1 text-blue-400" />
              <span>{item.location}</span>
           </div>
           {item.clicks > 100 && (
            <div className="flex items-center text-sm font-semibold text-orange-300 bg-orange-800/50 px-2 py-1 rounded-full">
              <TrendingIcon className="h-4 w-4 mr-1" />
              <span>Trending</span>
            </div>
           )}
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
        <p className="text-gray-300 mb-4">{item.description}</p>
        
        <div className="mb-4">
          <VerificationBadge verification={item.verification} />
          {item.verification.reasoning && (
            <p className="text-xs text-gray-400 mt-2 italic pl-2 border-l-2 border-gray-600">
              {item.verification.reasoning}
            </p>
          )}
        </div>
        
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-200 mb-3 text-center">Is this news real?</h4>
          <div className="flex justify-center gap-4 mb-4">
            <button 
              onClick={() => handleVoteClick(true)} 
              disabled={item.userHasVoted}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800/50 disabled:cursor-not-allowed text-white font-bold rounded-md transition-transform transform hover:scale-105"
            >
              <ThumbsUpIcon /> Real
            </button>
            <button 
              onClick={() => handleVoteClick(false)}
              disabled={item.userHasVoted}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800/50 disabled:cursor-not-allowed text-white font-bold rounded-md transition-transform transform hover:scale-105"
            >
              <ThumbsDownIcon /> Fake
            </button>
          </div>
          <PollResults votes={item.votes} newsLocation={item.location} userLocation={userLocation}/>
        </div>
        
        <EvidenceSection 
            evidenceList={item.evidence}
            onAddEvidence={(evidence) => onAddEvidence(item.id, evidence)}
            showForm={showEvidenceForm}
            setShowForm={setShowEvidenceForm}
            userHasVotedReal={item.userHasVoted && item.votes.some(v => v.isReal)}
        />
      </div>
    </div>
  );
};

export default NewsCard;

