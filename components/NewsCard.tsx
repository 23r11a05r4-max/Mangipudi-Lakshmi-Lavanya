import React, { useState, useMemo, useEffect, useRef } from 'react';
import { NewsItem, Evidence, VerificationStatus, GeolocationState } from '../types';
import { ThumbsUpIcon, ThumbsDownIcon, TrendingIcon, LocationIcon, CheckCircleIcon, CrossCircleIcon, QuestionMarkCircleIcon, AiIcon, ChartBarIcon, ShareIcon } from './icons';
import PollResults from './PollResults';
import EvidenceSection from './EvidenceSection';
import DataVisualizationModal from './DataVisualizationModal';

interface NewsCardProps {
  item: NewsItem;
  onVote: (newsId: string, isReal: boolean) => void;
  onAddEvidence: (newsId: string, evidence: Omit<Evidence, 'id'| 'authorLocation' | 'likes' | 'responses'>) => void;
  onCardVisible: (newsId: string) => void;
  userLocation: GeolocationState;
  onShare: (newsId: string) => void;
  onLikeEvidence: (newsId: string, evidenceId: string) => void;
  onRespondToEvidence: (newsId: string, evidenceId: string, text: string) => void;
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


const NewsCard: React.FC<NewsCardProps> = ({ item, onVote, onAddEvidence, onCardVisible, userLocation, onShare, onLikeEvidence, onRespondToEvidence }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isConfirmingRevote, setIsConfirmingRevote] = useState(false);
  const [revoteChoice, setRevoteChoice] = useState<boolean | null>(null);
  const [revoteCheckbox, setRevoteCheckbox] = useState(false);
  
  const [isUpdated, setIsUpdated] = useState(false);
  const prevVoteCount = useRef(item.votes.length);

