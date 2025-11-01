import React from 'react';
import { CheckCircleIcon, CrossCircleIcon } from './icons';

interface PasswordValidatorProps {
  value: string;
  username?: string;
}

interface ValidationRule {
  text: string;
  test: (value: string) => boolean;
}

const commonPasswords = ['123456', 'password', '12345678', 'qwerty', '111111'];

const PasswordValidator: React.FC<PasswordValidatorProps> = ({ value, username = '' }) => {
  const rules: ValidationRule[] = [
    { text: 'At least 8 characters', test: (v) => v.length >= 8 },
    { text: 'Contains uppercase (A-Z)', test: (v) => /[A-Z]/.test(v) },
    { text: 'Contains lowercase (a-z)', test: (v) => /[a-z]/.test(v) },
    { text: 'Contains a number (0-9)', test: (v) => /\d/.test(v) },
    { text: 'Contains special char (@#$%!)', test: (v) => /[@#$%!]/.test(v) },
    { text: 'Not a common password', test: (v) => !commonPasswords.includes(v.toLowerCase()) },
    { text: 'Does not contain username', test: (v) => username.trim().length > 2 ? !v.toLowerCase().includes(username.trim().toLowerCase()) : true },
  ];

  if (!value) return null;

  return (
    <div className="p-3 bg-gray-900/50 rounded-lg mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {rules.map((rule) => {
          // Hide username rule if username is too short to be relevant
          if (rule.text.includes('username') && username.trim().length <= 2) {
            return null;
          }
          const isValid = rule.test(value);
          return (
            <div key={rule.text} className={`flex items-center gap-2 transition-colors ${isValid ? 'text-green-400' : 'text-red-400'}`}>
              {isValid 
                  ? <CheckCircleIcon className="h-4 w-4 flex-shrink-0" /> 
                  : <CrossCircleIcon className="h-4 w-4 flex-shrink-0" />
              }
              <span>{rule.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordValidator;
