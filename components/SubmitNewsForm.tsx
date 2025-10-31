
import React, { useState } from 'react';
import { NewsItem, VerificationStatus } from '../types';
import { verifyNews, VerificationResult } from '../services/geminiService';
import { UploadIcon, SpinnerIcon } from './icons';

interface SubmitNewsFormProps {
  onAddNews: (newsItem: Omit<NewsItem, 'id' | 'votes' | 'evidence' | 'clicks' | 'userHasVoted'>) => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });


const SubmitNewsForm: React.FC<SubmitNewsFormProps> = ({ onAddNews }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !location.trim() || !title.trim()) {
      setError('Title, description, and location are required.');
      return;
    }
    setError('');
    setIsLoading(true);

    let base64Image: string | undefined = undefined;
    let mimeType: string | undefined = undefined;
    let imageUrl: string | undefined = undefined;

    if (imageFile) {
      base64Image = await fileToBase64(imageFile);
      mimeType = imageFile.type;
      imageUrl = URL.createObjectURL(imageFile);
    }
    
    try {
      const verificationResult: VerificationResult = await verifyNews(description, base64Image, mimeType);
      
      const newNews: Omit<NewsItem, 'id' | 'votes' | 'evidence' | 'clicks' | 'userHasVoted'> = {
        title,
        description,
        location,
        imageUrl,
        verification: {
          status: VerificationStatus[verificationResult.verdict],
          confidence: verificationResult.confidence,
          reasoning: verificationResult.reasoning,
          isAiGenerated: verificationResult.isAiGenerated,
        },
      };

      onAddNews(newNews);
      setTitle('');
      setDescription('');
      setLocation('');
      setImageFile(null);
      
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error(err);
      setError('Failed to verify news. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-bold mb-4 text-blue-300">Submit a News Report for Verification</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="News Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={isLoading}
        />
        <textarea
          placeholder="What's the news? Provide as much detail as possible..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows={3}
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Location of the event (e.g., city, state)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={isLoading}
        />
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">Upload an image (optional)</label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
        >
          {isLoading ? <SpinnerIcon /> : <UploadIcon />}
          <span className="ml-2">{isLoading ? 'Verifying...' : 'Submit & Verify'}</span>
        </button>
      </form>
    </div>
  );
};

export default SubmitNewsForm;
