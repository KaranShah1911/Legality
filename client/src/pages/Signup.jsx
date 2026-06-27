import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, User, Mail, HelpCircle, ChevronRight, CheckCircle, Eye, EyeOff } from 'lucide-react';

const SECURITY_QUESTIONS = [
  "Name of your first pet?",
  "City where you were born?",
  "Name of your first school?",
  "Mother's maiden name?",
  "Name of your childhood best friend?",
];

const Signup = () => {
  const navigate = useNavigate();
  const [tempData, setTempData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showAnswers, setShowAnswers] = useState([false, false]);
  const [formData, setFormData] = useState({
    name: '', email: '',
    q1: '', a1: '', q2: '', a2: '',
  });

  useEffect(() => {
    const data = sessionStorage.getItem('pendingSignupTemp');
    if (!data) navigate('/');
    else setTempData(JSON.parse(data));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        walletAddress: tempData.address, message: tempData.message, signature: tempData.signature,
        name: formData.name, email: formData.email,
        securityQuestions: [
          { question: formData.q1, answer: formData.a1 },
          { question: formData.q2, answer: formData.a2 },
        ]
      };
      const res = await axios.post('http://localhost:5000/api/auth/signup', payload);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      sessionStorage.removeItem('pendingSignupTemp');
      navigate('/dashboard');
    } catch (err) {
      alert('Signup failed: ' + (err.response?.data?.error || err.message));
    } finally { setLoading(false); }
  };

  if (!tempData) return null;

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 page-enter">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-lg relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display">Create Your Profile</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Complete your Legality identity — secured by your wallet.</p>
        </div>

        {/* Wallet badge */}
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
          <span className="text-xs font-mono break-all" style={{ color: '#60a5fa' }}>{tempData.address}</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step >= s ? 'text-white' : ''}`}
                style={{
                  background: step >= s ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'var(--bg-glass-sm)',
                  color: step >= s ? '#fff' : 'var(--text-dim)',
                  border: step >= s ? 'none' : '1px solid var(--border-glass-sm)'
                }}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              <span className="text-xs font-medium" style={{ color: step >= s ? 'var(--text-primary)' : 'var(--text-dim)' }}>
                {s === 1 ? 'Basic Info' : 'Security'}
              </span>
              {s < 2 && <div className="flex-1 h-px" style={{ background: step > s ? '#6366f1' : 'var(--border-glass-sm)' }} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="glass p-8 space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="form-label flex items-center gap-2"><User className="w-3.5 h-3.5" />Full Name</label>
                  <input required className="form-input" placeholder="e.g. Karan Shah"
                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="form-label flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />Email Address
                    <span className="normal-case font-normal" style={{ color: 'var(--text-dim)' }}>(optional)</span>
                  </label>
                  <input type="email" className="form-input" placeholder="e.g. karan@example.com"
                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <button type="button" onClick={() => { if (!formData.name) return alert('Please enter your name'); setStep(2); }}
                  className="btn-primary w-full mt-2">
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex items-center gap-2 text-sm mb-4"
                  style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                  <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p>These help verify your identity before signing high-value contracts. Answers are hashed and never stored in plain text.</p>
                </div>

                {[1, 2].map((n) => (
                  <div key={n} className="space-y-3">
                    <label className="form-label">Security Question {n}</label>
                    <select required className="form-input"
                      value={formData[`q${n}`]}
                      onChange={e => setFormData({ ...formData, [`q${n}`]: e.target.value })}>
                      <option value="">Select a question...</option>
                      {SECURITY_QUESTIONS.filter(q => q !== formData[`q${n === 1 ? 2 : 1}`]).map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                    <div className="relative">
                      <input required
                        type={showAnswers[n - 1] ? 'text' : 'password'}
                        className="form-input pr-10"
                        placeholder="Your answer (case-insensitive)"
                        value={formData[`a${n}`]}
                        onChange={e => setFormData({ ...formData, [`a${n}`]: e.target.value })} />
                      <button type="button"
                        onClick={() => setShowAnswers(prev => { const a = [...prev]; a[n - 1] = !a[n - 1]; return a; })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: 'var(--text-dim)' }}>
                        {showAnswers[n - 1] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {n === 1 && <div className="divider" />}
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-2 flex-grow">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Profile...
                      </span>
                    ) : 'Complete Signup'}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
