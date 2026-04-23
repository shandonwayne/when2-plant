import { useState } from 'react';
import { Sprout, Loader2 } from 'lucide-react';

interface AuthFormProps {
  onSignIn: (email: string, password: string) => Promise<{ message: string } | null>;
  onSignUp: (email: string, password: string) => Promise<{ message: string } | null>;
}

export default function AuthForm({ onSignIn, onSignUp }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isSignUp
      ? await onSignUp(email, password)
      : await onSignIn(email, password);

    if (result) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sage-100 rounded-2xl mb-4">
            <Sprout size={28} className="text-sage-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-earth-900 tracking-tight">
            Garden Planner
          </h1>
          <p className="text-sm text-earth-500 mt-1">Plan your perfect garden</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-earth-200 p-6 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-earth-800 text-lg">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] uppercase tracking-wider text-earth-500 font-semibold block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-earth-50 border border-earth-200 rounded-xl text-sm text-earth-800 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-earth-500 font-semibold block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 bg-earth-50 border border-earth-200 rounded-xl text-sm text-earth-800 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-sage-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-earth-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-sage-600 font-semibold hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
