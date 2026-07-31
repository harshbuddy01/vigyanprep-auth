import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight, Lock, CheckCircle, Loader2 } from 'lucide-react';

interface TestSeries {
  id: string;
  name: string;
  description: string;
  price: number;
  exam_type: string;
  duration_minutes: number;
  is_active: boolean;
}


export default function TestSelection() {
  const navigate = useNavigate();
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      setUser(user);

      const [{ data: tests, error: testsErr }, { data: purchases }] = await Promise.all([
        supabase.from('test_series').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('purchases').select('test_series_id').eq('user_id', user.id)
      ]);

      if (testsErr) setError('Failed to load test series. Please refresh.');
      if (tests) setTestSeries(tests);
      if (purchases) setPurchasedIds(new Set(purchases.map((p: any) => p.test_series_id)));
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleStartTest = async (testId: string) => {
    setError(null);
    try {
      // Get the student's current Supabase auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/'); return; }
      
      // Issue a short-lived single-use exam access code from the API
      const res = await fetch('https://api.vigyanprep.com/api/exam-access/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ test_series_id: testId })
      });
      
      if (!res.ok) throw new Error('Could not generate exam access. Please try again.');
      const { code } = await res.json();
      
      // Redirect to test portal with ONLY the opaque code (not the JWT)
      // Code expires in 60 seconds and is single-use
      const testPortal = import.meta.env.VITE_TEST_PORTAL_URL || 'https://test.vigyanprep.com';
      window.location.href = `${testPortal}/instructions?code=${encodeURIComponent(code)}`;
    } catch (e: any) {
      setError(e.message || 'Failed to launch exam portal.');
    }
  };

  // Razorpay payment flow
  const handleBuy = async (testId: string, _price: number, testName: string) => {
    setBuyingId(testId);
    setError(null);
    try {
      // 1. Create Razorpay order on backend
      const res = await fetch('https://api.vigyanprep.com/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_series_id: testId, user_id: user?.id })
      });

      if (!res.ok) throw new Error('Could not create payment order. Please try again.');
      const { order } = await res.json();

      // 2. Load Razorpay script and open checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: 'Vigyan.prep',
        description: testName,
        order_id: order.id,
        prefill: { email: user?.email },
        theme: { color: '#f59e0b' },
        handler: async (response: any) => {
          // 3. Verify payment on backend
          const verifyRes = await fetch('https://api.vigyanprep.com/api/payment/paymentverification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              test_series_id: testId,
              user_id: user?.id
            })
          });
          if (verifyRes.ok) {
            const data = await verifyRes.json();
            navigate('/success', { state: { testId, rollNumber: data.rollNumber } });
          } else {
            setError('Payment verification failed. Contact support.');
          }
        },
      };

      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) throw new Error('Payment system unavailable. Please refresh.');
      new Razorpay(options).open();
    } catch (e: any) {
      setError(e.message || 'Payment failed. Please try again.');
    } finally {
      setBuyingId(null);
    }
  };

  const examTypeBadge = (type: string) => {
    const map: Record<string, string> = {
      NEST: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      IAT: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      CMI: 'bg-green-500/20 text-green-300 border-green-500/40',
      PYQ: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    };
    return map[type] || 'bg-neutral-500/20 text-neutral-300 border-neutral-500/40';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#16120b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-amber-400/60 text-sm">Loading your test series...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#16120b] text-white px-6 py-12">
      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif italic text-amber-100 mb-2">
            VIGYAN<span className="font-sans text-sm tracking-normal text-amber-400 font-semibold ml-1">.prep</span>
          </h1>
          <p className="text-neutral-400 text-sm">Welcome, {user?.email}</p>
          <h2 className="text-2xl font-light mt-4 text-amber-200">Select Your Test Series</h2>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-500/40 text-red-300 rounded-lg px-4 py-3 text-sm text-center">
            {error}
          </div>
        )}

        {testSeries.length === 0 ? (
          <div className="text-center text-neutral-400 py-20">
            <p className="text-lg">No test series available right now.</p>
            <p className="text-sm mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testSeries.map(test => {
              const isPurchased = purchasedIds.has(test.id);
              const isBuying = buyingId === test.id;

              return (
                <div
                  key={test.id}
                  className="bg-neutral-900/80 backdrop-blur border border-white/10 rounded-2xl p-6 flex flex-col hover:border-amber-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-amber-900/10"
                >
                  {/* Badge row */}
                  <div className="flex items-center gap-2 mb-4">
                    {test.exam_type && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-mono font-semibold ${examTypeBadge(test.exam_type)}`}>
                        {test.exam_type}
                      </span>
                    )}
                    {test.duration_minutes && (
                      <span className="text-xs text-neutral-500 font-mono">{test.duration_minutes} mins</span>
                    )}
                    {isPurchased && (
                      <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Enrolled
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-serif mb-2 text-amber-100">{test.name}</h2>
                  <p className="text-neutral-400 text-sm mb-6 flex-grow leading-relaxed">{test.description}</p>

                  <div className="text-2xl font-bold mb-4 text-amber-400">
                    {test.price === 0 ? 'Free' : `₹${test.price}`}
                  </div>

                  {isPurchased ? (
                    <button
                      onClick={() => handleStartTest(test.id)}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold transition"
                    >
                      Enter Exam Portal <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(test.id, test.price, test.name)}
                      disabled={isBuying}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isBuying ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                      ) : (
                        <><Lock className="w-4 h-4" /> Buy Now</>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
