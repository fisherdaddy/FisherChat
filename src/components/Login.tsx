import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../store/slices/authSlice';
import { XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface LoginProps {
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      // TODO: Implement actual authentication logic here
      const mockUser = {
        id: '1',
        email: email,
        name: 'Test User',
      };
      const mockToken = 'mock-token';

      dispatch(setUser(mockUser));
      dispatch(setToken(mockToken));
      onClose();
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <UserCircleIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">登录</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-gradient-to-r from-red-500/90 to-orange-500/90 text-white p-4 rounded-lg text-sm font-medium flex items-center space-x-2">
              <XMarkIcon className="h-5 w-5 text-white" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
              邮箱
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-white px-4 py-2.5 text-sm"
              placeholder="请输入邮箱地址"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
              密码
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-white px-4 py-2.5 text-sm"
              placeholder="请输入密码"
            />
          </div>
          <div className="flex justify-end space-x-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium"
            >
              登录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 