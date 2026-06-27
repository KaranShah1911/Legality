import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import axios from 'axios';
import { contractAddress, contractAbi } from '../utils/constants';
import { FileText, ChevronDown, AlertCircle, Loader, CreditCard, ShieldCheck, X } from 'lucide-react';

const CREATION_FEE_ETH = '0.1';

const TEMPLATES = [
  {
    id: 'Property',
    label: 'Property Agreement',
    desc: 'Real estate transfers, lease agreements, or property-related contracts.',
    fields: [
      { key: 'buyerName', label: 'Buyer Full Name', placeholder: 'e.g. John Doe', type: 'text' },
      { key: 'sellerName', label: 'Seller Full Name', placeholder: 'e.g. Jane Smith', type: 'text' },
      { key: 'propertyAddress', label: 'Property Address', placeholder: 'e.g. 123 Main Street, Mumbai', type: 'text' },
      { key: 'salePrice', label: 'Sale Price (INR/ETH)', placeholder: 'e.g. ₹80,00,000', type: 'text' },
      { key: 'possessionDate', label: 'Possession Date', placeholder: '', type: 'date' },
      { key: 'additionalTerms', label: 'Additional Terms', placeholder: 'Any special conditions...', type: 'textarea' },
    ],
  },
  {
    id: 'Partnership',
    label: 'Partnership Agreement',
    desc: 'Business partnership terms, profit sharing, and operational responsibilities.',
    fields: [
      { key: 'buyerName', label: 'Partner 1 Name', placeholder: 'e.g. Karan Shah', type: 'text' },
      { key: 'sellerName', label: 'Partner 2 Name', placeholder: 'e.g. Rohan Mehta', type: 'text' },
      { key: 'businessName', label: 'Business Name', placeholder: 'e.g. Legality Ventures', type: 'text' },
      { key: 'profitSharing', label: 'Profit Sharing Ratio', placeholder: 'e.g. 50-50', type: 'text' },
      { key: 'duration', label: 'Partnership Duration', placeholder: 'e.g. 2 Years', type: 'text' },
      { key: 'additionalTerms', label: 'Additional Terms', placeholder: 'Capital contribution details...', type: 'textarea' },
    ],
  },
  {
    id: 'NDA',
    label: 'Non-Disclosure Agreement',
    desc: 'Protect sensitive information shared between parties — startups, employees, or freelancers.',
    fields: [
      { key: 'buyerName', label: 'Disclosing Party', placeholder: 'e.g. Legality Inc.', type: 'text' },
      { key: 'sellerName', label: 'Receiving Party', placeholder: 'e.g. Freelancer Name', type: 'text' },
      { key: 'purpose', label: 'Purpose of Disclosure', placeholder: 'e.g. Software development project', type: 'text' },
      { key: 'duration', label: 'Confidentiality Period', placeholder: 'e.g. 2 Years', type: 'text' },
      { key: 'jurisdiction', label: 'Governing Law / Jurisdiction', placeholder: 'e.g. Republic of India', type: 'text' },
      { key: 'additionalTerms', label: 'Excluded Information', placeholder: 'Any publicly known data...', type: 'textarea' },
    ],
  },
];

