
import React, { useState, useContext } from 'react';
import { Evidence, ResponseItem } from '../types';
import { LocationIcon, PlusCircleIcon, SpinnerIcon, ThumbsUpIcon } from './icons';
import { AuthContext } from '../contexts/AuthContext';


interface EvidenceSectionProps {
  evidenceList: Evidence[];
  onAddEvidence: (evidence: Omit<Evidence, 'id' | 'authorLocation' | 'likes' | 'responses'>) => void;
  showFormInitially: boolean;
  onLike: (evidenceId: string) => void;
  onRespond: (evidenceId: string, text: string) => void;
}

const EvidenceForm: React.FC<{onAddEvidence: EvidenceSectionProps['onAddEvidence'], onDone: () => void}> = ({onAddEvidence, onDone}) => {
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!text.trim()) return;

        setIsLoading(true);
        let imageUrl: string | undefined = undefined;

        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            imageUrl = await new Promise((resolve) => {
                reader.onload = () => resolve(reader.result as string);
            });
        }

        onAddEvidence({ text, imageUrl });
        setText('');
        setImageFile(null);
        setIsLoading(false);
        onDone();
    }
    
    return (
        <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-700/50 rounded-lg space-y-3">
             <h4 className="font-semibold text-gray-200">Share Your Evidence</h4>
             <textarea 
                placeholder="Describe what you've seen or know..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
             />
             <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                disabled={isLoading}
             />
             <button type="submit" disabled={isLoading || !text.trim()} className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
                {isLoading ? <SpinnerIcon /> : 'Submit Evidence'}
             </button>
        </form>
    );
}

const ResponseForm: React.FC<{ evidenceId: string, onRespond: (evidenceId: string, text: string) => void }> = ({ evidenceId, onRespond }) => {
    const [text, setText] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        onRespond(evidenceId, text);
        setText('');
    };
    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
            <input 
                type="text"
                placeholder="Write a response..."
                value={text}
                onChange={e => setText(e.target.value)}
                className="flex-grow bg-gray-600 border border-gray-500 rounded-md px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <button type="submit" className="px-3 py-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">Post</button>
        </form>
    );
}

const EvidenceItem: React.FC<{ evidence: Evidence, onLike: (id: string) => void, onRespond: (id: string, text: string) => void }> = ({ evidence, onLike, onRespond }) => {
    const { user } = useContext(AuthContext);
    const [showResponses, setShowResponses] = useState(false);
    const hasLiked = user ? evidence.likes.includes(user.id) : false;

    return (
        <div className="bg-gray-700/50 p-3 rounded-lg">
          {evidence.imageUrl && <img src={evidence.imageUrl} alt="Evidence" className="rounded-md mb-2 max-h-60 w-full object-contain bg-gray-900/50" />}
          <p className="text-gray-300 text-sm">{evidence.text}</p>
          <div className="text-xs text-gray-500 mt-2 flex items-center">
            <LocationIcon className="h-3 w-3 mr-1" />
            <span>From: {evidence.authorLocation}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
             <button onClick={() => onLike(evidence.id)} className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${hasLiked ? 'text-blue-400 bg-blue-900/50' : 'text-gray-400 hover:bg-gray-600'}`}>
                <ThumbsUpIcon className="h-4 w-4" />
                <span>{evidence.likes.length > 0 ? evidence.likes.length : 'Like'}</span>
             </button>
             <button onClick={() => setShowResponses(!showResponses)} className="text-gray-400 hover:text-white text-xs font-medium">
                {evidence.responses.length > 0 ? `${evidence.responses.length} Response(s)` : 'Respond'}
             </button>
          </div>
          {showResponses && (
            <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {evidence.responses.map(r => (
                        <div key={r.id} className="text-xs">
                            <span className="font-bold text-gray-300">{r.authorUsername}: </span>
                            <span className="text-gray-400">{r.text}</span>
                        </div>
                    ))}
                </div>
                <ResponseForm evidenceId={evidence.id} onRespond={onRespond} />
            </div>
          )}
        </div>
    )
}

const EvidenceSection: React.FC<EvidenceSectionProps> = ({ evidenceList, onAddEvidence, onLike, onRespond, showFormInitially }) => {
  const [showForm, setShowForm] = useState(showFormInitially);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-bold text-gray-200">Community Evidence</h4>
        { !showForm && (
            <button onClick={() => setShowForm(true)} className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                <PlusCircleIcon className="h-5 w-5 mr-1"/>
                Add Evidence
            </button>
        )}
      </div>

      {showForm && <EvidenceForm onAddEvidence={onAddEvidence} onDone={() => setShowForm(false)}/>}

      <div className="mt-4 space-y-4">
        {evidenceList.length > 0 ? (
          evidenceList.map(e => (
            <EvidenceItem key={e.id} evidence={e} onLike={onLike} onRespond={onRespond} />
          ))
        ) : (
          !showForm && <p className="text-sm text-gray-500 italic">No evidence has been submitted yet.</p>
        )}
      </div>
    </div>
  );
};

export default EvidenceSection;