  const isNew = useMemo(() => {
    // Item is considered "new" if it was created in the last 60 seconds
    return new Date().getTime() - new Date(item.createdAt).getTime() < 60000;
  }, [item.createdAt]);


  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onCardVisible(item.id);
          observer.disconnect(); // Only trigger once
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, [item.id, onCardVisible]);
  
  useEffect(() => {
    if (item.votes.length > prevVoteCount.current) {
        setIsUpdated(true);
        const timer = setTimeout(() => setIsUpdated(false), 1500);
        return () => clearTimeout(timer);
    }
    prevVoteCount.current = item.votes.length;
  }, [item.votes.length]);


  const { localRealVotes, localFakeVotes } = useMemo(() => {
    const localVotes = item.votes.filter(v => v.location.toLowerCase() === item.location.toLowerCase());
    const real = localVotes.filter(v => v.isReal).length;
    const fake = localVotes.length - real;
    return { localRealVotes: real, localFakeVotes: fake };
  }, [item.votes, item.location]);

  const handleVoteClick = (isReal: boolean) => {
    if (item.userVote !== isReal) {
      if (item.userVoteCount > 0) {
        setRevoteChoice(isReal);
        setIsConfirmingRevote(true);
      } else {
         onVote(item.id, isReal);
      }
    }
  };

  const handleConfirmRevote = () => {
    if (revoteChoice !== null && revoteCheckbox) {
        onVote(item.id, revoteChoice);
        handleCancelRevote();
    }
  };

  const handleCancelRevote = () => {
    setIsConfirmingRevote(false);
    setRevoteChoice(null);
    setRevoteCheckbox(false);
  };
  
  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(item.verification.status === VerificationStatus.REAL && !item.sharedByUser) {
        onShare(item.id);
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href + `#news-${item.id}`);
    setCopied(true);
    setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
    }, 2000);
  };

  return (
    <>
      <div ref={cardRef} className={`bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700 transition-all duration-500 ${isUpdated ? 'ring-2 ring-blue-500 shadow-blue-500/30' : 'ring-0 ring-transparent'} ${isNew ? 'animate-slide-in-fade' : ''}`}>
        {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />}
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="relative group flex items-center text-sm text-gray-400 cursor-pointer">
                <LocationIcon className="h-4 w-4 mr-1 text-blue-400" />
                <span>{item.location}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700 shadow-lg">
                  <span className="font-bold">Local Votes:</span>
                  <span className="text-green-400 ml-2">Real: {localRealVotes}</span>
                  <span className="text-red-400 ml-2">Fake: {localFakeVotes}</span>
                </div>
              </div>
              <span className="text-xs font-semibold bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{item.category}</span>
            </div>
             <div className="flex items-center gap-4">
                {isNew && (
                  <div className="text-xs font-bold text-cyan-300 bg-cyan-800/60 px-2 py-1 rounded-full animate-pulse">
                    Just In
                  </div>
                )}
                {item.clicks > 100 && (
                  <div className="flex items-center text-sm font-semibold text-orange-300 bg-orange-800/50 px-2 py-1 rounded-full">
                    <TrendingIcon className="h-4 w-4 mr-1" />
                    <span>Trending</span>
                  </div>
                )}
                 <div className="relative">
                     <button 
                        onClick={(e) => { e.stopPropagation(); setShowShareMenu(prev => !prev); }}
                        className="text-gray-400 hover:text-white"
                        aria-label="Share news"
                     >
                        <ShareIcon className="h-5 w-5" />
                     </button>
                     {showShareMenu && (
                         <div className="absolute right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-20" onClick={e => e.stopPropagation()}>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(window.location.href + `#news-${item.id}`)}`} onClick={handleShareClick} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">Share on Twitter</a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href + `#news-${item.id}`)}`} onClick={handleShareClick} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">Share on Facebook</a>
                            <button onClick={handleCopyLink} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">{copied ? 'Copied!' : 'Copy Link'}</button>
                         </div>
                     )}
                 </div>
             </div>
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
            {!isConfirmingRevote ? (
                <>
                    <h4 className="font-semibold text-gray-200 mb-3 text-center">Is this news real?</h4>
                    <div className="flex justify-center gap-4 mb-4">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleVoteClick(true); }}
                        className={`flex items-center justify-center gap-2 px-6 py-2 font-bold rounded-md transition-all transform hover:scale-105 ${item.userVote === true ? 'bg-green-500 ring-2 ring-white text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                    >
                        <ThumbsUpIcon /> Real
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleVoteClick(false); }}
                        className={`flex items-center justify-center gap-2 px-6 py-2 font-bold rounded-md transition-all transform hover:scale-105 ${item.userVote === false ? 'bg-red-500 ring-2 ring-white text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                    >
                        <ThumbsDownIcon /> Fake
                    </button>
                    </div>
                    <PollResults votes={item.votes} newsLocation={item.location} userLocation={userLocation}/>
                    {item.votes.length > 0 && (
                        <div className="text-center mt-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center mx-auto gap-2 px-3 py-1 rounded-md hover:bg-blue-900/50 transition-colors"
                                aria-label="View detailed vote analytics"
                            >
                                <ChartBarIcon className="h-4 w-4" />
                                View Detailed Analytics
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center text-sm" onClick={e => e.stopPropagation()}>
                    <h4 className="font-semibold text-gray-200 mb-2">Change your opinion?</h4>
                    <p className="text-gray-400 mb-3">You are changing your vote to "{revoteChoice ? 'Real' : 'Fake'}". Your second opinion will earn half credits if correct.</p>
                     <label className="flex items-center justify-center gap-2 text-gray-300 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={revoteCheckbox} 
                            onChange={(e) => setRevoteCheckbox(e.target.checked)} 
                            className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                         <span className="text-xs select-none">I understand this is a re-submission.</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 mb-4">"I know this is my second submission for the same news, but since I have an opinion change, I am doing this knowingly.”</p>
                    <div className="flex justify-center gap-3">
                        <button onClick={handleCancelRevote} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-md">Cancel</button>
                        <button onClick={handleConfirmRevote} disabled={!revoteCheckbox} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold rounded-md">Confirm Change</button>
                    </div>
                </div>
            )}
          </div>
          
          <EvidenceSection 
              evidenceList={item.evidence}
              onAddEvidence={(evidence) => onAddEvidence(item.id, evidence)}
              onLike={(evidenceId) => onLikeEvidence(item.id, evidenceId)}
              onRespond={(evidenceId, text) => onRespondToEvidence(item.id, evidenceId, text)}
              showFormInitially={item.userVote === true && item.evidence.length === 0}
          />
        </div>
      </div>
      {isModalOpen && (
        <DataVisualizationModal 
            item={item} 
            onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default NewsCard;