
import React, { useState } from 'react';
import { Evidence } from '../types';
import { LocationIcon, PlusCircleIcon, SpinnerIcon } from './icons';


interface EvidenceSectionProps {
  evidenceList: Evidence[];
  onAddEvidence: (evidence: Omit<Evidence, 'id' | 'authorLocation'>) => void;
  showForm: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  userHasVotedReal: boolean;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

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
            imageUrl = await fileToBase64(imageFile);
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


const EvidenceSection: React.FC<EvidenceSectionProps> = ({ evidenceList, onAddEvidence, showForm, setShowForm, userHasVotedReal }) => {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-bold text-gray-200">Community Evidence</h4>
        {userHasVotedReal && !showForm && (
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
            <div key={e.id} className="bg-gray-700/50 p-3 rounded-lg">
              {e.imageUrl && <img src={e.imageUrl} alt="Evidence" className="rounded-md mb-2 max-h-60 w-full object-contain" />}
              <p className="text-gray-300 text-sm">{e.text}</p>
              <div className="text-xs text-gray-500 mt-2 flex items-center">
                <LocationIcon className="h-3 w-3 mr-1" />
                <span>From: {e.authorLocation}</span>
              </div>
            </div>
          ))
        ) : (
          !showForm && <p className="text-sm text-gray-500 italic">No evidence has been submitted yet.</p>
        )}
      </div>
    </div>
  );
};

export default EvidenceSection;
