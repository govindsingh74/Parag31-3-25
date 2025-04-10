import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Clock, DollarSign, Trophy } from 'lucide-react';
import { format } from 'date-fns';

interface Bet {
  id: string;
  numbers: number[];
  amount: number;
  bet_type: string;
  status: string;
  created_at: string;
  game: {
    name: string;
    game_date: string;
  };
}

interface UserProfile {
  username: string;
  email: string;
  balance: number;
  wallet_address: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bets, setBets] = useState<Bet[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('username, email, balance, wallet_address')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user's bets
        const { data: betsData, error: betsError } = await supabase
          .from('bets')
          .select(`
            id,
            numbers,
            amount,
            bet_type,
            status,
            created_at,
            game:game_id (
              name,
              game_date
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (betsError) throw betsError;
        setBets(betsData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-casino-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-casino-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-casino-black to-casino-purple py-12">
      <div className="container mx-auto px-4">
        {/* User Profile Section */}
        <div className="bg-gradient-to-r from-gray-900 to-casino-purple rounded-lg shadow-xl p-8 mb-8 border border-casino-gold/20">
          <h2 className="text-3xl font-bold text-casino-gold mb-8">Welcome, {profile?.username}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 p-6 rounded-lg border border-casino-gold/10">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-semibold text-white">💰Balance</h3>
              </div>
              <p className="text-3xl font-bold text-casino-gold">⛃{profile?.balance.toFixed(2)}</p>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-lg border border-casino-gold/10">
              <div className="flex items-center mb-4">
                <Trophy className="w-8 h-8 text-casino-gold mr-3" />
                <h3 className="text-xl font-semibold text-white">Total Bets</h3>
              </div>
              <p className="text-3xl font-bold text-casino-gold">{bets.length}</p>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-lg border border-casino-gold/10">
              <div className="flex items-center mb-4">
                <Clock className="w-8 h-8 text-casino-gold mr-3" />
                <h3 className="text-xl font-semibold text-white">Member Since</h3>
              </div>
              <p className="text-xl text-casino-gold">
                {format(new Date(user?.created_at || new Date()), 'MMMM yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Bets Section */}
        <div className="bg-gradient-to-r from-gray-900 to-casino-purple rounded-lg shadow-xl p-8 border border-casino-gold/20">
          <h3 className="text-2xl font-bold text-casino-gold mb-8">Recent Bets</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Game</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Numbers</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {bets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{bet.game.name}</div>
                      <div className="text-sm text-gray-400">{format(new Date(bet.game.game_date), 'PP')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {bet.numbers.map((num, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-casino-purple text-white text-sm font-medium border border-casino-gold/20"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-casino-gold font-medium">⛃{bet.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bet.status === 'won' ? 'bg-casino-green/20 text-green-400' :
                        bet.status === 'lost' ? 'bg-casino-red/20 text-red-400' :
                        'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {format(new Date(bet.created_at), 'PP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;