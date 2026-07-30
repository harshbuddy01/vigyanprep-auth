import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TestSeries {
  id: string;
  name: string;
  description: string;
  price: number;
}

export default function TestSelection() {
  const navigate = useNavigate();
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      setUser(user);

      const [{ data: tests }, { data: purchases }] = await Promise.all([
        supabase.from('test_series').select('*').eq('is_active', true),
        supabase.from('purchases').select('test_series_id').eq('user_id', user.id)
      ]);

      if (tests) setTestSeries(tests);
      if (purchases) setPurchasedIds(new Set(purchases.map(p => p.test_series_id)));
      
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleBuy = async (testId: string) => {
    try {
      const res = await fetch('https://api.vigyanprep.com/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_series_id: testId, user_id: user?.id })
      });
      if (res.ok) {
        navigate('/success', { state: { testId } });
      }
    } catch (e) {
      console.error('Payment failed', e);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl mb-8 text-center text-amber-500 font-serif">Available Test Series</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testSeries.map(test => {
          const isPurchased = purchasedIds.has(test.id);
          return (
            <div key={test.id} className="bg-neutral-900/90 backdrop-blur border border-white/10 rounded-xl p-6 flex flex-col">
              <h2 className="text-2xl mb-2 font-serif">{test.name}</h2>
              <p className="text-neutral-400 mb-4 flex-grow">{test.description}</p>
              <div className="text-xl font-bold mb-6 text-amber-400">₹{test.price}</div>
              
              {isPurchased ? (
                <a 
                  href="https://test.vigyanprep.com"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition border border-white/10"
                >
                  Start Test <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <button
                  onClick={() => handleBuy(test.id)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:opacity-90 transition"
                >
                  Buy Now
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
