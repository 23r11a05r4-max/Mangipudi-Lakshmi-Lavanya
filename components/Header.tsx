
import React, { useContext } from 'react';
import { CheckCircleIcon, UserIcon } from './icons';
import { AuthContext } from '../contexts/AuthContext';

const CreditProgressBar: React.FC<{ current: number; goal: number; label: string; color: string; }> = ({ current, goal, label, color }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    return (
        <div>
            <div className="flex justify-between text-xs font-medium text-gray-300">
                <span>{label}</span>
                <span>{Math.floor(current)} / {goal}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1.5 mt-1">
                <div className={`${color} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


const Header: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-gray-800 shadow-md sticky top-0 z-30">
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between flex-wrap gap-y-2">
        <div className="flex items-center">
          <CheckCircleIcon className="h-8 w-8 text-blue-400 mr-3" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Truth Tally
          </h1>
        </div>
        {user && (
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex flex-col gap-1 w-32">
                <CreditProgressBar current={user.credits} goal={100} label="Pro Version" color="bg-purple-500" />
                <CreditProgressBar current={user.credits} goal={500} label="Redeem Coupons" color="bg-yellow-500" />
            </div>
            <div className="flex items-center gap-2 text-gray-300">
               <div className="text-right">
                  <span className="font-bold text-lg text-white block -mb-1">{Math.floor(user.credits)}</span>
                  <span className="text-xs text-gray-400">Credits</span>
               </div>
               <UserIcon className="h-8 w-8 text-gray-400" />
            </div>
            <button 
              onClick={logout} 
              className="px-3 py-1.5 text-sm font-semibold bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
                Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
