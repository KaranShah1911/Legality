import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { FileText, PlusCircle, CheckCircle, Clock, ArrowRight, TrendingUp, Layers, Users } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="glass-sm p-5 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-bold font-display" style={{ color: 'var(--text-heading)' }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!address) { navigate('/'); return; }
    fetchContracts();
  }, [address, navigate]);

  const fetchContracts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/contracts?walletAddress=${address}`);
      setContracts(res.data.contracts);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const myContracts = contracts.filter(c => c.buyerWallet.toLowerCase() === address?.toLowerCase());
  const toSign = contracts.filter(c => c.sellerWallet?.toLowerCase() === address?.toLowerCase() && c.status === 'Pending');
  const completed = contracts.filter(c => c.status === 'Completed');

  const filtered = contracts.filter(c => {
    if (filter === 'created') return c.buyerWallet.toLowerCase() === address?.toLowerCase();
    if (filter === 'pending') return c.status === 'Pending';
    if (filter === 'completed') return c.status === 'Completed';
    return true;
  });

  const shortAddr = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '—';

  return (
    <div className="max-w-7xl mx-auto page-enter py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Dashboard</h1>
          <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>{address}</p>
        </div>
        <Link to="/create-contract">
          <button className="btn-primary gap-2">
            <PlusCircle className="w-4 h-4" /> New Contract
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Contracts" value={contracts.length} icon={Layers} color="#6366f1" />
        <StatCard label="Created by Me" value={myContracts.length} icon={TrendingUp} color="#3b82f6" />
        <StatCard label="Needs My Signature" value={toSign.length} icon={Users} color="#f59e0b" />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle} color="#10b981" />
      </div>

      {/* Alert for pending signatures */}
      {toSign.length > 0 && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl"
          style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-sm" style={{ color: '#d97706' }}>
            <span className="font-bold">{toSign.length} contract{toSign.length > 1 ? 's' : ''}</span> awaiting your signature.
          </p>
          <button onClick={() => setFilter('pending')} className="ml-auto text-xs font-medium" style={{ color: '#d97706' }}>
            View →
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'created', label: 'Created' },
          { key: 'pending', label: 'Pending' },
          { key: 'completed', label: 'Completed' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={filter === f.key
              ? { background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }
              : { background: 'var(--bg-glass-sm)', border: '1px solid var(--border-glass-sm)', color: 'var(--text-secondary)' }
            }>
            {f.label}
          </button>
        ))}
      </div>

      {/* Contracts List */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-sm p-6">
              <div className="shimmer h-5 w-32 mb-4 rounded" />
              <div className="shimmer h-4 w-48 mb-2 rounded" />
              <div className="shimmer h-4 w-36 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px dashed rgba(99,102,241,0.3)' }}>
            <FileText className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold font-display mb-2">No contracts found</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-dim)' }}>Create your first blockchain-backed agreement.</p>
          <Link to="/create-contract"><button className="btn-primary">Create Contract</button></Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(contract => {
            const isBuyer = contract.buyerWallet.toLowerCase() === address?.toLowerCase();
            const link = isBuyer ? `/contract/${contract.contractId}` : `/sign-contract/${contract.contractId}`;

            return (
              <Link to={link} key={contract.contractId}>
                <div className="contract-card p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    {contract.status === 'Completed'
                      ? <span className="badge-completed"><CheckCircle className="w-3 h-3" /> Completed</span>
                      : <span className="badge-pending"><Clock className="w-3 h-3" /> Pending</span>
                    }
                  </div>

                  <h3 className="font-bold font-display mb-1" style={{ color: 'var(--text-heading)' }}>{contract.templateType} Agreement</h3>
                  <p className="text-xs font-mono mb-4 truncate" style={{ color: 'var(--text-dim)' }}>#{contract.contractId.slice(0, 18)}...</p>

                  <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-dim)' }}>
                    <div className="flex justify-between">
                      <span>Buyer</span>
                      <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{shortAddr(contract.buyerWallet)}</span>
                    </div>
                    {contract.sellerWallet && (
                      <div className="flex justify-between">
                        <span>Seller</span>
                        <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{shortAddr(contract.sellerWallet)}</span>
                      </div>
                    )}
                  </div>

                  <div className="divider" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-md font-medium" style={{
                      background: isBuyer ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
                      color: isBuyer ? '#3b82f6' : '#8b5cf6'
                    }}>
                      {isBuyer ? 'Creator' : 'Signee'}
                    </span>
                    <span className="text-indigo-500 flex items-center gap-1 font-medium">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
