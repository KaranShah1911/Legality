import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { FileText, Send, Download, CheckCircle, Clock, ExternalLink, Copy, Hash, Link2 } from 'lucide-react';

const ContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const [contract, setContract] = useState(null);
  const [sellerWallet, setSellerWallet] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => { fetchContractDetails(); }, [id]);

  const fetchContractDetails = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const wa = address || stored?.walletAddress || '';
      const res = await axios.get(`http://localhost:5000/api/contracts?walletAddress=${wa}`);
      const found = res.data.contracts.find(c => c.contractId === id);
      if (found) setContract(found);
      else navigate('/dashboard');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!sellerWallet.trim()) return alert('Please enter the seller wallet address.');
    setSending(true);
    try {
      await axios.post('http://localhost:5000/api/contracts/send', { contractId: id, sellerWallet });
      await fetchContractDetails();
      setSellerWallet('');
    } catch (err) { alert('Failed to send: ' + (err.response?.data?.error || err.message)); }
    finally { setSending(false); }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const shortAddr = (addr) => addr ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : '—';

  if (loading) return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="shimmer h-10 w-64 mb-4 rounded-xl" />
      <div className="grid lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-48 rounded-2xl" />)}
      </div>
    </div>
  );

  if (!contract) return null;

  return (
    <div className="max-w-6xl mx-auto page-enter py-10 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-indigo-500 font-semibold tracking-widest uppercase mb-2">Contract Details</p>
            <h1 className="text-3xl font-bold font-display">{contract.templateType} Agreement</h1>
            <p className="font-mono text-xs mt-2 flex items-center gap-2" style={{ color: 'var(--text-dim)' }}>
              <Hash className="w-3 h-3" />
              {contract.contractId}
              <button onClick={() => copyToClipboard(contract.contractId, 'id')} className="transition-colors" style={{ color: 'var(--text-dim)' }}>
                {copied === 'id' ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </p>
          </div>
          {contract.status === 'Completed'
            ? <span className="badge-completed text-sm px-4 py-2"><CheckCircle className="w-4 h-4" /> Signed &amp; Completed</span>
            : <span className="badge-pending text-sm px-4 py-2"><Clock className="w-4 h-4" /> Pending Signature</span>
          }
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Parties + Form Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parties */}
          <div className="glass p-6">
            <h3 className="font-bold font-display mb-5 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <Link2 className="w-4 h-4 text-indigo-400" /> Parties Involved
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-2">Buyer (Creator)</p>
                <p className="font-mono text-sm break-all" style={{ color: 'var(--text-primary)' }}>{shortAddr(contract.buyerWallet)}</p>
              </div>
              <div className="p-4 rounded-xl" style={{
                background: contract.sellerWallet ? 'rgba(139,92,246,0.06)' : 'var(--bg-glass-sm)',
                border: contract.sellerWallet ? '1px solid rgba(139,92,246,0.2)' : '1px dashed var(--border-glass-sm)'
              }}>
                <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-2">Seller (Signee)</p>
                {contract.sellerWallet
                  ? <p className="font-mono text-sm break-all" style={{ color: 'var(--text-primary)' }}>{shortAddr(contract.sellerWallet)}</p>
                  : <p className="text-sm italic" style={{ color: 'var(--text-dim)' }}>Not assigned yet</p>
                }
              </div>
            </div>
          </div>

          {/* Agreement Details */}
          <div className="glass p-6">
            <h3 className="font-bold font-display mb-5 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <FileText className="w-4 h-4 text-indigo-400" /> Agreement Data
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(contract.formData).map(([key, val]) => (
                <div key={key} className="info-row">
                  <span className="info-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="info-value">{val || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Send contract section */}
          {contract.status === 'Pending' && !contract.sellerWallet && (
            <div className="glass p-6">
              <h3 className="font-bold font-display mb-2 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                <Send className="w-4 h-4 text-indigo-400" /> Send for Signature
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Enter the counterparty's wallet address to request their signature on this agreement.</p>
              <div className="flex gap-3">
                <input className="form-input flex-grow" placeholder="0x... wallet address"
                  value={sellerWallet} onChange={e => setSellerWallet(e.target.value)} />
                <button onClick={handleSend} disabled={sending} className="btn-primary shrink-0">
                  {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4 mr-1" /> Send</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* PDF Download */}
          <div className="glass p-6 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="font-bold font-display mb-1" style={{ color: 'var(--text-heading)' }}>Contract PDF</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>
              {contract.status === 'Completed' ? 'Final signed document with embedded signatures.' : 'Draft document pending signatures.'}
            </p>
            {contract.pdfUrl ? (
              <a href={`http://localhost:5000${contract.pdfUrl}`} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full">
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </a>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Not yet generated</p>
            )}
          </div>

          {/* Hashes */}
          {(contract.hash || contract.finalHash) && (
            <div className="glass p-6">
              <h3 className="font-bold font-display mb-4 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                <Hash className="w-4 h-4 text-indigo-400" /> Document Hashes
              </h3>
              <div className="space-y-3">
                {contract.hash && (
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)' }}>Pre-Sign SHA-256</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs truncate flex-1" style={{ color: 'var(--text-secondary)' }}>{contract.hash.slice(0, 20)}...</p>
                      <button onClick={() => copyToClipboard(contract.hash, 'hash')} style={{ color: 'var(--text-dim)' }}>
                        {copied === 'hash' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
                {contract.finalHash && (
                  <div className="pt-3" style={{ borderTop: '1px solid var(--info-row-border)' }}>
                    <p className="text-xs text-emerald-500 uppercase tracking-widest mb-1">Final Signed SHA-256</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs truncate flex-1" style={{ color: 'var(--text-secondary)' }}>{contract.finalHash.slice(0, 20)}...</p>
                      <button onClick={() => copyToClipboard(contract.finalHash, 'fhash')} style={{ color: 'var(--text-dim)' }}>
                        {copied === 'fhash' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Blockchain Record */}
          {contract.txHash && (
            <div className="p-5 rounded-2xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <p className="text-xs text-emerald-500 uppercase tracking-widest font-semibold mb-2 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> On-Chain Record
              </p>
              <p className="font-mono text-xs break-all mb-3" style={{ color: 'var(--text-secondary)' }}>{contract.txHash}</p>
              <a href={`https://sepolia.etherscan.io/tx/${contract.txHash}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">
                View on Etherscan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;
