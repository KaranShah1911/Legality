import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAccount, useSignMessage } from 'wagmi';
import { ethers } from 'ethers';
import { contractAddress, contractAbi } from '../utils/constants';
import {
  FileText, Download, CheckCircle, ShieldCheck, Database, Loader,
  ExternalLink, AlertCircle, Lock, Fingerprint, X
} from 'lucide-react';

const SignContract = () => {
  const { id } = useParams();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [signStep, setSignStep] = useState(0);

  // Security Modal State
  const [showSecurityPrompt, setShowSecurityPrompt] = useState(false);
  const [securityData, setSecurityData] = useState([]);
  const [answers, setAnswers] = useState(['', '']);

  useEffect(() => { 
    fetchContractDetails(); 
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setSecurityData(user.securityQuestions || []);
    }
  }, [id]);

  const fetchContractDetails = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const wa = address || stored?.walletAddress || '';
      const res = await axios.get(`http://localhost:5000/api/contracts?walletAddress=${wa}`);
      const found = res.data.contracts.find(c => c.contractId === id);
      if (found) setContract(found);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePreSign = () => {
    if (securityData.length === 0) return alert('Security questions missing from profile. Please login again.');
    setShowSecurityPrompt(true);
  };

  const executeSign = async (e) => {
    e.preventDefault();
    if (!answers[0] || !answers[1]) return alert('Please answer both security questions.');
    
    setShowSecurityPrompt(false);
    setSigning(true);
    setSignStep(1);
    try {
      const message = `I agree to contract ID: ${id} at ${new Date().toISOString()}`;
      const signature = await signMessageAsync({ message });
      const formattedAnswers = securityData.map((sq, i) => ({ answer: answers[i] }));
      
      const res = await axios.post('http://localhost:5000/api/contracts/sign', {
        contractId: id, signature, message, sellerWallet: address, securityAnswers: formattedAnswers
      });
      setContract(res.data.contract);
      setSignStep(2);
    } catch (err) {
      console.error(err);
      setSignStep(0);
      setAnswers(['', '']);
      alert('Signing failed: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    } finally { 
      setSigning(false); 
    }
  };

  const handleStoreBlockchain = async () => {
    if (!contract?.finalHash || !window.ethereum) return;
    setIsWriting(true);
    try {
      const bytes32Hash = contract.finalHash.startsWith('0x') ? contract.finalHash : `0x${contract.finalHash}`;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const sc = new ethers.Contract(contractAddress, contractAbi, signer);
      const tx = await sc.storeHash(bytes32Hash);
      await tx.wait();
      await axios.post('http://localhost:5000/api/contracts/store-hash', { contractId: id, txHash: tx.hash });
      await fetchContractDetails();
    } catch (err) {
      alert('Transaction failed: ' + (err.reason || err.message));
    } finally { setIsWriting(false); }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="shimmer h-10 w-64 mb-6 rounded-xl" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="shimmer h-64 rounded-2xl" />
        <div className="shimmer h-64 rounded-2xl" />
      </div>
    </div>
  );

  if (!contract) return (
    <div className="text-center py-20"><p style={{ color: 'var(--text-secondary)' }}>Contract not found.</p></div>
  );

  const isCompleted = contract.status === 'Completed';

  return (
    <div className="max-w-6xl mx-auto page-enter py-10 px-4">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-indigo-500 font-semibold tracking-widest uppercase mb-2">For Your Signature</p>
        <h1 className="text-3xl font-bold font-display">{contract.templateType} Agreement</h1>
        <p className="font-mono text-xs mt-2" style={{ color: 'var(--text-dim)' }}>#{contract.contractId}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: contract details */}
        <div className="space-y-5">
          <div className="glass p-6">
            <h3 className="font-bold font-display mb-4" style={{ color: 'var(--text-heading)' }}>Parties</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--info-row-border)' }}>
                <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Issuing Party</span>
                <span className="font-mono text-sm text-blue-500">{contract.buyerWallet?.slice(0,8)}...{contract.buyerWallet?.slice(-6)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Signing Party</span>
                <span className="font-mono text-sm text-violet-500">{contract.sellerWallet?.slice(0,8)}...{contract.sellerWallet?.slice(-6)}</span>
              </div>
            </div>
          </div>

          <div className="glass p-6">
            <h3 className="font-bold font-display mb-4 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <FileText className="w-4 h-4 text-indigo-400" /> Agreement Terms
            </h3>
            <div className="space-y-1">
              {Object.entries(contract.formData).map(([key, val]) => (
                <div key={key} className="info-row">
                  <span className="info-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="info-value">{val || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {contract.pdfUrl && (
            <a href={`http://localhost:5000${contract.pdfUrl}`} target="_blank" rel="noopener noreferrer"
              className="glass flex items-center gap-4 p-5 hover:border-indigo-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Download className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>Review Contract PDF</p>
                <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{isCompleted ? 'Final signed document' : 'Draft — review before signing'}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>
          )}
        </div>

        {/* Right: Signing panel */}
        <div className="space-y-5">
          {!isCompleted ? (
            <div className="glass p-6">
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))', border: '1px solid rgba(99,102,241,0.25)' }}>
                  <Fingerprint className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold font-display mb-2" style={{ color: 'var(--text-heading)' }}>Sign with Your Wallet</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  By signing, you cryptographically agree to the terms of this contract.
                  Your EIP-191 signature will be embedded in the final PDF.
                </p>
              </div>

              <div className="p-4 rounded-xl mb-5 flex items-start gap-3 text-sm"
                style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', color: 'var(--text-secondary)' }}>
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p>Once signed, this action cannot be undone. Ensure you have thoroughly reviewed the agreement terms before proceeding.</p>
              </div>

              {signStep === 0 && (
                <button onClick={handlePreSign} disabled={signing}
                  className="btn-primary w-full py-4 text-base font-bold"
                  style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
                  <Lock className="w-5 h-5 mr-2" /> I Agree &amp; Sign Contract
                </button>
              )}
              {signStep === 1 && (
                <div className="flex flex-col items-center py-4 gap-3">
                  <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Awaiting MetaMask signature...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-6 rounded-2xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-bold font-display" style={{ color: 'var(--text-heading)' }}>Contract Signed</h3>
                    <p className="text-emerald-500 text-xs">Signature verified and embedded</p>
                  </div>
                </div>
                {contract.finalHash && (
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)' }}>Final SHA-256</p>
                    <p className="font-mono text-xs break-all p-2 rounded-lg" style={{ color: 'var(--text-secondary)', background: 'var(--bg-glass-sm)' }}>{contract.finalHash}</p>
                  </div>
                )}
              </div>

              {!contract.txHash ? (
                <div className="glass p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <Database className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold font-display" style={{ color: 'var(--text-heading)' }}>Store Hash On-Chain</h3>
                      <p className="text-indigo-500 text-xs">Final step — make it immutable</p>
                    </div>
                  </div>
                  <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Submit the document hash to the <span className="text-indigo-500 font-mono text-xs">LegalityStorage</span> contract on Sepolia.
                    This permanently records proof of this agreement on the blockchain.
                  </p>
                  <button onClick={handleStoreBlockchain} disabled={isWriting}
                    className="btn-primary w-full py-3"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
                    {isWriting ? (
                      <span className="flex items-center gap-2"><Loader className="w-4 h-4 animate-spin" />Processing...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Database className="w-4 h-4" />Store on Sepolia Blockchain</span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <p className="text-xs text-indigo-500 font-semibold uppercase tracking-widest mb-2">Secured On-Chain ✓</p>
                  <p className="font-mono text-xs break-all mb-3" style={{ color: 'var(--text-secondary)' }}>{contract.txHash}</p>
                  <a href={`https://sepolia.etherscan.io/tx/${contract.txHash}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-indigo-500 hover:text-indigo-400 flex items-center gap-1 transition-colors">
                    View on Etherscan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="flex items-start gap-3 p-4 rounded-xl text-xs"
            style={{ background: 'var(--bg-glass-sm)', border: '1px solid var(--border-glass-sm)', color: 'var(--text-dim)' }}>
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-dim)' }} />
            <p>Your wallet signature is verified using EIP-191 standard. Legality never has access to your private keys.</p>
          </div>
        </div>
      </div>

      {/* Security Prompt Modal */}
      {showSecurityPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm page-enter">
          <div className="glass-panel w-full max-w-md p-6 relative">
            <button onClick={() => setShowSecurityPrompt(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-display" style={{ color: 'var(--text-heading)' }}>Security Check</h3>
            </div>
            
            <form onSubmit={executeSign} className="space-y-4">
              {securityData.map((sq, i) => (
                <div key={i}>
                  <label className="form-label mb-2 block">{sq.question}</label>
                  <input required type="password" className="form-input" placeholder="Enter your answer"
                    value={answers[i]} onChange={e => {
                      const newAns = [...answers];
                      newAns[i] = e.target.value;
                      setAnswers(newAns);
                    }} />
                </div>
              ))}
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowSecurityPrompt(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Verify &amp; Sign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignContract;
