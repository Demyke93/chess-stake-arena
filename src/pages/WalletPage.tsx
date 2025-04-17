
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const WalletPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleDeposit = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to make a deposit',
        variant: 'destructive',
      });
      return;
    }
    
    // Get user email from profile if user.email is not available
    let userEmail = user.email;
    
    if (!userEmail) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        userEmail = profileData?.email;
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    }

    if (!userEmail) {
      toast({
        title: 'Error',
        description: 'No email found for your account. Please update your profile.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await supabase.functions.invoke('paystack', {
        body: { 
          amount: Number(amount),
          email: userEmail,
          type: 'deposit'
        },
      });

      if (response.data.status) {
        window.location.href = response.data.data.authorization_url;
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Wallet</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Balance</CardTitle>
          <CardDescription>Your current balance and deposit options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-2xl font-bold">
              {isLoading ? 'Loading...' : `${wallet?.balance || 0} coins`}
            </div>
            <div className="flex gap-4">
              <Input
                type="number"
                min="1000"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount in Naira (₦)"
              />
              <Button onClick={handleDeposit}>
                Deposit
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              1000 Naira = 1 coin
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletPage;
