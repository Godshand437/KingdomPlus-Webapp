import React, { useState } from 'react';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const KingdomPlusSignupFlow = () => {
  const [step, setStep] = useState(1);
  
  // Wallet Generation State
  const [seedPhrase, setSeedPhrase] = useState([]);
  const [generatedAddress, setGeneratedAddress] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Profile Onboarding State (Matches your exact schema fields)
  const [formData, setFormData] = useState({
    name: '', email: '', username: '', age: '',
    city: '', country: '',
    role_at_church: 'Member',
    denomination_id: '', custom_denomination: '',
    church_id: '', custom_church_name: '', custom_church_address: '',
    isPastorOfNewChurch: false,
    ministry_tags: [], global_interests: []
  });

  // Seeded Denominations for Step 3 Dropdown
  const seedDenominations = [
    { id: 'denom_001', name: 'Catholic' },
    { id: 'denom_007', name: 'Baptist' },
    { id: 'denom_008', name: 'Pentecostal' },
    { id: 'denom_009', name: 'RCCG – Redeemed Christian Church of God' },
    { id: 'denom_010', name: 'Living Faith Church – Winners Chapel' },
    { id: 'denom_014', name: 'Non-denominational' },
    { id: 'other', name: 'My denomination isn’t listed (Other)' }
  ];

  // Mocked Church database query for Step 4
  const mockChurches = [
    { id: 'church_1', name: 'Grace Sanctuary Central', is_verified: true, city: formData.city },
    { id: 'church_2', name: 'Winners Chapel ' + (formData.city || 'Local'), is_verified: false, city: formData.city }
  ];

  // Step 1 Engine: Generate Wallet completely in-app
  const handleGenerateWallet = async () => {
    try {
      const mnemonic = bip39.generateMnemonic();
      const seed = await bip39.mnemonicToSeed(mnemonic);
      const keypair = Keypair.fromSeed(seed.slice(0, 32));
      
      setSeedPhrase(mnemonic.split(' '));
      setGeneratedAddress(keypair.publicKey.toString());
    } catch (err) {
      console.error("Wallet generation failed:", err);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleFinishOnboarding = async () => {
    // Final Payload combining Wallet Data + Relational Profile Data
    const finalPayload = {
      ...formData,
      wallet_address: generatedAddress,
      anchor_source: formData.custom_church_name ? 'user_entered' : 'church_registered'
    };
    
    console.log("Onboarding Complete! Sending payload to backend:", finalPayload);
    alert("Profile saved! 1 KPC Welcome Bonus will be minted to: " + generatedAddress);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>KINGDOMPLUS</h1>
        <p style={styles.subtitle}>Step {step} of 5</p>

        {/* STEP 1: IN-APP WALLET GENERATION */}
        {step === 1 && (
          <div style={styles.stepBlock}>
            <h2>Create Your Private Vault</h2>
            <p style={styles.subtext}>To receive your KingdomPlus Coin (KPC) incentives, we need to securely configure an in-app wallet directly on this device.</p>
            
            {!generatedAddress ? (
              <button onClick={handleGenerateWallet} style={styles.button}>GENERATE SECURE WALLET</button>
            ) : (
              <div>
                <div style={styles.warningBox}>
                  <strong>⚠️ Write down your Recovery Phrase:</strong>
                  <p style={{fontSize: '11px', marginTop: '4px'}}>If you lose these 12 words, you lose access to your KPC earnings completely.</p>
                </div>
                
                <div style={styles.seedGrid}>
                  {seedPhrase.map((word, i) => (
                    <div key={i} style={styles.seedWord}>
                      <span style={{color: '#888'}}>{i+1}</span> {word}
                    </div>
                  ))}
                </div>

                <p style={{fontSize: '11px', color: '#14F195', marginBottom: '15px', wordBreak: 'break-all'}}>
                  <strong>Your Wallet Address:</strong><br/>{generatedAddress}
                </p>

                <button onClick={() => { setIsCopied(true); handleNext(); }} style={styles.button}>
                  I HAVE SECURELY COPIED PHRASE
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: BASIC INFO & LOCATION */}
        {step === 2 && (
          <div style={styles.stepBlock}>
            <h2>Basic Information</h2>
            <input type="text" name="name" placeholder="Full Name" onChange={handleChange} style={styles.input} />
            <input type="text" name="username" placeholder="Choose Username" onChange={handleChange} style={styles.input} />
            <input type="email" name="email" placeholder="Email Address" onChange={handleChange} style={styles.input} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" name="city" placeholder="City" onChange={handleChange} style={{ ...styles.input, flex: 1 }} />
              <input type="text" name="country" placeholder="Country" onChange={handleChange} style={{ ...styles.input, flex: 1 }} />
            </div>
            <div style={styles.btnRow}>
              <button onClick={handleBack} style={styles.ghostBtn}>Back</button>
              <button onClick={handleNext} style={styles.button}>Continue</button>
            </div>
          </div>
        )}

        {/* STEP 3: DENOMINATION MIX */}
        {step === 3 && (
          <div style={styles.stepBlock}>
            <h2>Your Denomination Alignment</h2>
            <select name="denomination_id" onChange={handleChange} style={styles.input}>
              <option value="">-- Select Denomination --</option>
              {seedDenominations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            {formData.denomination_id === 'other' && (
              <div style={styles.anchorBox}>
                <p style={{color: '#cc9b43', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px'}}>Create Denomination Anchor</p>
                <input type="text" name="custom_denomination" placeholder="Type your denomination name" onChange={handleChange} style={styles.input} />
                <span style={{fontSize: '11px', color: '#ff6b6b'}}>⚠️ Will register as 'Not yet verified on KingdomPlus'</span>
              </div>
            )}
            
            <div style={styles.btnRow}>
              <button onClick={handleBack} style={styles.ghostBtn}>Back</button>
              <button onClick={handleNext} style={styles.button}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 4: CHURCH / SANCTUARY ASSIGNMENT */}
        {step === 4 && (
          <div style={styles.stepBlock}>
            <h2>Find Your Local Sanctuary</h2>
            
            <div style={styles.churchList}>
              {mockChurches.map(c => (
                <div key={c.id} style={{...styles.churchItem, border: formData.church_id === c.id ? '1px solid #29beaf' : '1px solid rgba(255,255,255,0.08)'}} onClick={() => setFormData({...formData, church_id: c.id})}>
                  <strong>{c.name}</strong> 
                  {c.is_verified ? <span style={{color: '#14F195'}}>✓ Verified</span> : <span style={{color: '#cc9b43'}}>Anchor Placeholder</span>}
                </div>
              ))}
            </div>

            <div style={styles.anchorBox}>
              <p style={{fontSize: '13px', marginBottom: '8px'}}>Can't find your home sanctuary?</p>
              <input type="text" name="custom_church_name" placeholder="Type your Local Church name to anchor it" onChange={handleChange} style={styles.input} />
              
              {formData.custom_church_name && (
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="checkbox" onChange={(e) => setFormData({...formData, isPastorOfNewChurch: e.target.checked})} />
                    I am the head Pastor / Ministry leader of this church
                  </label>
                </div>
              )}
            </div>

            <div style={styles.btnRow}>
              <button onClick={handleBack} style={styles.ghostBtn}>Back</button>
              <button onClick={handleNext} style={styles.button}>Verify Setup</button>
            </div>
          </div>
        )}

        {/* STEP 5: CONDITIONAL REDIRECT STATUS */}
        {step === 5 && (
          <div style={styles.stepBlock}>
            <h2>Onboarding Review Completed</h2>
            
            {formData.church_id && mockChurches.find(c => c.id === formData.church_id)?.is_verified ? (
              <div style={styles.successBox}>
                <h3>✨ Full Sanctuary Dashboard Ready</h3>
                <p>Linked securely to verified church nodes. You will instantly get updates from your local leadership.</p>
              </div>
            ) : formData.custom_church_name ? (
              <div style={styles.warningBox}>
                <h3>🛡️ Circular Global Feed (Anchor Mode)</h3>
                <p>Your sanctuary placeholder has been set. Once your Pastor runs the KYC/CAC approval loop, your full church vault initializes.</p>
                {formData.isPastorOfNewChurch ? (
                  <p style={{color: '#14F195', marginTop: '10px', fontSize: '12px'}}>✓ You will be directed to the pastoral validation engine next.</p>
                ) : (
                  <p style={{color: '#cc9b43', marginTop: '10px', fontSize: '12px'}}>💡 You'll be given a banner to share with your Pastor to claim this platform.</p>
                )}
              </div>
            ) : (
              <div style={styles.successBox}>
                <h3>🌍 Circular Global Feed</h3>
                <p>You are entering as an independent believer. You can still stream global gospel media and read scripture to claim rewards!</p>
              </div>
            )}

            <div style={styles.btnRow}>
              <button onClick={handleBack} style={styles.ghostBtn}>Back</button>
              <button onClick={handleFinishOnboarding} style={{...styles.button, flex: 1}}>ENTER HUB & MINTS REWARDS</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Inline CSS Engine mappings for structural layout visualization
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#03070c', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', padding: '15px' },
  card: { backgroundColor: '#0a0e17', border: '1px solid #1c232d', borderRadius: '28px', padding: '25px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column' },
  title: { color: '#d4af37', margin: 0, fontSize: '22px', textAlign: 'center', letterSpacing: '1px' },
  subtitle: { color: '#888', fontSize: '11px', textAlign: 'center', marginBottom: '20px', textTransform: 'uppercase' },
  stepBlock: { display: 'flex', flexDirection: 'column', gap: '15px' },
  subtext: { color: '#cecdcd', fontSize: '13px', lineHeight: '1.4', textAlign: 'center', marginBottom: '10px' },
  input: { padding: '14px', borderRadius: '10px', backgroundColor: '#131a24', border: '1px solid #2c3645', color: '#fff', width: '100%', fontSize: '14px', outline: 'none' },
  button: { padding: '16px', borderRadius: '14px', backgroundImage: 'linear-gradient(90deg, #cc9b43 0%, #29beaf 100%)', border: 'none', color: '#0c141d', fontWeight: '800', cursor: 'pointer', fontSize: '15px' },
  ghostBtn: { padding: '16px', borderRadius: '14px', backgroundColor: 'transparent', border: '1px solid #4a5568', color: '#fff', cursor: 'pointer', fontWeight: '600' },
  btnRow: { display: 'flex', gap: '10px', marginTop: '10px' },
  seedGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '15px 0' },
  seedWord: { backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 178, 108, 0.25)', padding: '10px 4px', borderRadius: '8px', textHeigh: 'center', fontSize: '12px', display: 'flex', justifyContent: 'center', gap: '5px' },
  anchorBox: { backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #cc9b43', display: 'flex', flexDirection: 'column', gap: '8px' },
  churchList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  churchItem: { padding: '14px', backgroundColor: '#131a24', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '13px' },
  warningBox: { backgroundColor: 'rgba(255, 107, 107, 0.08)', border: '1px solid rgba(255, 107, 107, 0.3)', padding: '12px', borderRadius: '10px', color: '#ff8585', fontSize: '12px' },
  successBox: { backgroundColor: 'rgba(20, 241, 149, 0.05)', border: '1px solid #14F195', padding: '16px', borderRadius: '12px', fontSize: '13px', lineHeight: '1.4' }
};

export default KingdomPlusSignupFlow;