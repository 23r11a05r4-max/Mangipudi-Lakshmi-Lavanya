
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { User, CATEGORIES, Category } from '../types';
import PasswordValidator from './PasswordValidator';
import { EyeIcon, EyeOffIcon, SpinnerIcon } from './icons';
import PasswordStrengthMeter from './PasswordStrengthMeter';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
             <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700">
                <h1 className="text-3xl font-bold text-center text-white mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-center text-gray-400 mb-6">
                    {isLogin ? 'Log in to continue to Truth Tally' : 'Join the community to verify news'}
                </p>
                
                {isLogin ? <LoginForm /> : <RegisterForm />}

                <div className="text-center mt-6">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-400 hover:text-blue-300 hover:underline">
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                    </button>
                </div>
             </div>
        </div>
    );
};

const LoginForm: React.FC = () => {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(username, password);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
                {isLoading ? <SpinnerIcon /> : 'Log In'}
            </button>
        </form>
    );
};


const RegisterForm: React.FC = () => {
    const { register } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        gender: 'prefer-not-to-say' as User['gender'],
        dob: '',
        location: '',
        preferredCategories: [] as Category[],
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (category: Category) => {
        setFormData(prev => ({
            ...prev,
            preferredCategories: prev.preferredCategories.includes(category)
                ? prev.preferredCategories.filter(c => c !== category)
                : [...prev.preferredCategories, category]
        }));
    };

    const commonPasswords = ['123456', 'password', '12345678', 'qwerty', '111111'];
    const isPasswordValid = 
        formData.password.length >= 8 &&
        /[A-Z]/.test(formData.password) &&
        /[a-z]/.test(formData.password) &&
        /\d/.test(formData.password) &&
        /[@#$%!]/.test(formData.password) &&
        !commonPasswords.includes(formData.password.toLowerCase()) &&
        (formData.username.trim().length > 2 ? !formData.password.toLowerCase().includes(formData.username.trim().toLowerCase()) : true);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!isPasswordValid) {
            setError('Password does not meet all security requirements.');
            return;
        }

        setIsLoading(true);
        try {
            const { password, confirmPassword, ...userData } = formData;
            await register(userData, password);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Username" name="username" value={formData.username} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            <div className="space-y-2">
                <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="Password" name="password" value={formData.password} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">
                        {showPassword ? <EyeOffIcon/> : <EyeIcon/>}
                    </button>
                </div>
                <PasswordStrengthMeter password={formData.password} />
                <PasswordValidator value={formData.password} username={formData.username}/>
            </div>
            <input type="password" placeholder="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="prefer-not-to-say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <input type="text" placeholder="Area / Location" name="location" value={formData.location} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Choose your preferred news categories:</label>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            type="button"
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${formData.preferredCategories.includes(cat) ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" disabled={isLoading || !isPasswordValid || formData.password !== formData.confirmPassword} className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
                 {isLoading ? <SpinnerIcon /> : 'Sign Up'}
            </button>
        </form>
    )
}

export default AuthPage;
