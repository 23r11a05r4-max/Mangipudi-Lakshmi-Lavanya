import React from 'react';

interface PasswordStrengthMeterProps {
  password?: string;
}

const rules = [
  (v: string) => v.length >= 8,
  (v: string) => /[A-Z]/.test(v),
  (v: string) => /[a-z]/.test(v),
  (v: string) => /\d/.test(v),
  (v: string) => /[@#$%!]/.test(v),
];

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  if (!password) {
    return null;
  }
  
  const strength = rules.reduce((acc, rule) => acc + (rule(password) ? 1 : 0), 0);

  const getStrengthProps = () => {
    switch (strength) {
      case 1:
        return { width: '20%', bgColor: 'bg-red-500', textColor: 'text-red-400', text: 'Very Weak' };
      case 2:
        return { width: '40%', bgColor: 'bg-orange-500', textColor: 'text-orange-400', text: 'Weak' };
      case 3:
        return { width: '60%', bgColor: 'bg-yellow-500', textColor: 'text-yellow-400', text: 'Medium' };
      case 4:
        return { width: '80%', bgColor: 'bg-lime-500', textColor: 'text-lime-400', text: 'Strong' };
      case 5:
        return { width: '100%', bgColor: 'bg-green-500', textColor: 'text-green-400', text: 'Very Strong' };
      default:
        // Case 0 or any other
        return { width: '0%', bgColor: 'bg-gray-700', textColor: 'text-gray-400', text: '' };
    }
  };
  
  const { width, bgColor, textColor, text } = getStrengthProps();

  return (
    <div className="space-y-1">
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${bgColor}`} 
          style={{ width: width }}
          aria-label={`Password strength: ${text}`}
        ></div>
      </div>
      {text && <p className={`text-right text-xs font-semibold ${textColor}`}>{text}</p>}
    </div>
  );
};

export default PasswordStrengthMeter;
