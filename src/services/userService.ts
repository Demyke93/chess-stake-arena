
import { User, Match } from '@/types';

// Mock database for demo purposes
let users: User[] = [
  {
    id: 'user_1',
    username: 'ChessPlayer1',
    balance: 1000,
    avatar: '♔'
  },
  {
    id: 'user_2',
    username: 'ChessPlayer2',
    balance: 1000,
    avatar: '♕'
  },
  {
    id: 'user_3',
    username: 'GrandMaster',
    balance: 5000,
    avatar: '♚'
  }
];

let matches: Match[] = [
  {
    id: 'match_1',
    whitePlayerId: 'user_1',
    blackPlayerId: 'user_2',
    whiteUsername: 'ChessPlayer1',
    blackUsername: 'ChessPlayer2',
    stake: 100,
    status: 'completed',
    winner: 'user_1',
    timeControl: '5+3',
    gameMode: 'rapid',
    lichessGameId: 'abc123',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 82800000).toISOString()
  },
  {
    id: 'match_2',
    whitePlayerId: 'user_3',
    blackPlayerId: 'user_1',
    whiteUsername: 'GrandMaster',
    blackUsername: 'ChessPlayer1',
    stake: 200,
    status: 'completed',
    winner: 'user_3',
    timeControl: '3+2',
    gameMode: 'blitz',
    lichessGameId: 'def456',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 169200000).toISOString()
  }
];

// Current user session (for demo)
let currentUser: User | null = null;

export const userService = {
  // Login user (in a real app, this would authenticate with backend)
  login: (username: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (user) {
          currentUser = user;
          resolve(user);
        } else {
          // For demo purposes, create a new user if not found
          const newUser: User = {
            id: `user_${Math.random().toString(36).substr(2, 9)}`,
            username,
            balance: 1000,
            avatar: '♟' // Default avatar
          };
          users.push(newUser);
          currentUser = newUser;
          resolve(newUser);
        }
      }, 500);
    });
  },

  // Get current user
  getCurrentUser: (): Promise<User | null> => {
    return Promise.resolve(currentUser);
  },

  // Set current user
  setCurrentUser: (user: User): void => {
    currentUser = user;
  },

  // Logout user
  logout: (): Promise<void> => {
    return new Promise((resolve) => {
      currentUser = null;
      resolve();
    });
  },

  // Get user by ID
  getUserById: (id: string): Promise<User | null> => {
    return new Promise((resolve) => {
      const user = users.find(u => u.id === id);
      resolve(user || null);
    });
  },

  // Get all users
  getAllUsers: (): Promise<User[]> => {
    return Promise.resolve(users);
  },

  // Update user balance
  updateBalance: (userId: string, amount: number): Promise<User> => {
    return new Promise((resolve, reject) => {
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        reject(new Error('User not found'));
        return;
      }

      users[userIndex] = {
        ...users[userIndex],
        balance: users[userIndex].balance + amount
      };

      if (currentUser && currentUser.id === userId) {
        currentUser = users[userIndex];
      }

      resolve(users[userIndex]);
    });
  },

  // Create a match
  createMatch: (match: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>): Promise<Match> => {
    return new Promise((resolve) => {
      const now = new Date().toISOString();
      const newMatch: Match = {
        id: `match_${Math.random().toString(36).substr(2, 9)}`,
        ...match,
        createdAt: now,
        updatedAt: now
      };

      matches.push(newMatch);
      resolve(newMatch);
    });
  },

  // Get all matches for a user
  getUserMatches: (userId: string): Promise<Match[]> => {
    return new Promise((resolve) => {
      const userMatches = matches.filter(
        m => m.whitePlayerId === userId || m.blackPlayerId === userId
      );
      resolve(userMatches);
    });
  },

  // Complete a match and handle stake transfers
  completeMatch: (matchId: string, winnerId: string | null): Promise<Match> => {
    return new Promise(async (resolve, reject) => {
      const matchIndex = matches.findIndex(m => m.id === matchId);
      
      if (matchIndex === -1) {
        reject(new Error('Match not found'));
        return;
      }

      const match = matches[matchIndex];
      
      if (match.status === 'completed') {
        reject(new Error('Match already completed'));
        return;
      }

      // Update match status
      const updatedMatch: Match = {
        ...match,
        status: 'completed',
        winner: winnerId || undefined,
        updatedAt: new Date().toISOString()
      };
      
      matches[matchIndex] = updatedMatch;

      // Handle stake transfers if there's a winner
      if (winnerId) {
        const loserId = winnerId === match.whitePlayerId ? match.blackPlayerId : match.whitePlayerId;
        
        // Credit winner
        await userService.updateBalance(winnerId, match.stake);
        
        // Debit loser
        await userService.updateBalance(loserId, -match.stake);
      }

      resolve(updatedMatch);
    });
  },

  // Get all matches
  getAllMatches: (): Promise<Match[]> => {
    return Promise.resolve([...matches].reverse());
  }
};
