import { useState, useEffect } from 'react';
import { blockchainSystem } from './blockchain';
import { Wallet } from './types';

export function useWallet() {
  const [currentUser, setCurrentUser] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const user = await blockchainSystem.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error loading wallet:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWallet();
  }, []);

  return {
    currentUser,
    loading
  };
} 