const CreateContract = () => {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [isTxPending, setIsTxPending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Security Modal State
  const [showSecurityPrompt, setShowSecurityPrompt] = useState(false);
  const [securityData, setSecurityData] = useState([]);
  const [answers, setAnswers] = useState(['', '']);

  const template = TEMPLATES.find(t => t.id === selectedTemplate);

  useEffect(() => {
    if (template) {
      const defaults = {};
      template.fields.forEach(f => defaults[f.key] = '');
      setFormData(defaults);
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setSecurityData(user.securityQuestions || []);
      }
    }
  }, [selectedTemplate]);

  const handlePreCreate = (e) => {
    e.preventDefault();
    if (!address) return alert('Please connect your wallet first.');
    if (!window.ethereum) return alert('No Ethereum wallet detected.');
    if (securityData.length === 0) return alert('Security questions missing from profile. Please login again.');
    setShowSecurityPrompt(true);
  };

  const executeCreate = async () => {
    if (!answers[0] || !answers[1]) return alert('Please answer both security questions.');
    
    setShowSecurityPrompt(false);
    setIsTxPending(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const tx = await contract.payForContract({ value: ethers.parseEther(CREATION_FEE_ETH) });
      await tx.wait();
      setIsTxPending(false);
      await generateContractOnBackend();
    } catch (err) {
      setIsTxPending(false);
      setAnswers(['', '']);
      alert('Transaction failed: ' + (err.reason || err.message));
    }
  };

  const generateContractOnBackend = async () => {
    setIsGenerating(true);
    try {
      const formattedAnswers = securityData.map((sq, i) => ({ answer: answers[i] }));
      const res = await axios.post('http://localhost:5000/api/contracts/create', {
        buyerWallet: address, 
        templateType: selectedTemplate, 
        formData,
        securityAnswers: formattedAnswers
      });
      navigate(`/contract/${res.data.contract.contractId}`);
    } catch (err) {
      alert('Error creating contract: ' + (err.response?.data?.error || err.message));
    } finally { 
      setIsGenerating(false); 
      setAnswers(['', '']);
    }
  };

  const isBusy = isTxPending || isGenerating;

  return (
    <div className="max-w-6xl mx-auto page-enter py-10 px-4 relative">
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-display">Create New Agreement</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          Select a contract type, fill in the details, and pay the platform fee to generate your blockchain-backed PDF.
        </p>
      </div>

      {/* Template Selection */}
      {!selectedTemplate ? (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: 'var(--text-dim)' }}>Choose a Contract Template</p>
          <div className="grid md:grid-cols-3 gap-5">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)} className="contract-card text-left p-6 group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-bold font-display mb-2" style={{ color: 'var(--text-heading)' }}>{t.label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t.desc}</p>
                <div className="mt-5 text-indigo-500 text-sm font-medium flex items-center gap-1">
                  Use this template <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-indigo-500 font-semibold tracking-widest uppercase mb-1">Contract Type</p>
                <h2 className="text-2xl font-bold font-display">{template.label}</h2>
              </div>
              <button onClick={() => setSelectedTemplate(null)} className="btn-ghost text-sm" style={{ color: 'var(--text-dim)' }}>
                ← Change
              </button>
            </div>

            <form onSubmit={handlePreCreate}>
              <div className="glass p-6 space-y-5">
                {template.fields.map(field => (
                  <div key={field.key}>
                    <label className="form-label">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea rows={4} className="form-input resize-none" placeholder={field.placeholder}
                        value={formData[field.key] || ''}
                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                        required disabled={isBusy} />
                    ) : (
                      <input type={field.type} required className="form-input" placeholder={field.placeholder}
                        value={formData[field.key] || ''}
                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                        disabled={isBusy} />
                    )}
                  </div>
                ))}
              </div>

              <button type="submit" disabled={isBusy}
                className="btn-primary w-full mt-5 py-4 text-base font-bold relative overflow-hidden">
                {isTxPending ? (
                  <span className="flex items-center gap-2"><Loader className="w-5 h-5 animate-spin" />Confirming Blockchain Payment...</span>
                ) : isGenerating ? (
                  <span className="flex items-center gap-2"><Loader className="w-5 h-5 animate-spin" />Generating PDF Contract...</span>
                ) : (
                  <span className="flex items-center gap-2"><CreditCard className="w-5 h-5" />Pay {CREATION_FEE_ETH} ETH &amp; Generate Contract</span>
                )}
              </button>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-5">
            <div className="glass p-6">
              <h3 className="font-bold font-display mb-4" style={{ color: 'var(--text-heading)' }}>Payment Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--info-row-border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Platform Fee</span>
                  <span className="font-bold" style={{ color: 'var(--text-heading)' }}>{CREATION_FEE_ETH} ETH</span>
                </div>
                <div className="flex justify-between py-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Network Gas</span>
                  <span style={{ color: 'var(--text-primary)' }}>~Variable</span>
                </div>
              </div>
              <div className="mt-5 flex items-start gap-2 text-xs"
                style={{ background: 'rgba(99,102,241,0.06)', borderRadius: '0.75rem', padding: '0.75rem', color: 'var(--text-secondary)' }}>
                <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Payment is processed via the LegalityStorage smart contract on the Sepolia testnet. The fee is transferred to the platform admin wallet.</span>
              </div>
            </div>

            <div className="glass p-6">
              <h3 className="font-bold font-display mb-4" style={{ color: 'var(--text-heading)' }}>What happens next?</h3>
              <div className="space-y-4">
                {['Transaction confirmed on Sepolia', 'PDF generated with your data', 'SHA-256 hash computed & saved', 'Send contract to counterparty'].map((s, i) => (
                  <div key={s} className="flex items-start gap-3 text-sm">
                    <div className="step-bubble text-xs mt-0.5">{i + 1}</div>
                    <span style={{ color: 'var(--text-secondary)' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
            
            <form onSubmit={(e) => { e.preventDefault(); executeCreate(); }} className="space-y-4">
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
                <button type="submit" className="btn-primary flex-1">Verify &amp; Pay</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateContract;
