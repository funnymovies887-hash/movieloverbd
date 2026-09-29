import React, { useState } from 'react';
import { X, Send, Film, CheckCircle2 } from 'lucide-react';
import { addStoredRequest } from '../utils/storage';
import { MovieRequest } from '../types';

interface RequestMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted: (requests: MovieRequest[]) => void;
}

export const RequestMovieModal: React.FC<RequestMovieModalProps> = ({
  isOpen,
  onClose,
  onRequestSubmitted
}) => {
  const [movieTitle, setMovieTitle] = useState('');
  const [year, setYear] = useState('');
  const [userName, setUserName] = useState('');
  const [language, setLanguage] = useState('Bengali');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieTitle.trim()) return;

    const updated = addStoredRequest({
      movieTitle: movieTitle.trim(),
      year: year.trim(),
      userName: userName.trim() || 'Anonymous Visitor',
      language
    });

    onRequestSubmitted(updated);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setMovieTitle('');
      setYear('');
      setUserName('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Request a Movie / Series</h3>
            <p className="text-xs text-slate-400">Can't find your desired print? We'll upload it!</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Request Received!</h4>
            <p className="text-xs text-slate-300">
              Our upload team has received your request and will upload it shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Movie / Series Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Toofan (2024) or Mirzapur"
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 focus:border-red-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Release Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2024"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Audio Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:border-red-500 focus:outline-none"
                >
                  <option value="Bengali">Bengali</option>
                  <option value="Hindi Dubbed">Hindi Dubbed</option>
                  <option value="Dual Audio">Dual Audio</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Your Name / Nickname (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Tanvir"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 focus:border-red-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Movie Request</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
