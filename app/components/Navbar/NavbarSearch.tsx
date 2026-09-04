'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2, LogIn, AlertCircle } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { searchUsers, type SearchUserItem } from '@/app/lib/actions/actionSearch';

interface NavbarSearchProps {
  isLoggedIn?: boolean;
}

export default function NavbarSearch({ isLoggedIn = false }: NavbarSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUserItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (!isOpen) {
      setQuery('');
      setResults([]);
      setErrorMessage(null);
    }
  }, [isOpen, isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    if (!query.trim()) {
      setResults([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      const res = await searchUsers(query);
      if (res.success) {
        setResults(res.users);
        setErrorMessage(null);
      } else {
        setResults([]);
        setErrorMessage(res.error || 'Unable to complete search');
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, isLoggedIn]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Search"
        className={`hover:bg-white/10 p-2 rounded-full transition-colors text-white cursor-pointer ${
          isOpen ? 'bg-white/10 text-blue-400' : ''
        }`}
      >
        <Search className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="top-12 right-0 absolute bg-black/95 backdrop-blur-xl shadow-2xl border border-white/10 rounded-2xl w-[310px] sm:w-[360px] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {!isLoggedIn ? (
            <div className="p-6 text-center flex flex-col items-center gap-3">
              <div className="p-3 bg-white/5 rounded-full text-blue-400">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-base">Search Boblo</h4>
                <p className="text-neutral-400 text-xs mt-1">
                  You need to be signed in to search for users.
                </p>
              </div>
              <Link
                href="/auth"
                onClick={() => setIsOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black font-semibold text-xs px-4 py-2 rounded-full transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="relative flex items-center p-3 border-b border-white/10">
                <Search className="left-6 absolute w-4 h-4 text-neutral-400" />
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={30}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users..."
                  className="bg-neutral-900 focus:outline-none pl-9 pr-8 py-2 border border-white/10 focus:border-blue-500 rounded-full w-full text-white text-sm placeholder:text-neutral-500 transition-colors"
                />
                {isLoading ? (
                  <Loader2 className="right-6 absolute w-4 h-4 text-neutral-400 animate-spin" />
                ) : query ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="right-6 absolute text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <div className="max-h-72 overflow-y-auto">
                {results.length > 0 ? (
                  results.map((user) => (
                    <Link
                      key={user.id}
                      href={`/${user.userName}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 hover:bg-white/5 px-4 py-2.5 transition-colors"
                    >
                      <div className="w-9 h-9 shrink-0">
                        <Avatar
                          name={user.name || user.userName}
                          image={user.avatar}
                          size={36}
                          className="w-9 h-9"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-white text-sm truncate">
                          {user.name || user.userName}
                        </span>
                        <span className="text-neutral-400 text-xs truncate">
                          @{user.userName}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : query.trim() && !isLoading && !errorMessage ? (
                  <div className="py-6 text-center text-neutral-400 text-sm">
                    No users found for &ldquo;{query}&rdquo;
                  </div>
                ) : !query.trim() && !errorMessage ? (
                  <div className="py-6 text-center text-neutral-500 text-xs">
                    Search by name or username
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
