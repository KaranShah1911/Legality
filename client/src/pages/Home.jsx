import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Shield, FileText, Lock, CheckCircle, ArrowRight,
  Fingerprint, Database, Zap, Users
} from 'lucide-react';

const FEATURES = [
  { icon: Lock, label: 'Wallet Auth', desc: 'MetaMask-based login — no passwords, no emails, just your wallet.' },
  { icon: FileText, label: 'Smart Templates', desc: 'Property, NDA, and Partnership agreements with auto-PDF generation.' },
  { icon: Fingerprint, label: 'EIP-191 Signatures', desc: 'Cryptographic wallet signatures verified on the backend.' },
  { icon: Database, label: 'On-Chain Proof', desc: 'SHA-256 hashes stored on Sepolia — tamper-proof and permanent.' },
];

const STEPS = [
  { num: '01', label: 'Connect Wallet', desc: 'Authenticate with MetaMask via RainbowKit.' },
  { num: '02', label: 'Create Agreement', desc: 'Choose a template, fill details, pay the platform fee.' },
  { num: '03', label: 'Send & Sign', desc: 'Counterparty signs with their wallet identity.' },
  { num: '04', label: 'Verify Forever', desc: 'Hash stored on-chain. Verify any document anytime.' },
];

const Home = () => {
  return (
    <div className="page-enter">
      {/* === HERO === */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center dot-grid">
        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold tracking-wider" style={{ color: '#818cf8' }}>
              POWERED BY ETHEREUM
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold font-display leading-tight mb-6">
            Contracts that are
            <br />
            <span className="gradient-text">truly immutable.</span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Legality lets you create, sign, and verify legal agreements backed by blockchain.
            No middlemen. No forgery. Just cryptographic truth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <ConnectButton label="Connect Wallet to Start" />
            <Link to="/verify">
              <button className="btn-secondary gap-2">
                <Shield className="w-4 h-4" /> Verify a Document
              </button>
            </Link>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              Sepolia Testnet
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              SHA-256 Hashing
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              EIP-191 Signatures
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              PDF Generation
            </div>
          </div>
        </div>
      </section>

      {/* === FEATURES GRID === */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: '#818cf8' }}>Platform capabilities</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display" style={{ color: 'var(--text-heading)' }}>
            Everything you need for<br /><span className="gradient-text">trustless agreements</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(f => (
            <div key={f.label} className="glass-sm p-6 group hover:border-indigo-500/20 transition-all">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <f.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-bold font-display mb-2" style={{ color: 'var(--text-heading)' }}>{f.label}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: '#818cf8' }}>How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display" style={{ color: 'var(--text-heading)' }}>
            Four steps to <span className="gradient-text">immutable proof</span>
          </h2>
        </div>
        <div className="space-y-8">
          {STEPS.map((step, i) => (
            <div key={step.num} className="timeline-step">
              <div className="timeline-icon">
                <span className="text-sm font-bold" style={{ color: '#818cf8' }}>{step.num}</span>
              </div>
              <div className="pt-1">
                <h3 className="font-bold font-display text-lg mb-1" style={{ color: 'var(--text-heading)' }}>{step.label}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === CTA === */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="glass p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08), transparent 70%)' }} />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4" style={{ color: 'var(--text-heading)' }}>
              Ready to sign your first contract?
            </h2>
            <p className="mb-8 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Connect your wallet, create an agreement, and let the blockchain handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <ConnectButton label="Get Started Now" />
              <Link to="/dashboard">
                <button className="btn-ghost gap-2">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
