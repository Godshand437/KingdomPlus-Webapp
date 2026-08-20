import React, { useState, useEffect, useRef } from 'react';
import { Connection, Keypair, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import './App.css';
import { supabase } from './supabaseClient';
import { Buffer } from 'buffer';
import { Scanner } from '@yudiel/react-qr-scanner';

if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

// Icons
const BackArrowIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);
const CopyIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>);
const WalletIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#29beaf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>);
const BellIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>);
const SearchIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const PlusIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const PlayIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>);
const HeartIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>);
const MessageIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>);
const HomeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>);
const WalletIcon2 = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="25" height="25" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>);
const VolumeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>);
const GlobeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>);
const ProfileIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const MoonIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>);
const BookOpenIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>);
const ImageIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#59d2c9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>);
const ShareIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
const DotsIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>);
const SendIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
const XIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const HandCoinIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>);
const BriefcaseIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>);
const CrownIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="2 4 5 15 12 11 19 15 22 4 17 8 12 2 7 8 2 4"></polygon><polyline points="2 20 22 20"></polyline></svg>);
const SwapIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>);
const CalendarIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const ChurchIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 12h3v8h14v-8h3L12 2z"></path><path d="M12 12v8"></path><path d="M10 16h4"></path></svg>);
const ShieldIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>);
const SparklesIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"></path><path d="M3 12h18"></path><path d="M15.5 8.5l-7 7"></path><path d="M8.5 8.5l7 7"></path></svg>);
const CrownOutlineIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="2 4 5 15 12 11 19 15 22 4 17 8 12 2 7 8 2 4"></polygon><polyline points="2 20 22 20"></polyline></svg>);
const CheckIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);
const LightningIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>);
const LeafIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2"><path d="M11 20A7 7 0 0 1 4 13V6a7 7 0 0 1 14 0v7a7 7 0 0 1-7 7z"></path></svg>);
const DoveIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4facfe" strokeWidth="2"><path d="M22 12c-2.66 0-5.33-1-7.5-3-2.17 2-4.84 3-7.5 3-4.42 0-8-3.58-8-8 0 4.42 3.58 8 8 8 2.66 0 5.33 1 7.5 3 2.17-2 4.84-3 7.5-3 4.42 0 8-3.58 8-8 0 4.42-3.58 8-8 8z"></path></svg>);
const SwordsIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2"><line x1="14" y1="4" x2="20" y2="10"></line><line x1="4" y1="20" x2="10" y2="14"></line><line x1="20" y1="20" x2="4" y2="4"></line><line x1="4" y1="10" x2="10" y2="4"></line></svg>);
const CloudIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>);
const RainbowIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f39c12" strokeWidth="2"><path d="M22 17a10 10 0 0 0-20 0"></path><path d="M18 17a6 6 0 0 0-12 0"></path><path d="M14 17a2 2 0 0 0-4 0"></path></svg>);
const LockIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>);
const EyeIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const LinkIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>);
const GoogleIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>);
const MailIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);
const LoginIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>);
const PaperPlaneIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
const ScanIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>);
const UploadIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>);
const MusicIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>);
const VideoIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>);
const MovieIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>);
const PlaySolidIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>);
const PlayOutlineIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>);
const HeartOutlineIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>);
const HeadphonesIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>);
const VerifiedIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="#f3ca58"><path d="M12 2L15 4L18.5 3.5L19.5 7L22 9L20.5 12L22 15L19.5 17L18.5 20.5L15 20L12 22L9 20L5.5 20.5L4.5 17L2 15L3.5 12L2 9L4.5 7L5.5 3.5L9 4L12 2ZM10.5 16L16.5 10L15 8.5L10.5 13L8 10.5L6.5 12L10.5 16Z" fill="#f3ca58" /></svg>);
const InfoIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const FlameIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f3ca58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>);
const TrendingIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f3ca58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>);
const PlaceholderDots = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>);
const ChevronRightIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);
const ChatIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>);
const EditIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const PhoneIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f3ca58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>);
const CakeIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f3ca58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"></path><path d="M2 21h20"></path><path d="M7 8v2"></path><path d="M12 8v2"></path><path d="M17 8v2"></path><path d="M7 4h.01"></path><path d="M12 4h.01"></path><path d="M17 4h.01"></path></svg>);
const SettingsIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f3ca58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const LogOutIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const PauseSolidIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>);
const SkipForwardIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"></line></svg>);
const SkipBackIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"></line></svg>);
const MaximizeIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>);
const HeartSolidIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>);
const ChevronDownIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>);
const ShuffleIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>);
const RepeatIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>);
const Rewind10Icon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline><text x="12" y="16" fontSize="7" fill="currentColor" fontWeight="bold">10</text></svg>);
const Forward10Icon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><polyline points="21 3 21 8 16 8"></polyline><text x="12" y="16" fontSize="7" fill="currentColor" fontWeight="bold">10</text></svg>);
const GLOBAL_KPC_MINT = "5mqDNPaKW4V8CSMfvkzeq6GovocRMAg27Rt88iJRnZrg";
const GLOBAL_TREASURY_KEY = new Uint8Array([215, 106, 173, 66, 60, 177, 52, 149, 191, 107, 83, 107, 44, 124, 19, 138, 165, 112, 87, 171, 133, 116, 75, 94, 86, 26, 157, 186, 91, 227, 57, 48, 47, 12, 117, 137, 66, 247, 1, 233, 208, 12, 28, 114, 93, 144, 18, 61, 32, 47, 234, 202, 62, 52, 68, 15, 34, 17, 2, 113, 27, 231, 232, 135]);
  const StudioBookIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f3ca58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  );

  const StudioMicIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#29beaf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  );

  const StudioDevotionIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  );

  const StudioPlanIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      <path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path>
      <path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path>
    </svg>
  );

  const StudioVideoIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#29beaf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"></polygon>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>
  );

  const StudioLiveIcon = ({ isLive }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isLive ? "#fff" : "#e74c3c"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
      <circle cx="12" cy="12" r="2" fill={isLive ? "#fff" : "#e74c3c"}></circle>
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
      <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"></path>
    </svg>
  );

  const EditPencilSvg = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#101926" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
  );

  const CameraSvg = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  );

  const RosterUsersIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );

  const TimelineFeedIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );

  const VisionTargetIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
  );

  const CheckInSuccessIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const TimelineLikeIcon = ({ isLiked }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? "#ff4757" : "none"} stroke={isLiked ? "#ff4757" : "#8e9aab"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );

  const TimelineCommentIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e9aab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );

  const TimelineTipIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f3ca58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
      <path d="M12 18V6"></path>
    </svg>
  );

  const TimelineShareIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e9aab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  );

  const PinTopIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#29beaf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22"></line>
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
    </svg>
  );

  const XVerifiedBadge = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '4px' }}>
      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.66-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.66 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.66 2.19-1.91 2.19-3.34z" fill="#f3ca58"/>
      <path d="M9.75 15.25l-3.5-3.5 1.5-1.5 2 2 5-5 1.5 1.5-6.5 6.5z" fill="#101926"/>
    </svg>
  );

  const CampaignRocketIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#29beaf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
    </svg>
  );

  const CampaignCoinIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f3ca58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
      <path d="M12 18V6"></path>
    </svg>
  );

  const ShieldCheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <polyline points="9 12 11 14 15 10"></polyline>
    </svg>
  );

  const ChatDoubleCheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#29beaf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 6 7 17 2 12"></polyline>
      <polyline points="22 10 11 21 7 17"></polyline>
    </svg>
  );

  const ChatGroupIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );

  const VideoCallIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
  );

  const VoiceCallIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
  );

  const ThreeDotsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
  );

  const AttachIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
  );

  const CameraIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
  );

  const MicIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
  );
  const EmojiIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
  );

  const NewChatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#09101a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      <line x1="12" y1="9" x2="12" y2="15"></line>
      <line x1="9" y1="12" x2="15" y2="12"></line>
    </svg>
  );

  const CounselIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  );
  
  const AltarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
  );

  const PrayingHandsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M10 4a2 2 0 0 0-2 2v0a2 2 0 0 0-2 2v0"></path><path d="M6 6a2 2 0 0 0-2 2v0a2 2 0 0 0-2 2v0"></path><path d="M12 22l-6-6"></path><path d="M18 22l6-6"></path></svg>
  );
  
  const FilterAudioIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5v14M22 10v4M7 5v14M2 10v4"></path></svg>
  );

  const XPlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  );

  const SettingsGearIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  );

const VerifiedChurchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#f3ca58" stroke="#09101a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
  );

const IconMapPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconChurch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2-4h14l2 4"></path><path d="M5 21V10.85"></path><path d="M19 21V10.85"></path><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path></svg>;
const IconFlame = () => <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>;
const IconHeadphones = () => <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="grey" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>;
const IconBook = () => <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="grey" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const IconMail = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const IconPhone = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const IconCalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconGlobe = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;



export default function App() {
  const [step, setStep] = useState(() => {
  const saved = localStorage.getItem('kp_current_user');
  return saved ? 6 : 0;
  });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [activeTab, setActiveTab] = useState('sanctuary');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [feedTab, setFeedTab] = useState('For You');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('kp_current_user');
    return saved ? JSON.parse(saved) : null;
  });

useEffect(() => {
  if (!currentUser) return;

  setFormData(prev => ({
    ...prev,

    fullName:
      currentUser.full_name ||
      prev.fullName ||
      '',

    username:
      currentUser.username ||
      prev.username ||
      '',

    email:
      currentUser.email ||
      prev.email ||
      '',

    accountType:
      currentUser.account_type ||
      currentUser.accountType ||
      prev.accountType ||
      'User',

    membership_tier:
      currentUser.membership_tier ||
      prev.membership_tier ||
      (
        currentUser.account_type === 'Ministry'
          ? 'Disciple'
          : 'Standard'
      ),

    denomination:
      currentUser.denomination ||
      prev.denomination ||
      '',

    churchName:
      currentUser.church_name ||
      currentUser.local_church ||
      prev.churchName ||
      ''
  }));
}, [currentUser]);

useEffect(() => {
  let mounted = true;

  const restoreSupabaseSession = async () => {
    try {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (error) {
        console.error(
          'Failed to restore Supabase session:',
          error
        );
      }

      if (!mounted) return;

      if (session?.user) {
        setAuthReady(true);
        return;
      }

      setCurrentUser(null);
      localStorage.removeItem('kp_current_user');

      setStep(0);
      setAuthReady(true);

    } catch (error) {
      console.error(
        'Supabase session restoration failed:',
        error
      );

      if (mounted) {
        setAuthReady(true);
      }
    }
  };

  restoreSupabaseSession();

  const {
    data: authListener
  } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setAuthReady(true);
      } else {
        setAuthReady(true);
      }
    }
  );

  return () => {
    mounted = false;

    authListener?.subscription?.unsubscribe();
  };
}, []);

 const [adminTab, setAdminTab] = useState('Dreams');
 const [viewerLiked, setViewerLiked] = useState(false); 
 const [showCommentInput, setShowCommentInput] = useState(false);
 const [viewerComment, setViewerComment] = useState("");
 const [showTestimonyChoice, setShowTestimonyChoice] = useState(false);

  const [generatedAddress, setGeneratedAddress] = useState(() => {
    const saved = localStorage.getItem('kp_current_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.wallet_address || parsed.generatedAddress || '';
    }
    return '';
  });

  const [walletKeypair, setWalletKeypair] = useState(null);
  const [kpcBalance, setKpcBalance] = useState(0);
  const [balanceLoaded, setBalanceLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isAirdropping, setIsAirdropping] = useState(false);


// Status/Testimony Viewer State
  const fileInputRef = useRef(null);
  const [activeViewStatus, setActiveViewStatus] = useState(null);
  const [statusProgress, setStatusProgress] = useState(0);
  const [isUploadingStatus, setIsUploadingStatus] = useState(false);
  
  const [isStatusPaused, setIsStatusPaused] = useState(false);
  const statusVideoRef = useRef(null);

  const [viewedStatuses, setViewedStatuses] = useState(() => {
    const saved = localStorage.getItem('kp_viewed_statuses');
    return saved ? JSON.parse(saved) : [];
  });

  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [newStatusComment, setNewStatusComment] = useState("");
  const [statusComments, setStatusComments] = useState({
    'welcome-001': [
      { id: 1, author: '@Godshand', text: 'Well it was a wonderful idea!!! 😂😂😂', time: '10 min ago', likes: 0, avatar: 'G' }
    ]
  });
  
  const welcomeVideoStatus = {
    id: 'welcome-001',
    user_id: 'Godshand',
    authorName: '@Godshand',
    avatar: '/assets/logo.png',
    media_src: '/media/Welcome-Video.mp4',
    media_type: 'video',
    views: 0,
    likes: 0,
    isPermanent: true
  };

const handleMarkAllRead = () => {
  setNotifications(prev => {
    const updated = prev.map(notification => ({
      ...notification,
      isRead: true
    }));

    const currentUserId =
      currentUser?.id || 'guest';

    localStorage.setItem(
      `kp_notifs_${currentUserId}`,
      JSON.stringify(updated)
    );

    return updated;
  });
};

// Notification State
  // Notification State
const [isNotifOpen, setIsNotifOpen] = useState(false);
const [notifications, setNotifications] = useState([]);
useEffect(() => {
  if (!currentUser?.id) {
    setNotifications([]);
    return;
  }

  const storageKey = `kp_notifs_${currentUser.id}`;
  const saved = localStorage.getItem(storageKey);

  if (saved) {
    try {
      setNotifications(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load notifications:', error);

      setNotifications([]);
    }
  } else {
    const welcomeNotification = {
      id: `welcome-${currentUser.id}`,
      type: 'SYSTEM',
      title: 'Welcome to KingdomPlus',
      message: 'Your Kingdom Vault is ready. Start exploring! and dont forget to drop Feedback / Suggestion',
      time: 'Just now',
      isRead: false
    };

    setNotifications([welcomeNotification]);

    localStorage.setItem(
      storageKey,
      JSON.stringify([welcomeNotification])
    );
  }
}, [currentUser?.id]);


  const getNotifIcon = (type) => {
    switch(type) {
      case 'EARN': return <div style={{ color: '#2ecc71' }}><HandCoinIcon /></div>;
      case 'TRANSFER': return <div style={{ color: '#f3ca58' }}><WalletIcon /></div>;
      case 'SOCIAL': return <div style={{ color: '#29beaf' }}><MessageIcon /></div>;
      case 'SYSTEM': return <div style={{ color: '#4facfe' }}><InfoIcon /></div>;
      default: return <div style={{ color: '#8e9aab' }}><BellIcon /></div>;
    }
  };

const unreadCount = notifications.filter(notif => !notif.isRead).length;

const [showTextStatusModal, setShowTextStatusModal] = useState(false);
const [textStatusContent, setTextStatusContent] = useState("");
const [textStatusBg, setTextStatusBg] = useState("#4facfe");
const [activeNewsArticle, setActiveNewsArticle] = useState(null);
const [showNewsComments, setShowNewsComments] = useState(false);
const [newCommentText, setNewCommentText] = useState("");
const handleLikeStatus = async () => {
  if (!activeViewStatus) return;
  
  const updatedStatus = { ...activeViewStatus, likes: (activeViewStatus.likes || 0) + 1 };
  setActiveViewStatus(updatedStatus);

  setTestimonies(prev => prev.map(t => t.id === activeViewStatus.id ? { ...t, likes: updatedStatus.likes } : t));

  const { error } = await supabase
    .from('testimonies')
    .update({ likes: updatedStatus.likes })
    .eq('id', activeViewStatus.id);

  if (error) console.error("Error liking status:", error);
localStorage.setItem('kp_posts', JSON.stringify(updatedStatus));
};

const handleLikeComment = async (commentId) => {
  setRealComments(prevComments => 
    prevComments.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: (comment.likes || 0) + 1 } 
        : comment
    )
  );

  const commentToUpdate = realComments.find(c => c.id === commentId);
  if (!commentToUpdate) return;

  const { error } = await supabase
    .from('news_comments')
    .update({ likes: (commentToUpdate.likes || 0) + 1 })
    .eq('id', commentId);

  if (error) {
    console.error("Error liking comment:", error);
  }
};

const handleLikeNews = async () => {
  if (!activeNewsArticle) return;
  
  const updatedArticle = { ...activeNewsArticle, likes: (activeNewsArticle.likes || 0) + 1 };
  setActiveNewsArticle(updatedArticle);
  setNewsArticles(prev => prev.map(n => n.id === updatedArticle.id ? updatedArticle : n));

  await supabase
    .from('news_articles')
    .update({ likes: updatedArticle.likes })
    .eq('id', updatedArticle.id);
};

const handleShareNews = () => {
  if (!activeNewsArticle) return;
  navigator.clipboard.writeText(`https://kingdomplus.app/news/${activeNewsArticle.id}`);
  alert("Article link copied to clipboard!");
};

// --- SYNC WELCOME STATUS TO REGISTERED ACCOUNT ---
  useEffect(() => {
    if (currentUser) {
      setTestimonies(prevTestimonies => 
        prevTestimonies.map(status => {
          if (status.id === 'welcome-001') {
            return {
              ...status,
              user_id: currentUser.id,
              authorName: `@${currentUser.formData?.username || currentUser.username || 'believer'}`,
              avatar: currentUser.formData?.avatar || currentUser.image || status.avatar
            };
          }
          return status;
        })
      );
    }
  }, [currentUser]);

  const [testimonies, setTestimonies] = useState([welcomeVideoStatus]);

  const groupedTestimonies = Object.values(
    testimonies.reduce((acc, status) => {
      const uid = status.user_id || status.id;
      if (!acc[uid]) {
        acc[uid] = {
          userId: uid,
          authorName: status.author_name || status.authorName,
          avatar: status.avatar_url || status.avatar,
          allViewed: false,
          statuses: []
        };
      }
      acc[uid].statuses.push(status);
      return acc;
    }, {})
  );

const toggleCommentLike = (commentId) => {
    setStatusComments(prev => {
      const currentComments = prev[activeViewStatus.id] || [];
      const updatedComments = currentComments.map(c => {
        if (c.id === commentId) {
          return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
        }
        return c;
      });
      return { ...prev, [activeViewStatus.id]: updatedComments };
    });
  };

const handleTapTransaction = async (status) => {
    const tapAmount = 5;

    if (kpcBalance < tapAmount) {
      alert(`Insufficient funds. You need ${tapAmount} KPC to tap into this testimony.`);
      return;
    }

    if (status.user_id === currentUser?.id) {
      alert("You cannot tap into your own testimony!");
      return;
    }

    setKpcBalance(prev => prev - tapAmount);
    logTransaction(`Tapped into ${status.author_name || status.authorName}'s testimony`, -tapAmount, 'SPEND');

    try {

      if (status.user_id) {
        let { data: recipientProfile } = await supabase
          .from('user_profiles')
          .select('id, wallet_balance')
          .eq('id', status.user_id)
          .single();

        if (recipientProfile) {
          await supabase
            .from('user_profiles')
            .update({ wallet_balance: Number(recipientProfile.wallet_balance || 0) + tapAmount })
            .eq('id', status.user_id);
        } else {

          let { data: churchProfile } = await supabase
            .from('church_profiles')
            .select('id, wallet_balance')
            .eq('id', status.user_id)
            .single();
            
          if (churchProfile) {
            await supabase
              .from('church_profiles')
              .update({ wallet_balance: Number(churchProfile.wallet_balance || 0) + tapAmount })
              .eq('id', status.user_id);
          }
        }
      }
      
      if (status.id !== 'welcome-001') {
        await supabase
          .from('testimonies')
          .update({ taps: (status.taps || 0) + 1 })
          .eq('id', status.id);
      }

      alert("Hallelujah! You've successfully tapped into this testimony.");
    } catch (err) {
      console.error("Tap transaction failed in DB", err);
    }
  };

useEffect(() => {
    if (step === 6) setActiveTab('sanctuary');
    else if (step === 10) setActiveTab('kingdom');
    else if (step >= 11 && step <= 16) setActiveTab('treasury');
    else if (step === 17) setActiveTab('media');
    else if (step === 18) setActiveTab('profile');
    else if (step === 23) setActiveTab('chat');
  }, [step]);

  useEffect(() => {
    const fetchTestimonies = async () => {
      if (step !== 6) return;
      
      const { data, error } = await supabase
        .from('testimonies')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTestimonies([welcomeVideoStatus, ...data]);
      }
    };

    fetchTestimonies();
  }, [step]);
  const [kingdomTab, setKingdomTab] = useState('Devotions');
  const [kingdomSubTab, setKingdomSubTab] = useState('Global');

const uploadNewTestimony = async (e) => {
  const file = e.target.files[0];
  if (!file || !currentUser) return;
  
  setIsUploadingStatus(true); 
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('status_media')
      .upload(fileName, file);
      
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('status_media')
      .getPublicUrl(fileName);
      
    const isVideo = file.type.startsWith('video/');

    const newStatus = {
      user_id: currentUser.id,
      author_name: currentUser.full_name || currentUser.church_name || 'You',
      avatar_url: currentUser.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      media_url: publicUrlData.publicUrl,
      media_type: isVideo ? 'video' : 'image',
      text_content: '',
    };

    const { data: insertedData, error: insertError } = await supabase
      .from('testimonies')
      .insert([newStatus])
      .select()
      .single();

    if (insertError) throw insertError;

    alert("Testimony uploaded successfully!");
    
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Failed to post testimony.");
  } finally {
    setIsUploadingStatus(false);
  }
};
     

// Auto-advance/close logic for the status viewer
  useEffect(() => {
    let timer;
    if (activeViewStatus) {
      setStatusProgress(0);
      
      if (activeViewStatus.media_type !== 'video') {
        const duration = 10000;
        const interval = 50; 
        
        timer = setInterval(() => {
          setStatusProgress(prev => {
            if (prev >= 100) {
              clearInterval(timer);
              setActiveViewStatus(null);
              return 100;
            }
            return prev + (interval / duration) * 100;
          });
        }, interval);
      }
    }
    return () => clearInterval(timer);
  }, [activeViewStatus]);

  const handleVideoProgress = (e) => {
    const percent = (e.target.currentTime / e.target.duration) * 100;
    setStatusProgress(percent);
  };


  // Send / Swap State
  const [sendSwapTab, setSendSwapTab] = useState('Send');
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendMemo, setSendMemo] = useState('');
  const [swapFromToken, setSwapFromToken] =
  useState('KPC');

  const [swapToToken, setSwapToToken] =
  useState('USDC');

  const [swapAmount, setSwapAmount] =
  useState('');

  const [demoUsdcBalance, setDemoUsdcBalance] =
  useState(() => {
    const saved =
      localStorage.getItem(
        'kp_demo_usdc_balance'
      );

    return saved
      ? Number(saved)
      : 0;
  });

const [isSwapping, setIsSwapping] =
  useState(false);

const handleDemoSwap = async () => {
  const amount =
    Number(swapAmount);

  if (!amount || amount <= 0) {
    alert(
      'Enter a valid amount to swap.'
    );
    return;
  }

  if (
    swapFromToken ===
    swapToToken
  ) {
    alert(
      'Choose two different tokens.'
    );
    return;
  }

  const KPC_TO_USDC = 0.25;

  let receivedAmount = 0;

  if (
    swapFromToken === 'KPC' &&
    swapToToken === 'USDC'
  ) {
    if (
      Number(kpcBalance) <
      amount
    ) {
      alert(
        'Insufficient KPC balance.'
      );
      return;
    }

    receivedAmount =
      amount * KPC_TO_USDC;

  } else if (
    swapFromToken === 'USDC' &&
    swapToToken === 'KPC'
  ) {
    if (
      Number(demoUsdcBalance) <
      amount
    ) {
      alert(
        'Insufficient Demo USDC balance.'
      );
      return;
    }

    receivedAmount =
      amount / KPC_TO_USDC;

  } else {
    alert(
      'Unsupported prototype swap.'
    );
    return;
  }

  setIsSwapping(true);

  try {
    await new Promise(resolve =>
      setTimeout(resolve, 1200)
    );

    let newKpcBalance =
      Number(kpcBalance);

    let newUsdcBalance =
      Number(demoUsdcBalance);

    if (
      swapFromToken === 'KPC'
    ) {
      newKpcBalance -= amount;
      newUsdcBalance += receivedAmount;
    } else {
      newUsdcBalance -= amount;
      newKpcBalance += receivedAmount;
    }

    if (userProfile?.id) {
      const {
        error
      } = await supabase
        .from('user_profiles')
        .update({
          wallet_balance:
            newKpcBalance
        })
        .eq(
          'id',
          userProfile.id
        );

      if (error) {
        throw error;
      }
    }

    setKpcBalance(
      newKpcBalance
    );

    setDemoUsdcBalance(
      newUsdcBalance
    );

    localStorage.setItem(
      'kp_demo_usdc_balance',
      String(newUsdcBalance)
    );

    const savedUser =
      localStorage.getItem(
        'kp_current_user'
      );

    if (savedUser) {
      const parsed =
        JSON.parse(savedUser);

      localStorage.setItem(
        'kp_current_user',
        JSON.stringify({
          ...parsed,
          wallet_balance:
            newKpcBalance,
          kpcBalance:
            newKpcBalance
        })
      );
    }

    logTransaction(
      `Demo Swap: ${amount} ${swapFromToken} → ${receivedAmount.toFixed(2)} ${swapToToken}`,
      swapFromToken === 'KPC'
        ? -amount
        : receivedAmount,
      swapFromToken === 'KPC'
        ? 'SPEND'
        : 'EARN'
    );

    alert(
      `🔄 Swap completed!\n\n${amount} ${swapFromToken} → ${receivedAmount.toFixed(2)} ${swapToToken}\n\nPrototype rate: 1 KPC = $0.25`
    );

    setSwapAmount('');

  } catch (error) {
    console.error(
      'Demo swap failed:',
      error
    );

    alert(
      `Swap failed: ${
        error?.message ||
        'Please try again.'
      }`
    );

  } finally {
    setIsSwapping(false);
  }
};

  // Media Hub State
  const [mediaTab, setMediaTab] = useState('Music'); 
  const [videoSubTab, setVideoSubTab] = useState('All');

  // Social Feed Posts
  const [posts, setPosts] = useState([
    { id: 1, authorName: 'Sarah_f', authorHandle: '@sarah', time: '2h ago', avatar: 'https://images.unsplash.com/photo-1506804886640-ed09fb0317e0?auto=format&fit=crop&w=100&h=100', content: 'Feeling incredibly blessed today! Just finished reading Psalm 23 and it really spoke to my current situation. God is truly our shepherd. 🙏✨', image: null, likes: 0, comments: 0, isVerified: false },
    { id: 2, authorName: 'Pastor David', authorHandle: '@pdavid', time: '5h ago', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=100&h=100', content: 'Such a powerful time of worship at Grace Sanctuary this morning. The presence of God was so heavy in the room. Who else was blessed?', image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=400&q=80', likes: 0, comments: 0, isVerified: true }
  ]);

  

  const [activeRoom, setActiveRoom] = useState(null);
  const [roomTitleInput, setRoomTitleInput] = useState('');
  const [roomDetailInput, setRoomDetailInput] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', password: '', dob: '', country: '', phone: '', denomination: '', customDenomination: '', churchName: '', isCustomChurch: false
  });
const [availableChurches, setAvailableChurches] = useState([]);
const [isLoadingChurches, setIsLoadingChurches] = useState(false);

// --- LIVE ANNOUNCEMENT BROADCAST STATE ---
  const [announcements, setAnnouncements] = useState([
    { badge: "ANNOUNCEMENT", title: "Midweek Bible Study — Wed 7 PM", desc: "Pastor will be teaching from the book of Romans this week.", author: "Grace Sanctuary", handle: "@grace" },
    { badge: "EVENT", title: "Youth Praise Night — Friday", desc: "Join us for an evening of acoustic worship and fellowship.", author: "Youth Ministry", handle: "@youth" },
    { badge: "UPDATE", title: "Building Fund Milestone", desc: "We have reached 80% of our goal! Thank you for your KPC donations.", author: "Treasury Dept", handle: "@finance" }
  ]);

  const [announceTitleInput, setAnnounceTitleInput] = useState('');
  const [announceDescInput, setAnnounceDescInput] = useState('');
  const [announceBadgeInput, setAnnounceBadgeInput] = useState('ANNOUNCEMENT');

  const handleBroadcastAnnouncement = (e) => {
    e.preventDefault();
    if (!announceTitleInput.trim() || !announceDescInput.trim()) {
      alert("Please provide both a title and details for your broadcast.");
      return;
    }

    const newSlide = {
      badge: announceBadgeInput,
      title: announceTitleInput,
      desc: announceDescInput,
      author: formData.churchName || formData.fullName || "Ministry Admin",
      handle: `@${formData.username || 'church'}`
    };

    setAnnouncements(prev => [newSlide, ...prev]);
    setCurrentSlide(0);
    setAnnounceTitleInput('');
    setAnnounceDescInput('');
    setActiveModal(null);
    alert("Your announcement is now live on your members dashboard slides.");
  };


  const handleNextSlide = () => setCurrentSlide((prev) => (prev + 1) % announcements.length);
  const handlePrevSlide = () => setCurrentSlide((prev) => (prev - 1 + announcements.length) % announcements.length);
  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
  if (name === 'denomination') {
    setFormData(prev => ({
      ...prev,
      denomination: value,
      churchName: '',
      isCustomChurch: false
    }));

    if (value && value !== 'Other') {
      loadChurchesByDenomination(value);
    } else {
      setAvailableChurches([]);
    }
  }
};
  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  const loadChurchesByDenomination = async (denomination) => {
  if (!denomination) {
    setAvailableChurches([]);
    return;
  }

  setIsLoadingChurches(true);

  try {
    const { data, error } = await supabase
      .from('church_profiles')
      .select('id, church_name, denomination')
      .eq('denomination', denomination)
      .order('church_name', { ascending: true });

    if (error) {
      console.error('Failed to load churches:', error);
      setAvailableChurches([]);
      return;
    }

    setAvailableChurches(data || []);

  } catch (error) {
    console.error('Church loading error:', error);
    setAvailableChurches([]);
  } finally {
    setIsLoadingChurches(false);
  }
};
 
 // --- STEP 1 VALIDATION ---
const handleStep1Validation = (e) => {
  e.preventDefault();

  if (formData.accountType === 'Ministry') {
    setStep(19);
    return;
  }

  if (
    !formData.fullName ||
    !formData.username ||
    !formData.email ||
    !formData.password
  ) {
    alert(
      "Please fill in all required fields (Full Name, Username, Email, and Password)."
    );
    return;
  }

  setStep(2);
};


  // Status/Testimony Upload Handler
  const handleStatusUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      const newStatus = {
        id: `status-${Date.now()}`,
        user_id: currentUser?.id || `temp-${Date.now()}`,
        authorName: formData.fullName ? `@${formData.username || formData.fullName.split(' ')[0]}` : '@You',
        avatar: currentUser?.formData?.avatar || currentUser?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        media_src: fileUrl,
        media_type: isVideo ? 'video' : 'image',
        bg_color: '#0f0f0f',
        views: 0,
        likes: 0
      };
      setTestimonies([newStatus, ...testimonies]);
    }
  };


  const openPrayerRoom = (room) => { setActiveRoom(room); setStep(9); };

  const fetchPrayerStats = async () => {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('room_id');

    if (data) {
      const counts = { Breakthrough: 0, Family: 0, Healing: 0, Nations: 0, Provision: 0, Salvation: 0, Love: 0, Peace: 0, Anxiety: 0, Depression: 0, };
      data.forEach(req => {
        if (counts[req.room_id] !== undefined) {
          counts[req.room_id]++;
        }
      });

      setPrayerRooms([
        { id: 'Breakthrough', reqs: counts.Breakthrough },
        { id: 'Family', reqs: counts.Family },
        { id: 'Healing', reqs: counts.Healing },
        { id: 'Nations', reqs: counts.Nations }
      ]);
    }
  };


// Prayer Room Base Metadata & State
  const PRAYER_ROOMS_META = [
    { id: 'Breakthrough', title: 'Breakthrough', sub: 'Strongholds broken, new doors', color: '#e5c158', bg: '#8C7A3E', img: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=150&q=80' },
    { id: 'Family', title: 'Family', sub: 'Marriages, parenting, reconciliation', color: '#f39c12', bg: '#2980B9', img: 'https://images.unsplash.com/photo-1476611317561-60117649dd94?auto=format&fit=crop&w=150&q=80' },
    { id: 'Healing', title: 'Healing', sub: 'Bodies, hearts, and minds restored', color: '#ff4757', bg: '#4E8B61', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=150&q=80' },
    { id: 'Nations', title: 'Nations', sub: 'Governments, peace, and justice', color: '#4facfe', bg: '#2C3E50', img: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=150&q=80' },
    { id: 'Provision', title: 'Provision', sub: 'Work, finances, daily bread', color: '#2ecc71', bg: '#E74C3C', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=150&q=80' },
    { id: 'Salvation', title: 'Salvation', sub: 'Souls coming to Christ', color: '#9b59b6', bg: '#D81B60', img: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=150&q=80' },
    { id: 'Love', title: 'Love', sub: 'Walking in unconditional love', color: '#1abc9c', bg: '#16a085', img: 'https://images.unsplash.com/photo-1518199266791-5375a83164ba?auto=format&fit=crop&w=150&q=80' },
    { id: 'Peace', title: 'Peace', sub: 'Calming the storms of life', color: '#e67e22', bg: '#d35400', img: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=150&q=80' },
    { id: 'Anxiety', title: 'Anxiety', sub: 'Casting all your cares on Him', color: '#fd79a8', bg: '#e84393', img: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=150&q=80' },
    { id: 'Depression', title: 'Depression', sub: 'Finding joy in the morning', color: '#a3b18a', bg: '#588157', img: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&w=150&q=80' }
  ];

  const [prayerRooms, setPrayerRooms] = useState(PRAYER_ROOMS_META.map(r => ({ ...r, reqs: 0, lifted: 0 })));
  const [roomRequests, setRoomRequests] = useState([]);
  const [prayedForIds, setPrayedForIds] = useState([]);

  const fetchPrayerData = async () => {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setRoomRequests(data);

      const updatedRooms = PRAYER_ROOMS_META.map(room => {
        const roomReqs = data.filter(req => req.room_id === room.id);
        const totalLifted = roomReqs.reduce((sum, req) => sum + (req.prayed_count || 0), 0);
        return {
          ...room,
          reqs: roomReqs.length,
          lifted: totalLifted
        };
      });
      setPrayerRooms(updatedRooms);
    }
  };

  useEffect(() => {
    fetchPrayerData();
  }, []);

  const handleCreateRoomPrayer = async () => {
    if (!roomTitleInput.trim() || !activeRoom) return;

    const newReq = {
      room_id: activeRoom.id,
      user_id: userProfile?.id || null,
      author_name: isAnonymous ? 'Anonymous' : (userProfile?.Username || 'Anonymous Believer'),
      title: roomTitleInput,
      content: roomDetailInput,
      is_urgent: isUrgent,
      prayed_count: 0
    };

    const { error } = await supabase.from('prayer_requests').insert([newReq]);

    if (error) {
      alert("Error posting prayer: " + error.message);
    } else {
      setRoomTitleInput('');
      setRoomDetailInput('');
      setIsUrgent(false);
      setIsAnonymous(false);
      fetchPrayerData();
    }
  };

  const handleToggleRoomPray = async (req) => {
    const isPrayed = prayedForIds.includes(req.id);
    const increment = isPrayed ? -1 : 1;

    if (isPrayed) {
      setPrayedForIds(prev => prev.filter(id => id !== req.id));
    } else {
      setPrayedForIds(prev => [...prev, req.id]);
      setKpcBalance(prev => prev + 1);
    }

    setRoomRequests(prev => prev.map(r => 
      r.id === req.id ? { ...r, prayed_count: r.prayed_count + increment } : r
    ));

    await supabase
      .from('prayer_requests')
      .update({ prayed_count: req.prayed_count + increment })
      .eq('id', req.id);

    fetchPrayerData();
  };



  // Hire Services State
  const [hireTab, setHireTab] = useState('All');
  const [processingId, setProcessingId] = useState(null);

  const freelancers = [
    { id: 1, name: 'Grace Adeleke', handle: '@gracedesigns', service: 'Flyer & Poster Design', rating: '4.9', jobs: '142', price: 250, cat: 'Design' },
    { id: 2, name: 'Pastor Tunde', handle: '@voiceofzion', service: 'Voice-over & Narration', rating: '5.0', jobs: '88', price: 400, cat: 'Audio' },
    { id: 3, name: 'Mercy Films', handle: '@mercyfilms', service: 'Sermon Video Editing', rating: '4.8', jobs: '61', price: 900, cat: 'Video' },
    { id: 4, name: 'Choir Beats', handle: '@choirbeats', service: 'Worship Music Production', rating: '4.9', jobs: '47', price: 1200, cat: 'Audio' },
    { id: 5, name: 'Daniel O.', handle: '@inkofdaniel', service: 'Devotional Copywriting', rating: '4.7', jobs: '203', price: 180, cat: 'Writing' },
    { id: 6, name: 'Light Studios', handle: '@lightstudios', service: 'Event Photography', rating: '4.9', jobs: '35', price: 700, cat: 'Design' }
  ];

  // --- AUTO-ADVANCE SANCTUARY SLIDER ---
  useEffect(() => {
    if (step !== 6) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % announcements.length);
    }, 4500); // Slides every 4.5 seconds
    return () => clearInterval(interval);
  }, [step, announcements.length]);

  // Dream Diary State
  const [dreamTab, setDreamTab] = useState('Last night');
  const [isDreamModalOpen, setIsDreamModalOpen] = useState(false);
  const [selectedDreamToView, setSelectedDreamToView] = useState(null);
  const [dreamStepModal, setDreamStepModal] = useState(1);
  const [newDream, setNewDream] = useState({ title: '', desc: '', mood: '', requestInterpretation: false });
  const [isSubmittingDream, setIsSubmittingDream] = useState(false);

  const [dreams, setDreams] = useState([
    {
      id: 1, date: 'WED 8 JUL 2026', title: 'Dream of eating',
      desc: "I had a dream I went to the market to get some goods and there's this particular lady shop I usually buy something from. She's very kind and generous and I was recalling with someone how generous this lady was that when we wants to buy something and don't have enough money for it she still gives it to us. Now in my other dream I went to a restaurant, a fancy one that has a private night club. While a co worker or someone that I know forcefully take his friend to the night club to party anyways I went to the one serving food and brought fries with chicken.",
      status: 'PENDING', mood: 'Peaceful'
    },
    {
      id: 2, date: 'WED 1 JUL 2026', title: 'A river of Gold',
      desc: 'I had a dream of seeing gold rivers flowing endlessly.',
      status: null, mood: 'Prophetic'
    },
    {
      id: 3, date: 'WED 17 JUN 2026', title: 'Had a dream of buying anointing oil',
      desc: "I had a dream last night and in the dream i went to market on a bike and getting there i branch into a man's shop where I brought things from. I was holding a nylon bag and brought a bottle of anointing oil and two other items.",
      status: 'PENDING', mood: 'Mystery'
    }
  ]);

  const moods = [
    { name: 'Peaceful', icon: <LeafIcon />, color: '#2ecc71', bgClass: 'dream-bg-peaceful' },
    { name: 'Prophetic', icon: <DoveIcon />, color: '#4facfe', bgClass: 'dream-bg-prophetic' },
    { name: 'Warfare', icon: <SwordsIcon />, color: '#e74c3c', bgClass: 'dream-bg-mystery' },
    { name: 'Fearful', icon: <CloudIcon />, color: '#94a3b8', bgClass: 'dream-bg-default' },
    { name: 'Joyful', icon: <RainbowIcon />, color: '#f39c12', bgClass: 'dream-bg-peaceful' },
    { name: 'Mystery', icon: <MoonIcon />, color: '#8b5cf6', bgClass: 'dream-bg-mystery' }
  ];

  const getMoodConfig = (moodName) => moods.find(m => m.name === moodName) || moods[5];

  const handleDreamSave = async () => {
    if (newDream.requestInterpretation) {
      if (kpcBalance < 25) { alert("Insufficient KPC."); return; }
      setIsSubmittingDream(true);
      try {
        const KPC_MINT = new PublicKey(GLOBAL_KPC_MINT);
        const feePayer = Keypair.fromSecretKey(GLOBAL_TREASURY_KEY);
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const userPub = new PublicKey(generatedAddress);
        const src = await getOrCreateAssociatedTokenAccount(connection, feePayer, KPC_MINT, userPub);
        const dest = await getOrCreateAssociatedTokenAccount(connection, feePayer, KPC_MINT, feePayer.publicKey);
        await transfer(connection, feePayer, src.address, dest.address, feePayer.publicKey, 25 * Math.pow(10, 8));
        setKpcBalance(prev => prev - 25);
      } catch (error) {
        alert("Simulating payment success for app demonstration!");
        setKpcBalance(prev => prev - 25);
      }
      setIsSubmittingDream(false);
    }

   const newDreamObj = {
    id: Date.now(),
    user_id: currentUser.id,
    date: 'TODAY',
    title: newDream.title || 'Untitled Dream',
    desc: newDream.desc,
    status: newDream.requestInterpretation ? 'PENDING' : null,
    mood: newDream.mood || 'Mystery'
  };

  setDreams([newDreamObj, ...dreams]);
  setNewDream({ title: '', desc: '', mood: '', requestInterpretation: false });
  setDreamStepModal(1);
  setIsDreamModalOpen(false);

  await supabase.from('dreams').insert([newDreamObj]);
};

useEffect(() => {
  if (step === 14 && currentUser) {
    const fetchMyDreams = async () => {
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (data) setDreams(data);
    };
    fetchMyDreams();
  }
}, [step, currentUser]);


const handlePostComment = async (commentText) => {
    if (!commentText.trim()) return;

    const userName = currentUser?.formData?.username || 'User';

    const newComment = {
      article_id: activeNewsArticle.id,
      user_id: currentUser?.id || `temp-${Date.now()}`,
      author_name: `@${userName}`,
      avatar: currentUser?.formData?.avatar || currentUser?.image || `https://ui-avatars.com/api/?name=${userName}&background=f3ca58&color=000`,
      content: commentText
    };

    try {
      const { data, error } = await supabase
        .from('news_comments')
        .insert([newComment])
        .select();
      
      if (error) {
        console.error("Error saving comment:", error);
      } else {
        console.log("Comment saved to Supabase:", data);
        // UNCOMMENT THIS LINE:
        setRealComments([data[0], ...realComments]);
      }
    } catch (err) {
      console.error("Database connection error:", err);
    }
};

// Handle opening a status and saving it to seen history
  const handleViewStatus = (group) => {
    setActiveViewStatus(group.statuses[0]);
    setStatusProgress(0);
    setIsStatusPaused(false);
    setShowCommentsPanel(false);
    
    if (!viewedStatuses.includes(group.userId)) {
      const newViewed = [...viewedStatuses, group.userId];
      setViewedStatuses(newViewed);
      localStorage.setItem('kp_viewed_statuses', JSON.stringify(newViewed));
    }
  };

const incrementStatusView = async (statusId, currentViews) => {
  const { data, error } = await supabase
    .from('testimonies')
    .update({ views: currentViews + 1 })
    .eq('id', statusId);
    
  if (error) console.error("Error updating views:", error);
};

  useEffect(() => {
    let timer;
    if (activeViewStatus && !isStatusPaused && !showCommentsPanel) {
      if (activeViewStatus.media_type !== 'video') {
        const duration = 10000;
        const interval = 50; 
        
        timer = setInterval(() => {
          setStatusProgress(prev => {
            if (prev >= 100) {
              clearInterval(timer);
              setActiveViewStatus(null);
              return 100;
            }
            return prev + (interval / duration) * 100;
          });
        }, interval);
      } else if (statusVideoRef.current) {
        statusVideoRef.current.play();
      }
    } else if (statusVideoRef.current && (isStatusPaused || showCommentsPanel)) {
      statusVideoRef.current.pause();
    }
    
    return () => clearInterval(timer);
  }, [activeViewStatus, isStatusPaused, showCommentsPanel]);

const [realComments, setRealComments] = useState([]);

useEffect(() => {
  if (activeNewsArticle) {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('news_comments')
        .select('*')
        .eq('article_id', activeNewsArticle.id)
        .order('created_at', { ascending: false });

      if (data) setRealComments(data);
    };
    fetchComments();
  }
}, [activeNewsArticle]);

  const handleHireAndEscrow = async (freelancer) => {
    if (kpcBalance < freelancer.price) {
      alert(`Insufficient funds. This service requires ${freelancer.price} KPC.`);
      return;
    }

    setProcessingId(freelancer.id);

    try {
      const KPC_MINT_ADDRESS = new PublicKey(GLOBAL_KPC_MINT);
      const feePayerKeypair = Keypair.fromSecretKey(GLOBAL_TREASURY_KEY);
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

      const escrowVaultPubKey = feePayerKeypair.publicKey;
      const userPubKey = new PublicKey(generatedAddress);

      const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection, feePayerKeypair, KPC_MINT_ADDRESS, userPubKey
      );
      const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection, feePayerKeypair, KPC_MINT_ADDRESS, escrowVaultPubKey
      );

      const decimals = 8;
      const paymentValue = freelancer.price * Math.pow(10, decimals);

      const txSignature = await transfer(
        connection,
        feePayerKeypair,
        sourceTokenAccount.address,
        destinationTokenAccount.address,
        feePayerKeypair.publicKey,
        paymentValue
      );

      setKpcBalance(prev => prev - freelancer.price);
      alert(`Success! Funds for ${freelancer.name} secured in Kingdom Escrow.\nTransaction Signature: ${txSignature}`);
    } catch (error) {
      console.error("Escrow transaction failed:", error);
      alert("Devnet signature timeout or network congestion. Simulating local escrow vault sync for app demonstration!");
      setKpcBalance(prev => prev - freelancer.price);
    } finally {
      setProcessingId(null);
    }
  };



useEffect(() => {
    const initializeWallet = async () => {
      if (step === 4 && !generatedAddress) {
        setIsGenerating(true);
        
        try {
          const newKeypair = Keypair.generate();
          const newAddress = newKeypair.publicKey.toString();
          
          setWalletKeypair(newKeypair);
          setGeneratedAddress(newAddress);
          
          if (typeof requestKPCAirdrop === 'function') {
            await requestKPCAirdrop(newAddress); 
          }
          
          setIsGenerating(false);
          
        } catch (err) {
          console.error("Wallet generation or airdrop failed:", err);
          setIsGenerating(false);
        }
      }
    };

    initializeWallet();
    
  }, [step, generatedAddress]);

  const truncateAddress = (addr) => !addr ? '' : `${addr.slice(0, 6)}...${addr.slice(-6)}`;

  // --- UPGRADED AIRDROP & PERMANENT ACCOUNT REGISTRATION ---
  const requestKPCAirdrop = async () => {
    if (!generatedAddress) return;
    setIsAirdropping(true);

    let finalBalance = kpcBalance + 50;
    let airdropSignature = null;

    // 1. Handle the Solana Token Airdrop
    try {
      const KPC_MINT_ADDRESS = new PublicKey(GLOBAL_KPC_MINT);
      const faucetKeypair = Keypair.fromSecretKey(GLOBAL_TREASURY_KEY);
      const recipientPubKey = new PublicKey(generatedAddress);
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

      const senderTokenAccount = await getOrCreateAssociatedTokenAccount(connection, faucetKeypair, KPC_MINT_ADDRESS, faucetKeypair.publicKey);
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(connection, faucetKeypair, KPC_MINT_ADDRESS, recipientPubKey);

      const amountToSend = 50 * Math.pow(10, 8);
      airdropSignature = await transfer(connection, faucetKeypair, senderTokenAccount.address, recipientTokenAccount.address, faucetKeypair.publicKey, amountToSend);

      alert(`Success! 50 KPC deposited to your wallet.\nTX ID: ${airdropSignature}`);
    } catch (error) {
      console.error("Airdrop failed:", error);
      alert("Devnet Airdrop timeout. Simulating 50 KPC deposit for app demonstration!");
    } 

    // 2. Handle Supabase Registration and State Updates
    try {
      setKpcBalance(finalBalance);
      logTransaction('Welcome Vault Airdrop', +50, 'AIRDROP', airdropSignature);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      const userId = authData?.user?.id;
      
      if (userId) {
        const isMinistry =
  formData.accountType === 'Ministry';

const registrationDate = new Date().toISOString();

const ministryName =
  (formData.churchName || '').trim();

const resolvedDenomination = isMinistry
  ? (
      formData.churchDenomination === 'Other'
        ? formData.customDenomination
        : formData.churchDenomination
    )
  : (
      formData.denomination === 'Other'
        ? formData.customDenomination
        : formData.denomination
    );

if (isMinistry && !ministryName) {
  throw new Error('Please enter your Ministry / Church name.');
}

const profileData = {
  id: userId,

  email: formData.email,
  username: formData.username,

  account_type: isMinistry
    ? 'Ministry'
    : 'User',

  membership_tier: isMinistry
    ? 'Disciple'
    : 'Standard',

  ministry_type: isMinistry
    ? 'Church'
    : null,

  membership_updated_at:
    registrationDate,

  full_name: isMinistry
    ? ministryName
    : formData.fullName,

  denomination:
    resolvedDenomination || null,

  local_church:
    isMinistry
      ? null
      : (formData.churchName || null),

  phone_number:
    formData.phone || null,

  date_of_birth:
    isMinistry
      ? null
      : (formData.dob || null),

  country:
    isMinistry
      ? (formData.churchCountry || formData.country || null)
      : (formData.country || null),

  wallet_address:
    generatedAddress,

  wallet_balance:
    finalBalance,

  created_at:
    registrationDate
};

const {
  error: userProfileError
} = await supabase
  .from('user_profiles')
  .insert([profileData]);

if (userProfileError) {
  throw userProfileError;
}

if (isMinistry) {
  const ministryProfile = {
    id: userId,

    ministry_name: ministryName,
    username: formData.username,
    email: formData.email,

    account_type: 'Ministry',
    membership_tier: 'Disciple',
    ministry_type: 'Church',
    membership_updated_at: registrationDate,

    denomination:
      resolvedDenomination || null,

    year_founded:
      formData.yearFounded
        ? Number(formData.yearFounded)
        : null,

    mission_statement:
      formData.missionStatement || null,

    country:
      formData.churchCountry || null,

    city:
      formData.churchCity || null,

    street_address:
      formData.churchAddress || null,

    main_service_day:
      formData.serviceDay || null,

    'service_time':
      formData.serviceTime || null,

    phone_number:
      formData.phone || null,

    wallet_address:
      generatedAddress,

    wallet_balance:
      finalBalance,

    created_at:
      registrationDate
  };

  const {
    error: ministryProfileError
  } = await supabase
    .from('church_profiles')
    .insert([ministryProfile]);

  if (ministryProfileError) {
  console.error(
    'Ministry profile creation failed:',
    ministryProfileError
  );

  const {
    error: rollbackProfileError
  } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', userId);

  if (rollbackProfileError) {
    console.error(
      'Failed to rollback user profile:',
      rollbackProfileError
    );
  }

  throw new Error(
    `Ministry registration failed: ${ministryProfileError.message}`
  );
}
}

const today = new Date();

const todayDate =
  today.toISOString().slice(0, 10);

const lastLoginDate =
  profileData.last_login_date || null;

let newLoginStreak =
  Number(profileData.login_streak || 0);

if (!lastLoginDate) {
  newLoginStreak = 1;

} else if (lastLoginDate === todayDate) {
  newLoginStreak =
    Number(profileData.login_streak || 1);

} else {
  const previousDate =
    new Date(`${lastLoginDate}T00:00:00`);

  const currentDate =
    new Date(`${todayDate}T00:00:00`);

  const differenceInDays =
    Math.floor(
      (
        currentDate -
        previousDate
      ) /
      (1000 * 60 * 60 * 24)
    );

  if (differenceInDays === 1) {
    newLoginStreak =
      Number(profileData.login_streak || 0) + 1;
  } else {
    newLoginStreak = 1;
  }
}

const {
  error: streakUpdateError
} = await supabase
  .from('user_profiles')
  .update({
    login_streak:
      newLoginStreak,
    last_login_date:
      todayDate
  })
  .eq('id', userId);

if (streakUpdateError) {
  console.error(
    'Failed to update login streak:',
    streakUpdateError
  );
}

profileData.login_streak =
  newLoginStreak;

profileData.last_login_date =
  todayDate;

const sessionRecord = {
  ...formData,

  accountType:
    profileData.account_type,

  membership_tier:
    profileData.membership_tier,

  ministry_type:
    profileData.ministry_type,

  fullName:
    isMinistry
      ? ministryName
      : formData.fullName,

  ministry_name:
    isMinistry
      ? ministryName
      : null,

  generatedAddress,
  kpcBalance: finalBalance
};

setUserTier(
  profileData.account_type === 'Ministry'
    ? (
        profileData.membership_tier ||
        'Disciple'
      )
    : (
        profileData.membership_tier ||
        'Standard'
      )
);

setCurrentUser(sessionRecord);

localStorage.setItem(
  'kp_current_user',
  JSON.stringify(sessionRecord)
);
      }



      
      setStep(5);
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Process failed: " + error.message);
    } finally {
      setIsAirdropping(false);
    }
  };

// --- NEW SUPABASE LOGIN HANDLER ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError(null);

    try {
      let loginEmail = authEmail.trim();
      
      const isEmail = loginEmail.includes('@') && loginEmail.includes('.');

      if (!isEmail) {

        let { data: userProfile } = await supabase
          .from('user_profiles')
          .select('email')
          .ilike('username', loginEmail)
          .single();

        if (userProfile && userProfile.email) {
          loginEmail = userProfile.email;
        } else {

          let { data: churchProfile } = await supabase
            .from('church_profiles')
            .select('email')
            .ilike('username', loginEmail)
            .single();

          if (churchProfile && churchProfile.email) {
            loginEmail = churchProfile.email;
          } else {
            throw new Error("Username not found.");
          }
        }
      }

      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: authPassword,
      });

      if (authErr) throw authErr;

      const userId = authData.user.id;

      let profileData = null;

const {
  data: fullUserProfile,
  error: profileError
} = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle();

if (profileError) {
  throw profileError;
}

if (!fullUserProfile) {
  throw new Error(
    'Your KingdomPlus profile could not be found.'
  );
}

profileData = fullUserProfile;

      if (profileData) {
        if (profileData.wallet_address) setGeneratedAddress(profileData.wallet_address);
        if (profileData.wallet_balance !== undefined && profileData.wallet_balance !== null) setKpcBalance(Number(profileData.wallet_balance));
        setFormData(prev => ({
  ...prev,

  fullName:
    profileData.full_name ||
    profileData.church_name ||
    '',

  username:
    profileData.username || '',

  email:
    profileData.email || '',

  accountType:
    profileData.account_type === 'Ministry'
      ? 'Ministry'
      : 'User',

  denomination:
    profileData.denomination || '',

  churchName:
    profileData.church_name ||
    profileData.local_church ||
    ''
}));
      }

      alert(`Welcome back, ${profileData?.full_name || profileData?.church_name || 'Believer'}!`);

const today = new Date();

const todayDate =
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const lastLoginDate =
  profileData.last_login_date || null;

let newLoginStreak =
  Number(profileData.login_streak || 0);

if (!lastLoginDate) {

  newLoginStreak = 1;

} else if (lastLoginDate === todayDate) {

    Number(profileData.login_streak || 1);

} else {

  const previousDate =
    new Date(`${lastLoginDate}T00:00:00`);

  const currentDate =
    new Date(`${todayDate}T00:00:00`);

  const differenceInDays =
    Math.round(
      (
        currentDate -
        previousDate
      ) /
      (1000 * 60 * 60 * 24)
    );

  if (differenceInDays === 1) {

    newLoginStreak =
      Number(profileData.login_streak || 0) + 1;

  } else {

    newLoginStreak = 1;
  }
}

const {
  error: streakUpdateError
} = await supabase
  .from('user_profiles')
  .update({
    login_streak: newLoginStreak,
    last_login_date: todayDate
  })
  .eq('id', userId);

if (streakUpdateError) {
  console.error(
    'Login streak update failed:',
    streakUpdateError
  );
}

profileData.login_streak =
  newLoginStreak;

profileData.last_login_date =
  todayDate;
      
     const sessionRecord = {
  ...profileData,

  account_type:
    profileData.account_type === 'Ministry'
      ? 'Ministry'
      : 'User',

  membership_tier:
    profileData.account_type === 'Ministry'
      ? (
          profileData.membership_tier ||
          'Disciple'
        )
      : (
          profileData.membership_tier ||
          'Standard'
        ),

  wallet_address:
    profileData?.wallet_address || '',

  wallet_balance:
    Number(
      profileData?.wallet_balance || 0
    )
};
      setCurrentUser(sessionRecord);
      localStorage.setItem('kp_current_user', JSON.stringify(sessionRecord));
      
      setStep(6);

    } catch (error) {
      setAuthError("Invalid credentials.");
      alert("Login failed: " + (error.message || "Invalid credentials"));
    } finally {
      setIsAuthLoading(false);
    }
  };

  // --- NEW SUPABASE LOGOUT HANDLER ---
  const handleLogoutUser = async () => {
    if (window.confirm("Are you sure you want to log out of your Kingdom Vault?")) {
      await supabase.auth.signOut();
      setCurrentUser(null);
      localStorage.removeItem('kp_current_user');
      setFormData({ fullName: '', username: '', email: '', password: '', dob: '', country: '', phone: '', denomination: '', churchName: '' });
      setKpcBalance(0);
      setGeneratedAddress('');
      setStep(0);
    }
  };

  const [userTier, setUserTier] = useState('Standard');
  const [selectedUpgrade, setSelectedUpgrade] = useState('Disciple');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const upgradeTiers = {
  Standard: {
    price: 0
  },
  Disciple: {
    price: 250
  },
  Apostle: {
    price: 900
  }
};

const handleUpgradeMembershipTier = async () => {
  if (!selectedUpgrade) {
    alert('Please select a membership tier.');
    return;
  }

  const currentTier =
    userProfile?.membership_tier ||
    userTier ||
    (
      userProfile?.account_type === 'Ministry'
        ? 'Disciple'
        : 'Standard'
    );

  const isMinistry =
    userProfile?.account_type === 'Ministry';

  const tierRank = {
    Standard: 0,
    Disciple: 1,
    Apostle: 2
  };

  const upgradeCosts = {
    Disciple: 250,
    Apostle: 900
  };

  if (
    isMinistry &&
    currentTier === 'Disciple' &&
    selectedUpgrade === 'Disciple'
  ) {
    alert(
      'Your Ministry account already includes Disciple membership.'
    );
    return;
  }

  if (
    tierRank[selectedUpgrade] <=
    tierRank[currentTier]
  ) {
    alert(
      `You are already on the ${currentTier} plan or above.`
    );
    return;
  }

  const cost =
    upgradeCosts[selectedUpgrade];

  if (!cost) {
    alert('Invalid membership upgrade.');
    return;
  }

  if (
    Number(kpcBalance) < cost
  ) {
    alert(
      `Insufficient KPC. You need ${cost} KPC to upgrade to ${selectedUpgrade}.`
    );
    return;
  }

  if (!userProfile?.id) {
    alert('Your account could not be identified.');
    return;
  }

  setIsUpgrading(true);

  try {
    await new Promise(resolve =>
      setTimeout(resolve, 1200)
    );

    const newBalance =
      Number(kpcBalance) - cost;

    const {
      error: membershipError
    } = await supabase
      .from('user_profiles')
      .update({
        membership_tier:
          selectedUpgrade,
        membership_updated_at:
          new Date().toISOString(),
        wallet_balance:
          newBalance
      })
      .eq('id', userProfile.id);

    if (membershipError) {
      throw membershipError;
    }

    if (isMinistry) {
      await supabase
        .from('church_profiles')
        .update({
          membership_tier:
            selectedUpgrade,
          membership_updated_at:
            new Date().toISOString(),
          wallet_balance:
            newBalance
        })
        .eq('id', userProfile.id);
    }

    setKpcBalance(newBalance);
    setUserTier(selectedUpgrade);

    setUserProfile(prev => ({
      ...prev,
      membership_tier:
        selectedUpgrade,
      membership_updated_at:
        new Date().toISOString(),
      wallet_balance:
        newBalance
    }));

    setCurrentUser(prev => ({
      ...prev,
      membership_tier:
        selectedUpgrade,
      wallet_balance:
        newBalance
    }));

    const savedUser =
      localStorage.getItem(
        'kp_current_user'
      );

    if (savedUser) {
      const parsed =
        JSON.parse(savedUser);

      localStorage.setItem(
        'kp_current_user',
        JSON.stringify({
          ...parsed,
          membership_tier:
            selectedUpgrade,
          wallet_balance:
            newBalance,
          kpcBalance:
            newBalance
        })
      );
    }

    logTransaction(
      `Upgraded to ${selectedUpgrade}`,
      -cost,
      'SPEND'
    );

    alert(
      `🎉 Congratulations!\n\nYou have successfully upgraded your membership tier to ${selectedUpgrade}.\n\n${cost} KPC has been used for your upgrade.`
    );

    setStep(11);

  } catch (error) {
    console.error(
      'Prototype upgrade failed:',
      error
    );

    alert(
      `Upgrade failed: ${
        error?.message ||
        'Please try again.'
      }`
    );

  } finally {
    setIsUpgrading(false);
  }
};

  const [claimedVideos, setClaimedVideos] = useState({});
  const [isClaiming, setIsClaiming] = useState(false);
  
  const handleWatchAndEarn = async (video) => {
    if (claimedVideos[video.id]) return;

    setIsClaiming(true);
    try {

      await new Promise(resolve => setTimeout(resolve, 1500));

      const KPC_MINT = new PublicKey(GLOBAL_KPC_MINT);
      const feePayer = Keypair.fromSecretKey(GLOBAL_TREASURY_KEY);
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const userPub = new PublicKey(generatedAddress);

      const dest = await getOrCreateAssociatedTokenAccount(connection, feePayer, KPC_MINT, userPub);
      const src = await getOrCreateAssociatedTokenAccount(connection, feePayer, KPC_MINT, feePayer.publicKey);

      await transfer(connection, feePayer, src.address, dest.address, feePayer.publicKey, video.reward * Math.pow(10, 8));

      setKpcBalance(prev => prev + video.reward);
      setClaimedVideos(prev => ({ ...prev, [video.id]: true }));
      alert(`Hallelujah! You earned ${video.reward} KPC for watching.`);
    } catch (error) {
      setKpcBalance(prev => prev + video.reward);
      setClaimedVideos(prev => ({ ...prev, [video.id]: true }));
      alert(`Simulated App Mode: You earned ${video.reward} KPC for watching.`);
    }
    setIsClaiming(false);
  };

  // --- STREAM-TO-EARN PLAYER STATE ---
  const [activeMedia, setActiveMedia] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const mediaRef = useRef(null);

  // --- MEDIA SOCIAL & COMMENTS STATE (Safely declared after activeMedia) ---
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isTipping, setIsTipping] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, author: 'Grace D.', text: 'This message is so timely! 🙏', avatar: 'G' },
    { id: 2, author: 'Elijah P.', text: 'Hallelujah, I am claiming this.', avatar: 'E' }
  ]);

  // Reset social state when a new media file is opened
useEffect(() => {
  if (activeMedia) {
    setIsLiked(false);
    setIsCommentsOpen(false);
    
    const fetchMediaComments = async () => {
      const { data, error } = await supabase
        .from('media_comments')
        .select('*')
        .eq('media_id', activeMedia.id)
        .order('created_at', { ascending: false });

      if (data) setComments(data);
    };
    fetchMediaComments();
  }
}, [activeMedia]);

  const REWARD_THRESHOLD_SECONDS = 15;

  const openPlayer = (item, type) => {
    setActiveMedia(item);
    setMediaType(type);
    setIsPlaying(true);
    setCurrentTime(0);
    setIsPlayerExpanded(type === 'video');
  };

  const closePlayer = () => {
    if (mediaRef.current) mediaRef.current.pause();
    setActiveMedia(null);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (mediaRef.current) {
      if (isPlaying) mediaRef.current.pause();
      else mediaRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = async () => {
    if (!mediaRef.current) return;
    const current = mediaRef.current.currentTime;
    setCurrentTime(current);

    if (current >= REWARD_THRESHOLD_SECONDS && !claimedVideos[activeMedia.id] && !isClaiming) {
      setIsClaiming(true);

      const rewardAmount = Number(activeMedia.reward) || 5; 

      try {
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const feePayer = Keypair.fromSecretKey(GLOBAL_TREASURY_KEY);
        const userPub = new PublicKey(generatedAddress);
        const KPC_MINT = new PublicKey(GLOBAL_KPC_MINT);

        const src = await getOrCreateAssociatedTokenAccount(connection, feePayer, KPC_MINT, feePayer.publicKey);
        const dest = await getOrCreateAssociatedTokenAccount(connection, feePayer, KPC_MINT, userPub);

        await transfer(connection, feePayer, src.address, dest.address, feePayer.publicKey, rewardAmount * Math.pow(10, 8));

        setKpcBalance(prev => (Number(prev) || 0) + rewardAmount);
        logTransaction(`Stream Reward: ${activeMedia.title}`, +rewardAmount, 'EARN');
        setClaimedVideos(prev => ({ ...prev, [activeMedia.id]: true }));
      } catch (error) {
        setKpcBalance(prev => (Number(prev) || 0) + rewardAmount);
        setClaimedVideos(prev => ({ ...prev, [activeMedia.id]: true }));
      }
      setIsClaiming(false);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- DASHBOARD (SANCTUARY) STATE & DATA ---
  const [activeArticle, setActiveArticle] = useState(null);
  const [claimedArticles, setClaimedArticles] = useState({});
  const [isClaimingArticle, setIsClaimingArticle] = useState(false);

  const [dashboardWorship, setDashboardWorship] = useState([]);
  const [newsData, setNewsData] = useState([]);

// Admin Media States
  const [editingId, setEditingId] = useState(null);
  const [videoData, setVideoData] = useState([]);
  const [movieData, setMovieData] = useState([]);
  const [musicData, setMusicData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event, fieldToUpdate) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${adminTab.toLowerCase()}/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('kingdom_media')
        .upload(filePath, file);

      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('kingdom_media')
        .getPublicUrl(filePath);

      setAdminUpload(prev => ({ ...prev, [fieldToUpdate]: publicUrl }));
      alert("File uploaded successfully!");

    } catch (error) {
      alert("Error uploading file: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const [adminUpload, setAdminUpload] = useState({
    title: '',
    artist: '',
    description: '',
    img: '',
    src: '',
    content: '',
    category: 'Nigerian Gospel'
  });

  const fetchAllMediaData = async () => {
    const { data: music } = await supabase.from('kingdom_music').select('*').order('created_at', { ascending: false });
    if (music) setMusicData(music);

    const { data: vids } = await supabase.from('kingdom_videos').select('*').order('created_at', { ascending: false });
    if (vids) setVideoData(vids);

    const { data: movies } = await supabase.from('kingdom_movies').select('*').order('created_at', { ascending: false });
    if (movies) setMovieData(movies);

    const { data: news } = await supabase.from('kingdom_news').select('*').order('created_at', { ascending: false });
    if (news) setNewsData(news);
  };

  useEffect(() => {
    fetchAllMediaData();
  }, []);

  const handleAdminPublish = async () => {
    if (!adminUpload.title || !adminUpload.img) {
      return alert("Title and Cover Image are required!");
    }

    let tableName = '';
    let payload = {};

    if (adminTab === 'Music') {
      tableName = 'kingdom_music';
      payload = {
        title: adminUpload.title,
        artist: adminUpload.artist || 'Unknown',
        img: adminUpload.img,
        src: adminUpload.src,
        category: adminUpload.category || 'Nigerian Gospel'
      };
    } else if (adminTab === 'Movies') {
      tableName = 'kingdom_movies';
      payload = {
        title: adminUpload.title,
        description: adminUpload.description,
        img: adminUpload.img,
        src: adminUpload.src,
        category: adminUpload.category || 'Trending Now'
      };
    } else if (adminTab === 'Videos') {
      tableName = 'kingdom_videos';
      payload = {
        title: adminUpload.title,
        channel: adminUpload.artist || 'KingdomPlus TV',
        description: adminUpload.description,
        img: adminUpload.img,
        src: adminUpload.src,
        category: adminUpload.category || 'Sermons'
      };
    } else if (adminTab === 'News') {
      tableName = 'kingdom_news';
      payload = {
        title: adminUpload.title,
        content: adminUpload.content,
        img: adminUpload.img
      };
    }

    if (editingId) {
      const { error } = await supabase.from(tableName).update(payload).eq('id', editingId);
      if (error) alert("Error updating: " + error.message);
      else alert(`${adminTab} updated successfully!`);
    } else {
      const { error } = await supabase.from(tableName).insert([payload]);
      if (error) alert("Error publishing: " + error.message);
      else alert(`${adminTab} published successfully!`);
    }

    setEditingId(null);
    setAdminUpload({ title: '', artist: '', description: '', img: '', src: '', content: '', category: 'Nigerian Gospel' });
    fetchAllMediaData();
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setAdminUpload({
      title: item.title || '',
      artist: item.artist || item.channel || '',
      description: item.description || '',
      img: item.img || '',
      src: item.src || '',
      content: item.content || '',
      category: item.category || 'Nigerian Gospel'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    let tableName = adminTab === 'Music' ? 'kingdom_music' :
                    adminTab === 'Movies' ? 'kingdom_movies' :
                    adminTab === 'Videos' ? 'kingdom_videos' : 'kingdom_news';

    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) alert("Error deleting: " + error.message);
    else {
      alert("Deleted successfully!");
      fetchAllMediaData();
    }
  };


  const handleClaimArticleReward = async () => {
    if (!activeArticle || claimedArticles[activeArticle.id]) return;

    setIsClaimingArticle(true);
    try {
      const connection = new Connection('https://rpc.ankr.com/solana_devnet', 'confirmed');
      const feePayer = Keypair.fromSecretKey(GLOBAL_TREASURY_KEY);
      const userPub = new PublicKey(generatedAddress);
      const KPC_MINT = new PublicKey(GLOBAL_KPC_MINT);

      const src = await getOrCreateAssociatedTokenAccount(connection, feePayer, KPC_MINT, feePayer.publicKey);
      const dest = await getOrCreateAssociatedTokenAccount(connection, feePayer, KPC_MINT, userPub);

      await transfer(connection, feePayer, src.address, dest.address, feePayer.publicKey, activeArticle.reward * Math.pow(10, 8));

      setKpcBalance(prev => prev + activeArticle.reward);
      setClaimedArticles(prev => ({ ...prev, [activeArticle.id]: true }));
      alert(`🎉 You earned ${activeArticle.reward} KPC for reading!`);
    } catch (error) {
      setKpcBalance(prev => prev + activeArticle.reward);
      logTransaction(`Read Reward: ${activeArticle.title.substring(0, 20)}...`, +activeArticle.reward, 'EARN');
      setClaimedArticles(prev => ({ ...prev, [activeArticle.id]: true }));
      alert(`Simulated: You earned ${activeArticle.reward} KPC for reading!`);
    }
    setIsClaimingArticle(false);
  };

  const renderTopNav = (currentStep) => (
    <>
      <div className="top-nav">
        <button className="back-button" onClick={handleBack}><BackArrowIcon /></button>
        <span className="step-indicator">STEP {currentStep} OF 4</span>
      </div>
      <div className="progress-container"><div className="progress-fill" style={{ width: `${(currentStep / 4) * 100}%` }}></div></div>
    </>
  );

  const AppBottomNav = () => (
    <div className="bottom-nav">
      <div className={`nav-item ${activeTab === 'sanctuary' ? 'active' : ''}`} onClick={() => { setActiveTab('sanctuary'); setStep(6); }}>
        <div className="nav-icon-wrapper"><HomeIcon /></div>
        <span className="nav-label">Sanctuary</span>
      </div>
      <div className={`nav-item ${activeTab === 'media' ? 'active' : ''}`} onClick={() => { setActiveTab('media'); setStep(17); }}>
        <div className="nav-icon-wrapper"><VolumeIcon /></div>
        <span className="nav-label">Media</span>
      </div>
      <div className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => { setActiveTab('chat'); setStep(23); setHubTab('INBOX'); }}>
        <div className="nav-icon-wrapper" style={{ position: 'relative' }}>
          <ChatIcon />
          {unreadChatCount > 0 && (
            <div style={{
              position: 'absolute', top: '-4px', right: '-6px',
              background: '#e74c3c', color: '#fff',
              fontSize: '9px', fontWeight: '900',
              width: '16px', height: '16px',
              borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              border: '2px solid #09101a'
            }}>
              {unreadChatCount > 9 ? '9+' : unreadChatCount}
            </div>
          )}
          
        </div>
        <span className="nav-label">Chat</span>
      </div>
      
      <div className={`nav-item ${activeTab === 'kingdom' ? 'active' : ''}`} onClick={() => { setActiveTab('kingdom'); setKingdomTab('Devotions'); setStep(10); }}>
        <div className="nav-icon-wrapper"><GlobeIcon /></div>
        <span className="nav-label">Kingdom</span>
      </div>
      
      <div className={`nav-item ${activeTab === 'treasury' ? 'active' : ''}`} onClick={() => { setActiveTab('treasury'); setStep(11); }}>
        <div className="nav-icon-wrapper"><WalletIcon2 /></div>
        <span className="nav-label">Treasury</span>
      </div>
      <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setStep(18); }}>
        <div className="nav-icon-wrapper"><ProfileIcon /></div>
        <span className="nav-label">Profile</span>
      </div>
    </div>
  );

  // --- THE PLAYER RENDER FUNCTION (SCROLLABLE & INTEGRATED SOCIAL COMMENTS) ---
  const renderStreamPlayer = () => {
    if (!activeMedia) return null;

    const isClaimed = claimedVideos[activeMedia.id];
    const progressPercent = (currentTime / (duration || 1)) * 100;
    const TIP_AMOUNT = 10;

    const isHintTime = currentTime >= 2 && currentTime <= 8;
    const isJustClaimed = currentTime >= REWARD_THRESHOLD_SECONDS && currentTime <= (REWARD_THRESHOLD_SECONDS + 4);
    const showVideoBadge = mediaType === 'video' && (isHintTime || (isClaimed && isJustClaimed));

    const handleLikeToggle = (e) => {
      if (e) e.stopPropagation();
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    const handleTipCreator = async (e) => {
      if (e) e.stopPropagation();
      if (kpcBalance < TIP_AMOUNT) { alert(`Insufficient balance.`); return; }
      setIsTipping(true);
      try {
        const connection = new Connection('https://rpc.ankr.com/solana_devnet', 'confirmed');
        const feePayer = Keypair.fromSecretKey(GLOBAL_TREASURY_KEY);
        const userPub = new PublicKey(generatedAddress);
        const KPC_MINT = new PublicKey(GLOBAL_KPC_MINT);
        const src = await getOrCreateAssociatedTokenAccount(connection, feePayer, KPC_MINT, userPub);
        const dest = await getOrCreateAssociatedTokenAccount(connection, feePayer, KPC_MINT, feePayer.publicKey);
        await transfer(connection, feePayer, src.address, dest.address, feePayer.publicKey, TIP_AMOUNT * Math.pow(10, 8));
        setKpcBalance(prev => prev - TIP_AMOUNT);
        logTransaction(`Tipped Creator: ${activeMedia.artist || activeMedia.channel}`, -TIP_AMOUNT, 'SPEND');
        alert(`🎉 Tipped ${TIP_AMOUNT} KPC!`);
      } catch (error) {
        setKpcBalance(prev => prev - TIP_AMOUNT);
        alert(`Simulated: Tipped ${TIP_AMOUNT} KPC!`);
      }
      setIsTipping(false);
    };

    const handleAddComment = async () => {
  if (!newComment.trim()) return;
  
  const commentObj = {
    media_id: activeMedia.id,
    author: currentUser?.formData?.username || 'You',
    text: newComment,
    avatar: currentUser?.formData?.avatar || 'K',
    time: 'Just now'
  };
  
  setComments([commentObj, ...comments]);
  setNewComment("");

  await supabase.from('media_comments').insert([commentObj]);
};

    const togglePlayPauseEvent = (e) => {
      if (e) e.stopPropagation();
      togglePlayPause();
    }

    const closePlayerEvent = (e) => {
      if (e) e.stopPropagation();
      closePlayer();
    }

    const skipTime = (seconds) => {
      if (mediaRef.current) mediaRef.current.currentTime += seconds;
    }

    return (
      <div className="global-media-wrapper">

        {/* --- PERSISTENT MEDIA ELEMENTS --- */}
        {mediaType === 'video' ? (
          <div className={`video-host ${isPlayerExpanded ? 'expanded' : 'minimized'}`}>
            <video
              ref={mediaRef} src={activeMedia.src} autoPlay playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={(e) => setDuration(e.target.duration)}
              onEnded={() => setIsPlaying(false)}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        ) : (
          <audio
  ref={mediaRef} 
  src={activeMedia.src} 
  autoPlay
  preload="auto"
  crossOrigin="anonymous"
  onTimeUpdate={handleTimeUpdate}
  onLoadedMetadata={(e) => setDuration(e.target.duration)}
  onEnded={() => setIsPlaying(false)}
  style={{ display: 'none' }}
/>
        )}

        {/* --- 1. UNIVERSAL MINI PLAYER --- */}
        {!isPlayerExpanded && (
          <div className="mini-player-container" onClick={() => setIsPlayerExpanded(true)}>
            <img src={activeMedia.img} alt="cover" className="mini-player-img" />
            <div className="mini-player-info">
              <div className="mini-player-title">{activeMedia.title}</div>
              <div className="mini-player-artist">{activeMedia.artist || 'KingdomPlus'}</div>
            </div>
            <div className="mini-player-actions">
              <button className="mini-player-btn" onClick={togglePlayPauseEvent}>
                {isPlaying ? <PauseSolidIcon /> : <PlaySolidIcon />}
              </button>
              <button className="mini-player-btn mini-player-close" onClick={closePlayerEvent}>
                <XIcon />
              </button>
            </div>
          </div>
        )}

        {/* --- 2. SPOTIFY AUDIO UI (Scrollable with Integrated Comments) --- */}
        {isPlayerExpanded && mediaType === 'audio' && (
          <div className="spotify-audio-layout">

            {/* Top Bar */}
            <div className="spotify-header">
              <button className="mini-player-btn" onClick={() => setIsPlayerExpanded(false)}><ChevronDownIcon /></button>
              <div className="spotify-header-text">PLAYING FROM KINGDOMPLUS</div>
              <button className="mini-player-btn" onClick={closePlayerEvent}><XIcon /></button>
            </div>

            {/* Album Art */}
            <div className="spotify-art-container">
              <img src={activeMedia.img} className="spotify-art" alt="Album Art" />
            </div>

            {/* Track Info & Tip/Like Actions */}
            <div className="spotify-info-row">
              <div>
                <div className="spotify-title">{activeMedia.title}</div>
                <div className="spotify-artist">{activeMedia.artist || 'Kingdom Worship'}</div>
              </div>
              <div className="spotify-actions">
                <button className="mini-player-btn" onClick={handleLikeToggle}>
                  {isLiked ? <HeartSolidIcon /> : <HeartOutlineIcon />}
                </button>
                <button className="mini-player-btn" style={{ color: '#f3ca58' }} onClick={handleTipCreator}>
                  {isTipping ? "..." : <HandCoinIcon />}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-bar-bg" onClick={(e) => {
                if (!mediaRef.current) return;
                const rect = e.currentTarget.getBoundingClientRect();
                mediaRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
              }}>
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, background: '#fff' }}></div>
              </div>
              <div className="time-indicators">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Media Controls */}
            <div className="spotify-controls">
              <button className="mini-player-btn" style={{ color: '#29beaf' }}><ShuffleIcon /></button>
              <button className="mini-player-btn" onClick={() => skipTime(-10)}><SkipBackIcon /></button>
              <button className="spotify-play-btn" onClick={togglePlayPause}>
                {isPlaying ? <PauseSolidIcon /> : <PlaySolidIcon />}
              </button>
              <button className="mini-player-btn" onClick={() => skipTime(10)}><SkipForwardIcon /></button>
              <button className="mini-player-btn"><RepeatIcon /></button>
            </div>

            {/* --- INTEGRATED MODERN SOCIAL COMMENTS SEGMENT --- */}
            <div className="integrated-comments-section">
              <div className="social-comments-header">
                <div className="social-comments-title">
                  <MessageIcon /> Community Thoughts
                  <span className="social-comments-count">{comments.length + 45}</span>
                </div>
                <div style={{ color: '#8e9aab', fontSize: '12px' }}>Live Feed</div>
              </div>

              {/* Inline Input Box */}
              <div className="social-comment-input-box">
                <input
                  type="text"
                  className="social-input-field"
                  placeholder="Share a testimony or thought..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button className="social-send-btn" onClick={handleAddComment}>
                  <SendIcon />
                </button>
              </div>

              {/* Comment Cards List */}
              <div className="social-comments-list">
                {comments.map((comment, idx) => (
                  <div key={comment.id || idx} className="social-comment-card">
                    <div className="social-comment-avatar">{comment.avatar}</div>
                    <div className="social-comment-body">
                      <div className="social-comment-meta">
                        <span className="social-comment-author">{comment.author}</span>
                        <span className="social-comment-time">{comment.time || '2h ago'}</span>
                      </div>
                      <div className="social-comment-text">{comment.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- 3. VIDEO UI (Scrollable Expanded) --- */}
        {isPlayerExpanded && mediaType === 'video' && (
          <div className="media-player-overlay" style={{ background: '#000', overflowY: 'auto' }}>
            <div className="player-header" style={{ position: 'sticky', top: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
              <button className="close-player-btn" onClick={() => setIsPlayerExpanded(false)}>
                <ChevronDownIcon />
              </button>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div className={`reward-badge ${isClaimed ? 'claimed' : ''}`} style={{ opacity: showVideoBadge ? 1 : 0, transition: 'all 0.5s' }}>
                  {isClaimed ? <CheckIcon /> : <HandCoinIcon />}
                  {isClaimed ? 'REWARD SECURED' : `WATCH TO EARN`}
                </div>
              </div>
              <button className="close-player-btn" onClick={closePlayerEvent}><XIcon /></button>
            </div>

            {/* Video Spacer */}
            <div style={{ height: '40vh' }}></div>

            <div className="player-controls" style={{ padding: '20px' }}>
              <div className="player-meta">
                <h3>{activeMedia.title}</h3>
                <p>{activeMedia.channel || 'KingdomPlus Media'}</p>
              </div>

              <div className="progress-container">
                <div className="progress-bar-bg" onClick={(e) => {
                  if (!mediaRef.current) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  mediaRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
                }}>
                  <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="time-indicators">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="control-buttons">
                <button className="secondary-btn" onClick={() => skipTime(-10)}><Rewind10Icon /></button>
                <button className="play-pause-btn" onClick={togglePlayPause}>
                  {isPlaying ? <PauseSolidIcon /> : <PlaySolidIcon />}
                </button>
                <button className="secondary-btn" onClick={() => skipTime(10)}><Forward10Icon /></button>
              </div>

              {/* Integrated Comments for Video too! */}
              <div className="integrated-comments-section" style={{ marginTop: '30px' }}>
                <div className="social-comments-header">
                  <div className="social-comments-title"><MessageIcon /> Comments <span className="social-comments-count">{comments.length + 45}</span></div>
                </div>
                <div className="social-comment-input-box">
                  <input type="text" className="social-input-field" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddComment()} />
                  <button className="social-send-btn" onClick={handleAddComment}><SendIcon /></button>
                </div>
                <div className="social-comments-list">
                  {comments.map((comment, idx) => (
                    <div key={comment.id || idx} className="social-comment-card">
                      <div className="social-comment-avatar">{comment.avatar}</div>
                      <div className="social-comment-body">
                        <div className="social-comment-meta">
                          <span className="social-comment-author">{comment.author}</span>
                          <span className="social-comment-time">{comment.time || '2h ago'}</span>
                        </div>
                        <div className="social-comment-text">{comment.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  };

  // --- TRANSACTION HISTORY STATE ---
  const [txHistory, setTxHistory] = useState(() => {
    const savedUser = localStorage.getItem('kp_current_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return parsed.txHistory || [];
    }
    return [];
  });

  const [txFilter, setTxFilter] = useState('ALL');

  // --- UNIVERSAL TRANSACTION LOGGER ---
  const logTransaction = (title, amount, type = 'EARN', signature = null) => {
    const newTx = {
      id: Date.now() + Math.random(),
      title: title,
      amount: amount,
      type: type,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Confirmed',
      signature: signature || `5K2p...${Math.floor(1000 + Math.random() * 9000)}`
    };

    setTxHistory(prev => [newTx, ...prev]);
  };

  // ==========================================
// SAFE LOCAL STORAGE AUTO-SYNC
// ==========================================

useEffect(() => {
  if (!currentUser || !currentUser.email) return;
  if (!balanceLoaded) return;

  const savedUser = {
    ...currentUser,
    formData,
    kpcBalance,
    wallet_balance: kpcBalance,
    generatedAddress,
    userTier,
    claimedVideos,
    claimedArticles,
    txHistory
  };

  localStorage.setItem(
    'kp_current_user',
    JSON.stringify(savedUser)
  );

}, [
  balanceLoaded,
  kpcBalance,
  generatedAddress,
  userTier,
  formData,
  claimedVideos,
  claimedArticles,
  txHistory,
  currentUser?.id,
  currentUser?.email
]);


// --- TREASURY MODALS & WEB3 ECONOMY ENGINE ---
  const [activeModal, setActiveModal] = useState(null);
  const [transferUsername, setTransferUsername] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTier, setSelectedTier] = useState('Disciple');

  // 1. GIVE / SEND BY USERNAME OR WALLET ADDRESS
  const handleSendByUsername = async (e) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (amount <= 0 || amount > kpcBalance) {
      alert("Invalid amount or insufficient balance.");
      return;
    }
    
    const cleanInput = transferUsername.trim();
    const isWalletAddress = cleanInput.length > 30 && !cleanInput.startsWith('@');
    const cleanUsername = cleanInput.replace('@', '').toLowerCase();
    
    let recipientRecord = null;
    let recipientEmail = null;
    let targetAddress = cleanInput;
    
    if (!isWalletAddress) {
      let { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('username', cleanUsername)
        .single();
        
      if (userProfile) {
        recipientRecord = userProfile;
        recipientEmail = userProfile.email;
        targetAddress = userProfile.wallet_address;
      } else {
        let { data: churchProfile } = await supabase
          .from('church_profiles')
          .select('*')
          .ilike('church_name', cleanUsername) 
          .single();
          
        if (churchProfile) {
          recipientRecord = churchProfile;
          recipientEmail = churchProfile.email;
          targetAddress = churchProfile.wallet_address;
        }
      }

      if (!recipientRecord || !targetAddress) {
        alert(`Username @${cleanUsername} not found or they haven't generated a vault yet.`);
        return;
      }
      
      if (recipientEmail === currentUser?.email) {
        alert("You cannot send KPC to yourself!");
        return;
      }
    }
    

    setIsTransferring(true);
    try {
      const connection = new Connection('https://rpc.ankr.com/solana_devnet', 'confirmed');
      const senderKeypair = Keypair.fromSecretKey(GLOBAL_TREASURY_KEY); 
      const KPC_MINT = new PublicKey(GLOBAL_KPC_MINT);
      
      const src = await getOrCreateAssociatedTokenAccount(connection, senderKeypair, KPC_MINT, new PublicKey(generatedAddress));
      const dest = await getOrCreateAssociatedTokenAccount(connection, senderKeypair, KPC_MINT, new PublicKey(targetAddress));
      
      const signature = await transfer(connection, senderKeypair, src.address, dest.address, senderKeypair.publicKey, amount * Math.pow(10, 8));
      
      setKpcBalance(prev => prev - amount);
      
      const receiverName = recipientRecord?.username || recipientRecord?.church_name || cleanUsername;
      const targetName = isWalletAddress ? `${targetAddress.substring(0, 6)}...` : `@${receiverName}`;
      
      logTransaction(`Sent to ${targetName}`, -amount, 'SPEND', signature);

      // --- SUPABASE UPDATE ---
      if (!isWalletAddress && recipientRecord) {
        const newBalance = (recipientRecord.wallet_balance || 0) + amount;
        const tableName = recipientRecord.church_name ? 'church_profiles' : 'user_profiles';
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ wallet_balance: newBalance })
          .eq('id', recipientRecord.id);

        if (updateError) {
          console.error("Failed to update recipient balance in Supabase:", updateError);
        }
      }
      // ------------------------------------------

      alert(`🎉 Successfully transferred ${amount} KPC to ${isWalletAddress ? 'Wallet Address' : '@' + cleanUsername}!`);
      setActiveModal(null);
      setTransferUsername('');
      setTransferAmount('');
    } catch (error) {
      console.error("Transfer error:", error);
      setKpcBalance(prev => prev - amount);
      const targetName = isWalletAddress ? `${targetAddress.substring(0, 6)}...` : `@${cleanUsername}`;
      logTransaction(`Sent to ${targetName}`, -amount, 'SPEND');
      alert(`Simulated: Transferred ${amount} KPC to ${targetName}!`);
      setActiveModal(null);
    }
    setIsTransferring(false);
  };

  // 2. HIRE MINISTER SERVICES HANDLER
  const handleHireSubmit = () => {
    if (!selectedService) { alert("Please select a ministry service."); return; }
    if (kpcBalance < selectedService.price) { alert("Insufficient KPC balance to hire this service."); return; }
    
    if (window.confirm(`Confirm booking for "${selectedService.title}" for ${selectedService.price} KPC?`)) {
      setKpcBalance(prev => prev - selectedService.price);
      logTransaction(`Hired: ${selectedService.title}`, -selectedService.price, 'SPEND');
      alert(`🎉 Booking confirmed! The verified minister has received your request and KPC escrow.`);
      setActiveModal(null);
      setSelectedService(null);
    }
  };

  // 3. UPGRADE TIER HANDLER
  const handleTierUpgradeSubmit = () => {
    const cost = selectedTier === 'Disciple' ? 100 : selectedTier === 'Apostle' ? 500 : 0;
    if (kpcBalance < cost) { alert(`You need ${cost} KPC to unlock the ${selectedTier} tier.`); return; }
    if (userTier === selectedTier) { alert("You are already on this tier!"); return; }

    if (window.confirm(`Upgrade your Kingdom Vault to "${selectedTier}" for ${cost} KPC?`)) {
      setKpcBalance(prev => prev - cost);
      setUserTier(selectedTier);
      logTransaction(`Upgraded Vault to ${selectedTier} Tier`, -cost, 'SPEND');
      alert(`Congratulations! You are now ranked as an ${selectedTier.toUpperCase()} with enhanced staking & earning multipliers!`);
      setActiveModal(null);
    }
  };

// --- CHURCH DASHBOARD STATE & HANDLERS ---
  const [ministerSearchInput, setMinisterSearchInput] = useState('');
  const [verifiedMinistersList, setVerifiedMinistersList] = useState([]);

  const handleVerifyMinister = async (e) => {
    e.preventDefault();
    const cleanSearch = ministerSearchInput.trim().toLowerCase().replace('@', '');
    if (!cleanSearch) return;

    let targetEmail = null;
    let targetUser = null;

    const { data: foundUser, error: searchError } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`username.ilike.${cleanSearch},email.ilike.${cleanSearch}`)
      .single();

    if (!foundUser) {
      alert(`No believer found with username @${cleanSearch} or email.`);
      return;
    }

    if (foundUser.account_type === 'Minister') {
      alert(`@${foundUser.username || cleanSearch} is already a verified minister!`);
      return;
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        account_type: 'Minister' 
      })
      .eq('id', foundUser.id);

    if (updateError) {
      console.error("Failed to upgrade minister in Supabase:", updateError);
      alert("Failed to ordain minister on the server.");
      return;
    }

    setVerifiedMinistersList(prev => [
      { 
        name: foundUser.full_name || 'Minister', 
        handle: `@${foundUser.username}`, 
        role: 'Ordained Minister' 
      },
      ...prev
    ]);

    setMinisterSearchInput('');
    alert(`Hallelujah! @${foundUser.username} is now a Verified Minister under your church.`);
 };

// --- CHURCH STUDIO REFS, LIVE STREAM & MODAL STATES ---
  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  
  const [activeStudioModal, setActiveStudioModal] = useState(null); 
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [liveStreamTitle, setLiveStreamTitle] = useState('Sunday Worship Service — Live Broadcast');
  const [conferenceRoomId, setConferenceRoomId] = useState(null);

// --- 1. HANDLE WALLPAPER & PROFILE PICTURE UPLOADS ---
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result;
      const updatedForm = {
        ...formData,
        [type === 'cover' ? 'churchCover' : 'churchAvatar']: base64Image
      };

      setFormData(updatedForm);
      if (currentUser?.email) {
        const updatedUser = { ...currentUser, formData: updatedForm };
        setCurrentUser(updatedUser);
        localStorage.setItem('kp_current_user', JSON.stringify(updatedUser));
      }
    };
    reader.readAsDataURL(file);
  };

  // --- 2. TOGGLE LIVE SERVICE BROADCAST ALERT ---
  const handleToggleLiveBroadcast = () => {
    if (!isLiveStreaming) {
      if (window.confirm(`Start live broadcast: "${liveStreamTitle}"? All Members will see a live pulsing alert at the top of their feeds!`)) {
        setIsLiveStreaming(true);
      }
    } else {
      if (window.confirm("End current live stream service?")) {
        setIsLiveStreaming(false);
      }
    }
  };


// --- THE CHURCH / MINISTRY COMMAND HUB ---
  const renderChurchDashboard = () => {
    const givingInflow = txHistory.filter(tx => tx.amount > 0);
    const totalInflow = givingInflow.reduce((acc, curr) => acc + curr.amount, 0);

    return (
      <div className="sanctuary-container" style={{ paddingBottom: '90px' }}>
<input 
          type="file" 
          ref={coverInputRef} 
          onChange={(e) => handleImageUpload(e, 'cover')} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />
        <input 
          type="file" 
          ref={avatarInputRef} 
          onChange={(e) => handleImageUpload(e, 'avatar')} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />
        
        {/* --- LIVE BROADCAST ALERT BAR (When Active) --- */}
        {isLiveStreaming && (
          <div style={{ background: 'linear-gradient(90deg, #e74c3c, #c0392b)', padding: '12px 18px', borderRadius: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(231, 76, 60, 0.4)', animation: 'pulse 2s infinite' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontWeight: '800', fontSize: '13px' }}>
              <span style={{ width: '10px', height: '10px', background: '#fff', borderRadius: '50%', display: 'inline-block' }}></span>
              🔴 LIVE ON AIR: {liveStreamTitle}
            </div>
            <button onClick={handleToggleLiveBroadcast} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>End Stream</button>
          </div>
        )}

        {/* 1. X-STYLE PROFESSIONAL PROFILE PAGE */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          
          {/* CLICKABLE COVER WALLPAPER BANNER */}
          <div 
            onClick={() => coverInputRef.current?.click()}
            style={{ 
              height: '130px', 
              background: formData.churchCover ? `url(${formData.churchCover}) center/cover no-repeat` : 'linear-gradient(135deg, #1f3752 0%, #101926 50%, #0d2b28 100%)', 
              position: 'relative', 
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
              <CameraSvg /> Tap to change cover wallpaper
            </div>
            <div style={{ position: 'absolute', right: '15px', bottom: '12px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', color: '#8e9aab', fontWeight: '700', zIndex: 1 }}>
              {formData.churchDenomination || 'Non-denominational'} Ministry
            </div>
          </div>

          <div style={{ padding: '0 20px 20px 20px' }}>
            
            {/* FIXED AVATAR WITH SVG EDIT BADGE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-45px', marginBottom: '15px', position: 'relative', zIndex: 10 }}>
              <div 
                onClick={() => avatarInputRef.current?.click()}
                style={{ width: '86px', height: '86px', borderRadius: '50%', background: 'linear-gradient(135deg, #f3ca58, #29beaf)', padding: '3px', boxShadow: '0 6px 20px rgba(0,0,0,0.6)', cursor: 'pointer', position: 'relative' }}
              >
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: formData.churchAvatar ? `url(${formData.churchAvatar}) center/cover no-repeat` : '#101926', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '34px', fontWeight: '900', color: '#fff', overflow: 'hidden' }}>
                  {!formData.churchAvatar && (formData.churchName || 'G').charAt(0).toUpperCase()}
                </div>
                {/* SVG Edit Badge */}
                <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: '#29beaf', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #101926' }}>
                  <EditPencilSvg />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setActiveModal('qr')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 14px', borderRadius: '20px', color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 Project QR
                </button>
                <button onClick={() => setActiveModal('announcement')} style={{ background: 'linear-gradient(90deg, #f3ca58, #29beaf)', border: 'none', padding: '8px 16px', borderRadius: '20px', color: '#101926', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(41, 190, 175, 0.2)' }}>
                  Post Broadcast
                </button>
              </div>
            </div>

            {/* Profile Name & Verified Badge */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '800', margin: 0 }}>
                  {formData.churchName || 'Grace Fellowship Assembly'}
                </h1>
                <XVerifiedBadge />
              </div>
              <div style={{ color: '#8e9aab', fontSize: '13px', marginTop: '2px' }}>
                @{formData.username || 'grace_assembly'} • Official Kingdom Ministry
              </div>
            </div>

            {/* Profile Bio */}
            <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.5', margin: '14px 0' }}>
              {formData.missionStatement || "Proclaiming the gospel, raising disciples, and advancing the Kingdom of God through fellowship, prayer, and decentralized community support."}
            </p>

            {/* X-Style Metadata Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', color: '#8e9aab', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span>📍</span> {formData.churchCity || 'Lagos'}, {formData.churchCountry || 'Nigeria'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span>🗓️</span> Gatherings: {formData.serviceDay || 'Sunday'}s @ {formData.serviceTime || '09:00'}</div>
              {formData.yearFounded && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span>🏛️</span> Est. {formData.yearFounded}</div>}
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
              <div><span style={{ color: '#fff', fontWeight: '800' }}>{verifiedMinistersList.length + 1}</span> <span style={{ color: '#8e9aab' }}>Ordained Ministers</span></div>
              <div><span style={{ color: '#fff', fontWeight: '800' }}>{totalInflow}</span> <span style={{ color: '#8e9aab' }}>KPC Offerings Received</span></div>
              <div><span style={{ color: '#2ecc71', fontWeight: '800' }}>Active</span> <span style={{ color: '#8e9aab' }}>Devnet Node</span></div>
            </div>

          </div>
        </div>

        {/* 2. THE NEW PULPIT & MEDIA STUDIO GRID */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: '#fff', fontSize: '16px', margin: 0 }}>Pulpit & Media Studio</h3>
              <p style={{ color: '#8e9aab', fontSize: '12px', margin: '4px 0 0 0' }}>Publish spiritual resources, host conferences, and broadcast live services to all believers.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            
            {/* Action 1: Upload Book -> Maps to Store */}
            <div onClick={() => { setStudioCategory('Store'); setActiveStudioModal('kingdom_publish'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(243, 202, 88, 0.2)', padding: '16px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(243, 202, 88, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <StudioBookIcon />
              </div>
              <div><div style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>Upload Book</div><div style={{ color: '#8e9aab', fontSize: '11px', marginTop: '2px' }}>Push to Bookstore</div></div>
            </div>

            {/* Action 2: Upload Message -> Maps to Messages */}
            <div onClick={() => { setStudioCategory('Messages'); setActiveStudioModal('kingdom_publish'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(41, 190, 175, 0.2)', padding: '16px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(41, 190, 175, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <StudioMicIcon />
              </div>
              <div><div style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>Upload Message</div><div style={{ color: '#8e9aab', fontSize: '11px', marginTop: '2px' }}>Audio or Video word</div></div>
            </div>

            {/* Action 3: Daily Devotional -> Maps to Devotions */}
            <div onClick={() => { setStudioCategory('Devotions'); setActiveStudioModal('kingdom_publish'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <StudioDevotionIcon />
              </div>
              <div><div style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>Daily Devotional</div><div style={{ color: '#8e9aab', fontSize: '11px', marginTop: '2px' }}>Push to Daily Bread</div></div>
            </div>

            {/* Action 4: Bible Plan -> Maps to Bible Plans */}
            <div onClick={() => { setStudioCategory('Bible Plans'); setActiveStudioModal('kingdom_publish'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(229, 193, 88, 0.3)', padding: '16px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(229, 193, 88, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <StudioPlanIcon />
              </div>
              <div><div style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>Reading Plan</div><div style={{ color: '#8e9aab', fontSize: '11px', marginTop: '2px' }}>Push to Active Plans</div></div>
            </div>

            {/* Action 5: Start Conference -> Maps to Conference Modal */}
            <div onClick={() => setActiveStudioModal('conference')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(41, 190, 175, 0.2)', padding: '16px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(41, 190, 175, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <StudioVideoIcon />
              </div>
              <div><div style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>Start Conference</div><div style={{ color: '#8e9aab', fontSize: '11px', marginTop: '2px' }}>Interactive video room</div></div>
            </div>

            {/* Action 6: Broadcast Live Service -> Calls Handler Directly */}
            <div onClick={handleToggleLiveBroadcast} style={{ background: isLiveStreaming ? 'rgba(231, 76, 60, 0.15)' : 'rgba(255,255,255,0.03)', border: isLiveStreaming ? '1px solid #e74c3c' : '1px solid rgba(231, 76, 60, 0.3)', padding: '16px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: isLiveStreaming ? '#e74c3c' : 'rgba(231, 76, 60, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <StudioLiveIcon isLive={isLiveStreaming} />
              </div>
              <div><div style={{ color: isLiveStreaming ? '#e74c3c' : '#fff', fontSize: '13px', fontWeight: '800' }}>{isLiveStreaming ? 'Live On Air' : 'Broadcast Live'}</div><div style={{ color: '#8e9aab', fontSize: '11px', marginTop: '2px' }}>{isLiveStreaming ? 'Tap to end stream' : 'Stream to all members'}</div></div>
            </div>

          </div>
        </div>

        {/* 3. CONGREGATION ANALYTICS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ color: '#8e9aab', fontSize: '10px', fontWeight: '700' }}>TOTAL OFFERINGS</div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '800', marginTop: '6px' }}>{totalInflow} <span style={{ color: '#29beaf', fontSize: '11px' }}>KPC</span></div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ color: '#8e9aab', fontSize: '10px', fontWeight: '700' }}>ORDAINED MINISTERS</div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '800', marginTop: '6px' }}>{verifiedMinistersList.length + 1} <span style={{ color: '#f3ca58', fontSize: '11px' }}>Active</span></div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ color: '#8e9aab', fontSize: '10px', fontWeight: '700' }}>DEVNET STATUS</div>
            <div style={{ color: '#2ecc71', fontSize: '15px', fontWeight: '800', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71', display: 'inline-block' }}></span> Connected
            </div>
          </div>
        </div>
{/* =========================================================================
            3. CHURCH SUB-NAVIGATION TABS (ATTENDANCE | TIMELINE | CAMPAIGNS)
            ========================================================================= */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          
          <button 
            onClick={() => setChurchSubTab('attendance')}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: churchSubTab === 'attendance' ? 'linear-gradient(90deg, #f3ca58, #29beaf)' : 'transparent', color: churchSubTab === 'attendance' ? '#101926' : '#8e9aab', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
            <RosterUsersIcon /> Attendance CRM
          </button>

          <button 
            onClick={() => setChurchSubTab('timeline')}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: churchSubTab === 'timeline' ? 'linear-gradient(90deg, #f3ca58, #29beaf)' : 'transparent', color: churchSubTab === 'timeline' ? '#101926' : '#8e9aab', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
            <TimelineFeedIcon /> Ministry Timeline
          </button>

          <button 
            onClick={() => setChurchSubTab('campaigns')}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: churchSubTab === 'campaigns' ? 'linear-gradient(90deg, #f3ca58, #29beaf)' : 'transparent', color: churchSubTab === 'campaigns' ? '#101926' : '#8e9aab', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
            <VisionTargetIcon /> Vision Campaigns
          </button>

        </div>

        {/* =========================================================================
            4. DYNAMIC SECTION: ATTENDANCE CRM & GAMIFIED ROSTER
            ========================================================================= */}
        {churchSubTab === 'attendance' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            
            {/* Top Control Bar for Pastor */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isCheckInActive ? '#2ecc71' : '#8e9aab', display: 'inline-block' }}></span>
                  <span style={{ color: isCheckInActive ? '#2ecc71' : '#8e9aab', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                    {isCheckInActive ? 'CHECK-IN PORTAL ACTIVE' : 'PORTAL CURRENTLY CLOSED'}
                  </span>
                </div>
                <h3 style={{ color: '#fff', fontSize: '16px', margin: '4px 0 0 0' }}>{checkInSessionTitle}</h3>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {isCheckInActive && (
                  <button onClick={handleSimulateMemberCheckIn} style={{ background: 'rgba(41, 190, 175, 0.15)', border: '1px solid #29beaf', color: '#29beaf', padding: '8px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>
                    + Simulate Member Entry
                  </button>
                )}
                <button onClick={handleToggleCheckInSession} style={{ background: isCheckInActive ? '#e74c3c' : 'linear-gradient(90deg, #f3ca58, #29beaf)', border: 'none', color: isCheckInActive ? '#fff' : '#101926', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                  {isCheckInActive ? 'Close Check-In' : 'Open Live Check-In'}
                </button>
              </div>
            </div>

            {/* Attendance Analytics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '700' }}>PRESENT TODAY</div>
                <div style={{ color: '#fff', fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>{attendanceRoster.length} <span style={{ color: '#29beaf', fontSize: '11px' }}>Believers</span></div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '700' }}>KPC REWARDS DISTRIBUTED</div>
                <div style={{ color: '#f3ca58', fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>{attendanceRoster.length * 5} <span style={{ fontSize: '11px' }}>KPC</span></div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '700' }}>CHECK-IN REWARD</div>
                <div style={{ color: '#2ecc71', fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>+5.0 <span style={{ fontSize: '11px' }}>KPC / person</span></div>
              </div>
            </div>

            {/* Live Member Roster Feed */}
            <div>
              <div style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '700', marginBottom: '10px', letterSpacing: '0.5px' }}>LIVE GATHERING ROSTER (RECENT CHECK-INS)</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {attendanceRoster.map((attendee, idx) => (
                  <div key={attendee.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #29beaf, #f3ca58)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#101926', fontWeight: '900', fontSize: '14px' }}>
                        {attendee.avatar}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {attendee.name}
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '6px', background: attendee.tier === 'Apostle' ? 'rgba(243, 202, 88, 0.2)' : 'rgba(41, 190, 175, 0.15)', color: attendee.tier === 'Apostle' ? '#f3ca58' : '#29beaf' }}>
                            {attendee.tier}
                          </span>
                        </div>
                        <div style={{ color: '#8e9aab', fontSize: '11px' }}>{attendee.handle} • Checked in at {attendee.time}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.3)', padding: '4px 8px', borderRadius: '8px' }}>
                      <CheckInSuccessIcon />
                      <span style={{ color: '#2ecc71', fontSize: '11px', fontWeight: '800' }}>+5 KPC</span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

     {/* =========================================================================
           MINISTRY TIMELINE
            ========================================================================= */}
        {churchSubTab === 'timeline' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            
            {/* Timeline Header & Quick Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '16px', margin: 0 }}>Ministry Broadcast Timeline</h3>
                <p style={{ color: '#8e9aab', fontSize: '12px', margin: '4px 0 0 0' }}>Manage your published devotionals, announcements, and track community engagement.</p>
              </div>
              <button 
                onClick={() => { setStudioCategory('Devotions'); setActiveStudioModal('kingdom_publish'); }}
                style={{ background: 'linear-gradient(90deg, #f3ca58, #29beaf)', border: 'none', color: '#101926', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                + Create New Post
              </button>
            </div>

            {/* Total Engagement Summary Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ color: '#8e9aab', fontSize: '10px', fontWeight: '700' }}>TOTAL POST LIKES</div>
                <div style={{ color: '#fff', fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>
                  {ministryTimeline.reduce((acc, curr) => acc + curr.likes, 0)} <span style={{ color: '#ff4757', fontSize: '11px' }}>♥</span>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ color: '#8e9aab', fontSize: '10px', fontWeight: '700' }}>COMMUNITY COMMENTS</div>
                <div style={{ color: '#fff', fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>
                  {ministryTimeline.reduce((acc, curr) => acc + curr.comments, 0)} <span style={{ color: '#29beaf', fontSize: '11px' }}>Replies</span>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ color: '#8e9aab', fontSize: '10px', fontWeight: '700' }}>POST TIPS SECURED</div>
                <div style={{ color: '#f3ca58', fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>
                  {ministryTimeline.reduce((acc, curr) => acc + curr.tipsReceived, 0)} <span style={{ fontSize: '11px' }}>KPC</span>
                </div>
              </div>
            </div>

            {/*Chronological Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Sort to display pinned posts first */}
              {[...ministryTimeline].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map((post) => (
                <div 
                  key={post.id} 
                  style={{ background: post.isPinned ? 'rgba(41, 190, 175, 0.05)' : 'rgba(255,255,255,0.02)', border: post.isPinned ? '1px solid rgba(41, 190, 175, 0.3)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', transition: 'all 0.2s' }}
                >
                  
                  {/* Pinned Header Banner */}
                  {post.isPinned && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#29beaf', fontSize: '11px', fontWeight: '800', marginBottom: '10px', letterSpacing: '0.5px' }}>
                      <PinTopIcon /> PINNED TO TOP OF TIMELINE
                    </div>
                  )}

                  {/* Author Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #f3ca58, #29beaf)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#101926', fontWeight: '900', fontSize: '16px' }}>
                        {(formData.churchName || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ color: '#fff', fontWeight: '800', fontSize: '14px' }}>{formData.churchName || 'Grace Fellowship Assembly'}</span>
                          <XVerifiedBadge />
                        </div>
                        <div style={{ color: '#8e9aab', fontSize: '12px' }}>
                          @{formData.username || 'grace_assembly'} • <span style={{ color: '#f3ca58' }}>{post.category}</span> • {post.time}
                        </div>
                      </div>
                    </div>

                    {/* Pin/Unpin Action */}
                    <button 
                      onClick={() => handleTogglePinPost(post.id)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#8e9aab', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      {post.isPinned ? 'Unpin' : 'Pin Post'}
                    </button>
                  </div>

                  {/* Post Title & Body */}
                  <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: '800', margin: '0 0 8px 0' }}>{post.title}</h4>
                  <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6', margin: '0 0 16px 0' }}>{post.content}</p>

                  {/* X-Style Engagement Action Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#8e9aab', fontSize: '12px', fontWeight: '700' }}>
                    
                    {/* Likes */}
                    <div 
                      onClick={() => handleTimelineLikeToggle(post.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: post.isLiked ? '#ff4757' : '#8e9aab', transition: 'all 0.2s' }}
                    >
                      <TimelineLikeIcon isLiked={post.isLiked} />
                      <span>{post.likes}</span>
                    </div>

                    {/* Comments */}
                    <div 
                      onClick={() => alert("Opening full thread comments view...")}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <TimelineCommentIcon />
                      <span>{post.comments} Replies</span>
                    </div>

                    {/* Tips Received */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f3ca58', background: 'rgba(243, 202, 88, 0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(243, 202, 88, 0.2)' }}>
                      <TimelineTipIcon />
                      <span>+{post.tipsReceived} KPC Tipped</span>
                    </div>

                    {/* Share */}
                    <div 
                      onClick={() => alert("Post broadcast link copied to clipboard!")}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <TimelineShareIcon />
                      <span>Share</span>
                    </div>

                  </div>

                </div>
              ))}

            </div>

          </div>
        )}

        {/* =========================================================================
            6. DYNAMIC SECTION: TARGETED VISION CAMPAIGNS
            ========================================================================= */}
        {churchSubTab === 'campaigns' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            
            {/* Campaigns Header & Launch Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '18px' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '16px', margin: 0 }}>Targeted Vision Campaigns</h3>
                <p style={{ color: '#8e9aab', fontSize: '12px', margin: '4px 0 0 0' }}>Cast a clear vision with transparent Web3 progress bars to inspire donor generosity.</p>
              </div>
              <button 
                onClick={() => alert("Opening Launch New Vision Campaign builder...")}
                style={{ background: 'linear-gradient(90deg, #f3ca58, #29beaf)', border: 'none', color: '#101926', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                + Launch Campaign
              </button>
            </div>

            {/* Campaign Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {visionCampaigns.map((camp) => {
                const percentReached = Math.min(Math.round((camp.raised / camp.target) * 100), 100);

                return (
                  <div 
                    key={camp.id} 
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '18px', transition: 'all 0.2s' }}
                  >
                    
                    {/* Top Tag & Days Left */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', background: camp.isUrgent ? 'rgba(231, 76, 60, 0.15)' : 'rgba(41, 190, 175, 0.15)', color: camp.isUrgent ? '#e74c3c' : '#29beaf', letterSpacing: '0.5px' }}>
                        {camp.category} {camp.isUrgent && '• URGENT VISION'}
                      </span>
                      <span style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '700' }}>
                        {camp.daysLeft} Days Remaining
                      </span>
                    </div>

                    {/* Headline & Description */}
                    <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: '800', margin: '0 0 6px 0' }}>{camp.title}</h4>
                    <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.5', margin: '0 0 16px 0' }}>{camp.desc}</p>

                    {/* Web3 Progress Bar */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
                        <div>
                          <span style={{ color: '#f3ca58', fontSize: '20px', fontWeight: '900' }}>{camp.raised.toLocaleString()}</span>
                          <span style={{ color: '#8e9aab', fontSize: '13px' }}> / {camp.target.toLocaleString()} KPC</span>
                        </div>
                        <span style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>{percentReached}% Funded</span>
                      </div>
                      
                      <div className="progress-container" style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', margin: 0 }}>
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${percentReached}%`, 
                            background: percentReached >= 100 ? '#2ecc71' : 'linear-gradient(90deg, #f3ca58, #29beaf)', 
                            height: '100%', 
                            borderRadius: '10px' 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer Analytics & Sowing Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ color: '#8e9aab', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CampaignCoinIcon />
                        <span>Backed by <strong style={{ color: '#fff' }}>{camp.donorsCount}</strong> Kingdom Believers</span>
                      </div>

                      <button 
                        onClick={() => handleSowIntoCampaign(camp.id, camp.title)}
                        style={{ background: percentReached >= 100 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(243, 202, 88, 0.15)', border: `1px solid ${percentReached >= 100 ? '#2ecc71' : '#f3ca58'}`, color: percentReached >= 100 ? '#2ecc71' : '#f3ca58', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        {percentReached >= 100 ? '✓ Goal Reached (Sow Overflow)' : 'Sow 100 KPC Seed'}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

{/* =========================================================================
            7. RECENT GIVING LEDGER (RESTORED TO BOTTOM)
            ========================================================================= */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '22px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '15px', margin: '0 0 16px 0' }}>Live Congregation Inflow</h3>
          {givingInflow.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '25px 0', color: '#8e9aab', fontSize: '13px' }}>
              No offerings or tithes recorded yet. Project your Giving QR during service!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {givingInflow.slice(0, 5).map((tx, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>{tx.title}</div>
                    <div style={{ color: '#8e9aab', fontSize: '11px', marginTop: '4px' }}>{tx.date} • {tx.status}</div>
                  </div>
                  <div style={{ color: '#2ecc71', fontWeight: '800', fontSize: '15px' }}>+{tx.amount} KPC</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            8. MINISTRY LEADERSHIP TEAM (TEAM MANAGEMENT)
            ========================================================================= */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '22px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ color: '#f3ca58' }}><ShieldCheckIcon /></div>
            <h3 style={{ color: '#fff', fontSize: '16px', margin: 0 }}>Ministry Leadership Team</h3>
          </div>
          <p style={{ color: '#8e9aab', fontSize: '12px', margin: '0 0 20px 0' }}>Ordain new ministers, manage your pastoral team, and oversee their Kingdom standing.</p>

          {/* Ordain New Minister Input Form */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '20px' }}>
            <div style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '800', marginBottom: '10px', letterSpacing: '0.5px' }}>ORDAIN A NEW MINISTER</div>
            <form onSubmit={handleVerifyMinister} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Enter believer's @username or email..." 
                value={ministerSearchInput}
                onChange={(e) => setMinisterSearchInput(e.target.value)}
                className="app-input" 
                style={{ margin: 0, flex: 1, background: 'rgba(255,255,255,0.05)' }} 
              />
              <button type="submit" className="action-button" style={{ width: 'auto', padding: '0 20px', margin: 0, background: 'linear-gradient(135deg, #f3ca58, #e5c158)', color: '#101926', fontWeight: '800', fontSize: '13px' }}>
                Verify Minister
              </button>
            </form>
          </div>

          {/* Complete Leadership Roster */}
          <div>
            <div style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '12px' }}>ACTIVE PASTORAL ROSTER</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Top Level: Main Admin / Lead Pastor */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(41, 190, 175, 0.05)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(41, 190, 175, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #29beaf, #f3ca58)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#101926', fontWeight: '900', fontSize: '16px' }}>
                    {(formData.churchName || formData.fullName || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {formData.fullName || 'Lead Admin'}
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: '#29beaf', color: '#101926', fontWeight: '900' }}>LEAD PASTOR</span>
                    </div>
                    <div style={{ color: '#8e9aab', fontSize: '12px', marginTop: '2px' }}>@{formData.username || 'admin'} • Full Dashboard Access</div>
                  </div>
                </div>
              </div>

              {/* Mapped Roster of Ordained Ministers */}
              {verifiedMinistersList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#8e9aab', fontSize: '13px', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', borderRadius: '14px' }}>
                  No additional ministers ordained yet. Use the portal above to add team members.
                </div>
              ) : (
                verifiedMinistersList.map((min, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: min.avatar ? `url(${min.avatar}) center/cover no-repeat` : 'rgba(243, 202, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f3ca58', fontWeight: '800', fontSize: '16px', border: '1px solid rgba(243, 202, 88, 0.3)' }}>
                        {!min.avatar && min.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div>
                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {min.name}
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(243, 202, 88, 0.15)', color: '#f3ca58', fontWeight: '900' }}>{min.role.toUpperCase()}</span>
                        </div>
                        <div style={{ color: '#8e9aab', fontSize: '12px', marginTop: '2px' }}>{min.handle} • Ordained & Active</div>
                      </div>
                    </div>
                    
                    {/* Management Action Button */}
                    <button 
                      onClick={() => alert(`Opening management tools for ${min.name}...`)}
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#8e9aab', padding: '8px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = '#8e9aab'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    >
                      Manage
                    </button>
                  </div>
                ))
              )}

            </div>
          </div>
        </div>

      </div>
    );
  };

// --- DYNAMIC KINGDOM HUB STATE ARRAYS ---
  const [devotionsList, setDevotionsList] = useState([
    { id: 'd1', title: 'Morning Glory', scripture: 'Philippians 4:13', time: '5 min read', reward: 5, img: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=200&q=80', isFeatured: true, author: 'Grace Sanctuary' },
    { id: 'd2', title: 'Walking in Faith', scripture: 'Hebrews 11:1', time: '4 min read', reward: 5, img: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=200&q=80', isFeatured: false, author: 'Pastor Josh' },
    { id: 'd3', title: 'Overcoming Anxiety', scripture: '1 Peter 5:7', time: '6 min read', reward: 5, img: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&w=200&q=80', isFeatured: false, author: 'Kingdom Devotionals' }
  ]);

  const [biblePlansList, setBiblePlansList] = useState([
    { id: 'p1', title: 'Bible in 90 Days', desc: 'Day 14 of 90 • Old Testament', progress: 15, rewardText: '🎁 Bonus: +50 KPC at finish', img: 'https://images.unsplash.com/photo-1518199266791-5375a83164ba?auto=format&fit=crop&w=200&q=80', isActive: true },
    { id: 'p2', title: 'Proverbs Daily', desc: '31 Days of Wisdom', progress: 0, rewardText: '✨ +10 KPC upon completion', img: 'https://images.unsplash.com/photo-1476611317561-60117649dd94?auto=format&fit=crop&w=200&q=80', isActive: false }
  ]);

  const [messagesList, setMessagesList] = useState([
    { id: 'm1', title: 'The Power of Grace', author: 'Pastor Josh • Sun, Oct 12', duration: '45:20', reward: 15, img: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=300&q=80', isSeries: false },
    { id: 'm2', title: 'Living by Faith', author: 'Pastor Josh • Sun, Oct 5', duration: '38:15', reward: 15, img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&q=80', isSeries: false },
    { id: 'm3', title: 'Book of Romans', author: '12 Parts • Bible Study', duration: 'Series', reward: 2, img: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=300&q=80', isSeries: true }
  ]);

  const [storeBooksList, setStoreBooksList] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
const fetchKingdomBooks = async () => {
  try {
    setIsLoadingBooks(true);

    const {
      data,
      error
    } = await supabase
      .from('kingdom_books')
      .select(`
  id,
  title,
  description,
  author_id,
  author_name,
  price_kpc,
  is_free,
  cover_url,
  book_file_path,
  book_file_name,
  book_file_type,
  is_published,
  created_at
`)
      .eq('is_published', true)
      .order('created_at', {
        ascending: false
      });

    if (error) throw error;

    const normalizedBooks = (data || []).map(book => ({
  id: book.id,
  title: book.title,
  author: book.author_name,
  price: book.is_free ? 0 : Number(book.price_kpc || 0),
  desc: book.description || '',
  img: book.cover_url,
  pdfUrl: null,

  bookFilePath: book.book_file_path,

  bookFileName: book.book_file_name,
  bookFileType: book.book_file_type,

  authorId: book.author_id,
  createdAt: book.created_at
}));

    setStoreBooksList(normalizedBooks);

  } catch (error) {
    console.error('Error loading Kingdom books:', error);
  } finally {
    setIsLoadingBooks(false);
  }
};

useEffect(() => {
  if (kingdomTab === 'Store') {
    fetchKingdomBooks();
  }
}, [kingdomTab]);

  // --- STUDIO INPUT STATE & UNIFIED PUBLISHING HANDLER ---
  const [studioCategory, setStudioCategory] = useState('Devotions'); // 'Devotions', 'Bible Plans', 'Messages', 'Store'
  const [studioTitle, setStudioTitle] = useState('');
  const [studioSub, setStudioSub] = useState('');
  const [studioPriceOrReward, setStudioPriceOrReward] = useState('5');

  const handleKingdomPublish = (e) => {
    e.preventDefault();
    if (!studioTitle.trim()) { alert("Please provide a title for your publication."); return; }

    const authorName = formData.churchName || formData.fullName || "Official Ministry";
    const newId = `pub_${Date.now()}`;
    const defaultImg = "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=300&q=80";

    if (studioCategory === 'Devotions') {
      setDevotionsList(prev => [{
        id: newId, title: studioTitle, scripture: studioSub || 'General Devotional', time: '5 min read', reward: Number(studioPriceOrReward) || 5, img: defaultImg, isFeatured: false, author: authorName
      }, ...prev]);
    } else if (studioCategory === 'Bible Plans') {
      setBiblePlansList(prev => [{
        id: newId, title: studioTitle, desc: studioSub || '30 Days of Spiritual Growth', progress: 0, rewardText: `Bonus: +${studioPriceOrReward} KPC`, img: defaultImg, isActive: false
      }, ...prev]);
    } else if (studioCategory === 'Messages') {
      setMessagesList(prev => [{
        id: newId, title: studioTitle, author: `${authorName} • Just now`, duration: studioSub || '35:00', reward: Number(studioPriceOrReward) || 10, img: defaultImg, isSeries: false
      }, ...prev]);
    } else if (studioCategory === 'Store') {
      setStoreBooksList(prev => [{
        id: newId, title: studioTitle, author: authorName, price: Number(studioPriceOrReward) || 50, img: defaultImg
      }, ...prev]);
    }

    alert(`Glory! Your ${studioCategory.slice(0, -1)} "${studioTitle}" has been published directly to the Kingdom Hub!`);
    setStudioTitle(''); setStudioSub(''); setStudioPriceOrReward('5');
    setActiveModal(null);
  };

// --- CHURCH CRM & GAMIFIED ATTENDANCE STATE ---
  const [churchSubTab, setChurchSubTab] = useState('attendance'); // 'attendance' | 'timeline' | 'campaigns'
  const [isCheckInActive, setIsCheckInActive] = useState(false);
  const [checkInSessionTitle, setCheckInSessionTitle] = useState('Sunday Morning Gathering');
  
  const [attendanceRoster, setAttendanceRoster] = useState([]);
const [ministryMembers, setMinistryMembers] = useState([]);
const [isLoadingMinistryMembers, setIsLoadingMinistryMembers] = useState(false);
const [ministryMemberCount, setMinistryMemberCount] = useState(0);

  // Pastor toggles check-in open/closed for the congregation
  const handleToggleCheckInSession = () => {
    if (!isCheckInActive) {
      if (window.confirm(`Open Live Check-In for "${checkInSessionTitle}"? Believers will be able to check in and earn +5 KPC!`)) {
        setIsCheckInActive(true);
      }
    } else {
      if (window.confirm("Close current check-in session? Roster will be archived to permanent church analytics.")) {
        setIsCheckInActive(false);
      }
    }
  };

  // Simulate a believer checking in (for demonstration/testing on the dashboard)
  const handleSimulateMemberCheckIn = () => {
    const mockNames = ['Tobi Oba', 'Mercy Johnson', 'Elijah Peter', 'David King', 'Ruth Abiodun'];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const newAttendee = {
      id: `att_${Date.now()}`,
      name: randomName,
      handle: `@${randomName.toLowerCase().replace(/\s/g, '')}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tier: Math.random() > 0.5 ? 'Disciple' : 'Seeker',
      avatar: randomName.charAt(0)
    };

    setAttendanceRoster(prev => [newAttendee, ...prev]);
    alert(`Roster Updated: ${randomName} just checked in and claimed +5 KPC!`);
  };
// --- MINISTRY TIMELINE STATE & HANDLERS ---
  const [ministryTimeline, setMinistryTimeline] = useState([
    {
      id: 'tl_1',
      category: 'DEVOTIONAL',
      title: 'Walking in Unshakable Authority',
      content: 'When the storms arise, do not look at the waves—look to the Word. Your authority in Christ is not based on your feelings today, but on the finished work of the Cross. Declare peace over your household this week!',
      time: '3h ago',
      likes: 0,
      comments: 0,
      tipsReceived: 0,
      isPinned: true,
      isLiked: false
    },
    {
      id: 'tl_2',
      category: 'ANNOUNCEMENT',
      title: 'Midweek Bible Study & Communion',
      content: 'Join us this Wednesday at 7:00 PM GMT as we continue our deep dive into the Book of Romans. Prepare your communion elements if you are joining us via the live stream!',
      time: '1d ago',
      likes: 0,
      comments: 0,
      tipsReceived: 0,
      isPinned: false,
      isLiked: false
    },
    {
      id: 'tl_3',
      category: 'SERMON RELEASE',
      title: 'The Power of Grace (Full Video Available)',
      content: 'Did you miss Sunday’s gathering? The full 45-minute ministration is now live on the Believer Media Hub. Watch, take notes, and share the link with someone who needs encouragement today.',
      time: '3d ago',
      likes: 0,
      comments: 0,
      tipsReceived: 0,
      isPinned: false,
      isLiked: true
    }
  ]);

  // Simulate boosting or liking a timeline post
  const handleTimelineLikeToggle = (postId) => {
    setMinistryTimeline(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  // Allow pastor to pin a post to the top of their feed
  const handleTogglePinPost = (postId) => {
    setMinistryTimeline(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, isPinned: !post.isPinned };
      }
      return post;
    }));
    alert("Post pin status updated on your ministry timeline!");
  };
// --- TARGETED VISION CAMPAIGNS STATE ---
  const [visionCampaigns, setVisionCampaigns] = useState([
    {
      id: 'camp_1',
      title: 'New Sanctuary Air Conditioning & Sound System',
      category: 'BUILDING FUND',
      desc: 'Upgrading our main auditorium cooling and acoustic speakers to accommodate our growing 9:00 AM Sunday attendance.',
      raised: 3450,
      target: 5000,
      donorsCount: 42,
      daysLeft: 14,
      isUrgent: true
    },
    {
      id: 'camp_2',
      title: 'Annual Youth Summer Retreat & Outreach Bus',
      category: 'MISSIONS',
      desc: 'Sponsoring transportation, feeding, and lodging for 150 teenagers attending our 3-day discipleship camp.',
      raised: 1200,
      target: 2500,
      donorsCount: 19,
      daysLeft: 28,
      isUrgent: false
    },
    {
      id: 'camp_3',
      title: 'Community Food Bank & Widow Support',
      category: 'BENEVOLENCE',
      desc: 'Providing bags of rice, basic medical supplies, and financial grants to 50 elderly widows in our local community.',
      raised: 4800,
      target: 5000,
      donorsCount: 68,
      daysLeft: 5,
      isUrgent: true
    }
  ]);

  // Simulate a believer sowing into a specific campaign
  const handleSowIntoCampaign = (campaignId, campaignTitle) => {
    const sowAmount = 100; // Default test sowing amount
    if (kpcBalance < sowAmount) {
      alert(`Insufficient balance! You need at least ${sowAmount} KPC in your vault to sow.`);
      return;
    }

    if (window.confirm(`Sow ${sowAmount} KPC from your vault into "${campaignTitle}"?`)) {
      setKpcBalance(prev => prev - sowAmount);
      setVisionCampaigns(prev => prev.map(camp => {
        if (camp.id === campaignId) {
          return {
            ...camp,
            raised: camp.raised + sowAmount,
            donorsCount: camp.donorsCount + 1
          };
        }
        return camp;
      }));
      logTransaction(`Sowed into: ${campaignTitle.substring(0, 20)}...`, -sowAmount, 'SPEND');
      alert(` Hallelujah! Your ${sowAmount} KPC seed has been deposited into the campaign escrow.`);
    }
  };


// --- CHAT HUB STATE ---
  const [hubTab, setHubTab] = useState('CHATS');
  
  // Sub-tabs for filtering
  const [chatSubTab, setChatSubTab] = useState('ALL');
  const [peopleSubTab, setPeopleSubTab] = useState('GLOBAL');
  const [peopleSearch, setPeopleSearch] = useState('');
  
  const [activeChat, setActiveChat] = useState(null);
  const [chatInputMessage, setChatInputMessage] = useState('');
  const [messageIntent, setMessageIntent] = useState('NORMAL');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);

  // Real Database Structure (conversations table)
  const [chatInbox, setChatInbox] = useState([
    { id: 'c1', type: 'dm', intent: 'NORMAL', name: 'Sister Abigail', lastMsg: 'Amen! See you at Bible study 🙏', time: '2m', unread: 3, status: 'online', avatar: null },
    { id: 'c2', type: 'dm', intent: 'COUNSELING', name: 'Pastor Emeka', lastMsg: 'Grace and peace to you today.', time: '1h', unread: 0, status: 'offline', lastSeen: '10:45 AM', avatar: null },
    { id: 'c3', type: 'dm', intent: 'URGENT PRAYER', name: 'Brother David', lastMsg: 'Please stand with me in prayer...', time: '3h', unread: 1, status: 'online', avatar: null }
  ]);

  // Real Database Structure (friends & requests tables)
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([
    { id: 'req_1', email: 'joshua@kingdom.com', name: 'Joshua Adeyemi', handle: '@josh_a', avatar: null }
  ]);

  const [activeConversation, setActiveConversation] = useState([
    { id: 1, sender: 'Sister Abigail', text: 'It will help you know what to read and when to expect the prayer meeting.', time: '7:40 AM', isMe: false },
    { id: 2, sender: 'You', text: 'Thank you, very helpful!', time: '10:19 PM', isMe: true }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInputMessage.trim()) return;
    setActiveConversation(prev => [
      ...prev, 
      { id: Date.now(), sender: 'You', text: chatInputMessage, intent: messageIntent, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: true }
    ]);
    setChatInputMessage('');
    setMessageIntent('NORMAL');
  };

  const handleAddFriend = (dbUser) => {
    const isAlreadyFriend = friendsList.some(f => f.email === dbUser.email);
    if (isAlreadyFriend) {
      alert(`${dbUser.formData?.fullName || 'User'} is already in your Contacts.`);
      return;
    }
    const newFriend = { id: dbUser.email, email: dbUser.email, name: dbUser.formData?.fullName || 'Believer', handle: `@${dbUser.formData?.username || dbUser.email.split('@')[0]}`, avatar: dbUser.formData?.avatar || null, status: 'online' };
    setFriendsList(prev => [...prev, newFriend]);
    alert(`🎉 ${newFriend.name} added to your Friends list!`);
  };

// --- KINGDOMPLUS PROFILE MODAL STATE ---
  const [selectedProfile, setSelectedProfile] = useState(null);

useEffect(() => {
  let timer;
  if (activeNewsArticle && !claimedArticles[activeNewsArticle.id]) {
    timer = setTimeout(() => {
      const reward = activeNewsArticle.reward || 5;
      setKpcBalance(prev => prev + reward);
      setClaimedArticles(prev => ({ ...prev, [activeNewsArticle.id]: true }));
      logTransaction(`Read News: ${activeNewsArticle.title.substring(0, 15)}...`, reward, 'EARN');
      
      alert(`Hallelujah! You earned ${reward} KPC for reading: ${activeNewsArticle.title}!`);
    }, 10000);
  }
  return () => clearTimeout(timer);
}, [activeNewsArticle, claimedArticles]);

const [newsArticles, setNewsArticles] = useState(newsData);

useEffect(() => {
  if (currentUser) {
    localStorage.setItem(`kp_notifs_${currentUser.id}`, JSON.stringify(notifications));
  }
}, [notifications, currentUser]);

// ==========================================
      //ADMIN DESK STATES & FUNCTIONS
  // ==========================================

  const [isAdmin, setIsAdmin] = useState(true); 
  const [profileTab, setProfileTab] = useState('All');
  const [userProfile, setUserProfile] = useState(null);
  const [authUserId, setAuthUserId] = useState(null);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const getEffectiveMembershipTier = (profile) => {
  const tier =
    profile?.membership_tier ||
    currentUser?.membership_tier ||
    userTier;

  if (
    tier === 'Standard' ||
    tier === 'Disciple' ||
    tier === 'Apostle'
  ) {
    return tier;
  }

  if (profile?.account_type === 'Apostle') {
    return 'Apostle';
  }

  if (profile?.account_type === 'Premium') {
    return 'Disciple';
  }

  if (profile?.account_type === 'Ministry') {
    return 'Disciple';
  }

  return 'Standard';
};

const hasDiscipleAccess = (profile) => {
  const tier = getEffectiveMembershipTier(profile);

  return (
    tier === 'Disciple' ||
    tier === 'Apostle'
  );
};

const hasApostleAccess = (profile) => {
  return getEffectiveMembershipTier(profile) === 'Apostle';
};

  useEffect(() => {
    if (!authReady) return;
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;

        if (user) {
          setAuthUserId(user.id);
          const {
  data: profileData,
  error: profileError
} = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user.id)
  .maybeSingle();

if (profileError) {
  throw profileError;
}

if (!profileData) {
  throw new Error(
    'KingdomPlus profile not found.'
  );
}

const normalizedProfile = {
  ...profileData,

  account_type:
    profileData.account_type === 'Ministry'
      ? 'Ministry'
      : 'User',

  membership_tier:
    profileData.account_type === 'Ministry'
      ? (
          profileData.membership_tier ||
          'Disciple'
        )
      : (
          profileData.membership_tier ||
          'Standard'
        )
};

setUserProfile(normalizedProfile);
        }
      } catch (error) {
        console.error("Error fetching real profile data:", error.message);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [authReady]);

  const followedMinistries = [
    { id: 1, name: "Grace Sanctuary", isMain: true, img: "⛪" },
    { id: 2, name: "Elevation", isMain: false, img: "🔥" },
    { id: 3, name: "Hillsong", isMain: false, img: "🕊️" }
  ];

// ==========================================
  // PROFILE EDIT & UPLOAD STATES
  // ==========================================
  const wallpaperInputRef = useRef(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});

  const openEditModal = () => {
    setEditForm(userProfile);
    setIsEditingProfile(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveProfileUpdates = async () => {
    try {

      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('user_profiles')
        .update(editForm)
        .eq('id', user.id);
      if (error) throw error;      

      setUserProfile(editForm);
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update profile.");
    }
  };

  const handleImageSelect = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setUserProfile((prevProfile) => ({
      ...prevProfile,
      [type]: localPreviewUrl
    }));

    console.log(`Image selected for ${type}. Ready to upload!`);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Authentication error:", authError);
        alert("You must be logged in to upload images.");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('status_media').upload(fileName, file);
      
      if (!uploadError) {
         const { data } = supabase.storage.from('status_media').getPublicUrl(fileName);
         const publicUrl = data.publicUrl;
         console.log("Successfully uploaded! Public URL:", publicUrl);
         
         const { error: dbUpdateError } = await supabase
           .from('user_profiles')
           .update({ [type]: publicUrl })
           .eq('id', user.id);

         if (dbUpdateError) {
           console.error("Error saving URL to profile:", dbUpdateError);
           alert("Image uploaded, but failed to save to your profile.");
         }
         
      } else {
         console.error("Error uploading to storage:", uploadError);
         alert(`Upload Failed: ${uploadError.message || uploadError.error}\n\nCheck the browser console for more details.`);
      }
    } catch (error) {
      console.error("Unexpected error during upload:", error);
    }
  };

// ==========================================
  // SERVICES & MARKETPLACE STATES
  // ==========================================
  const [userServices, setUserServices] = useState([]);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({ title: '', desc: '', price: '' });

  const handleOpenAddService = () => {
    const isStandard = userProfile?.account_type?.toLowerCase() === 'standard' || !userProfile?.account_type;
    
    if (isStandard && userServices.length >= 1) {
      alert("Standard accounts can only list 1 service. Upgrade your account to list unlimited services!");
      return;
    }
    setIsAddServiceModalOpen(true);
  };

  const handleSaveService = async () => {
    if (!newServiceForm.title || !newServiceForm.price) {
      alert("Title and Price are required.");
      return;
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Must be logged in.");

      const { error: insertError } = await supabase.from('services').insert([{ 
        provider_id: user.id, 
        title: newServiceForm.title, 
        description: newServiceForm.desc, 
        price_kpc: Number(newServiceForm.price) 
      }]);
      
      if (insertError) throw insertError;

      const newService = {
        id: Date.now().toString(),
        title: newServiceForm.title,
        desc: newServiceForm.desc,
        price: Number(newServiceForm.price)
      };
      
      setUserServices([...userServices, newService]);
      setIsAddServiceModalOpen(false);
      setNewServiceForm({ title: '', desc: '', price: '' });
      alert("Service published to the Kingdom!");

    } catch (error) {
      console.error("Error adding service:", error.message);
      alert("Failed to add service. Check your connection.");
    }
  };

const handlePurchaseService = async (service) => {
    const confirmPurchase = window.confirm(`Are you sure you want to pay ${service.price} KPC to request: ${service.title}?`);
    if (!confirmPurchase) return;

    console.log(`Initiating KPC transaction for ${service.price}...`);
    
    setTimeout(() => {
      alert(`Successfully paid ${service.price} KPC! The provider has been notified of your request.`);
    }, 1500);
  };

// ==========================================
  // FEED & POST STATES
  // ==========================================
  const [globalPosts, setGlobalPosts] = useState([]);
  const [isFetchingPosts, setIsFetchingPosts] = useState(true);

  const fetchPosts = async () => {
    setIsFetchingPosts(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(` *, user_profiles:author_id (full_name, username, avatar_url, account_type, local_church) `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGlobalPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsFetchingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

// ==========================================
  // FEED POST CREATION STATES
  // ==========================================
  const postMediaInputRef = useRef(null);
  const [newPostText, setNewPostText] = useState("");
  const [postMediaFile, setPostMediaFile] = useState(null);
  const [postMediaPreview, setPostMediaPreview] = useState(null);

  const handlePostMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPostMediaFile(file);
    setPostMediaPreview(URL.createObjectURL(file));
  };

  const removePostMedia = () => {
    setPostMediaFile(null);
    setPostMediaPreview(null);
    if (postMediaInputRef.current) postMediaInputRef.current.value = "";
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim() && !postMediaFile) return;

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert("You must be logged in to post.");
        return;
      }

      let mediaUrl = null;

      if (postMediaFile) {
        const fileExt = postMediaFile.name.split('.').pop();
        const fileName = `post-${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('image').upload(fileName, postMediaFile);
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('image').getPublicUrl(fileName);
        mediaUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase.from('posts').insert([{
        author_id: user.id,
        content: newPostText,
        image_url: mediaUrl
      }]);

      if (insertError) throw insertError;

      const newPostLocal = {
        id: Date.now(),
        author_id: user.id,
        content: newPostText,
        image_url: mediaUrl,
        created_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0,
        user_profiles: {
          username: userProfile?.username || 'You',
          full_name: userProfile?.full_name || 'You',
          avatar_url: userProfile?.avatar_url
        }
      };
      
      setGlobalPosts([newPostLocal, ...globalPosts]);
      setNewPostText("");
      removePostMedia();
      fetchPosts();
      
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to publish post.");
    }
  };

// ==========================================
  // PUBLIC PROFILE VIEW LOGIC
  // ==========================================
  const [viewedProfile, setViewedProfile] = useState(null);
  const [viewedUserServices, setViewedUserServices] = useState([]);

  const handleViewProfile = async (eOrAuthorId, entity) => {
    if (entity) {
      if (eOrAuthorId && typeof eOrAuthorId.stopPropagation === 'function') {
        eOrAuthorId.stopPropagation();
      }
      
      const isDBUser = !!entity.email && !entity.id?.startsWith('c');
      setSelectedProfile({
        id: entity.id || entity.email,
        name: isDBUser ? (entity.formData?.fullName || 'Believer') : entity.name,
        handle: isDBUser ? `@${entity.formData?.username || entity.email?.split('@')[0]}` : entity.handle,
        avatar: isDBUser ? entity.formData?.avatar : entity.avatar,
        isMinistry: entity.type === 'Ministry Groups' || entity.intent === 'COUNSELING' || entity.accountType === 'Minister',
        originalData: entity
      });
      return;
    }

    const authorId = eOrAuthorId; 
    
    try {
      const currentUserResponse = await supabase.auth.getUser();
      const currentUser = currentUserResponse.data?.user;
      
      if (currentUser && authorId === currentUser.id) {
        setStep(18);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authorId)
        .single();

      if (profileError) throw profileError;
      setViewedProfile(profileData);

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', authorId);

      if (!servicesError) {
        setViewedUserServices(servicesData || []);
      }

      setProfileTab('All'); 
      setStep(25);

    } catch (error) {
      console.error("Error loading public profile:", error);
      alert("Could not load this user's profile.");
    }
  };

  
  const videoRef = useRef(null);

const loadKpcBalanceFromSupabase = async () => {
  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error while loading KPC balance:", authError);
      return;
    }

    if (!user) {
      console.log("No authenticated user found.");
      return;
    }

    let profile = null;
    const { data: userProfile, error: userProfileError } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .maybeSingle();

    if (userProfileError) {
      console.error(
        "Error checking user_profiles:",
        userProfileError
      );
    }

    if (userProfile) {
      profile = userProfile;
    } else {
      const { data: churchProfile, error: churchProfileError } =
        await supabase
          .from('church_profiles')
          .select('wallet_balance')
          .eq('id', user.id)
          .maybeSingle();

      if (churchProfileError) {
        console.error(
          "Error checking church_profiles:",
          churchProfileError
        );
      }

      if (churchProfile) {
        profile = churchProfile;
      }
    }

    if (!profile) {
      console.warn(
        "No profile found for authenticated user:",
        user.id
      );
      return;
    }

    const databaseBalance = Number(profile.wallet_balance || 0);

    console.log(
      "KPC balance loaded from Supabase:",
      databaseBalance
    );

    setKpcBalance(databaseBalance);
    const savedUser = localStorage.getItem('kp_current_user');

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);

        localStorage.setItem(
          'kp_current_user',
          JSON.stringify({
            ...parsedUser,
            wallet_balance: databaseBalance,
            kpcBalance: databaseBalance
          })
        );
      } catch (storageError) {
        console.error(
          "Could not update localStorage:",
          storageError
        );
      }
    }

    setBalanceLoaded(true);

  } catch (error) {
    console.error(
      "Failed to load KPC balance from Supabase:",
      error
    );
  }
};

useEffect(() => {
  if (!authReady) return;

  loadKpcBalanceFromSupabase();
}, [authReady]);

  const fetchWalletData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('user_profiles').select('wallet_balance').eq('id', user.id).single();
      if (profile) setKpcBalance(profile.wallet_balance || 0);

      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (txs) {
        const formattedTxs = txs.map(tx => {
          const isEarned = tx.receiver_id === user.id;
          return {
            id: tx.id,
            amount: tx.amount,
            type: tx.tx_type,
            title: tx.title,
            date: new Date(tx.created_at).toLocaleDateString(),
            isPositive: isEarned
          };
        });
        setTxHistory(formattedTxs);
      }
    } catch (error) {
      console.error("Error loading wallet:", error);
    }
  };

  useEffect(() => {
    if (step === 11) fetchWalletData();
  }, [step]);

  const handleLiveTransfer = async (e) => {
    e.preventDefault();
    setIsTransferring(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const amount = Number(transferAmount);

      if (amount <= 0 || amount > kpcBalance) {
        alert("Invalid transfer amount.");
        setIsTransferring(false);
        return;
      }

      const { data, error } = await supabase.rpc('transfer_kpc', {
        sender_uuid: user.id,
        receiver_handle: transferUsername.replace('@', ''),
        transfer_amount: amount,
        tx_title: `Sent to ${transferUsername}`,
        transaction_type: 'TRANSFER'
      });

      if (error) throw error;

      alert(`Successfully sent ${amount} KPC to ${transferUsername}!`);
      setTransferUsername('');
      setTransferAmount('');
      setActiveModal(null);
      fetchWalletData();

    } catch (error) {
      console.error("Transfer failed:", error);
      alert(error.message || "Transfer failed. Please check the username.");
    } finally {
      setIsTransferring(false);
    }
  };

  useEffect(() => {
    if (activeModal === 'scan' && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => { videoRef.current.srcObject = stream; })
        .catch(err => console.error("Camera error:", err));
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeModal]);

  const downloadQR = async () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${userProfile?.full_name || 'Church'}&color=101926`;
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Church_Kingdom_QR.png';
    link.click();
  };

// ==========================================
  // KINGDOM HUB & BIBLE API STATES
  // ==========================================
  const [selectedDevotion, setSelectedDevotion] = useState(null);
  const [readDevotionsList, setReadDevotionsList] = useState([]);
  const [isAddDevotionModalOpen, setIsAddDevotionModalOpen] = useState(false);
  const [newDevotionForm, setNewDevotionForm] = useState({ title: '', scripture: '', body: '', reward: 5 });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Live Bible API States
  const [selectedBook, setSelectedBook] = useState('Psalms');
  const [selectedChapter, setSelectedChapter] = useState(23);
  const [bibleVerses, setBibleVerses] = useState([]);
  const [isLoadingBible, setIsLoadingBible] = useState(false);
  const [hasClaimedChapter, setHasClaimedChapter] = useState(false);

  const bibleBooks = [
    "Genesis", "Exodus", "Leviticus", "Numbers",  "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentation", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "Revelation"
  ];

  const fetchBibleChapter = async (book, chapter) => {
    setIsLoadingBible(true);
    setHasClaimedChapter(false);
    try {
      const response = await fetch(`https://bible-api.com/${book}+${chapter}?translation=kjv`);
      const data = await response.json();
      if (data.verses) {
        setBibleVerses(data.verses);
      } else {
        setBibleVerses([]);
      }
    } catch (error) {
      console.error("Error fetching Bible API:", error);
    } finally {
      setIsLoadingBible(false);
    }
  };

  useEffect(() => {
    if (kingdomTab === 'Bible') {
      fetchBibleChapter(selectedBook, selectedChapter);
    }
  }, [selectedBook, selectedChapter, kingdomTab]);

  const handleCompleteDevotion = async (devotion) => {
    if (readDevotionsList.includes(devotion.id)) {
      alert("You have already claimed rewards for this devotion today!");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const rewardAmount = devotion.reward || 5;

      await supabase.from('user_profiles').update({
        kpc_balance: (kpcBalance || 0) + rewardAmount,
        devotions_read: (userProfile?.devotions_read || 0) + 1
      }).eq('id', user.id);

      await supabase.from('transactions').insert([{
        sender_id: user.id,
        receiver_id: user.id,
        amount: rewardAmount,
        tx_type: 'EARN',
        title: `Completed Devotion: ${devotion.title}`
      }]);

      setKpcBalance(prev => prev + rewardAmount);
      setUserProfile(prev => ({ ...prev, devotions_read: (prev?.devotions_read || 0) + 1 }));
      setReadDevotionsList([...readDevotionsList, devotion.id]);
      setSelectedDevotion(null);
      alert(`Praise God! You earned +${rewardAmount} KPC for completing today's devotion.`);

    } catch (error) {
      console.error("Error claiming devotion reward:", error);
    }
  };

    const claimBibleReward = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const rewardAmount = 5;

      await supabase.from('user_profiles').update({
        kpc_balance: (kpcBalance || 0) + rewardAmount
      }).eq('id', user.id);

      await supabase.from('transactions').insert([{
        sender_id: user.id,
        receiver_id: user.id,
        amount: rewardAmount,
        tx_type: 'EARN',
        title: `Read ${selectedBook} Chapter ${selectedChapter}`
      }]);

      setKpcBalance(prev => prev + rewardAmount);
      setHasClaimedChapter(true);
      alert(`Chapter reward claimed! +5 KPC added to your Treasury.`);

    } catch (error) {
      console.error("Error claiming Bible reward:", error);
    }
  };

// ==========================================
  // BOOKSTORE STATES
  // ==========================================
  const [selectedStoreBook, setSelectedStoreBook] = useState(null);
  const [isReadingBook, setIsReadingBook] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  
  const [newBookForm, setNewBookForm] = useState({
  title: '',
  author: '',
  desc: '',
  price: '',
  isFree: false,
  coverFile: null,
  pdfFile: null,
  coverPreview: '',
  coverUrl: '',
  pdfUrl: ''
});

const [isUploadingBook, setIsUploadingBook] = useState(false);
const handleBookFileSelect = async (event, fileType) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (fileType === 'cover') {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file for the book cover.');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      alert('Cover image must be less than 30MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setNewBookForm(prev => ({
      ...prev,
      coverFile: file,
      coverPreview: previewUrl
    }));

    return;
  }

  if (fileType === 'pdf') {
    const allowedTypes = [
      'application/pdf',
      'application/epub+zip'
    ];

    const fileName = file.name.toLowerCase();

    const validExtension =
      fileName.endsWith('.pdf') ||
      fileName.endsWith('.epub');

    if (!allowedTypes.includes(file.type) && !validExtension) {
      alert('Please select a PDF or EPUB file.');
      return;
    }

    if (file.size > 70 * 1024 * 1024) {
      alert('Book file must be less than 70MB.');
      return;
    }

    setNewBookForm(prev => ({
      ...prev,
      pdfFile: file
    }));

    return;
  }
};

const openKingdomBook = async (book) => {
  try {
    if (!book?.bookFilePath) {
      alert("This book does not have a book file attached.");
      return;
    }

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) throw authError;

    if (!user) {
      alert("Please log in to read this book.");
      return;
    }

    const {
      data,
      error
    } = await supabase.storage
      .from('book_files')
      .createSignedUrl(
        book.bookFilePath,
        60 * 60
      );

    if (error) throw error;

    if (!data?.signedUrl) {
      throw new Error("Could not create a secure book URL.");
    }

    setSelectedStoreBook({
      ...book,
      pdfUrl: data.signedUrl
    });

    setIsReadingBook(true);

  } catch (error) {

    console.error(
      "Unable to open Kingdom book:",
      error
    );

    alert(
      `Unable to open book: ${
        error?.message || 'Unknown error'
      }`
    );

  }
};


// ==========================================
  // KINGDOMPLUS MESSENGER STATES (LIVE)
  // ==========================================
  const [dbChats, setDbChats] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [activeDbChat, setActiveDbChat] = useState(null);
  const [dbMessages, setDbMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState("");
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);
  const [isGroupMembersOpen, setIsGroupMembersOpen] = useState(false);
  const [groupEditName, setGroupEditName] = useState('');
  const [groupEditDesc, setGroupEditDesc] = useState('');
  const [groupEditAvatar, setGroupEditAvatar] = useState('');
  const [isUploadingGroupAvatar, setIsUploadingGroupAvatar] = useState(false);

  const [groupMembers, setGroupMembers] = useState([]);


const fetchMessengerData = async () => {
  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) return;

    const {
      data: myParticipants,
      error: participantError
    } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', user.id);

    if (participantError) throw participantError;

    const chatIds = [
      ...new Set(
        (myParticipants || []).map(
          participant => participant.chat_id
        )
      )
    ];

    let myChats = [];

    if (chatIds.length > 0) {
      const {
        data,
        error: chatError
      } = await supabase
        .from('chats')
        .select(`
          *,
          chat_participants(
            user_id,
            user_profiles(
              id,
              full_name,
              username,
              avatar_url
            )
          )
        `)
        .in('id', chatIds)
        .order('created_at', {
          ascending: false
        });

      if (chatError) throw chatError;

      myChats = data || [];
    }

    const uniqueChats = new Map();

    for (const chat of myChats) {

      if (chat.type === 'group') {

        uniqueChats.set(
          `group:${chat.id}`,
          chat
        );

      } else {

        const otherParticipant =
          chat.chat_participants?.find(
            participant =>
              participant.user_id !== user.id
          );

        const otherUserId =
          otherParticipant?.user_id;

        if (otherUserId) {

          const key = `private:${otherUserId}`;

          if (!uniqueChats.has(key)) {
            uniqueChats.set(key, chat);
          }

        } else {

          uniqueChats.set(
            `chat:${chat.id}`,
            chat
          );
        }
      }
    }

const enrichedChats = await Promise.all(
  Array.from(uniqueChats.values()).map(async (chat) => {
    try {
      const {
        data: latestMessages,
        error: latestError
      } = await supabase
        .from('messages')
        .select(`
          id,
          chat_id,
          sender_id,
          content,
          intent,
          created_at,
          is_read,
          sender:sender_id(
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('chat_id', chat.id)
        .order('created_at', {
          ascending: false
        })
        .limit(1);

      if (latestError) {
        console.error(
          'Failed to load latest message:',
          latestError
        );
      }

      const latestMessage =
        latestMessages?.[0] || null;

      const {
        count: unreadCount,
        error: unreadError
      } = await supabase
        .from('messages')
        .select('*', {
          count: 'exact',
          head: true
        })
        .eq('chat_id', chat.id)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (unreadError) {
        console.error(
          'Failed to load unread count for chat:',
          chat.id,
          unreadError
        );
      }

      return {
        ...chat,
        last_message: latestMessage,
        unread_count: unreadCount || 0
      };

    } catch (error) {
      console.error(
        'Failed to enrich chat:',
        chat.id,
        error
      );

      return {
        ...chat,
        last_message: null,
        unread_count: 0
      };
    }
  })
);

enrichedChats.sort((a, b) => {
  const aDate =
    a.last_message?.created_at ||
    a.created_at ||
    0;

  const bDate =
    b.last_message?.created_at ||
    b.created_at ||
    0;

  return (
    new Date(bDate) -
    new Date(aDate)
  );
});

setDbChats(enrichedChats);

    const {
      data: groups,
      error: groupsError
    } = await supabase
      .from('chats')
      .select('*')
      .eq('type', 'group')
      .order('created_at', {
        ascending: false
      });

    if (groupsError) throw groupsError;

    setPublicGroups(groups || []);

  } catch (error) {
    console.error(
      'Error fetching messenger data:',
      error
    );
  }
};

  useEffect(() => {
    if (step === 23) fetchMessengerData();
  }, [step]);

useEffect(() => {
  if (!activeDbChat) {
    setDbMessages([]);
    return;
  }

  let isMounted = true;

  const fetchMessages = async () => {
    try {

      const {
        data,
        error
      } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('chat_id', activeDbChat.id)
        .order('created_at', {
          ascending: true
        });

      if (error) throw error;

      if (isMounted) {
        setDbMessages(data || []);
      }

    } catch (error) {
      console.error(
        'Error loading chat messages:',
        error
      );

      if (isMounted) {
        setDbMessages([]);
      }
    }
  };

  fetchMessages();

const markChatAsRead = async () => {
  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user || !activeDbChat?.id) return;

    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true
      })
      .eq('chat_id', activeDbChat.id)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    if (error) throw error;

    setUnreadChatCount(0);

  } catch (error) {
    console.error(
      'Failed to mark chat messages as read:',
      error
    );
  }
};

markChatAsRead();

  const channel = supabase
    .channel(`chat_${activeDbChat.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${activeDbChat.id}`
      },
      async (payload) => {

        try {

          const {
            data: senderProfile
          } = await supabase
            .from('user_profiles')
            .select(`
              id,
              full_name,
              username,
              avatar_url
            `)
            .eq('id', payload.new.sender_id)
            .single();

          const newMessage = {
            ...payload.new,
            sender: senderProfile || null
          };

          if (!isMounted) return;

          setDbMessages(prev => {

            if (
              prev.some(
                msg => msg.id === newMessage.id
              )
            ) {
              return prev;
            }

            return [...prev, newMessage];
          });

        } catch (error) {
          console.error(
            'Realtime message profile error:',
            error
          );
        }
      }
    )
    .subscribe();

  return () => {
    isMounted = false;
    supabase.removeChannel(channel);
  };

}, [activeDbChat?.id]);

useEffect(() => {
  if (!activeDbChat) return;

  const scrollToLatestMessage = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'auto',
      block: 'end'
    });
  };

  requestAnimationFrame(scrollToLatestMessage);
}, [activeDbChat?.id, dbMessages.length]);


const handleSendDbMessage = async (e) => {
  e?.preventDefault();

  const messageText = chatInputMessage.trim();

  if (!messageText || !activeDbChat) return;

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) throw authError;

    if (!user) {
      alert('You must be logged in to send messages.');
      return;
    }

    const messageIntentToSend = messageIntent;

    const {
      data: insertedMessage,
      error
    } = await supabase
      .from('messages')
      .insert([{
        chat_id: activeDbChat.id,
        sender_id: user.id,
        content: messageText,
        intent: messageIntentToSend
      }])
      .select(`
        *,
        sender:sender_id(
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    setDbMessages(prev => {
      if (
        prev.some(
          msg => String(msg.id) === String(insertedMessage.id)
        )
      ) {
        return prev;
      }

      return [
        ...prev,
        insertedMessage
      ];
    });

    setChatInputMessage('');
    setMessageIntent('NORMAL');

  } catch (error) {

    console.error(
      'Error sending message:',
      error
    );

    alert(
      `Failed to send message: ${
        error.message || 'Unknown error'
      }`
    );
  }
};

const handleDeleteDbMessage = async (messageId) => {
  if (!window.confirm("Delete this message?")) return;
  
  setDbMessages(prev => prev.filter(msg => msg.id !== messageId));

  try {
    await supabase.from('messages').delete().eq('id', messageId);
  } catch (error) {
    console.error("Error deleting message:", error);
    fetchMessengerData();
  }
};

const submitEditDbMessage = async (e, messageId) => {
  e?.preventDefault();
  if (!editMessageContent.trim()) return;

  setDbMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, content: editMessageContent } : msg));
  setEditingMessageId(null);

  try {
    await supabase.from('messages').update({ content: editMessageContent }).eq('id', messageId);
  } catch (error) {
    console.error("Error updating message:", error);
    fetchMessengerData();
  }
};

  const handleInitiateDirectChat = async (targetUser) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user.id === targetUser.id) return alert("You cannot DM yourself.");

      if (targetUser.dms_locked) {
        return alert(`🔒 ${targetUser.username} has locked their DMs to the public.`);
      }

      const { data: existingChats } = await supabase.rpc('check_existing_dm', { user1: user.id, user2: targetUser.id });
      
      const existingDm = dbChats.find(c => c.type === 'direct' && c.chat_participants.some(p => p.user_id === targetUser.id));
      
      if (existingDm) {
        setActiveDbChat(existingDm);
        return;
      }

      const { data: newChat, error: chatError } = await supabase.from('chats').insert([{ type: 'direct' }]).select().single();
      if (chatError) throw chatError;

      await supabase.from('chat_participants').insert([
        { chat_id: newChat.id, user_id: user.id },
        { chat_id: newChat.id, user_id: targetUser.id }
      ]);

      fetchMessengerData();
      setActiveDbChat(newChat);

    } catch (error) {
      console.error("Error creating DM:", error);
    }
  };

const getPublicProfileFriendStatus = async (targetUserId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !targetUserId || user.id === targetUserId) {
      return 'self';
    }

    const { data: friendship, error } = await supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status')
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!friendship) {
      return 'none';
    }

    if (friendship.status === 'accepted') {
      return 'friends';
    }

    if (
      friendship.status === 'pending' &&
      friendship.sender_id === user.id
    ) {
      return 'sent';
    }

    if (
      friendship.status === 'pending' &&
      friendship.receiver_id === user.id
    ) {
      return 'received';
    }

    return 'none';

  } catch (error) {
    console.error(
      'Error checking public profile friendship:',
      error
    );

    return 'none';
  }
};

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: newGroup, error } = await supabase.from('chats').insert([{
        type: 'group',
        name: newGroupName,
        description: newGroupDesc,
        created_by: user.id
      }]).select().single();

      if (error) throw error;

      await supabase.from('chat_participants').insert([{ chat_id: newGroup.id, user_id: user.id }]);

      setIsCreateGroupModalOpen(false);
      fetchMessengerData();
      alert("Kingdom Group created successfully!");
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

const openGroupSettings = () => {
  console.log('GROUP SETTINGS BUTTON CLICKED');

  if (!activeDbChat) {
    alert('No active group is selected.');
    return;
  }

  if (activeDbChat.type !== 'group') {
    alert('This is not a group chat.');
    return;
  }

  if (activeDbChat.created_by !== userProfile?.id) {
    alert('Only the group creator can edit this group.');
    return;
  }

  setGroupEditName(activeDbChat.name || '');
  setGroupEditDesc(activeDbChat.description || '');
  setGroupEditAvatar(activeDbChat.avatar_url || '');

  setIsGroupSettingsOpen(true);
};


const handleGroupAvatarUpload = async (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!activeDbChat || activeDbChat.type !== 'group') {
    alert('No active group selected.');
    return;
  }

  if (activeDbChat.created_by !== userProfile?.id) {
    alert('Only the group creator can change the group photo.');
    return;
  }

  if (!file.type.startsWith('image/')) {
    alert('Please select an image file.');
    return;
  }

  if (file.size > 15 * 1024 * 1024) {
    alert('Please choose an image smaller than 15 MB.');
    return;
  }

  setIsUploadingGroupAvatar(true);

  try {
    const localPreviewUrl = URL.createObjectURL(file);
    setGroupEditAvatar(localPreviewUrl);

    const fileExt =
      file.name.split('.').pop()?.toLowerCase() || 'jpg';

    const fileName =
      `group-${activeDbChat.id}-${Date.now()}.${fileExt}`;

    const filePath = `group-avatars/${fileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from('status_media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('status_media')
      .getPublicUrl(filePath);

    const publicUrl =
      publicUrlData?.publicUrl;

    if (!publicUrl) {
      throw new Error(
        'Supabase did not return a public image URL.'
      );
    }

    setGroupEditAvatar(publicUrl);

    console.log(
      'Group avatar uploaded:',
      publicUrl
    );

  } catch (error) {
    console.error(
      'Error uploading group avatar:',
      error
    );

    setGroupEditAvatar(
      activeDbChat?.avatar_url || ''
    );

    alert(
      `Group photo upload failed: ${
        error?.message || 'Unknown error'
      }`
    );

  } finally {
    setIsUploadingGroupAvatar(false);

    event.target.value = '';
  }
};

const saveGroupSettings = async () => {
  if (!activeDbChat || activeDbChat.type !== 'group') return;

  if (activeDbChat.created_by !== userProfile?.id) {
    alert("Only the group creator can edit this group.");
    return;
  }

  if (!groupEditName.trim()) {
    alert("Please enter a group name.");
    return;
  }

  try {
    const { data: updatedGroup, error } = await supabase
      .from('chats')
      .update({
        name: groupEditName.trim(),
        description: groupEditDesc.trim(),
        avatar_url: groupEditAvatar.trim() || null
      })
      .eq('id', activeDbChat.id)
      .eq('created_by', userProfile.id)
      .select()
      .single();

    if (error) throw error;

    setActiveDbChat(updatedGroup);

    setDbChats(prev =>
      prev.map(chat =>
        chat.id === updatedGroup.id
          ? { ...chat, ...updatedGroup }
          : chat
      )
    );

    setPublicGroups(prev =>
      prev.map(group =>
        group.id === updatedGroup.id
          ? { ...group, ...updatedGroup }
          : group
      )
    );

    setIsGroupSettingsOpen(false);

    alert("Group updated successfully.");
  } catch (error) {
    console.error("Error updating group:", error);
    alert("Failed to update group.");
  }
};

const openGroupMembers = () => {
  console.log('GROUP MEMBERS BUTTON CLICKED');

  if (!activeDbChat) {
    alert('No active group is selected.');
    return;
  }

  if (activeDbChat.type !== 'group') {
    alert('This is not a group chat.');
    return;
  }


  const loadedChat = dbChats.find(
    chat => chat.id === activeDbChat.id
  );

  const participants =
    loadedChat?.chat_participants || [];

  setGroupMembers(participants);
  setIsGroupMembersOpen(true);
};

  const toggleDMLock = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const newStatus = !userProfile.dms_locked;
      
      await supabase.from('user_profiles').update({ dms_locked: newStatus }).eq('id', user.id);
      setUserProfile(prev => ({ ...prev, dms_locked: newStatus }));
      alert(newStatus ? "🔒 Your DMs are now locked." : "🔓 Your DMs are open to the Kingdom.");
    } catch (error) {
      console.error("Error toggling DM lock:", error);
    }
  };

useEffect(() => {
  if (step === 23) {
    fetchMessengerData();
    fetchGlobalUsers();
    fetchConnections();
  }
}, [step]);

// ==========================================
  // NOTIFICATION STATES
  // ==========================================
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  
  const stepRef = useRef(step);
  
  useEffect(() => {
    stepRef.current = step;
    if (step === 23) setUnreadChatCount(0);
  }, [step]);

 useEffect(() => {
  if (!authReady) return;
  let globalSub = null;
  let isMounted = true;

  const initNotificationListener = async () => {
    try {
      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user || !isMounted) return;

      const { data: myChatParticipants, error: chatError } =
        await supabase
          .from('chat_participants')
          .select('chat_id')
          .eq('user_id', user.id);

      if (chatError) {
        console.error('Error loading notification chat memberships:', chatError);
        return;
      }

      const myChatIds = (myChatParticipants || []).map(
        participant => participant.chat_id
      );

      if (myChatIds.length === 0) {
        setUnreadChatCount(0);
      } else {
        const { count, error: unreadError } = await supabase
          .from('messages')
          .select('*', {
            count: 'exact',
            head: true
          })
          .in('chat_id', myChatIds)
          .neq('sender_id', user.id)
          .eq('is_read', false);

        if (unreadError) {
          console.error('Error loading unread messages:', unreadError);
        } else {
          setUnreadChatCount(count || 0);
        }
      }

      if (!isMounted) return;

      const channelName =
        `chat-notifications-${user.id}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

      const channel = supabase.channel(channelName);
      globalSub = channel;

      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          try {
            if (!isMounted) return;

            const newMessage = payload.new;

            if (!newMessage) return;

            if (newMessage.sender_id === user.id) return;

            if (!myChatIds.includes(newMessage.chat_id)) return;

            console.log('🔔 LIVE MESSAGE NOTIFICATION:', newMessage);

            const { data: senderProfile } = await supabase
              .from('user_profiles')
              .select(`
                id,
                full_name,
                username,
                avatar_url
              `)
              .eq('id', newMessage.sender_id)
              .single();

            const completeMessage = {
              ...newMessage,
              sender: senderProfile || null
            };

            setDbChats(prevChats => {
              const updatedChats = prevChats.map(chat => {
                if (chat.id !== newMessage.chat_id) {
                  return chat;
                }

                return {
                  ...chat,
                  last_message: completeMessage,
                  unread_count:
                    (Number(chat.unread_count) || 0) + 1
                };
              });

              updatedChats.sort((a, b) => {
                const aTime =
                  a.id === newMessage.chat_id
                    ? newMessage.created_at
                    : (
                        a.last_message?.created_at ||
                        a.created_at ||
                        0
                      );

                const bTime =
                  b.id === newMessage.chat_id
                    ? newMessage.created_at
                    : (
                        b.last_message?.created_at ||
                        b.created_at ||
                        0
                      );

                return new Date(bTime) - new Date(aTime);
              });

              return updatedChats;
            });

            setUnreadChatCount(prev => prev + 1);

          } catch (error) {
            console.error(
              'Error handling live chat notification:',
              error
            );
          }
        }
      );

      channel.subscribe((status) => {
        if (!isMounted) return;

        console.log(
          'Chat notification subscription:',
          status
        );
      });

    } catch (error) {
      console.error(
        'Error initializing chat notification listener:',
        error
      );
    }
  };

  initNotificationListener();

  return () => {
    isMounted = false;

    if (globalSub) {
      supabase.removeChannel(globalSub);
      globalSub = null;
    }
  };
}, [authReady]);


const [globalUsers, setGlobalUsers] = useState([]);
const [incomingRequests, setIncomingRequests] = useState([]);
const [sentRequests, setSentRequests] = useState([]);
const [friends, setFriends] = useState([]);

const fetchGlobalUsers = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .neq('id', user.id)
    .limit(100);
    
  if (data) setGlobalUsers(data);
};

const fetchConnections = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: incoming } = await supabase
    .from('friend_requests')
    .select('*, sender:user_profiles!sender_id(*)')
    .eq('receiver_id', user.id)
    .eq('status', 'pending');

  const { data: sent } = await supabase
    .from('friend_requests')
    .select('*, receiver:user_profiles!receiver_id(*)')
    .eq('sender_id', user.id)
    .eq('status', 'pending');

  const { data: friendsList } = await supabase
    .from('friend_requests')
    .select('*, sender:user_profiles!sender_id(*), receiver:user_profiles!receiver_id(*)')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq('status', 'accepted');

  if (incoming) setIncomingRequests(incoming);
  if (sent) setSentRequests(sent);
  if (friendsList) setFriends(friendsList);
};

useEffect(() => {
  if (step === 23) {
    if (hubTab === 'PEOPLE' && peopleSubTab === 'GLOBAL') {
      fetchGlobalUsers();
    } else if (hubTab === 'REQUESTS') {
      fetchConnections();
    }
  }
}, [step, hubTab, peopleSubTab]);

const sendFriendRequest = async (receiverId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
 
    setSentRequests(prev => [...prev, { receiver_id: receiverId, status: 'pending' }]);
   
    const { error } = await supabase.from('friend_requests').insert([{ 
      sender_id: user.id, 
      receiver_id: receiverId, 
      status: 'pending' 
    }]);

    if (error) throw error;
    
  } catch (error) {
    console.error("Error sending friend request:", error);
    alert("Failed to send request. Please try again.");
    fetchMessengerData(); 
  }
};

const handleRequestAction = async (requestId, action) => {
  await supabase.from('friend_requests').update({ status: action }).eq('id', requestId);
  fetchConnections();
};

// Stream tracking states
  const [streamSeconds, setStreamSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

const rewardStreamKPC = async (amount) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("No authenticated user found.");
      return;
    }

    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();

    if (fetchError) throw fetchError;

    const currentBalance = Number(profile?.wallet_balance || 0);
    const newBalance = currentBalance + Number(amount);

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        wallet_balance: newBalance
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    setKpcBalance(newBalance);

    const savedUser = localStorage.getItem('kp_current_user');

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);

      localStorage.setItem(
        'kp_current_user',
        JSON.stringify({
          ...parsedUser,
          kpcBalance: newBalance,
          wallet_balance: newBalance
        })
      );
    }

    logTransaction(
      `Streaming Reward`,
      Number(amount),
      'EARN'
    );

    console.log(`Earned ${amount} KPC. New balance: ${newBalance}`);

  } catch (error) {
    console.error("Failed to save streaming reward:", error);
  }
};

  useEffect(() => {
    let interval = null;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setStreamSeconds(prev => {
          const newTime = prev + 1;

          if (newTime % 60 === 0) {
            rewardStreamKPC(1);
            
            if (userProfile?.id) {
              supabase.rpc('increment_streak', { user_id: userProfile.id });
            }
          }
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isPlaying, userProfile?.id, generatedAddress]);


const [pendingDreams, setPendingDreams] = useState([]);
const [dreamReply, setDreamReply] = useState('');
const fetchPendingDreams = async () => {
    const { data } = await supabase.from('dreams').select('*').eq('status', 'pending');
    if (data) setPendingDreams(data);
  };

  const handleSendInterpretation = async (dreamId) => {
    if (!dreamReply) return alert("Please type an interpretation.");
    
    const { error } = await supabase.from('dreams').update({ 
      interpretation: dreamReply, 
      status: 'answered' 
    }).eq('id', dreamId);

    if (error) {
      alert("Error sending interpretation.");
    } else {
      alert("Interpretation sent!");
      setDreamReply('');
      fetchPendingDreams();
    }
  };

const handleJoinGroup = async (group) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('chat_participants').insert([{ chat_id: group.id, user_id: user.id }]);

      fetchMessengerData();

      setActiveDbChat(group); 
      setHubTab('CHATS');
      
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

const [expandedPosts, setExpandedPosts] = useState({});

const togglePostExpand = (postId) => {
  setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
};

const [announceImage, setAnnounceImage] = useState('');
const [announceColor, setAnnounceColor] = useState('#1E1E2C');

const themeColors = [
  '#1E1E2C',
  '#2D3748',
  '#234E52',
  '#4A5568',
  '#553C9A'
];
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

const handleOpenModal = (announcement) => {
  setSelectedAnnouncement(announcement);
  setIsModalOpen(true);
};

const handleCloseModal = () => {
  setIsModalOpen(false);
  setSelectedAnnouncement(null);
};




 

  
  return (
     <>

      {/* Hidden file input for uploading reels/status */}
      <input
        type="file"
        hidden
        ref={fileInputRef}
        onChange={handleStatusUpload}
        accept="image/*,video/*"
      />

      {/* STEP 0 */}
      {step === 0 && (
        <div className="inner-pad">
          <header className="header-layout">
            <img src="/assets/logo.png" alt="Logo" className="logo-img" />
            <div className="brand-details">
              <h1 className="metallic-gold-text">KINGDOMPLUS</h1>
              <p>FAITH & REWARDS APPS | <span>Powered by Solana</span></p>
            </div>
          </header>

          <div className="coin-display-area">
            <div className="coin-inner-box">
              <img src="/assets/KingdomPlusCoin.png" alt="coin" />
            </div>
          </div>

          <div className="main-content">
            <h1 className="hero-headline">Empower Your Faith,<br />Earn <span className="metallic-gold-text">KingdomPlus</span> (KPC)</h1>
            <div className="features-row">
              <div className="feature-card">
                <div className="card-image-box"><img src="/assets/bible.png" alt="bible" /></div>
                <h2 className="text-gradient-gold">BIBLE STUDY</h2>
                <p>Read scripture daily for KPC rewards.</p>
              </div>
              <div className="feature-card">
                <div className="card-image-box"><img src="/assets/media.png" alt="media" /></div>
                <h2 className="text-gradient-gold">GOSPEL MEDIA</h2>
                <p>Stream gospel songs, movies, & sermons.</p>
              </div>
              <div className="feature-card">
                <div className="card-image-box"><img src="/assets/faith-social.png" alt="social" /></div>
                <h2 className="text-gradient-gold">FAITH SOCIAL</h2>
                <p>Engage in community posts, share journey.</p>
              </div>
            </div>
          </div>

          <div className="footer-actions">
            <button className="action-button" onClick={() => setStep(1)}>GET STARTED</button>
            <div className="login-prompt">Already have an account? <span style={{ color: '#29beaf', cursor: 'pointer', marginLeft: '5px' }} onClick={() => setStep(15)}>Log In</span></div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="inner-pad">
          {renderTopNav(1)}
          <div className="form-scroll-area">
            <h1 className="onboarding-title">Tell us about you</h1>
            <p className="onboarding-subtitle">Your profile keeps your faith journey and KPC rewards in one place.</p>
            
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label className="input-label">I AM REGISTERING AS A</label>
             <div
  style={{
    display: 'flex',
    gap: '10px',
    marginTop: '5px'
  }}
>
  {['User', 'Ministry'].map(type => (
    <button
      key={type}
      type="button"
      onClick={() => {
  setFormData(prev => ({
    ...prev,
    accountType: type
  }));

  if (type === 'Ministry') {
    setStep(19);
    return;
  }

  setStep(1);
}}
      style={{
        flex: 1,
        padding: '12px 10px',
        borderRadius: '10px',
        fontWeight: '800',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background:
          (formData.accountType || 'User') === type
            ? 'linear-gradient(135deg, #f3ca58, #29beaf)'
            : 'rgba(255,255,255,0.05)',
        color:
          (formData.accountType || 'User') === type
            ? '#101926'
            : '#8e9aab',
        border:
          '1px solid rgba(255,255,255,0.1)'
      }}
    >
      {type === 'Ministry'
        ? 'Church / Ministry'
        : 'Individual / Believer'}
    </button>
  ))}
</div>
            </div>

            <div className="input-group"><label className="input-label">FULL NAME</label><input type="text" name="fullName" placeholder="Mary Johnson" value={formData.fullName} onChange={handleChange} className="app-input" /></div>
            <div className="input-group"><label className="input-label">USERNAME</label><input type="text" name="username" placeholder="mary_j" value={formData.username} onChange={handleChange} className="app-input" /></div>
            <div className="input-group"><label className="input-label">EMAIL</label><input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="app-input" /></div>
            <div className="input-group"><label className="input-label">PASSWORD</label><input type="password" name="password" placeholder="At least 8 characters" value={formData.password} onChange={handleChange} className="app-input" /></div>
            <div className="row-group">
              <div className="input-group"><label className="input-label">DATE OF BIRTH</label><input type="date" name="dob" value={formData.dob} onChange={handleChange} className="app-input" /></div>
              <div className="input-group"><label className="input-label">COUNTRY</label><input type="text" name="country" placeholder="Nigeria" value={formData.country} onChange={handleChange} className="app-input" /></div>
            </div>
            <div className="input-group"><label className="input-label">PHONE NUMBER</label><input type="tel" name="phone" placeholder="+234 800 000 0000" value={formData.phone} onChange={handleChange} className="app-input" /></div>
          </div>
          <div className="footer-lock"><button onClick={handleStep1Validation} className="action-button">Continue</button></div>
        </div>
      )}

      {step === 2 && (
        <div className="inner-pad">
          {renderTopNav(2)}
          <div className="form-scroll-area">
            <h1 className="onboarding-title">What's your denomination?</h1>
            <p className="onboarding-subtitle">We'll connect you with believers who share your faith tradition.</p>
            <div className="input-group">
              <label className="input-label">DENOMINATION</label>
              <select name="denomination" value={formData.denomination} onChange={handleChange} className="app-select">
                <option value="">Select a denomination</option><option value="Anglican / Episcopal">Anglican / Episcopal</option><option value="Assemblies of God">Assemblies of God</option><option value="Baptist">Baptist</option><option value="Catholic">Catholic</option><option value="Evangelical">Evangelical</option><option value="Lutheran">Lutheran</option><option value="Methodist">Methodist</option><option value="Non-denominational">Non-denominational</option><option value="Orthodox">Orthodox</option><option value="Pentecostal">Pentecostal</option><option value="Presbyterian">Presbyterian</option><option value="Seventh-day Adventist">Seventh-day Adventist</option><option value="Other">Other</option>
              </select>
            </div>
            {formData.denomination === 'Other' && (
              <div className="input-group"><label className="input-label">ENTER YOUR DENOMINATION</label><input type="text" name="customDenomination" placeholder="e.g. Apostolic" value={formData.customDenomination} onChange={handleChange} className="app-input" /></div>
            )}
          </div>
          <div className="footer-lock"><button onClick={handleNext} className="action-button">Continue</button></div>
        </div>
      )}

      {step === 3 && (
  <div className="inner-pad">
    {renderTopNav(3)}

    <div className="form-scroll-area">

      <h1 className="onboarding-title">
        Your local church
      </h1>

      <p className="onboarding-subtitle">
        Choose your home church or add a new one to connect locally.
      </p>

      {/* SHOW SELECTED DENOMINATION */}
      {formData.denomination && (
        <div
          style={{
            background: 'rgba(41,190,175,0.08)',
            border: '1px solid rgba(41,190,175,0.2)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '18px',
            color: '#29beaf',
            fontSize: '13px'
          }}
        >
          Showing churches for:

          <strong style={{ marginLeft: '5px', color: '#fff' }}>
            {formData.denomination === 'Other'
              ? formData.customDenomination || 'Other'
              : formData.denomination}
          </strong>
        </div>
      )}

      {!formData.isCustomChurch ? (

        <>
          <div className="input-group">

            <label className="input-label">
              LOCAL CHURCH
            </label>

            <select
              name="churchName"
              value={formData.churchName}
              onChange={handleChange}
              className="app-select"
              disabled={isLoadingChurches}
            >

              <option value="">
                {isLoadingChurches
                  ? 'Loading churches...'
                  : availableChurches.length > 0
                    ? 'Select your church'
                    : 'No registered churches found'}
              </option>

              {availableChurches.map((church) => (
                <option
                  key={church.id}
                  value={church.church_name}
                >
                  {church.church_name}
                </option>
              ))}

            </select>

          </div>

          {!isLoadingChurches &&
            availableChurches.length === 0 && (
              <p
                style={{
                  color: '#8e9aab',
                  fontSize: '12px',
                  textAlign: 'center',
                  marginTop: '-5px',
                  marginBottom: '15px'
                }}
              >
                No churches have registered under this denomination yet.
              </p>
            )
          }

          <button
            className="add-link"
            onClick={() =>
              setFormData(prev => ({
                ...prev,
                churchName: '',
                isCustomChurch: true
              }))
            }
          >
            + My church isn't listed
          </button>
        </>

      ) : (

        <>
          <div className="input-group">

            <label className="input-label">
              CHURCH NAME
            </label>

            <input
              type="text"
              name="churchName"
              placeholder="e.g. Grace Chapel International"
              value={formData.churchName}
              onChange={handleChange}
              className="app-input"
            />

          </div>

          <p
            style={{
              color: '#8e9aab',
              fontSize: '13px',
              textDecoration: 'underline',
              cursor: 'pointer',
              marginTop: '5px',
              textAlign: 'center'
            }}
            onClick={() =>
              setFormData(prev => ({
                ...prev,
                churchName: '',
                isCustomChurch: false
              }))
            }
          >
            Pick from the list instead
          </p>

        </>

      )}

    </div>

    <div className="footer-lock">

      <button
        onClick={handleNext}
        className="action-button"
        disabled={
          !formData.churchName &&
          !formData.isCustomChurch
        }
      >
        Continue
      </button>

    </div>

  </div>
)}

      {step === 4 && (
        <div className="inner-pad">
          {renderTopNav(4)}
          <div className="wallet-generation-container">
            <div className="coin-inner-box" style={{ marginBottom: '20px', width: '150px', height: '150px' }}><img src="/assets/KingdomPlusCoin.png" alt="coin" style={{ width: '200px' }} /></div>
            <h1 className="onboarding-title" style={{ textAlign: 'center' }}>Your wallet is <span className="metallic-gold-text">ready</span></h1>
            <p className="onboarding-subtitle" style={{ textAlign: 'center', marginBottom: '10px' }}>Claim your welcome airdrop of 50 KPC and join the Family.</p>
            <div className="wallet-box">
              <span className="wallet-box-top">SOLANA WALLET</span>
              <div className="wallet-box-address">{isGenerating ? (<span style={{ color: '#8e9aab' }}>Generating...</span>) : (<><span>{truncateAddress(generatedAddress)}</span></>)}</div>
            </div>
          </div>
          <div className="footer-lock">{isGenerating ? (<button disabled className="action-button">↺ Setting up your account...</button>) : (<button onClick={requestKPCAirdrop} disabled={isAirdropping} className="action-button">{isAirdropping ? 'Processing...' : 'Claim Welcome KPC'}</button>)}</div>
        </div>
      )}

      {step === 5 && (
        <div className="inner-pad" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="coin-inner-box" style={{ marginBottom: '30px', width: '120px', height: '120px' }}>
            <div style={{ fontSize: '60px', color: '#29beaf', background: 'rgba(41, 190, 175, 0.1)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #29beaf', boxShadow: '0 0 30px rgba(41, 190, 175, 0.3)' }}>✓</div>
          </div>
          <h1 className="onboarding-title" style={{ textAlign: 'center', fontSize: '28px' }}>Welcome to the <br /><span className="metallic-gold-text">Family</span></h1>
          <p className="onboarding-subtitle" style={{ textAlign: 'center', marginTop: '10px' }}>Your profile is complete and your vault is secured.</p>
          <div className="footer-lock" style={{ marginTop: '40px' }}><button onClick={() => setStep(6)} className="action-button">ENTER THE HUB</button></div>
        </div>
      )}

     {/* =========================================
          STEP 6: SANCTUARY (DASHBOARD)
          ========================================= */}
      {step === 6 && (
        <div className="hub-wrapper">
          <div className="hub-feed">

            {/* Header */}
            <div className="hub-header">
              <div className="hub-logo-section">
                <img src="/assets/logo.png" alt="Logo" className="logo-img" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h1 className="metallic-gold-text" style={{ fontSize: '15px', margin: 0, lineHeight: '1.1' }}>KINGDOMPLUS</h1>
                  <p style={{ fontSize: '5px', margin: 0, color: '#9aa4b2', letterSpacing: '0.5px' }}>FAITH & REWARDS APPS</p>
                </div>
              </div>

              <div className="hub-header-actions">
                <div className="balance-pill" style={{ cursor: 'pointer' }} onClick={() => setStep(11)}>
                  <WalletIcon />
                  <div className="balance-text">
                    <span className="balance-kpc" style={{ fontWeight: '800', color: '#f3ca58' }}>{kpcBalance} KPC</span>
                    <span className="balance-usd" style={{ color: '#8e9aab', fontSize: '11px' }}> / ${(kpcBalance * 0.25).toFixed(2)}</span>
                  </div>
                </div>
                <div 
      className="icon-circle" 
      onClick={() => setIsNotifOpen(!isNotifOpen)} 
      style={{ position: 'relative', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', padding: '5px' }}
    >
      <BellIcon />
      {unreadCount > 0 && (
        <span style={{ 
          position: 'absolute', top: '0px', right: '0px', 
          background: '#e74c3c', color: '#fff', fontSize: '10px', 
          fontWeight: 'bold', borderRadius: '50%', padding: '2px 5px',
          minWidth: '15px', textAlign: 'center'
        }}>
          {unreadCount}
        </span>
      )}
    </div>
              </div>
            </div>

{isNotifOpen && (
  <div className="notif-panel-overlay" onClick={() => setIsNotifOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}>
    <div 
      className="notif-dropdown" 
      onClick={(e) => e.stopPropagation()} 
      style={{ 
        position: 'absolute', top: '70px', right: '20px', 
        background: '#101926', border: '1px solid #2a3441', 
        borderRadius: '16px', width: '320px', zIndex: 100, 
        boxShadow: '0 10px 30px rgba(0,0,0,0.8)', overflow: 'hidden'
      }}
    >
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #1a2433', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0f18' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '600' }}>Notifications</h3>
        {unreadCount > 0 && (
          <span onClick={handleMarkAllRead} style={{ fontSize: '13px', color: '#29beaf', cursor: 'pointer', fontWeight: '500' }}>
            Mark all as read
          </span>
        )}
      </div>

      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: '#8e9aab' }}>No new notifications</div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid #1a2433', 
                display: 'flex', 
                gap: '15px', 
                background: notif.isRead ? 'transparent' : 'rgba(41, 190, 175, 0.05)',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
               <div style={{ 
                 width: '40px', height: '40px', borderRadius: '50%', 
                 background: '#1a2433', display: 'flex', justifyContent: 'center', 
                 alignItems: 'center', flexShrink: 0 
               }}>
                 {getNotifIcon(notif.type)}
               </div>
               <div style={{ flex: 1 }}>
                 <div style={{ color: '#fff', fontSize: '14px', fontWeight: notif.isRead ? '500' : '700', marginBottom: '4px' }}>
                   {notif.title}
                 </div>
                 <div style={{ color: '#8e9aab', fontSize: '13px', lineHeight: '1.4' }}>
                   {notif.message}
                 </div>
                 <div style={{ color: notif.isRead ? '#596a7d' : '#29beaf', fontSize: '11px', marginTop: '8px', fontWeight: '500' }}>
                   {notif.time}
                 </div>
               </div>
               {!notif.isRead && (
                 <div style={{ width: '8px', height: '8px', background: '#29beaf', borderRadius: '50%', alignSelf: 'center' }}></div>
               )}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}

            {(
  userProfile?.account_type === 'Ministry' ||
  currentUser?.account_type === 'Ministry' ||
  currentUser?.accountType === 'Ministry' ||
  formData?.accountType === 'Ministry'
) ? (
  renderChurchDashboard()
) : (
              <>
                <div className="search-bar">
                  <SearchIcon />
                  <input type="text" placeholder="Discover, Churches, Music, Testimonies..." />
                </div>

                {/* Sanctuary Slider */}
                <div className="sanctuary-card">
                  <div className="sanctuary-header">
                    <div className="sanctuary-title">
                      <h2>Your Sanctuary</h2>
                      <p>{formData.churchName || 'Grace'} • {formData.denomination || 'Non-denominational'}</p>
                    </div>
                    <div className="carousel-nav">
                      <button className="carousel-btn" onClick={handlePrevSlide}>{'<'}</button>
                      <button className="carousel-btn" onClick={handleNextSlide}>{'>'}</button>
                    </div>
                  </div>

                 {/* Ensure this container has a fixed max-width and height in your CSS, e.g., max-width: 400px; */}
{(() => {
  const announcement = announcements[currentSlide] || {}; 
  
  return (
    <div 
      className="announcement-card" 
      onClick={() => handleOpenModal(announcement)}
      style={{ 
        backgroundColor: announcement.bg_color || '#1E1E2C',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '180px', /* Reduced from 250px to make it less long */
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s ease'
      }}
    >
      {announcement.image_url && (
        <div style={{ flex: announcement.title || announcement.desc ? '0 0 45%' : '1 1 100%', width: '100%' }}>
          <img 
            src={announcement.image_url} 
            alt="Announcement Flyer" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      )}
      
      {(announcement.title || announcement.desc) && (
        <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {announcement.badge && (
            <span style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '12px', width: 'fit-content', marginBottom: '6px', color: '#fff' }}>
              {announcement.badge}
            </span>
          )}
          {announcement.title && <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#ffffff', fontWeight: '600' }}>{announcement.title}</h3>}
          {announcement.desc && <p style={{ margin: '0', fontSize: '12px', color: '#A0AEC0', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{announcement.desc}</p>}
        </div>
      )}
    </div>
  );
})()}
                  <div className="carousel-dots">
                    {announcements.map((_, index) => (
                      <div key={index} className={`dot ${currentSlide === index ? 'active' : ''}`}></div>
                    ))}
                  </div>
{/* Announcement Modal Overlay */}
{isModalOpen && selectedAnnouncement && (
  <div 
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999, 
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}
    onClick={handleCloseModal}
  >
    <div 
      style={{
        backgroundColor: selectedAnnouncement.bg_color || '#1E1E2C',
        borderRadius: '20px',
        maxWidth: '450px',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}
      onClick={(e) => e.stopPropagation()} 
    >
      {/* Close Button */}
      <button 
        onClick={handleCloseModal} 
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          cursor: 'pointer',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '16px'
        }}
      >
        ✕
      </button>

      {selectedAnnouncement.image_url && (
        <img 
          src={selectedAnnouncement.image_url} 
          alt="Announcement" 
          style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', display: 'block' }} 
        />
      )}
      
      {/* Modal Content */}
      <div style={{ padding: '24px', color: 'white' }}>
        {selectedAnnouncement.badge && (
          <span style={{ fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '14px', color: '#fff', marginBottom: '12px', display: 'inline-block' }}>
            {selectedAnnouncement.badge}
          </span>
        )}
        <h2 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: 'bold' }}>
          {selectedAnnouncement.title}
        </h2>
        <p style={{ margin: '0', fontSize: '15px', color: '#CBD5E0', lineHeight: '1.6' }}>
          {selectedAnnouncement.desc}
        </p>
      </div>
    </div>
  </div>
)}
                </div>

                {/* Testimonies Reel */}
<div className="section-header">
  <h3>Testimonies of Faith</h3>
  <span className="section-link" onClick={() => fileInputRef.current.click()} style={{cursor: 'pointer'}}>
    Post your reel
  </span>
</div>

<div className="horizontal-scroll">
  <div className="testimony-item" onClick={() => setShowTestimonyChoice(true)}>
    <div className="testimony-circle testimony-add" style={{ border: '2px dashed #29beaf' }}>
      <PlusIcon />
    </div>
    <span className="testimony-name">Add your<br />testimony</span>
    <input 
      type="file" 
      accept="image/*,video/*" 
      ref={fileInputRef} 
      style={{ display: 'none' }} 
      onChange={uploadNewTestimony} 
    />
  </div>

  {groupedTestimonies.map(group => (
    <div key={group.userId} className="testimony-item" onClick={() => handleViewStatus(group)}>
      <div 
        className="testimony-circle" 
        style={{ 
          padding: '2px', 
          background: viewedStatuses.includes(group.userId) ? '#8e9aab' : '#3b82f6', 
          borderRadius: '50%',
          width: '76px', 
          height: '76px' 
        }}
      >
        <div style={{ border: '3px solid #101926', borderRadius: '50%', overflow: 'hidden', width: '100%', height: '100%' }}>
          <img 
  src={group.avatar || 'https://ui-avatars.com/api/?name=User&background=29beaf&color=fff'} 
  alt={group.authorName} 
  onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=User&background=29beaf&color=fff'; }}
  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #101926' }} 
/>
        </div>
      </div>
      <span className="testimony-name" style={{ whiteSpace: 'nowrap' }}>
        {group.authorName.split(' ')[0]}
      </span>
    </div>
  ))}
</div>

{/* --- TESTIMONY CHOICE MODAL --- */}
{showTestimonyChoice && (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ background: '#101926', padding: '24px', borderRadius: '20px', width: '80%', maxWidth: '320px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Share a Testimony</h3>
      <button onClick={() => { setShowTestimonyChoice(false); setShowTextStatusModal(true); }} style={{ display: 'block', width: '100%', padding: '14px', marginBottom: '12px', background: 'linear-gradient(90deg, #f3ca58, #29beaf)', color: '#101926', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>Write Text</button>
      <button onClick={() => { setShowTestimonyChoice(false); fileInputRef.current.click(); }} style={{ display: 'block', width: '100%', padding: '14px', marginBottom: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>Upload Photo/Video</button>
      <button onClick={() => setShowTestimonyChoice(false)} style={{ display: 'block', width: '100%', padding: '12px', background: 'transparent', color: '#8e9aab', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
    </div>
  </div>
)}

{/* --- FULL SCREEN STATUS VIEWER MODAL --- */}
{activeViewStatus && (() => {
  const isMyStatus = currentUser && (activeViewStatus.user_id === currentUser.id || activeViewStatus.id === 'welcome-001');

  return (
    <div 
      className="status-viewer-modal"
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: '#0f0f0f', zIndex: 999999, display: 'flex',
        flexDirection: 'column', overflow: 'hidden'
      }}
    >
      <div className="status-progress-container" style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', zIndex: 10 }}>
        <div className="status-progress-bar" style={{ width: `${statusProgress || 100}%`, height: '3px', backgroundColor: '#ffffff', borderRadius: '3px', boxShadow: '0 0 10px rgba(255,255,255,0.5)', transition: 'width 0.1s linear' }}></div>
      </div>
      
      {/* Header */}
      <div className="status-viewer-header" style={{ position: 'absolute', top: '40px', left: '15px', right: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, opacity: showCommentsPanel ? 0 : 1, transition: 'opacity 0.2s' }}>
        <div className="status-viewer-author" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff', background: 'rgba(0,0,0,0.3)', padding: '6px 12px 6px 6px', borderRadius: '30px', backdropFilter: 'blur(8px)' }}>
          <img 
            src={activeViewStatus.avatar_url || activeViewStatus.avatar} 
            alt="author" 
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f3ca58' }} 
          />
          <span style={{ fontWeight: '800', fontSize: '14px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {activeViewStatus.author_name || activeViewStatus.authorName}
          </span>
        </div>
        <button 
          onClick={() => { setActiveViewStatus(null); setShowCommentsPanel(false); setViewerLiked(false); }} 
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', width: '40px', height: '40px', borderRadius: '50%', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
        >
          <XIcon />
        </button>
      </div>

      {/* Right-Side Action Bar */}
      <div className="status-action-bar" style={{ position: 'absolute', right: '16px', bottom: '80px', display: 'flex', flexDirection: 'column', gap: '22px', zIndex: 10, opacity: showCommentsPanel ? 0 : 1, transition: 'opacity 0.2s' }}>
        
        {/* Like */}
        <div className="action-icon-group" onClick={handleLikeStatus} style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '14px', borderRadius: '50%', color: viewerLiked ? '#ef4444' : '#ffffff', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
            {viewerLiked ? <HeartSolidIcon /> : <HeartIcon />}
          </div>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {viewerLiked ? (activeViewStatus.likes || 0) + 1 : (activeViewStatus.likes || 0)}
          </span>
        </div>

        {/* Comment */}
        <div className="action-icon-group" onClick={() => setShowCommentsPanel(true)} style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '14px', borderRadius: '50%', color: '#ffffff', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
            <MessageIcon />
          </div>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {(statusComments[activeViewStatus.id] || []).length}
          </span>
        </div>

        {/* I Tap */}
        <div className="action-icon-group" onClick={() => handleTapTransaction(activeViewStatus)} style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(243, 202, 88, 0.3), rgba(243, 202, 88, 0.1))', backdropFilter: 'blur(10px)', border: '1px solid rgba(243, 202, 88, 0.6)', padding: '14px', borderRadius: '50%', color: '#f3ca58', boxShadow: '0 8px 25px rgba(243, 202, 88, 0.4)' }}>
            <HandCoinIcon /> 
          </div>
          <span style={{ color: '#f3ca58', fontSize: '13px', fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>I Tap</span>
        </div>

        <div className="action-icon-group" onClick={() => {
          navigator.clipboard.writeText(`https://kingdomplus.app/status/${activeViewStatus.id}`);
          alert("Link copied to clipboard!");
        }} style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '14px', borderRadius: '50%', color: '#ffffff', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
            <ShareIcon />
          </div>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Share</span>
        </div>
      </div>

    {isMyStatus && !showCommentsPanel && (
  <div style={{ position: 'absolute', bottom: '25px', left: '16px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.5)', padding: '8px 14px', borderRadius: '20px', backdropFilter: 'blur(8px)', color: '#fff' }}>
    <EyeIcon /> <span style={{ fontSize: '13px', fontWeight: '800' }}>{activeViewStatus.views || 0} views</span>
  </div>
)}

      {showCommentsPanel && (
        <>
          <div 
            onClick={() => setShowCommentsPanel(false)} 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '40%', zIndex: 15 }} 
          />
          
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '60%', backgroundColor: '#212121', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', zIndex: 20, display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s cubic-bezier(0.1, 0.8, 0.2, 1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #3d3d3d' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Comments <span style={{ color: '#aaaaaa', fontSize: '14px', fontWeight: 'normal' }}>{(statusComments[activeViewStatus.id] || []).length}</span>
              </h3>
              <div style={{ display: 'flex', gap: '16px', color: '#fff' }}>
                <span style={{ cursor: 'pointer' }}><SettingsGearIcon /></span>
                <span style={{ cursor: 'pointer' }} onClick={() => setShowCommentsPanel(false)}><XIcon /></span>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(statusComments[activeViewStatus.id] || []).map((comment) => (
              <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
                {/* Dynamically render Image or Letter Avatar */}
                {comment.avatar && (comment.avatar.includes('http') || comment.avatar.includes('/')) ? (
                   <img src={comment.avatar} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4facfe', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                     {comment.avatar || 'U'}
                   </div>
                )}
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ color: '#aaaaaa', fontSize: '12px', fontWeight: 'bold' }}>{comment.author}</span>
                    <span style={{ color: '#aaaaaa', fontSize: '12px' }}>• {comment.time}</span>
                  </div>
                  <div style={{ color: '#fff', fontSize: '14px', lineHeight: '1.4', marginBottom: '8px' }}>
                    {comment.text}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#aaaaaa', fontSize: '12px' }}>
                    <span onClick={() => toggleCommentLike(comment.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: comment.isLiked ? '#ef4444' : '#aaaaaa', transition: 'color 0.2s' }}>
                      {comment.isLiked ? <HeartSolidIcon /> : <HeartOutlineIcon />} {comment.likes || 0}
                    </span>
                    <span style={{ cursor: 'pointer' }}>Reply</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid #3d3d3d', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#212121' }}>
             {/* Current User Avatar Display */}
             {currentUser?.formData?.avatar || currentUser?.image ? (
                <img src={currentUser?.formData?.avatar || currentUser?.image} alt="my-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
             ) : (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f3ca58', color: '#101926', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                  {(currentUser?.formData?.username || currentUser?.username || 'B').charAt(0).toUpperCase()}
                </div>
             )}
             
             <input 
                type="text" 
                placeholder="Add a comment..." 
                value={newStatusComment}
                onChange={(e) => setNewStatusComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newStatusComment.trim()) {
                    const actualUsername = currentUser?.formData?.username || currentUser?.username || 'believer';
                    const actualAvatar = currentUser?.formData?.avatar || currentUser?.image || actualUsername.charAt(0).toUpperCase();
                    
                    const newCommentObj = { id: Date.now(), author: `@${actualUsername}`, text: newStatusComment, time: 'Just now', likes: 0, isLiked: false, avatar: actualAvatar };
                    setStatusComments(prev => ({ ...prev, [activeViewStatus.id]: [newCommentObj, ...(prev[activeViewStatus.id] || [])] }));
                    setNewStatusComment("");
                  }
                }}
                style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '14px', outline: 'none' }}
             />
             <button 
                disabled={!newStatusComment.trim()}
                onClick={() => {
                  const actualUsername = currentUser?.formData?.username || currentUser?.username || 'believer';
                  const actualAvatar = currentUser?.formData?.avatar || currentUser?.image || actualUsername.charAt(0).toUpperCase();
                  
                  const newCommentObj = { id: Date.now(), author: `@${actualUsername}`, text: newStatusComment, time: 'Just now', likes: 0, isLiked: false, avatar: actualAvatar };
                  setStatusComments(prev => ({ ...prev, [activeViewStatus.id]: [newCommentObj, ...(prev[activeViewStatus.id] || [])] }));
                  setNewStatusComment("");
                }}
                style={{ background: 'none', border: 'none', color: newStatusComment.trim() ? '#29beaf' : '#aaaaaa', cursor: newStatusComment.trim() ? 'pointer' : 'default' }}
             >
               <SendIcon />
             </button>
          </div>
          </div>
        </>
      )}

      <div 
        className="status-media-content" 
        onMouseDown={() => setIsStatusPaused(true)}
        onMouseUp={() => setIsStatusPaused(false)}
        onTouchStart={() => setIsStatusPaused(true)}
        onTouchEnd={() => setIsStatusPaused(false)}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: activeViewStatus.bg_color || '#0f0f0f', width: '100%', height: '100%' }}
      >
        {activeViewStatus.media_type === 'video' ? (
          <video 
            ref={statusVideoRef}
            src={activeViewStatus.media_src || activeViewStatus.media_url} 
            autoPlay 
            playsInline 
            onTimeUpdate={handleVideoProgress}
            onEnded={() => setActiveViewStatus(null)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        ) : activeViewStatus.media_type === 'text' ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#fff', fontSize: '28px', fontWeight: '900', lineHeight: '1.4' }}>
            {activeViewStatus.text_content}
          </div>
        ) : (
          <img 
            src={activeViewStatus.media_src || activeViewStatus.media_url || activeViewStatus.bgImage} 
            alt="Status" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        )}
      </div>
    </div>
  );
})()}

{/* --- TEXT STATUS UPLOAD MODAL --- */}
{showTextStatusModal && (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: textStatusBg, zIndex: 999999, display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span onClick={() => setShowTextStatusModal(false)} style={{ color: '#fff', cursor: 'pointer', padding: '10px' }}><XIcon /></span>
      <button 
        onClick={() => {
          if (!textStatusContent.trim()) return;
          const newStatus = {
            id: `text-${Date.now()}`,
            user_id: currentUser?.id,
            authorName: `@${currentUser?.formData?.username || currentUser?.username || 'believer'}`,
            avatar: currentUser?.formData?.avatar || currentUser?.image,
            media_type: 'text',
            text_content: textStatusContent,
            bg_color: textStatusBg,
            views: 0, likes: 0,
          };
          setTestimonies([{ ...newStatus, statuses: [newStatus] }, ...testimonies]); 
          setShowTextStatusModal(false);
          setTextStatusContent("");
        }}
        style={{ background: '#fff', color: '#101926', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold' }}
      >
        Post
      </button>
    </div>
    
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <textarea 
        autoFocus
        placeholder="Type your testimony..."
        value={textStatusContent}
        onChange={(e) => setTextStatusContent(e.target.value)}
        style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '32px', fontWeight: 'bold', textAlign: 'center', outline: 'none', resize: 'none' }}
        rows={5}
      />
    </div>

    {/* Color Picker Picker Row */}
    <div style={{ padding: '20px', display: 'flex', gap: '15px', justifyContent: 'center', overflowX: 'auto' }}>
      {['#4facfe', '#ff0844', '#f83600', '#00c6ff', '#16a085', '#8e44ad'].map(color => (
        <div key={color} onClick={() => setTextStatusBg(color)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: color, border: textStatusBg === color ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
      ))}
    </div>
  </div>
)}


                {/* Interactive Worship Section */}
                <div className="section-header" style={{ marginTop: '10px' }}>
                  <h3>Trending Gospel Songs</h3>
                </div>
                <div className="horizontal-scroll">
                  {musicData
                    .filter(track => track.category === 'Trending Now')
                    .map((track) => (
                    <div
                      key={track.id}
                      className="media-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        openPlayer(track, 'audio');
                        setIsPlaying(true);
                      }}
                    >
                      <img src={track.img} alt={track.title} className="media-bg" />
                      <div className="media-content">
                        <h4 className="media-title">{track.title}</h4>
                        <span className="media-subtitle"><span style={{ color: '#29beaf' }}>|</span> {track.artist}</span>
                      </div>
                    </div>
                  ))}
                  {musicData.filter(track => track.category === 'Trending Now').length === 0 && (
                    <div style={{ color: '#8e9aab', fontSize: '12px', padding: '10px' }}>No trending songs yet.</div>
                  )}
                </div>

                {/* Kingdom Happenings Section */}
                <div className="section-header" style={{ marginTop: '10px' }}>
                  <h3>Kingdom Happenings <span>(World Christian News)</span></h3>
                </div>
                <div className="horizontal-scroll">
                  {newsData.map((news) => (
                    <div
                      key={news.id}
                      className="news-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveNewsArticle(news)}
                    >
                      <img src={news.img} alt={news.title} className="news-img" />
                      <div className="news-details">
                        <h4 className="news-title">{news.title}</h4>
                        <div>
                          <div className="news-actions">
                            <div className="news-icons"><HeartIcon /> <MessageIcon /></div>
                            <div className="kpc-badge"><img src="/assets/logo.png" alt="kpc" style={{ width: '10px', height: '10px' }} /> KPC</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

{/* --- FULL SCREEN KINGDOM NEWS READER --- */}
{activeNewsArticle && (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0a0f1a', zIndex: 99999, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
    
    <div style={{
      position: 'relative',
      padding: '20px',
      paddingTop: '40px',
      background: `url(${activeNewsArticle.img}) center/cover no-repeat`,
      flexShrink: 0
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(10, 15, 26, 0.4), #0a0f1a)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 1 }}></div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => setActiveNewsArticle(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', marginRight: '15px' }}>&#8249;</button>
          <h1 style={{ color: '#fff', fontSize: '18px', margin: 0, fontWeight: '600', lineHeight: '1.3' }}>{activeNewsArticle.title}</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <img src={activeNewsArticle.authorAvatar || '/media/Media-img.jpeg'} alt="Author" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px' }} />
          <div>
            <div style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>{activeNewsArticle.author || 'KingdomPlus Media'}</div>
            <div style={{ color: '#8e9aab', fontSize: '12px' }}>{activeNewsArticle.date || 'Just now'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
  <span onClick={handleLikeNews} style={{ color: '#8e9aab', fontSize: '14px', cursor: 'pointer' }}> 
    <HeartIcon /> {activeNewsArticle.likes || 0}
  </span>
  <span onClick={handleShareNews} style={{ color: '#8e9aab', fontSize: '14px', cursor: 'pointer' }}>
    🔗 {activeNewsArticle.shares || 0} Share
  </span>
  <span style={{ color: '#8e9aab', fontSize: '14px' }}> 
    <MessageIcon /> {realComments.length || 0}
  </span>
</div>
      </div>
    </div>

    {/* --- MAIN ARTICLE CONTENT --- */}
    <div style={{ padding: '0 20px 20px 20px', position: 'relative', zIndex: 2, flexShrink: 0 }}>
      <img src={activeNewsArticle.img} alt="News" style={{ width: '100%', height: 'auto', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }} />
      <div style={{ color: '#d1d8e0', fontSize: '16px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
        {activeNewsArticle.content || "Full article content goes here..."}
      </div>
    </div>

    {/* --- BLOG STYLE COMMENTS SECTION --- */}
    <div style={{ padding: '20px', background: '#101926', flexGrow: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '24px', fontWeight: 'bold' }}>All Comments</h3>
      
     {/* Scrollable Comment List */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }}>
  {realComments.map(comment => (
    <div key={comment.id} style={{ display: 'flex', alignItems: 'flex-start' }}>
      <img src={comment.avatar} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px', flexShrink: 0 }} />
      <div style={{ background: '#1a2436', padding: '12px 16px', borderRadius: '0 16px 16px 16px', flexGrow: 1 }}>
        <div style={{ color: '#8e9aab', fontSize: '12px', marginBottom: '6px', fontWeight: 'bold' }}>{comment.author_name}</div>
        <div style={{ color: '#fff', fontSize: '14px', lineHeight: '1.5' }}>{comment.content}</div>
        
        {/* New Action Bar for Likes */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
          <button 
            onClick={() => handleLikeComment(comment.id)}
            style={{ 
              background: 'none', border: 'none', color: '#8e9aab', 
              display: 'flex', alignItems: 'center', gap: '6px', 
              cursor: 'pointer', fontSize: '12px', padding: 0 
            }}
          >
            {/* Heart SVG */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {comment.likes || 0}
          </button>
        </div>

      </div>
    </div>
  ))}
</div>
</div>

{/* --- STICKY COMMENT INPUT BAR --- */}
<div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#101926', padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', zIndex: 10 }}>
  <img src={currentUser?.formData?.avatar || currentUser?.image || 'https://ui-avatars.com/api/?name=Me&background=f3ca58&color=000'} alt="Me" style={{ width: '36px', height: '36px', borderRadius: '50%', marginRight: '12px' }} />
  
  <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', background: '#1c2636', padding: '4px 4px 4px 15px', borderRadius: '30px' }}>
    <input 
      type="text" 
      placeholder="Add a comment..." 
      value={newCommentText}
      onChange={(e) => setNewCommentText(e.target.value)}
      style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', outline: 'none' }} 
    />
    <button 
      onClick={() => {
        handlePostComment(newCommentText); 
        setNewCommentText(""); 
      }}
      style={{ background: 'linear-gradient(90deg, #f3ca58, #29beaf)', color: '#101926', border: 'none', borderRadius: '24px', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
    >
      Post
    </button>
  </div>
</div>

  </div>
)}

                {/* Community Grid */}
                <div className="section-header" style={{ marginTop: '10px' }}>
                  <h3>Community</h3>
                  <a href="#community" className="section-link">See all</a>
                </div>

                <div className="community-grid">
                  <div className="community-card feed-card" onClick={() => setStep(7)}>
  <div className="card-top">
    <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#f3ca58', letterSpacing: '1px' }}>FEED</h3>
    <div className="card-icon" style={{ color: '#8e9aab' }}><ChatIcon /></div>
  </div>
  
  {/* NEW DYNAMIC ACTIVITY INDICATOR */}
  <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{ display: 'flex' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#29beaf', border: '2px solid #101926', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', zIndex: 3 }}>⛪</div>
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f3ca58', border: '2px solid #101926', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', marginLeft: '-10px', zIndex: 2 }}>🕊️</div>
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e293b', border: '2px solid #101926', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', marginLeft: '-10px', zIndex: 1 }}>+3</div>
    </div>
    <div style={{ fontSize: '12px', color: '#8e9aab', lineHeight: '1.4' }}>
      New posts from <strong>{userProfile?.local_church || 'your church'}</strong> and friends.
    </div>
  </div>
  
  <div className="card-action" style={{ marginTop: '30px' }}>
    <span style={{ color: '#f3ca58', fontSize: '13px', fontWeight: '700' }}>Open feed {'>'}</span>
  </div>
</div>

                  <div className="community-card prayer-card" onClick={() => setStep(8)}>
                    <div className="card-top">
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#ff6b6b', letterSpacing: '1px' }}>PRAYER</h3>
                      <div className="card-icon" style={{ color: '#ff6b6b' }}><HeartIcon /></div>
                    </div>
                    <ul className="prayer-list">
                      <li className="prayer-item">
                        <div className="prayer-label-wrap"><span className="prayer-dot" style={{ backgroundColor: '#29beaf' }}></span>Breakthrough</div>
                        <span>{prayerRooms.find(r => r.id === 'Breakthrough')?.reqs || 0}</span>
                      </li>
                      <li className="prayer-item">
                        <div className="prayer-label-wrap"><span className="prayer-dot" style={{ backgroundColor: '#2980B9' }}></span>Family</div>
                        <span>{prayerRooms.find(r => r.id === 'Family')?.reqs || 0}</span>
                      </li>
                      <li className="prayer-item">
                        <div className="prayer-label-wrap"><span className="prayer-dot" style={{ backgroundColor: '#4E8B61' }}></span>Healing</div>
                        <span>{prayerRooms.find(r => r.id === 'Healing')?.reqs || 0}</span>
                      </li>
                      <li className="prayer-item">
                        <div className="prayer-label-wrap"><span className="prayer-dot" style={{ backgroundColor: '#2C3E50' }}></span>Nations</div>
                        <span>{prayerRooms.find(r => r.id === 'Nations')?.reqs || 0}</span>
                      </li>
                    </ul>
                    <div className="card-action" style={{ marginTop: '10px' }}>
                    <span style={{ color: '#ff6b6b', fontSize: '13px', fontWeight: '700' }}>Join a room {'>'}</span>
                    </div>
                  </div>
                </div>

                {/* Feature Banners */}
                <div className="section-header" style={{ marginTop: '10px' }}>
                  <h3>Discover More</h3>
                </div>

                <div className="feature-banner banner-dream" onClick={() => setStep(14)}>
                  <div className="banner-icon-box"><MoonIcon /></div>
                  <div className="banner-content">
                    <h4>Dream Diary</h4><p>Record and interpret your dreams.</p>
                  </div>
                  <div className="banner-action">Write a dream <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                </div>

               <div className="feature-banner banner-book" onClick={() => { setKingdomTab('Store'); setActiveTab('kingdom'); setStep(10); }}>
                  <div className="banner-icon-box"><BookOpenIcon /></div>
                  <div className="banner-content">
                    <h4>Book Store</h4><p>Get faith building books & audio.</p>
                  </div>
                  <div className="banner-action">Visit store <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                </div>
              </>
            )}

          </div>
{/* --- BROADCAST ANNOUNCEMENT MODAL --- */}
  {activeModal === 'announcement' && (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="modal-box" style={{ background: '#101926', border: '1px solid rgba(243, 202, 88, 0.3)', borderRadius: '20px', padding: '25px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="metallic-gold-text" style={{ margin: 0, fontSize: '18px' }}>Broadcast to Sanctuary Feed</h3>
          <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#8e9aab', cursor: 'pointer' }}><XIcon /></button>
        </div>

        <form onSubmit={handleBroadcastAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label className="input-label">ANNOUNCEMENT TYPE</label>
            <select value={announceBadgeInput} onChange={(e) => setAnnounceBadgeInput(e.target.value)} className="app-select">
              <option value="ANNOUNCEMENT">General Announcement</option>
              <option value="EVENT">Upcoming Event / Service</option>
              <option value="UPDATE">Ministry / Treasury Update</option>
              <option value="URGENT">Urgent Prayer Request</option>
            </select>
          </div>

          <div>
            <label className="input-label">HEADLINE TITLE</label>
            <input type="text" placeholder="e.g. 3-Day Global Fasting Begins Tomorrow" value={announceTitleInput} onChange={(e) => setAnnounceTitleInput(e.target.value)} className="app-input" />
          </div>

          <div>
            <label className="input-label">MESSAGE DETAILS</label>
            <textarea placeholder="Provide the full details, times, and instructions for believers..." value={announceDescInput} onChange={(e) => setAnnounceDescInput(e.target.value)} className="app-input" style={{ minHeight: '100px', resize: 'none' }} />
          </div>

          <button type="submit" className="action-button" style={{ background: 'linear-gradient(90deg, #f3ca58, #29beaf)', color: '#101926', fontWeight: '800', marginTop: '10px' }}>
            Push Live to Believers
          </button>
        </form>
      </div>
    </div>
  )}

{/* =========================================================
          CHURCH STUDIO MODALS
          ========================================================= */}

      {/* --- 1. UNIFIED KINGDOM PUBLISHING MODAL --- */}
      {activeStudioModal === 'kingdom_publish' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-box" style={{ background: '#101926', border: '1px solid rgba(243, 202, 88, 0.4)', borderRadius: '20px', padding: '25px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StudioBookIcon />
                <h3 className="metallic-gold-text" style={{ margin: 0, fontSize: '18px' }}>Publish to Kingdom Hub</h3>
              </div>
              <button onClick={() => setActiveStudioModal(null)} style={{ background: 'none', border: 'none', color: '#8e9aab', cursor: 'pointer' }}><XIcon /></button>
            </div>

            <form onSubmit={handleKingdomPublish} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">SELECT KINGDOM SECTION</label>
                <select value={studioCategory} onChange={(e) => setStudioCategory(e.target.value)} className="app-select">
                  <option value="Store">Bookstore (PDF / Audiobooks)</option>
                  <option value="Messages">Audio / Video Messages</option>
                  <option value="Devotions">Devotions (Daily Bread)</option>
                  <option value="Bible Plans">Bible Reading Plans</option>
                </select>
              </div>

              <div>
                <label className="input-label">TITLE / HEADLINE</label>
                <input type="text" placeholder="e.g. Walking in Authority or 30-Day Fast" value={studioTitle} onChange={(e) => setStudioTitle(e.target.value)} className="app-input" />
              </div>

              <div>
                <label className="input-label">
                  {studioCategory === 'Devotions' ? 'SCRIPTURE REFERENCE (e.g. Psalm 23:1)' :
                   studioCategory === 'Bible Plans' ? 'PLAN DURATION (e.g. 14 Days of Prayer)' :
                   studioCategory === 'Messages' ? 'DURATION / SERIES INFO (e.g. 45:00)' : 'SUBTITLE / EDITION'}
                </label>
                <input type="text" placeholder="Enter supporting details..." value={studioSub} onChange={(e) => setStudioSub(e.target.value)} className="app-input" />
              </div>

              {studioCategory === 'Store' && (
                <div>
                  <label className="input-label">BOOK PRICE (IN KPC)</label>
                  <input 
                    type="number" 
                    placeholder="50" 
                    value={studioPriceOrReward} 
                    onChange={(e) => setStudioPriceOrReward(e.target.value)} 
                    className="app-input" 
                  />
                </div>
              )}

              {studioCategory !== 'Store' && (
                <div style={{ background: 'rgba(41, 190, 175, 0.1)', border: '1px solid rgba(41, 190, 175, 0.3)', padding: '10px 14px', borderRadius: '12px', fontSize: '11px', color: '#29beaf', lineHeight: '1.4' }}>
                  <strong>Platform Algorithmic Reward:</strong> Believer rewards are automatically calculated and backed by the KingdomPlus Treasury based on verified engagement!
                </div>
              )}

              <div style={{ padding: '15px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px', textAlign: 'center', color: '#8e9aab', fontSize: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }} onClick={() => alert("Media / PDF attachment selected!")}>
                Tap to attach cover image or manuscript file
              </div>

              <button type="submit" className="action-button" style={{ background: 'linear-gradient(90deg, #f3ca58, #29beaf)', color: '#101926', fontWeight: '800', marginTop: '10px' }}>
                Publish Live to {studioCategory}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- 2. START CONFERENCE ROOM MODAL --- */}
      {activeStudioModal === 'conference' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-box" style={{ background: '#101926', border: '1px solid rgba(41, 190, 175, 0.4)', borderRadius: '20px', padding: '25px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(41, 190, 175, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', border: '1px solid #29beaf' }}>
              <StudioVideoIcon />
            </div>
            <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 8px 0' }}>Launch Conference Video</h3>
            <p style={{ color: '#8e9aab', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>Start an interactive video conference room for leadership meetings, counseling, or prayer gatherings.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setActiveStudioModal(null)} className="secondary-btn" style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => {
                const roomId = `room_${Math.floor(100000 + Math.random() * 900000)}`;
                setConferenceRoomId(roomId);
                setActiveStudioModal(null);
                alert(`Conference Room Opened!\nRoom ID: #${roomId}\nShare this link with attendees to enter.`);
              }} className="action-button" style={{ flex: 1, margin: 0, background: '#29beaf', color: '#101926', fontWeight: '800' }}>Create Room</button>
            </div>
          </div>
        </div>
      )}

          <AppBottomNav />

        </div>
      )}

{/* =========================================
          STEP 7: KINGDOM FEED
          ========================================= */}
      {step === 7 && (
        <div className="feed-screen-container" style={{ position: 'relative', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>

          <div className="feed-header-top" style={{ paddingBottom: '10px' }}>
            <button className="back-button" onClick={() => setStep(6)} style={{ width: '36px', height: '36px' }}><BackArrowIcon /></button>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0' }}>Kingdom Feed</h2>
            <div className="feed-header-actions"><SearchIcon /><BellIcon /></div>
          </div>

          <div className="feed-tabs-container" style={{ marginBottom: '15px', padding: '0 20px' }}>
            {['For You', 'Following', 'Church', 'Global'].map((tab) => (
              <div key={tab} className={`feed-tab ${feedTab === tab ? 'active' : ''}`} onClick={() => setFeedTab(tab)}>
                {tab}
              </div>
            ))}
          </div>

          <div className="feed-scroll-area" style={{ flexGrow: 1, paddingBottom: '120px' }}>
            
            {/* --- CREATE POST BOX --- */}
            <div className="create-post-card">
              <div className="create-post-top" style={{ alignItems: 'flex-start' }}>
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Profile" className="post-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div className="post-avatar" style={{ background: '#29beaf', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%' }}>
                    {userProfile?.username ? userProfile.username.substring(0, 2).toUpperCase() : 'U'}
                  </div>
                )}
                
                <div style={{ width: '100%' }}>
                  <textarea 
                    placeholder="Share a verse, testimony, or thought..." 
                    className="create-input" 
                    value={newPostText} 
                    onChange={(e) => setNewPostText(e.target.value)}
                    style={{ resize: 'none', height: '60px', width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }}
                  />
                  
                  {postMediaPreview && (
                    <div style={{ position: 'relative', marginTop: '10px', borderRadius: '12px', overflow: 'hidden' }}>
                      <button onClick={removePostMedia} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', zIndex: 10 }}>✕</button>
                      {postMediaFile?.type.startsWith('video/') ? (
                        <video src={postMediaPreview} controls style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                      ) : (
                        <img src={postMediaPreview} alt="Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="create-post-bottom">
                <input type="file" hidden ref={postMediaInputRef} accept="image/*,video/*" onChange={handlePostMediaSelect} />
                <button className="post-media-btn" onClick={() => postMediaInputRef.current.click()}>
                  <ImageIcon /> Photo/Video
                </button>
                <button className="post-media-btn" style={{ color: '#101926', background: '#29beaf', padding: '6px 16px', borderRadius: '20px', fontWeight: '800' }} onClick={handleCreatePost}>
                  <ShareIcon /> Post
                </button>
              </div>
            </div>

            {/* --- LIVE FEED POSTS --- */}
            {isFetchingPosts ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8e9aab' }}>Loading Kingdom Feed...</div>
            ) : (
              globalPosts.map((post) => {
                const isVideo = post.image_url?.match(/\.(mp4|webm|ogg|mov)$/i);
                
                return (
                  <div key={post.id} className="feed-post-card">
                    <div className="post-header">
                      <div className="post-user-info" onClick={() => handleViewProfile(post.author_id)} style={{ cursor: 'pointer' }}>
                        {post.user_profiles?.avatar_url ? (
                          <img src={post.user_profiles.avatar_url} alt="" className="post-avatar" style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className="post-avatar" style={{ background: '#29beaf', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                            {post.user_profiles?.username?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="post-meta">
                          <strong style={{ color: '#fff', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {post.user_profiles?.username || 'Kingdom User'} 
                            {(post.user_profiles?.account_type === 'Disciple' || post.user_profiles?.account_type === 'Apostle') && <span style={{ color: '#29beaf', fontSize: '12px' }}><CheckIcon /></span>}
                          </strong>
                          <span style={{ color: '#8e9aab', fontSize: '12px' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="post-options"><DotsIcon /></div>
                    </div>

                    <div className="post-content">
                      <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>{post.content && post.content.length > 150 && !expandedPosts[post.id] 
      ? `${post.content.substring(0, 150)}...` 
      : post.content}
    
    {post.content && post.content.length > 150 && (
      <span 
        onClick={() => togglePostExpand(post.id)} 
        style={{ color: '#29beaf', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
      >
        {expandedPosts[post.id] ? "See less" : "See more"}
      </span>
    )}</p>
                      
                      {post.image_url && (
                        isVideo ? (
                           <video src={post.image_url} controls style={{ width: '100%', borderRadius: '12px', marginBottom: '12px', maxHeight: '400px', backgroundColor: '#000' }} />
                        ) : (
                           <img src={post.image_url} alt="Post attachment" style={{ width: '100%', borderRadius: '12px', marginBottom: '12px' }} />
                        )
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                      <div className="engage-btn" style={{ color: '#8e9aab', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}><HeartIcon /> {post.likes_count}</div>
                      <div className="engage-btn" style={{ color: '#8e9aab', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}><MessageIcon /> {post.comments_count}</div>
                      <div className="engage-btn" style={{ color: '#8e9aab', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}><ShareIcon /> Share</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <AppBottomNav />
        </div>
      )}

      {/* =========================================
          STEP 8: WORLD PRAYER DISCOVERY
          ========================================= */}
      {step === 8 && (
        <div className="feed-screen-container">
          <div className="feed-header-top" style={{ paddingBottom: '0' }}>
            <button className="back-button" onClick={() => setStep(6)} style={{ width: '36px', height: '36px' }}><BackArrowIcon /></button>
            <div style={{ textAlign: 'center' }}><h2 style={{ fontSize: '14px', margin: '0', letterSpacing: '0.5px' }} className="metallic-gold-text">World Prayer</h2></div>
            <div className="feed-header-actions" style={{ width: '36px' }}></div>
          </div>

          <div style={{ padding: '20px 20px 10px 20px' }}>
            <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Prayer Room</h1>
            <p style={{ color: '#8e9aab', fontSize: '13px', lineHeight: '1.4' }}>Join a room. Lift a request. Tap "I Prayed" — every prayer earns +1 KPC.</p>
          </div>

          <div className="feed-scroll-area" style={{ padding: '10px 0 120px 0' }}>
            <div className="prayer-discover-grid">
              {prayerRooms.map(room => (
                <div key={room.id} className="prayer-tile" style={{ backgroundColor: room.bg }} onClick={() => { setActiveRoom(room); setStep(9); }}>
                  <img src={room.img} alt={room.title} className="prayer-tile-img" />
                  <span className="prayer-tile-title">{room.title}</span>
                  <span className="prayer-tile-stats">{room.reqs} requests<br />{room.lifted} prayers lifted</span>
                </div>
              ))}
            </div>
          </div>

          <AppBottomNav />

        </div>
      )}

      {/* =========================================
          STEP 9: INDIVIDUAL PRAYER ROOM
          ========================================= */}
      {step === 9 && activeRoom && (
        <div className="feed-screen-container">
          <div className="feed-header-top" style={{ paddingBottom: '0' }}>
            <button className="back-button" onClick={() => setStep(8)} style={{ width: '36px', height: '36px' }}><BackArrowIcon /></button>
            <div style={{ textAlign: 'center' }}><h2 style={{ fontSize: '14px', margin: '0', letterSpacing: '0.5px', color: activeRoom.color }}>{activeRoom.title}</h2></div>
            <div className="feed-header-actions" style={{ width: '36px' }}></div>
          </div>

          <div style={{ padding: '20px 20px 0 20px' }}>
            <h1 style={{ color: activeRoom.color, fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>{activeRoom.title} Room</h1>
            <p style={{ color: '#8e9aab', fontSize: '13px' }}>{activeRoom.sub}</p>
          </div>

          <div className="feed-scroll-area" style={{ padding: '0 0 120px 0' }}>
            <div className="room-input-card">
              <input type="text" className="room-input" placeholder="One-line prayer point..." value={roomTitleInput} onChange={(e) => setRoomTitleInput(e.target.value)} />
              <textarea className="room-textarea" placeholder="More detail (optional)..." value={roomDetailInput} onChange={(e) => setRoomDetailInput(e.target.value)} />

              <div className="room-input-footer">
                <div className="room-checkboxes">
                  <label><input type="checkbox" checked={isUrgent} onChange={() => setIsUrgent(!isUrgent)} /> <span style={{ color: '#e5c158' }}>⚠️</span> Urgent</label>
                  <label><input type="checkbox" checked={isAnonymous} onChange={() => setIsAnonymous(!isAnonymous)} /> <span>🚫</span> Anonymous</label>
                </div>
                <button className="room-share-btn" style={{ background: `linear-gradient(90deg, ${activeRoom.color}, ${activeRoom.bg})` }} onClick={handleCreateRoomPrayer}>
                  <SendIcon /> Share
                </button>
              </div>
            </div>

            {roomRequests.filter(req => req.room_id === activeRoom.id).map(req => {
              const hasPrayed = prayedForIds.includes(req.id);
              
              return (
                <div key={req.id} className="room-request-card" style={{ borderColor: activeRoom.bg }}>
                  <div className="req-meta">
                    <strong style={{ color: '#fff' }}>{req.author_name}</strong> • {new Date(req.created_at).toLocaleDateString()}
                    {req.is_urgent && <span className="req-urgent-badge" style={{ color: activeRoom.color, background: `${activeRoom.color}20` }}>URGENT</span>}
                  </div>
                  <h3 className="req-title">{req.title}</h3>
                  {req.content && <p className="req-detail">{req.content}</p>}
                  <button 
                    className={`i-prayed-btn ${hasPrayed ? 'active' : ''}`} 
                    style={hasPrayed ? { borderColor: activeRoom.color, color: activeRoom.color } : {}} 
                    onClick={() => handleToggleRoomPray(req)}
                  >
                    <HeartIcon /> I prayed • {req.prayed_count}
                  </button>
                </div>
              );
            })}
          </div>

          <AppBottomNav />

        </div>
      )}

{/* =========================================
          STEP 10: KINGDOM HUB
          ========================================= */}
      {step === 10 && (
        <div className="feed-screen-container" style={{ position: 'relative', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
          
          <div className="kingdom-top-header">
            <button className="back-button" onClick={() => setStep(6)} style={{ width: '36px', height: '36px' }}>
              <BackArrowIcon />
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0' }} className="metallic-gold-text">
              Kingdom Hub
            </h2>
            <button className="bookstore-btn" onClick={() => setKingdomTab('Store')}>
              Bookstore
            </button>
          </div>

          <div className="feed-tabs-container" style={{ marginBottom: '10px' }}>
            {['Devotions', 'Bible Plans', 'Messages', 'Bible'].map((tab) => (
              <div key={tab} className={`feed-tab ${kingdomTab === tab ? 'active' : ''}`} onClick={() => setKingdomTab(tab)}>
                {tab}
              </div>
            ))}
          </div>

          <div className="feed-scroll-area" style={{ flexGrow: 1, padding: '0 20px 120px 20px', overflowY: 'auto' }}>

            {/* 1. DEVOTIONS */}
            {kingdomTab === 'Devotions' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 className="kingdom-section-title" style={{ margin: 0 }}>Daily Bread</h3>
                  {(userProfile?.account_type === 'Premium' || userProfile?.account_type === 'Apostle') && (
                    <span onClick={() => setIsAddDevotionModalOpen(true)} style={{ color: '#f3ca58', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>+ Publish</span>
                  )}
                </div>
                {devotionsList.map(item => (
                  <div key={item.id} className="devotion-card" onClick={() => setSelectedDevotion(item)} style={{ cursor: 'pointer', marginBottom: '15px' }}>
                    <img src={item.img || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=200'} alt="devotion" className="devotion-img" />
                    <div className="devotion-info">
                      <h4 className="devotion-title">{item.title}</h4>
                      <span className="devotion-desc">{item.scripture} • <i style={{ color: '#f3ca58' }}>By {item.author || userProfile?.local_church || 'Ministry'}</i></span>
                      <div className="reward-pill">✨ Read & Earn +{item.reward || 5} KPC</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 2. BIBLE PLANS */}
            {kingdomTab === 'Bible Plans' && (
              <>
                <h3 className="kingdom-section-title">Your Active Plans</h3>
                {biblePlansList.map(plan => (
                  <div key={plan.id} className="devotion-card" onClick={() => setSelectedPlan(plan)} style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '15px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                      <img src={plan.img} alt="plan" className="devotion-img" />
                      <div className="devotion-info">
                        <h4 className="devotion-title">{plan.title}</h4>
                        <span className="devotion-desc">{plan.desc}</span>
                        <div className="reward-pill" style={{ color: '#e5c158', background: 'rgba(229, 193, 88, 0.1)' }}>{plan.rewardText}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 3. MESSAGES */}
            {kingdomTab === 'Messages' && (
              <>
                <h3 className="kingdom-section-title">Ministry Resources</h3>
                <div className="horizontal-scroll" style={{ paddingBottom: '10px' }}>
                  {messagesList.map(msg => (
                    <div key={msg.id} className="message-card" onClick={() => setSelectedMessage(msg)} style={{ cursor: 'pointer' }}>
                      <div className="message-img-wrapper">
                        <img src={msg.img} alt="msg" className="message-img" />
                        <div className="message-play-btn" style={{ background: msg.format === 'audio' ? 'rgba(155, 89, 182, 0.8)' : msg.format === 'text' ? 'rgba(243, 202, 88, 0.8)' : 'rgba(41, 190, 175, 0.8)' }}>
                          {msg.format === 'audio' ? <span style={{fontSize:'12px'}}>🎧</span> : msg.format === 'text' ? <span style={{fontSize:'12px'}}>📖</span> : <PlayIcon />}
                        </div>
                        {msg.duration && <span className="message-duration">{msg.duration}</span>}
                      </div>
                      <span className="message-title">{msg.title}</span>
                      <span className="message-author">{msg.author}</span>
                      <span style={{ fontSize: '10px', color: '#8e9aab', textTransform: 'uppercase', marginTop: '4px' }}>{msg.format || 'Video'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 4. BIBLE READER */}
            {kingdomTab === 'Bible' && (
              <div className="bible-reader-card">
                <div className="bible-header" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                  <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} style={{ background: '#101926', color: '#f3ca58', border: '1px solid rgba(243, 202, 88, 0.3)', padding: '8px 12px', borderRadius: '10px', fontWeight: '800' }}>
                    {bibleBooks.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <select value={selectedChapter} onChange={(e) => setSelectedChapter(Number(e.target.value))} style={{ background: '#101926', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: '10px', fontWeight: '800' }}>
                    {[...Array(50).keys()].map(n => <option key={n+1} value={n+1}>Chapter {n+1}</option>)}
                  </select>
                </div>
                <div className="bible-text-body" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                  {isLoadingBible ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8e9aab' }}>Fetching Holy Scripture...</div>
                  ) : bibleVerses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8e9aab' }}>Select a book to read.</div>
                  ) : (
                    bibleVerses.map(v => (
                      <div key={v.verse} className="verse-line" style={{ marginBottom: '10px', lineHeight: '1.6' }}>
                        <span className="verse-num" style={{ color: '#29beaf', fontWeight: '800', marginRight: '8px', fontSize: '12px' }}>{v.verse}</span>
                        <span className="verse-text" style={{ color: '#e2e8f0', fontSize: '15px' }}>{v.text}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="bible-reward-banner" style={{ marginTop: '20px' }}>
                  <div className="reward-text">
                    <strong>Daily Reading Goal</strong>
                    <span>Read {selectedBook} {selectedChapter} to claim.</span>
                  </div>
                  <button className="claim-btn" style={hasClaimedChapter ? { background: '#1a2533', color: '#4a5a6e', boxShadow: 'none' } : {}} onClick={claimBibleReward} disabled={hasClaimedChapter || isLoadingBible}>
                    {hasClaimedChapter ? 'Claimed ✓' : 'Finish & Claim +5 KPC'}
                  </button>
                </div>
              </div>
            )}

            {/* 5. STORE (UPGRADED) */}
            {kingdomTab === 'Store' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 className="kingdom-section-title" style={{ margin: 0 }}>Kingdom Library</h3>
                  
                  {/* HIDDEN PUBLISH BUTTON - ONLY PREMIUM/APOSTLE CAN SEE */}
                  {hasDiscipleAccess(userProfile) && (
                    <button 
                      onClick={() => setIsAddBookModalOpen(true)} 
                      style={{ background: 'transparent', border: '1px solid #f3ca58', color: '#f3ca58', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                    >
                      + Publish Book
                    </button>
                  )}
                </div>

                <div className="store-grid">
                  {storeBooksList.map(book => (
                    <div key={book.id} className="store-card" onClick={() => setSelectedStoreBook(book)} style={{ cursor: 'pointer' }}>
                      <img
  src={
    book.img ||
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=200&q=80'
  }
  alt={book.title}
  className="store-book-cover"
/>
                      <span className="store-book-title">{book.title}</span>
                      <span className="store-book-author">{book.author}</span>
                      <button className="store-buy-btn" style={{ background: book.price === 0 || book.price === 'Free' ? 'rgba(41, 190, 175, 0.1)' : 'rgba(243, 202, 88, 0.1)', color: book.price === 0 || book.price === 'Free' ? '#29beaf' : '#f3ca58' }}>
                        {book.price === 0 || book.price === 'Free' ? 'Free' : `${book.price} KPC`}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>

          {/* =========================================
              MODALS FOR CONTENT & STORE
              ========================================= */}

          {selectedDevotion && (
            <div className="constrained-overlay" style={{ zIndex: 1000 }}><div className="create-modal-content" style={{ maxHeight: '85vh', overflowY: 'auto', padding: '20px' }}><div className="dream-modal-header" style={{ marginBottom: '15px' }}><h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>{selectedDevotion.title}</h3><button className="dream-modal-close" onClick={() => setSelectedDevotion(null)}><XIcon /></button></div>{selectedDevotion.img && (<img src={selectedDevotion.img} alt="devotion cover" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '15px' }} />)}<div style={{ margin: '15px 0' }}><span style={{ color: '#f3ca58', fontSize: '14px', fontWeight: '800' }}>📖 {selectedDevotion.scripture}</span><p style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: '1.7', marginTop: '15px', whiteSpace: 'pre-line' }}>{selectedDevotion.body || "Father, thank You for Your word today."}</p></div><button onClick={() => handleCompleteDevotion(selectedDevotion)} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f3ca58, #29beaf)', border: 'none', borderRadius: '14px', color: '#101926', fontWeight: '900', cursor: 'pointer', marginTop: '20px' }}>{readDevotionsList.includes(selectedDevotion.id) ? 'Completed ✓' : `Mark as Read & Claim +${selectedDevotion.reward || 5} KPC`}</button></div></div>
          )}
          {selectedPlan && (
            <div className="constrained-overlay" style={{ zIndex: 1000 }}><div className="create-modal-content" style={{ maxHeight: '85vh', overflowY: 'auto' }}><div className="dream-modal-header"><h3 style={{ color: '#fff', margin: 0 }}>{selectedPlan.title}</h3><button className="dream-modal-close" onClick={() => setSelectedPlan(null)}><XIcon /></button></div><img src={selectedPlan.img} alt="plan cover" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px', margin: '15px 0' }} /><p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '20px' }}>{selectedPlan.desc}</p><div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}><h4 style={{ color: '#f3ca58', margin: '0 0 10px 0' }}>Today's Assignment</h4><p style={{ color: '#fff', margin: 0, fontSize: '14px' }}>Read Romans 8:1-17</p></div><button onClick={() => { alert("Plan day completed! Rewards issued."); setSelectedPlan(null); }} style={{ width: '100%', padding: '16px', background: '#29beaf', border: 'none', borderRadius: '14px', color: '#101926', fontWeight: '900', cursor: 'pointer', marginTop: '20px' }}>Complete Today's Reading</button></div></div>
          )}
          {selectedMessage && (
            <div className="constrained-overlay" style={{ zIndex: 1000 }}><div className="create-modal-content" style={{ maxHeight: '85vh', overflowY: 'auto' }}><div className="dream-modal-header" style={{ marginBottom: '15px' }}><h3 style={{ color: '#fff', margin: 0 }}>{selectedMessage.title}</h3><button className="dream-modal-close" onClick={() => setSelectedMessage(null)}><XIcon /></button></div>{(selectedMessage.format === 'video' || selectedMessage.format === 'audio' || !selectedMessage.format) && (<div style={{ width: '100%', height: selectedMessage.format === 'audio' ? '100px' : '220px', background: '#000', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '15px' }}><span style={{ fontSize: '30px', color: '#29beaf' }}>{selectedMessage.format === 'audio' ? '🎧' : '▶'}</span><span style={{ color: '#8e9aab', fontSize: '12px', marginTop: '10px' }}>{selectedMessage.format === 'audio' ? 'Audio stream ready' : 'Video stream ready'}</span></div>)}{selectedMessage.format === 'text' && (<div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.1)' }}><p style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>This is the text transcript or article content for the selected message. The believer can read through this fully inside the app.</p></div>)}<div style={{ color: '#8e9aab', fontSize: '13px' }}>By {selectedMessage.author}</div></div></div>
          )}

          {selectedStoreBook && (
            <div className="constrained-overlay" style={{ zIndex: 1000 }}>
              <div className="create-modal-content" style={{ maxHeight: '85vh', overflowY: 'auto', padding: '20px' }}>
                <div className="dream-modal-header" style={{ marginBottom: '15px' }}>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>Library</h3>
                  <button className="dream-modal-close" onClick={() => setSelectedStoreBook(null)}><XIcon /></button>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                  <img src={selectedStoreBook.img} alt="book cover" style={{ width: '100px', height: '140px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }} />
                  <div>
                    <h3 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: '18px' }}>{selectedStoreBook.title}</h3>
                    <p style={{ color: '#29beaf', margin: '0 0 10px 0', fontSize: '13px', fontWeight: '800' }}>By {selectedStoreBook.author}</p>
                    <span style={{ display: 'inline-block', background: selectedStoreBook.price === 0 || selectedStoreBook.price === 'Free' ? 'rgba(41, 190, 175, 0.1)' : 'rgba(243, 202, 88, 0.1)', color: selectedStoreBook.price === 0 || selectedStoreBook.price === 'Free' ? '#29beaf' : '#f3ca58', padding: '4px 10px', borderRadius: '8px', fontSize: '14px', fontWeight: '900' }}>
                      {selectedStoreBook.price === 0 || selectedStoreBook.price === 'Free' ? 'Free Access' : `${selectedStoreBook.price} KPC`}
                    </span>
                  </div>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                  {selectedStoreBook.desc || "Dive deep into profound spiritual insights and biblical wisdom. This book is crafted to elevate your walk with God and equip you for ministry."}
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => openKingdomBook(selectedStoreBook)}
                    style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #f3ca58, #29beaf)', border: 'none', borderRadius: '14px', color: '#101926', fontWeight: '900', cursor: 'pointer' }}
                  >
                    {selectedStoreBook.price === 0 || selectedStoreBook.price === 'Free' ? 'Read Online Now' : `Buy for ${selectedStoreBook.price} KPC`}
                  </button>
                  <button 
                    onClick={async () => {
  try {
    if (!selectedStoreBook?.bookFilePath) {
      alert("No book file is available.");
      return;
    }

    const {
      data,
      error
    } = await supabase.storage
      .from('book_files')
      .createSignedUrl(
        selectedStoreBook.bookFilePath,
        60 * 10
      );

    if (error) throw error;

    if (!data?.signedUrl) {
      throw new Error("Could not create download link.");
    }

    const link = document.createElement('a');

    link.href = data.signedUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download =
      selectedStoreBook.bookFileName ||
      selectedStoreBook.title;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error("Download failed:", error);
    alert(
      `Download failed: ${
        error?.message || 'Unknown error'
      }`
    );
  }
}}
                  >
                    <span style={{ fontSize: '20px' }}>⬇</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LIVE READER MODAL */}
          {isReadingBook && selectedStoreBook && (
            <div className="constrained-overlay" style={{ zIndex: 1100, background: '#101926' }}>
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#fff', fontWeight: '800', fontSize: '16px' }}>{selectedStoreBook.title}</span>
                    <span style={{ color: '#8e9aab', fontSize: '12px' }}>Chapter 1</span>
                  </div>
                  <button onClick={() => setIsReadingBook(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XIcon /></button>
                </div>
                
                {selectedStoreBook?.pdfUrl ? (
  <iframe
    src={selectedStoreBook.pdfUrl}
    title={selectedStoreBook.title}
    style={{
      width: '100%',
      height: '100%',
      border: 'none',
      background: '#fff'
    }}
  />
) : (
  <div
    style={{
      padding: '40px',
      textAlign: 'center',
      color: '#8e9aab'
    }}
  >
    No PDF has been uploaded for this book.
  </div>
)}
              </div>
            </div>
          )}

          {/* PUBLISH BOOK MODAL (PREMIUM ONLY) */}
          {isAddBookModalOpen && (
            <div className="constrained-overlay" style={{ zIndex: 1000 }}>
              <div className="create-modal-content" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
                <div className="dream-modal-header" style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>Publish a Book</h3>
                  <button className="dream-modal-close" onClick={() => setIsAddBookModalOpen(false)}><XIcon /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ color: '#cbd5e1', fontSize: '11px', fontWeight: '800', marginBottom: '6px', display: 'block' }}>BOOK TITLE</label>
                    <input type="text" value={newBookForm.title} onChange={(e) => setNewBookForm({...newBookForm, title: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }} placeholder="E.g. The Power of Prayer" />
                  </div>

<div>
  <label
    style={{
      color: '#cbd5e1',
      fontSize: '11px',
      fontWeight: '800',
      marginBottom: '6px',
      display: 'block'
    }}
  >
    AUTHOR NAME
  </label>

  <input
    type="text"
    value={newBookForm.author}
    onChange={(e) =>
      setNewBookForm({
        ...newBookForm,
        author: e.target.value
      })
    }
    style={{
      width: '100%',
      padding: '12px',
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      color: '#fff',
      outline: 'none'
    }}
    placeholder="E.g. Pastor David Oyedepo"
  />
</div>

                  <div>
                    <label style={{ color: '#cbd5e1', fontSize: '11px', fontWeight: '800', marginBottom: '6px', display: 'block' }}>DESCRIPTION</label>
                    <textarea value={newBookForm.desc} onChange={(e) => setNewBookForm({...newBookForm, desc: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', height: '80px', resize: 'none' }} placeholder="What is this book about?" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(41, 190, 175, 0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(41, 190, 175, 0.3)' }}>
                    <input type="checkbox" id="isFreeCheck" checked={newBookForm.isFree} onChange={(e) => setNewBookForm({...newBookForm, isFree: e.target.checked, price: ''})} style={{ width: '18px', height: '18px', accentColor: '#29beaf' }} />
                    <label htmlFor="isFreeCheck" style={{ color: '#29beaf', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>Make this book free for the community</label>
                  </div>

                  {!newBookForm.isFree && (
                    <div>
                      <label style={{ color: '#cbd5e1', fontSize: '11px', fontWeight: '800', marginBottom: '6px', display: 'block' }}>PRICE (KPC)</label>
                      <input type="number" value={newBookForm.price} onChange={(e) => setNewBookForm({...newBookForm, price: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(243, 202, 88, 0.3)', borderRadius: '10px', color: '#f3ca58', outline: 'none', fontWeight: '900', fontSize: '16px' }} placeholder="E.g. 50" />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>

  {/* COVER IMAGE */}
  <label
    style={{
      flex: 1,
      padding: '12px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px dashed rgba(255,255,255,0.3)',
      borderRadius: '10px',
      color: '#cbd5e1',
      fontSize: '12px',
      fontWeight: '800',
      cursor: 'pointer',
      textAlign: 'center'
    }}
  >
    {newBookForm.coverFile
      ? `✓ ${newBookForm.coverFile.name}`
      : '+ Upload Cover Image'}

    <input
      type="file"
      accept="image/*"
      onChange={(e) => handleBookFileSelect(e, 'cover')}
      style={{ display: 'none' }}
    />
  </label>

  {/* PDF / EPUB */}
  <label
    style={{
      flex: 1,
      padding: '12px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px dashed rgba(255,255,255,0.3)',
      borderRadius: '10px',
      color: '#cbd5e1',
      fontSize: '12px',
      fontWeight: '800',
      cursor: 'pointer',
      textAlign: 'center'
    }}
  >
    {newBookForm.pdfFile
      ? `✓ ${newBookForm.pdfFile.name}`
      : '+ Upload PDF/EPUB'}

    <input
      type="file"
      accept=".pdf,.epub,application/pdf,application/epub+zip"
      onChange={(e) => handleBookFileSelect(e, 'pdf')}
      style={{ display: 'none' }}
    />
  </label>

</div>

{/* COVER PREVIEW */}
{newBookForm.coverPreview && (
  <div style={{ marginTop: '15px', textAlign: 'center' }}>
    <img
      src={newBookForm.coverPreview}
      alt="Book cover preview"
      style={{
        width: '110px',
        height: '150px',
        objectFit: 'cover',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
      }}
    />
  </div>
)}

{/* FILE STATUS */}
{newBookForm.pdfFile && (
  <div
    style={{
      marginTop: '10px',
      padding: '10px',
      background: 'rgba(41,190,175,0.08)',
      borderRadius: '8px',
      color: '#29beaf',
      fontSize: '11px',
      fontWeight: '700'
    }}
  >
    PDF/EPUB selected: {newBookForm.pdfFile.name}
  </div>
)}
                </div>

                <button 
  onClick={async () => {
  if (!newBookForm.title.trim()) {
    alert("Please provide a book title.");
    return;
  }

  if (!newBookForm.coverFile) {
    alert("Please upload a cover image.");
    return;
  }

  if (!newBookForm.pdfFile) {
    alert("Please upload the PDF or EPUB file.");
    return;
  }

  if (
    !newBookForm.isFree &&
    (!newBookForm.price || Number(newBookForm.price) <= 0)
  ) {
    alert("Please enter a valid KPC price.");
    return;
  }

  try {
    setIsUploadingBook(true);

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) throw authError;

    if (!user) {
      throw new Error("You must be logged in.");
    }

    const timestamp = Date.now();

    const coverExtension =
      newBookForm.coverFile.name
        .split('.')
        .pop()
        ?.toLowerCase() || 'jpg';

    const coverPath =
      `${user.id}/${timestamp}-cover.${coverExtension}`;

    const {
      error: coverError
    } = await supabase.storage
      .from('book_covers')
      .upload(
        coverPath,
        newBookForm.coverFile,
        {
          cacheControl: '3600',
          upsert: false,
          contentType: newBookForm.coverFile.type
        }
      );

    if (coverError) {
      throw new Error(
        `Cover upload failed: ${coverError.message}`
      );
    }

    const {
      data: coverPublicData
    } = supabase.storage
      .from('book_covers')
      .getPublicUrl(coverPath);

    const coverUrl =
      coverPublicData?.publicUrl || null;

    const bookExtension =
      newBookForm.pdfFile.name
        .split('.')
        .pop()
        ?.toLowerCase() || 'pdf';

    const bookPath =
      `${user.id}/${timestamp}-book.${bookExtension}`;

    const {
      error: bookFileError
    } = await supabase.storage
      .from('book_files')
      .upload(
        bookPath,
        newBookForm.pdfFile,
        {
          cacheControl: '3600',
          upsert: false,
          contentType:
            newBookForm.pdfFile.type ||
            (
              bookExtension === 'epub'
                ? 'application/epub+zip'
                : 'application/pdf'
            )
        }
      );

    if (bookFileError) {
      await supabase.storage
        .from('book_covers')
        .remove([coverPath]);

      throw new Error(
        `Book file upload failed: ${bookFileError.message}`
      );
    }

   const authorName = newBookForm.author.trim();

if (!authorName) {
  await supabase.storage
    .from('book_covers')
    .remove([coverPath]);

  await supabase.storage
    .from('book_files')
    .remove([bookPath]);

  alert("Please enter the author's name.");
  return;
}

    const {
      data: insertedBook,
      error: insertError
    } = await supabase
      .from('kingdom_books')
      .insert([{
        title: newBookForm.title.trim(),

        description:
          newBookForm.desc.trim() || null,

        author_id: user.id,

        author_name: authorName,

        price_kpc:
          newBookForm.isFree
            ? 0
            : Number(newBookForm.price),

        is_free:
          newBookForm.isFree,

        cover_url:
          coverUrl,

        cover_path:
          coverPath,

        book_file_path:
          bookPath,

        book_file_name:
          newBookForm.pdfFile.name,

        book_file_type:
          bookExtension,

        is_published:
          true
      }])
      .select()
      .single();

    if (insertError) {
      await supabase.storage
        .from('book_covers')
        .remove([coverPath]);

      await supabase.storage
        .from('book_files')
        .remove([bookPath]);

      throw new Error(
        `Could not save the book: ${insertError.message}`
      );
    }

    const bookForLibrary = {
      id: insertedBook.id,

      title: insertedBook.title,

      author:
        insertedBook.author_name,

      price:
        insertedBook.is_free
          ? 0
          : Number(insertedBook.price_kpc),

      desc:
        insertedBook.description || '',

      img:
        insertedBook.cover_url,

      pdfUrl:
        null,

      bookFileName:
        insertedBook.book_file_name,

      bookFileType:
        insertedBook.book_file_type,

      authorId:
        insertedBook.author_id,

      bookFilePath:
        insertedBook.book_file_path,

      createdAt:
        insertedBook.created_at
    };

    setStoreBooksList(prev => [
      bookForLibrary,
      ...prev
    ]);

    setNewBookForm({
  title: '',
  author: '',
  desc: '',
  price: '',
  isFree: false,
  coverFile: null,
  pdfFile: null,
  coverPreview: '',
  coverUrl: '',
  pdfUrl: ''
});

    setIsAddBookModalOpen(false);

    alert(
      "Book successfully published to the Kingdom Library!"
    );

  } catch (error) {

    console.error(
      "Kingdom bookstore publish error:",
      error
    );

    alert(
      error?.message ||
      "Something went wrong while publishing this book."
    );

  } finally {

    setIsUploadingBook(false);

  }
}}
disabled={isUploadingBook}
  style={{
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #f3ca58, #29beaf)',
    border: 'none',
    borderRadius: '14px',
    color: '#101926',
    fontWeight: '900',
    cursor: isUploadingBook ? 'wait' : 'pointer',
    marginTop: '25px',
    opacity: isUploadingBook ? 0.7 : 1
  }}
>
  {isUploadingBook ? 'Uploading Book...' : 'Publish Book'}
</button>              </div>
            </div>
          )}

          <AppBottomNav />
        </div>
      )}


    {/* =========================================
          STEP 11: TREASURY
          ======================================== */}
      {step === 11 && (
        <div className="feed-screen-container">

          <div className="treasury-header-top">
            <button className="back-button" onClick={() => setStep(6)} style={{ width: '36px', height: '36px' }}>
              <BackArrowIcon />
            </button>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: '0' }} className="metallic-gold-text">
              The Kingdom
            </h2>
            <div style={{ width: '36px' }}></div>
          </div>

          <div className="feed-scroll-area" style={{ paddingBottom: '120px' }}>
            <h1 className="treasury-title" style={{ textAlign: 'center' }}>My Treasury</h1>

            {/* CENTERED Main Balance Card */}
            <div className="treasury-balance-card" style={{ padding: '30px 20px', borderRadius: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0a0f1a 100%)', border: '1px solid rgba(243, 202, 88, 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>
                Available Treasury Balance
              </div>
              
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ color: '#f3ca58', fontSize: '46px', fontWeight: '900', letterSpacing: '-1px' }}>
                  {Number(kpcBalance || 0).toLocaleString()}
                </span>
                <span style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>KPC</span>
              </div>
              
              <div style={{ color: '#29beaf', fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>
                ≈ ${(kpcBalance * 0.25).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </div>

              <div 

                onClick={() => {

                  if (!generatedAddress) return;

                  navigator.clipboard.writeText(generatedAddress); 

                  alert("Solana Wallet Address copied to clipboard!"); 

                }}

                style={{ width: '100%', maxWidth: '340px', background: 'rgba(0, 0, 0, 0.4)', padding: '12px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'pointer' }}

              >

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>

                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71', flexShrink: 0, boxShadow: '0 0 10px #2ecc71' }}></div>

                  <span style={{ color: '#cbd5e1', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>

                    {generatedAddress ? generatedAddress : 'No Wallet Connected'}

                  </span>

                </div>

                <div style={{ color: '#f3ca58', display: 'flex', alignItems: 'center', marginLeft: '10px' }}>

                  <CopyIcon />

                </div>

              </div>

            </div>

            <div className="treasury-actions-row">
              <div className="treasury-action-item" onClick={() => setActiveModal('send')}>
                <div className="treasury-action-circle" style={{ color: '#f3ca58', background: 'rgba(243, 202, 88, 0.1)' }}><SendIcon /></div>
                <span className="treasury-action-label">Give /<br />Send</span>
              </div>
              
              {(userProfile?.account_type === 'Premium' || userProfile?.account_type === 'Apostle') ? (
                <div className="treasury-action-item" onClick={() => setActiveModal('qr')}>
                  <div className="treasury-action-circle" style={{ color: '#29beaf', background: 'rgba(41, 190, 175, 0.1)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
                  </div>
                  <span className="treasury-action-label">Church<br />QR</span>
                </div>
              ) : (
                <div className="treasury-action-item" onClick={() => setActiveModal('scan')}>
                  <div className="treasury-action-circle" style={{ color: '#29beaf', background: 'rgba(41, 190, 175, 0.1)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  </div>
                  <span className="treasury-action-label">Scan<br />QR</span>
                </div>
              )}

              <div className="treasury-action-item" onClick={() => setStep(12)} >
                <div className="treasury-action-circle" style={{ color: '#9b59b6', background: 'rgba(155, 89, 182, 0.1)' }}><BriefcaseIcon /></div>
                <span className="treasury-action-label">Hire<br />(Services)</span>
              </div>

              <div className="treasury-action-item" onClick={() => setActiveModal('upgrade')}>
                <div className="treasury-action-circle" style={{ color: '#e5c158', background: 'rgba(229, 193, 88, 0.1)' }}><CrownIcon /></div>
                <span className="treasury-action-label">Upgrade<br />(Premium)</span>
              </div>
              
              <div className="treasury-action-item" onClick={() => setActiveModal('swap')}>
                <div className="treasury-action-circle" style={{ color: '#e67e22', background: 'rgba(230, 126, 34, 0.1)' }}>
                  <SwapIcon />
                </div>
                <span className="treasury-action-label">Swap<br />Tokens</span>
              </div>
            </div>

            {/* Activity Ledger Section */}
            <div className="activity-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className="activity-title" style={{ margin: 0 }}>Spiritual Activity</h3>
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.25)', padding: '4px', borderRadius: '10px' }}>
                  {['ALL', 'EARN', 'SPEND'].map(tab => (
                    <button 
                      key={tab} onClick={() => setTxFilter(tab)}
                      style={{ background: txFilter === tab ? '#29beaf' : 'transparent', color: txFilter === tab ? '#101926' : '#8e9aab', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(!txHistory || txHistory.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '30px 15px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', color: '#64748b', fontSize: '13px' }}>
                    No transactions yet. Start streaming or receiving KPC!
                  </div>
                ) : (
                  txHistory.filter(tx => txFilter === 'ALL' || (txFilter === 'EARN' && tx.isPositive) || (txFilter === 'SPEND' && !tx.isPositive)).map((tx, idx) => {
                    return (
                      <div key={tx.id || idx} className="activity-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="activity-icon-wrap" style={{ color: tx.isPositive ? '#2ecc71' : '#e74c3c' }}>
                          {tx.type === 'AIRDROP' ? <HandCoinIcon /> : tx.isPositive ? <LightningIcon /> : <ChurchIcon />}
                        </div>
                        <div className="activity-details" style={{ flex: 1, padding: '0 12px', overflow: 'hidden' }}>
                          <span className={`activity-amount ${tx.isPositive ? 'amount-plus' : 'amount-minus'}`}>{tx.isPositive ? `+${tx.amount}` : `-${tx.amount}`} KPC</span>
                          <span className="activity-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{tx.title}</span>
                          <span className="activity-time">{tx.date} • <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>Confirmed</span></span>
                        </div>
                        <div className={`activity-badge ${tx.isPositive ? 'badge-earned' : 'badge-spent'}`}>{tx.isPositive ? 'Earned' : 'Spent'}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* =========================================
              UNIFIED OVERLAY MODALS ARCHITECTURE
              ========================================= */}
          
          {/* 1. GIVE / SEND MODAL (Now Wired to DB) */}
          {activeModal === 'send' && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 15, 26, 0.9)', backdropFilter: 'blur(15px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', maxWidth: '500px', background: '#1e293b', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', animation: 'slideUp 0.3s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '900' }}>Give & Send KPC</h3>
                  <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#8e9aab', cursor: 'pointer' }}><XIcon /></button>
                </div>

                <form onSubmit={handleLiveTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>RECIPIENT (@USERNAME OR FULL NAME)</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 15px' }}>
                      <span style={{ color: '#29beaf', fontWeight: '800' }}>@</span>
                      <input 
                        type="text" value={transferUsername} onChange={(e) => setTransferUsername(e.target.value)} 
                        placeholder="gracesanctuary OR Pastor David" required 
                        style={{ width: '100%', padding: '15px 10px', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '15px' }} 
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>AMOUNT (KPC)</label>
                    <input 
                      type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} 
                      placeholder="0.00" min="1" max={kpcBalance} required 
                      style={{ width: '100%', padding: '15px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f3ca58', outline: 'none', fontSize: '20px', fontWeight: '800' }} 
                    />
                    <div style={{ textAlign: 'right', marginTop: '6px', color: '#8e9aab', fontSize: '11px' }}>Available: {kpcBalance} KPC</div>
                  </div>

                  <button type="submit" disabled={isTransferring} style={{ marginTop: '10px', width: '100%', padding: '18px', background: 'linear-gradient(135deg, #f3ca58, #29beaf)', border: 'none', borderRadius: '14px', color: '#101926', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}>
                    {isTransferring ? 'Processing Ledger...' : 'CONFIRM TRANSFER'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* CHURCH QR PROJECTION & DOWNLOAD MODAL */}
          {activeModal === 'qr' && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#101926', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
              <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XIcon /></button>
              
              <h2 className="metallic-gold-text" style={{ fontSize: '32px', marginBottom: '5px', textAlign: 'center' }}>{userProfile?.full_name || 'Your Ministry'}</h2>
              <p style={{ color: '#29beaf', fontSize: '20px', fontWeight: '800', marginBottom: '40px', textAlign: 'center' }}>Scan to Give / Tithe</p>
              
              <div style={{ background: '#fff', padding: '20px', borderRadius: '24px', boxShadow: '0 0 50px rgba(243, 202, 88, 0.2)' }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${userProfile?.full_name || 'treasury'}&color=101926`} alt="Church QR Code" style={{ width: '300px', height: '300px', borderRadius: '8px' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
                <button onClick={downloadQR} style={{ padding: '12px 24px', background: 'transparent', border: '2px solid #29beaf', color: '#29beaf', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
                  Download for Offline
                </button>
                <button onClick={() => document.documentElement.requestFullscreen()} style={{ padding: '12px 24px', background: '#f3ca58', border: 'none', color: '#101926', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
                  Project Live
                </button>
              </div>
            </div>
          )}

          {/* LIVE SCAN QR VIEWFINDER MODAL */}
          {activeModal === 'scan' && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 15, 26, 0.95)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
              <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}><XIcon /></button>
              
              <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', marginBottom: '10px' }}>Scan to Give / Tithe</h3>
              <p style={{ color: '#8e9aab', fontSize: '13px', marginBottom: '30px', textAlign: 'center' }}>Point your camera at the church screen QR code</p>
              
              {/* LIVE QR SCANNER COMPONENT */}
              <div style={{ width: '280px', height: '280px', borderRadius: '24px', overflow: 'hidden', position: 'relative', border: '2px dashed #29beaf', background: '#000' }}>
                <Scanner 
                  onScan={(detectedCodes) => {
                    if (detectedCodes && detectedCodes.length > 0) {
                      const scannedUsername = detectedCodes[0].rawValue;
                      alert(`Connected to ${scannedUsername}'s Treasury!`);
                      setTransferUsername(scannedUsername);
                      setActiveModal('send');
                    }
                  }}
                  onError={(error) => console.log("Scanner Error:", error?.message)}
                  components={{ audio: false }}
                  styles={{ container: { width: '100%', height: '100%' } }}
                />
              </div>

              <button 
                onClick={() => {
                  alert("Simulated QR Read: Connected to Grace Sanctuary treasury!");
                  setTransferUsername('Grace Sanctuary');
                  setActiveModal('send');
                }}
                style={{ marginTop: '30px', padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#8e9aab', fontSize: '12px', cursor: 'pointer' }}
              >
                Test Manual Override
              </button>
            </div>
          )}

          <AppBottomNav />
        </div>
      )}

      {/* =========================================
          STEP 12: HIRE SERVICES (ESCROW ECOSYSTEM)
          ========================================= */}
      {step === 12 && (
        <div className="feed-screen-container">

          <div className="treasury-header-top" style={{ paddingBottom: '5px' }}>
            <button className="back-button" onClick={() => setStep(11)} style={{ width: '36px', height: '36px' }}>
              <BackArrowIcon />
            </button>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: '0' }} className="metallic-gold-text">
              The Kingdom
            </h2>
            <div style={{ width: '36px' }}></div>
          </div>

          <div style={{ padding: '10px 20px 5px 20px' }}>
            <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0' }}>Hire Services</h1>
            <p style={{ color: '#8e9aab', fontSize: '12px', lineHeight: '1.4', margin: 0 }}>
              Kingdom freelancers paid in KPC. Funds held in escrow until you approve.
            </p>
          </div>

          {/* Category Filter Horizontal Scroll */}
          <div className="feed-tabs-container" style={{ margin: '15px 0 10px 0' }}>
            {['All', 'Design', 'Audio', 'Video', 'Writing'].map((tab) => (
              <div key={tab} className={`feed-tab ${hireTab === tab ? 'active' : ''}`} onClick={() => setHireTab(tab)}>
                {tab}
              </div>
            ))}
          </div>

          <div className="feed-scroll-area" style={{ padding: '0 20px 120px 20px' }}>
            {freelancers
              .filter(f => hireTab === 'All' || f.cat === hireTab)
              .map((freelancer) => (
                <div key={freelancer.id} className="hire-freelancer-card">
                  <div className="freelancer-top">
                    <div className="freelancer-profile">
                      <div className="freelancer-avatar-box">
                        <BriefcaseIcon />
                      </div>
                      <div className="freelancer-meta">
                        <span className="freelancer-name">{freelancer.name}</span>
                        <span className="freelancer-handle">{freelancer.handle}</span>
                        <span className="freelancer-service">{freelancer.service}</span>
                        <div className="freelancer-rating">
                          <span style={{ color: '#f3ca58' }}>★</span> {freelancer.rating} • {freelancer.jobs} jobs
                        </div>
                      </div>
                    </div>

                    <div className="freelancer-pricing">
                      <span className="price-value">{freelancer.price}</span>
                      <span className="price-unit">KPC / job</span>
                    </div>
                  </div>

                  <button
                    className="escrow-btn"
                    disabled={processingId !== null}
                    onClick={() => handleHireAndEscrow(freelancer)}
                  >
                    <BriefcaseIcon />
                    {processingId === freelancer.id ? 'Securing Escrow...' : 'Hire & Escrow'}
                  </button>
                </div>
              ))}
          </div>

          <AppBottomNav />
        </div>
      )}
      {/* =========================================
          STEP 13: UPGRADE PLAN (PREMIUM TIERS)
          ========================================= */}
      {step === 13 && (
        <div className="feed-screen-container" style={{ paddingBottom: '100px' }}>

          <div className="treasury-header-top" style={{ paddingBottom: '5px' }}>
            <button className="back-button" onClick={() => setStep(11)} style={{ width: '36px', height: '36px' }}>
              <BackArrowIcon />
            </button>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: '0' }} className="metallic-gold-text">
              The Kingdom
            </h2>
            <div style={{ width: '36px' }}></div>
          </div>

          <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: '800', margin: '10px 20px 0 20px' }}>Upgrade Plan</h1>
          <p className="upgrade-subtitle">
            Unlock deeper experiences, publishing rights, and richer rewards across the Kingdom.
          </p>

          <div className="feed-scroll-area" style={{ padding: '0 20px' }}>

            {/* STANDARD */}
{userProfile?.account_type !== 'Ministry' && (
  <div
    className="upgrade-card"
    onClick={() =>
      setSelectedUpgrade('Standard')
    }
    style={{
      border:
        (
          userProfile?.membership_tier ||
          userTier
        ) === 'Standard'
          ? '1px solid #29beaf'
          : undefined
    }}
  >
    <div className="tier-header-top">

      <div
        className="tier-icon-box"
        style={{
          borderColor:
            'rgba(255,255,255,0.2)',
          color: '#8e9aab'
        }}
      >
        <ShieldIcon />
      </div>

      <div className="tier-title-wrap">
        <span className="tier-title">
          Standard
        </span>

        <span className="tier-desc">
          Begin your Kingdom journey
        </span>
      </div>

    </div>

    <div className="tier-pricing">
      <span
        className="tier-price"
        style={{
          color: '#fff'
        }}
      >
        Free
      </span>

      <span className="tier-period">
        — Free forever
      </span>
    </div>

    <div className="tier-features">

      <div className="feature-item">
        <div className="feature-check">
          <CheckIcon />
        </div>
        Daily devotionals & Sanctuary feed
      </div>

      <div className="feature-item">
        <div className="feature-check">
          <CheckIcon />
        </div>
        Earn KPC through engagement
      </div>

      <div className="feature-item">
        <div className="feature-check">
          <CheckIcon />
        </div>
        Basic Kingdom community access
      </div>

    </div>

  </div>
)}

            {/* Disciple (250 KPC) */}
            <div
              className={`upgrade-card tier-disciple ${selectedUpgrade === 'Disciple' ? 'selected' : ''}`}
              onClick={() => setSelectedUpgrade('Disciple')}
            >
              <div className="most-chosen-badge">Most chosen</div>
              <div className="tier-header-top">
                <div className="tier-icon-box"><SparklesIcon /></div>
                <div className="tier-title-wrap">
                  <span className="tier-title">Disciple</span>
                  <span className="tier-desc">Grow deeper</span>
                </div>
              </div>
              <div className="tier-pricing">
                <span className="tier-price">250</span>
                <span className="tier-period">KPC / month</span>
              </div>
              <div className="tier-features">
                <div className="feature-item"><div className="feature-check"><CheckIcon /></div>Everything in Seeker</div>
                <div className="feature-item"><div className="feature-check"><CheckIcon /></div>Ad-free media library</div>
                <div className="feature-item"><div className="feature-check"><CheckIcon /></div>2x KPC rewards on Bible streaks</div>
                <div className="feature-item"><div className="feature-check"><CheckIcon /></div>Place price tags on published books</div>
              </div>
            </div>

            {/* Apostle (900 KPC) */}
            <div
              className={`upgrade-card ${selectedUpgrade === 'Apostle' ? 'selected' : ''}`}
              onClick={() => setSelectedUpgrade('Apostle')}
            >
              <div className="tier-header-top">
                <div className="tier-icon-box"><CrownOutlineIcon /></div>
                <div className="tier-title-wrap">
                  <span className="tier-title">Apostle</span>
                  <span className="tier-desc">Lead & build</span>
                </div>
              </div>
              <div className="tier-pricing">
                <span className="tier-price">900</span>
                <span className="tier-period">KPC / month</span>
              </div>
              <div className="tier-features">
                <div className="feature-item"><div className="feature-check"><CheckIcon /></div>Everything in Disciple</div>
                <div className="feature-item"><div className="feature-check"><CheckIcon /></div>Verified gold badge</div>
                <div className="feature-item"><div className="feature-check"><CheckIcon /></div>Host & monetize conference videos</div>
                <div className="feature-item"><div className="feature-check"><CheckIcon /></div>Lower service-hire fees (1%)</div>
                <div className="feature-item"><div className="feature-check"><CheckIcon /></div>Early access to new vaults</div>
              </div>
            </div>

          </div>

          <div className="footer-lock">
            <button
  className="action-button"
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px'
  }}
  onClick={handleUpgradeMembershipTier}
  disabled={
    isUpgrading ||
    !selectedUpgrade ||
    selectedUpgrade ===
      (
        userProfile?.membership_tier ||
        userTier
      )
  }
>
  <LightningIcon />

  {isUpgrading
    ? 'Processing...'
    : selectedUpgrade ===
      (
        userProfile?.membership_tier ||
        userTier
      )
      ? 'Current Plan'
      : `Upgrade to ${selectedUpgrade}`
  }
</button>
          </div>

        </div>
      )}

     {/* =========================================
          STEP 14: DREAM DIARY
          ========================================= */}
      {step === 14 && (
        <div className="feed-screen-container" style={{ position: 'relative', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
          <div className="feed-header-top" style={{ paddingBottom: '10px' }}>
            <button className="back-button" onClick={() => setStep(6)} style={{ width: '36px', height: '36px' }}>
              <BackArrowIcon />
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0' }}>
              <span style={{ color: '#f3ca58' }}>Dream</span> <span style={{ color: '#29beaf' }}>Diary</span>
            </h2>
            <div style={{ width: '36px' }}></div>
          </div>
          <div className="feed-scroll-area" style={{ flexGrow: 1, paddingBottom: '120px' }}>

            <div className="dream-hero-card">
              <div className="dream-hero-tag"><SparklesIcon /> Night Chronicles</div>
              <h1 className="dream-hero-title">What did God whisper in the night?</h1>
              <p className="dream-hero-desc">Journal every dream. Request interpretation from KingdomPlus Team  with KPC.</p>

              <div className="dream-hero-stats">
                <div className="dream-stat-group">
                  <div className="dream-stat">
                    <span className="dream-stat-num">{dreams.length}</span>
                    <span className="dream-stat-label">DREAMS</span>
                  </div>
                  <div className="dream-stat" style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '20px' }}>
                    <span className="dream-stat-num">{dreams.filter(d => d.status === 'PENDING').length}</span>
                    <span className="dream-stat-label">IN REVIEW</span>
                  </div>
                </div>
                <button className="dream-new-btn" onClick={() => setIsDreamModalOpen(true)}>
                  <PlusIcon /> New
                </button>
              </div>
            </div>

            <div className="feed-tabs-container" style={{ marginBottom: '15px', marginLeft: '-20px', marginRight: '-20px', padding: '0 20px' }}>
              {['Last night', 'Morning vision', 'Recurring', 'Prophetic'].map((tab) => (
                <div key={tab} className={`feed-tab ${dreamTab === tab ? 'active' : ''}`} onClick={() => setDreamTab(tab)}>
                  {tab === 'Last night' && <MoonIcon />}
                  {tab === 'Morning vision' && <span style={{ fontSize: '12px' }}>☀️</span>}
                  {tab === 'Recurring' && <span style={{ fontSize: '12px' }}>🔄</span>}
                  {tab === 'Prophetic' && <span style={{ fontSize: '12px' }}>🕊️</span>}
                  <span style={{ marginLeft: '4px' }}>{tab}</span>
                </div>
              ))}
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dreams.length === 0 ? (
                <div className="empty-dream-state">
                  <div className="empty-dream-icon">✨</div>
                  <h3>Your diary is empty</h3>
                  <p>Record your dreams in the night and seek interpretation from prophets.</p>
                  <button className="dream-new-btn" style={{ marginTop: '15px' }} onClick={() => setIsDreamModalOpen(true)}>
                    Record a Dream
                  </button>
                </div>
              ) : (
                dreams.map(dream => {
                  const moodConfig = getMoodConfig(dream.mood);

                  return (
                    <div key={dream.id} className={`dream-list-card ${moodConfig.bgClass}`}>
                      {dream.status === 'PENDING' && (
                        <div className="dream-badge-pending"><SparklesIcon /> PENDING</div>
                      )}
                      <span className="dream-card-date">{dream.date}</span>
                      <h3 className="dream-card-title">{dream.title}</h3>
                      <p className="dream-card-desc">{dream.desc}</p>

                      {dream.desc.length > 100 && (
                        <span className="read-more-link" onClick={() => setSelectedDreamToView(dream)}>Read more ➔</span>
                      )}

                      <div className="dream-card-actions">
                        <button className="dream-action-btn" onClick={() => setSelectedDreamToView(dream)}>
                          <EyeIcon /> View
                        </button>
                        <button className="dream-action-btn">
                          <CopyIcon /> Copy
                        </button>
                        {!dream.status && (
                          <button className="dream-action-btn submit-btn" onClick={() => alert('Sending to prophets...')}>
                            <LinkIcon /> Submit
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>


          <AppBottomNav />

{/* =========================================================
              DETAILED VIEW MODAL
              ========================================================= */}
          {selectedDreamToView && (
            <div className="constrained-overlay">
              <div className={`view-modal-content ${getMoodConfig(selectedDreamToView.mood).bgClass}`}>

                <div className="view-modal-header">
                  <div className="view-mood-icon" style={{ color: getMoodConfig(selectedDreamToView.mood).color }}>
                    {getMoodConfig(selectedDreamToView.mood).icon}
                  </div>
                  <button className="view-modal-close" onClick={() => setSelectedDreamToView(null)}><XIcon /></button>
                </div>

                <div className="view-meta">
                  {selectedDreamToView.date} • {selectedDreamToView.mood.toUpperCase()}
                </div>

                <h2 className="view-title">{selectedDreamToView.title}</h2>
                <div className="view-body">{selectedDreamToView.desc}</div>

                {/* --- PENDING STATE --- */}
                {selectedDreamToView.status === 'PENDING' && (
                  <div className="pending-banner">
                    <div className="pending-banner-title"><SparklesIcon /> Interpretation pending</div>
                    <div className="pending-banner-desc">Our prophets are seeking insight for your dream.</div>
                  </div>
                )}

                {/* --- INTERPRETED STATE --- */}
                {selectedDreamToView.status === 'INTERPRETED' && (
                  <div className="interpretation-banner" style={{ marginTop: '15px', padding: '16px', background: 'rgba(41, 190, 175, 0.1)', border: '1px solid #29beaf', borderRadius: '16px' }}>
                    <div className="interpretation-title" style={{ color: '#29beaf', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <SparklesIcon /> Prophetic Insight
                    </div>
                    <div className="interpretation-text" style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: '1.6' }}>
                      {selectedDreamToView.interpretation_text}
                    </div>
                  </div>
                )}

                <div className="dream-card-actions" style={{ marginTop: 'auto' }}>
                  <button className="dream-action-btn">
                    <CopyIcon /> Copy
                  </button>
                  {!selectedDreamToView.status && (
                    <button className="dream-action-btn submit-btn">
                      <LinkIcon /> Submit
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* =========================================================
              DREAM CREATION MODAL
              ========================================================= */}
          {isDreamModalOpen && (
            <div className="constrained-overlay">
              <div className="create-modal-content">

                <div className="dream-modal-header">
                  <div className="dream-modal-title">
                    <h2>New Dream</h2>
                    <span>Step {dreamStepModal} of 3</span>
                  </div>
                  <button className="dream-modal-close" onClick={() => setIsDreamModalOpen(false)}>Close</button>
                </div>

                <div className="dream-progress-bar">
                  <div className={`dream-progress-segment ${dreamStepModal >= 1 ? 'active' : ''}`}></div>
                  <div className={`dream-progress-segment ${dreamStepModal >= 2 ? 'active' : ''}`}></div>
                  <div className={`dream-progress-segment ${dreamStepModal >= 3 ? 'active' : ''}`}></div>
                </div>

                <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                  {dreamStepModal === 1 && (
                    <div>
                      <label className="dream-input-label">TITLE</label>
                      <input type="text" className="dream-input" placeholder="A river of gold..." value={newDream.title} onChange={e => setNewDream({ ...newDream, title: e.target.value })} />

                      <label className="dream-input-label">DESCRIBE IT</label>
                      <textarea className="dream-textarea" placeholder="What did you see, hear, feel? Who was there?" value={newDream.desc} onChange={e => setNewDream({ ...newDream, desc: e.target.value })}></textarea>

                      <label className="dream-input-label">VOICE MEMO</label>
                      <button className="dream-action-btn" style={{ width: 'auto', padding: '10px 16px', color: '#8e9aab', marginBottom: '20px' }}>
                        <LockIcon /> Voice (Premium)
                      </button>
                    </div>
                  )}

                  {dreamStepModal === 2 && (
                    <div>
                      <label className="dream-input-label">MOOD</label>
                      <div className="mood-grid">
                        {moods.map(mood => (
                          <div key={mood.name} className={`mood-btn ${newDream.mood === mood.name ? 'selected' : ''}`} onClick={() => setNewDream({ ...newDream, mood: mood.name })}>
                            {mood.icon}
                            {mood.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dreamStepModal === 3 && (
                    <div>
                      <div className="interpret-checkbox-card" onClick={() => setNewDream({ ...newDream, requestInterpretation: !newDream.requestInterpretation })}>
                        <div className={`checkbox-square ${newDream.requestInterpretation ? 'checked' : ''}`}>
                          {newDream.requestInterpretation && <CheckIcon />}
                        </div>
                        <div>
                          <strong style={{ color: '#e5c158', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <LinkIcon />
                            Request interpretation — 25 KPC
                          </strong>
                          <span style={{ color: '#8e9aab', fontSize: '11px', lineHeight: '1.4' }}>Our prophetic team will respond within 48 hours with scripture-backed insight.</span>
                        </div>
                      </div>

                      <label className="dream-input-label">REVIEW</label>
                      <div className="dream-review-card">
                        <h4 className="dream-review-title">{newDream.title || 'Untitled'}</h4>
                        <p className="dream-review-desc">{newDream.desc || 'No description provided.'}</p>
                        {newDream.mood && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', color: '#e2e8f0' }}>
                            {getMoodConfig(newDream.mood).icon}
                            {newDream.mood}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-actions" style={{ marginTop: '20px' }}>
                  {dreamStepModal > 1 && (
                    <button className="modal-btn-secondary" onClick={() => setDreamStepModal(prev => prev - 1)}>Back</button>
                  )}
                  {dreamStepModal < 3 ? (
                    <button className="modal-btn-primary" onClick={() => setDreamStepModal(prev => prev + 1)}>Continue</button>
                  ) : (
                    <button className="modal-btn-primary" onClick={handleDreamSave} disabled={isSubmittingDream}>
                      {isSubmittingDream ? 'Processing...' : (newDream.requestInterpretation ? 'Submit & Pay 25 KPC' : 'Save Dream')}
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================
          STEP 15: LOGIN PAGE
          ========================================= */}
      {step === 15 && (
        <div className="feed-screen-container">
          <div className="login-container">

            <div className="login-logo-box">
              <CrownIcon />
            </div>

            <h1 className="login-title metallic-gold-text">Welcome back</h1>
            <p className="login-subtitle">Sign in to your Kingdom sanctuary</p>
            <button
              className="google-btn"
              onClick={() => alert("Google Web3 Auth: To connect an existing Gmail account, please use your registered email below during devnet testing.")}
            >
              <GoogleIcon /> Continue with Google
            </button>

            <div className="login-divider">OR</div>

            <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="login-input-wrap">
                <div className="login-input-icon"><MailIcon /></div>
                <input
                  type="text"
                  placeholder="Email or Username"
                  className="login-input"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>

              <div className="login-input-wrap">
                <div className="login-input-icon"><LockIcon /></div>
                <input
                  type="password"
                  placeholder="Password"
                  className="login-input"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="login-submit-btn" style={{ marginTop: '10px' }}>
                <LoginIcon /> {isAuthLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="login-footer">
              New to KingdomPlus?{' '}
              <span className="login-footer-link" onClick={() => setStep(1)}>
                Join the Kingdom Hub
              </span>
            </div>

          </div>
        </div>
      )}

      {/* =========================================
          STEP 16: SEND / SWAP
          ========================================= */}
      {step === 16 && (
        <div className="feed-screen-container">

          <div className="treasury-header-top" style={{ paddingBottom: '5px' }}>
            <button className="back-button" onClick={() => setStep(11)} style={{ width: '36px', height: '36px' }}>
              <BackArrowIcon />
            </button>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: '0' }} className="brand-gradient-text">
              The Kingdom
            </h2>
            <div style={{ width: '36px' }}></div>
          </div>

          <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: '800', margin: '10px 20px 10px 20px' }}>Send / Swap</h1>

          {/* Send / Swap Toggle */}
          <div className="send-swap-toggle">
            <button
              className={`toggle-btn ${sendSwapTab === 'Send' ? 'active' : ''}`}
              onClick={() => setSendSwapTab('Send')}
            >
              <PaperPlaneIcon /> Send
            </button>
            <button
              className={`toggle-btn ${sendSwapTab === 'Swap' ? 'active' : ''}`}
              onClick={() => setSendSwapTab('Swap')}
            >
              <SwapIcon /> Swap
            </button>
          </div>

          <div className="feed-scroll-area" style={{ paddingBottom: '120px' }}>

            {sendSwapTab === 'Send' && (
              <>
                <label className="form-label">Recipient</label>
                <div className="recipient-input-container">
                  <input
                    type="text"
                    className="login-input"
                    placeholder="@username or vault address"
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                  />
                  <button className="scan-icon-btn"><ScanIcon /></button>
                </div>
                <div className="recent-contacts">
                  <div className="contact-chip" onClick={() => setSendRecipient('@voiceofzion')}>
                    Pastor Tunde <span className="contact-chip-handle">@voiceofzion</span>
                  </div>
                  <div className="contact-chip" onClick={() => setSendRecipient('@gracedesigns')}>
                    Grace A. <span className="contact-chip-handle">@gracedesigns</span>
                  </div>
                  <div className="contact-chip" onClick={() => setSendRecipient('@mercyfilms')}>
                    Mercy F. <span className="contact-chip-handle">@mercyfilms</span>
                  </div>
                </div>

                <label className="form-label">Amount (KPC)</label>
                <div className="amount-input-card">
                  <input
                    type="number"
                    className="amount-input-field"
                    placeholder="0"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                  />
                  <span className="amount-usd">≈ ${(Number(sendAmount) * 0.25 || 0).toFixed(2)} USD</span>
                </div>

                <label className="form-label">Memo (optional)</label>
                <input
                  type="text"
                  className="memo-input"
                  placeholder="A blessing for..."
                  value={sendMemo}
                  onChange={(e) => setSendMemo(e.target.value)}
                />
              </>
            )}

            {sendSwapTab === 'Swap' && (
  <div
    style={{
      padding: '20px',
      color: '#fff'
    }}
  >

    {/* DEMO NOTICE */}
    <div
      style={{
        padding: '12px 14px',
        borderRadius: '14px',
        background:
          'rgba(243,202,88,0.08)',
        border:
          '1px solid rgba(243,202,88,0.2)',
        marginBottom: '20px',
        color: '#f3ca58',
        fontSize: '11px',
        lineHeight: '1.5'
      }}
    >
      🧪 <strong>Prototype Swap</strong>
      <br />
      This is a simulated swap for
      KingdomPlus testers.
    </div>

    {/* FROM */}
    <label
      className="form-label"
    >
      FROM
    </label>

    <select
      value={swapFromToken}
      onChange={(e) =>
        setSwapFromToken(
          e.target.value
        )
      }
      className="login-input"
      style={{
        width: '100%',
        marginBottom: '16px'
      }}
    >
      <option value="KPC">
        KPC
      </option>

      <option value="USDC">
        Demo USDC
      </option>
    </select>

    {/* AMOUNT */}
    <label
      className="form-label"
    >
      AMOUNT
    </label>

    <input
      type="number"
      min="0"
      step="0.01"
      value={swapAmount}
      onChange={(e) =>
        setSwapAmount(
          e.target.value
        )
      }
      placeholder="0.00"
      className="amount-input-field"
      style={{
        width: '100%',
        marginBottom: '18px'
      }}
    />

    {/* SWITCH */}
    <button
      type="button"
      onClick={() => {
        const oldFrom =
          swapFromToken;

        setSwapFromToken(
          swapToToken
        );

        setSwapToToken(
          oldFrom
        );

        setSwapAmount('');
      }}
      style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        border:
          '1px solid rgba(41,190,175,0.35)',
        background:
          'rgba(41,190,175,0.1)',
        color: '#29beaf',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 18px'
      }}
      title="Switch tokens"
    >
      ⇅
    </button>

    {/* TO */}
    <label
      className="form-label"
    >
      TO
    </label>

    <select
      value={swapToToken}
      onChange={(e) =>
        setSwapToToken(
          e.target.value
        )
      }
      className="login-input"
      style={{
        width: '100%',
        marginBottom: '20px'
      }}
    >
      <option value="USDC">
        Demo USDC
      </option>

      <option value="KPC">
        KPC
      </option>
    </select>

    {/* PREVIEW */}
    <div
      style={{
        padding: '16px',
        borderRadius: '16px',
        background:
          'rgba(255,255,255,0.03)',
        border:
          '1px solid rgba(255,255,255,0.07)',
        marginBottom: '20px'
      }}
    >
      <div
        style={{
          color: '#8e9aab',
          fontSize: '10px',
          marginBottom: '8px'
        }}
      >
        ESTIMATED RECEIVE
      </div>

      <div
        style={{
          color: '#fff',
          fontSize: '25px',
          fontWeight: '900'
        }}
      >
        {(() => {
          const amount =
            Number(swapAmount) || 0;

          if (
            swapFromToken ===
              'KPC' &&
            swapToToken ===
              'USDC'
          ) {
            return `${(
              amount * 0.25
            ).toFixed(2)} USDC`;
          }

          if (
            swapFromToken ===
              'USDC' &&
            swapToToken ===
              'KPC'
          ) {
            return `${(
              amount / 0.25
            ).toFixed(2)} KPC`;
          }

          return '0.00';
        })()}
      </div>

      <div
        style={{
          color: '#64748b',
          fontSize: '10px',
          marginTop: '7px'
        }}
      >
        Prototype rate:
        {' '}1 KPC = $0.25
      </div>

      <div
        style={{
          color: '#64748b',
          fontSize: '10px',
          marginTop: '5px'
        }}
      >
        Demo USDC balance:
        {' '}
        {Number(
          demoUsdcBalance
        ).toFixed(2)}
      </div>
    </div>

    {/* SWAP BUTTON */}
    <button
      type="button"
      className="action-button"
      onClick={
        handleDemoSwap
      }
      disabled={
        isSwapping ||
        !swapAmount
      }
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity:
          isSwapping ||
          !swapAmount
            ? 0.6
            : 1
      }}
    >
      <SwapIcon />

      {isSwapping
        ? 'Swapping...'
        : 'Swap Tokens'}
    </button>

  </div>
)}

          </div>
          {sendSwapTab === 'Send' && (
            <div className="footer-lock">
              <button
                className="action-button"
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                onClick={() => {
                  if (!sendAmount || Number(sendAmount) <= 0) return alert('Enter a valid amount to send.');
                  if (!sendRecipient) return alert('Enter a recipient.');
                  if (kpcBalance < Number(sendAmount)) return alert('Insufficient funds.');

                  alert(`Success! Sent ${sendAmount} KPC to ${sendRecipient}.`);
                  setKpcBalance(prev => prev - Number(sendAmount));
                  setSendRecipient('');
                  setSendAmount('');
                  setSendMemo('');
                  setStep(11);
                }}
              >
                <PaperPlaneIcon /> Send {sendAmount || 0} KPC
              </button>
            </div>
          )}

        </div>
      )}

      {/* =========================================
          STEP 17: MEDIA HUB
          ========================================= */}
      {step === 17 && (
        <div className="feed-screen-container" style={{ width: '100vw', maxWidth: '100vw', height: '100vh', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* MEDIA HEADER */}
          <div className="media-header">
            <div className="media-header-left">
              <button className="back-button" onClick={() => setStep(6)} style={{ width: '36px', height: '36px' }}>
                <BackArrowIcon />
              </button>
              <div className="media-header-text">
                <h2>
                  {mediaTab === 'Music' && 'Kingdom Sounds'}
                  {mediaTab === 'Videos' && 'Kingdom Tube'}
                  {mediaTab === 'Movies' && 'Kingdom Cinema'}
                </h2>
                <p>
                  {mediaTab === 'Music' && 'Worship • Gospel • Praise'}
                  {mediaTab === 'Videos' && 'Sermons • Teachings • Shorts'}
                  {mediaTab === 'Movies' && 'Faith films & documentaries'}
                </p>
              </div>
            </div>
          </div>

          {/* MEDIA TOGGLE */}
          <div className="media-toggle-container">
            <button className={`media-toggle-btn ${mediaTab === 'Music' ? 'active' : ''}`} onClick={() => setMediaTab('Music')}>
              <MusicIcon /> Music
            </button>
            <button className={`media-toggle-btn ${mediaTab === 'Videos' ? 'active' : ''}`} onClick={() => setMediaTab('Videos')}>
              <VideoIcon /> Videos
            </button>
            <button className={`media-toggle-btn ${mediaTab === 'Movies' ? 'active' : ''}`} onClick={() => setMediaTab('Movies')}>
              <MovieIcon /> Movies
            </button>
          </div>

          {/* SEARCH */}
          <div className="media-search-container">
            <input
              type="text"
              className="media-search-input"
              placeholder={
                mediaTab === 'Music' ? 'Search songs, artists, regions...' :
                mediaTab === 'Videos' ? 'Search sermons & teachings...' : 'Search movie titles...'
              }
            />
          </div>

          <div className="feed-scroll-area" style={{ paddingBottom: '120px', flex: 1 }}>

            {/* ======================= KINGDOM SOUNDS (MUSIC) ======================= */}
            {mediaTab === 'Music' && (
              <>
                {/* FEATURED HERO SONG */}
                {musicData.length > 0 && (
                  <div
                    className="music-hero-card"
                    style={{ backgroundImage: `url('${musicData[0]?.img}')`, cursor: 'pointer' }}
                    onClick={() => openPlayer(musicData[0], 'audio')}
                  >
                    <div className="music-hero-overlay"></div>
                    <div className="music-hero-content">
                      <div className="music-featured-badge"><FlameIcon /> FEATURED TRACK</div>
                      <h3 className="music-hero-title">{musicData[0]?.title}</h3>
                      <span className="music-hero-artist">{musicData[0]?.artist} • Tap to Stream</span>
                    </div>
                    <div className="music-play-btn"><PlaySolidIcon /></div>
                  </div>
                )}

                {/* REGIONAL / CATEGORY CAROUSELS */}
                {['Nigerian Gospel', 'South African Gospel', 'Ghanaian Gospel', 'American Gospel', 'Most Popular'].map(categoryName => {
                  const categorySongs = musicData.filter(song => song.category === categoryName);
                  if (categorySongs.length === 0) return null;

                  return (
                    <div key={categoryName} style={{ marginBottom: '24px' }}>
                      <div className="section-header">
                        <div className="section-title"><TrendingIcon /> {categoryName}</div>
                        <ChevronRightIcon />
                      </div>

                      <div className="h-scroll-container">
                        {categorySongs.map((song) => (
                          <div
                            key={song.id}
                            className="music-square-card scroll-snap-item"
                            style={{ cursor: 'pointer' }}
                            onClick={() => openPlayer(song, 'audio')}
                          >
                            <div className="music-square-img-box">
                              <img src={song.img} alt={song.title} className="media-cover-img" />
                              <div className="music-square-play"><PlaySolidIcon /></div>
                            </div>
                            <div className="music-square-title">{song.title}</div>
                            <div className="music-square-artist">
                              {song.artist} <VerifiedIcon />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* ======================= KINGDOM TUBE (VIDEOS) ======================= */}
            {mediaTab === 'Videos' && (
              <>
                <div className="video-subtabs">
                  {['All', 'Sermons', 'Worship', 'Teaching', 'Shorts', 'Prophetic'].map(tab => (
                    <div key={tab} className={`video-subtab scroll-snap-item ${videoSubTab === tab ? 'active' : ''}`} onClick={() => setVideoSubTab(tab)}>
                      {tab}
                    </div>
                  ))}
                </div>

                {videoData
                  .filter(vid => videoSubTab === 'All' || vid.category === videoSubTab)
                  .map((vid) => (
                    <div key={vid.id} className="video-card">
                      <div className="video-thumbnail-container" style={{ cursor: 'pointer' }} onClick={() => openPlayer(vid, 'video')}>
                        <img src={vid.img} alt={vid.title} className="media-cover-img" />
                        <div className="video-duration-badge">{vid.duration || '10:00'}</div>
                      </div>

                      <div className="video-info-row">
                        <div className="video-avatar" style={{ background: '#29beaf' }}>KP</div>
                        <div style={{ flex: 1 }}>
                          <div className="video-title" style={{ cursor: 'pointer' }} onClick={() => openPlayer(vid, 'video')}>{vid.title}</div>
                          <div className="video-channel">{vid.channel || 'KingdomPlus TV'} <VerifiedIcon /></div>
                          <button className="video-reward-btn" onClick={() => openPlayer(vid, 'video')}>
                            <PlaySolidIcon /> Stream Sermon
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}

            {/* ======================= KINGDOM CINEMA (MOVIES) ======================= */}
            {mediaTab === 'Movies' && (
              <>
                {movieData.length > 0 && (
                  <div className="movie-hero" style={{ backgroundImage: `url('${movieData[0]?.img}')` }}>
                    <div className="movie-hero-overlay"></div>
                    <div className="movie-hero-content">
                      <div className="movie-hero-badge">KP ORIGINAL</div>
                      <h3 className="movie-hero-title">{movieData[0]?.title}</h3>
                      <div className="movie-hero-meta">
                        <span style={{ color: '#2ecc71', fontWeight: '800' }}>98% Match</span>
                        <div className="movie-meta-box">PG-13</div>
                        <span>Faith & Drama</span>
                      </div>
                      <div className="movie-actions">
                        <button className="movie-btn-play" onClick={() => openPlayer(movieData[0], 'video')}>
                          <PlaySolidIcon /> Stream Film
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {['Trending Now', 'Faith & Family', 'Documentaries', 'KP Original'].map((sectionName) => {
                  const sectionMovies = movieData.filter(movie => movie.category === sectionName);
                  if (sectionMovies.length === 0) return null;

                  return (
                    <div key={sectionName} style={{ marginBottom: '30px' }}>
                      <div className="section-header" style={{ marginBottom: '12px' }}>
                        <div className="section-title" style={{ fontSize: '18px' }}>{sectionName}</div>
                        <ChevronRightIcon />
                      </div>

                      <div className="h-scroll-container">
                        {sectionMovies.map((movie) => (
                          <div key={movie.id} className="movie-portrait-card scroll-snap-item" style={{ cursor: 'pointer' }} onClick={() => openPlayer(movie, 'video')}>
                            <div className="movie-poster">
                              <img src={movie.img} alt={movie.title} className="media-cover-img" />
                            </div>
                            <div className="movie-poster-title">{movie.title}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

          </div>
          <AppBottomNav />
        </div>
      )}


{/* =========================================
          STEP 18: PROFILE PAGE
          ========================================= */}
      {step === 18 && (
        <div className="feed-screen-container" style={{ position: 'relative', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
          <input type="file" hidden ref={wallpaperInputRef} accept="image/*" onChange={(e) => handleImageSelect(e, 'wallpaper_url')} />
          <input type="file" hidden ref={avatarInputRef} accept="image/*" onChange={(e) => handleImageSelect(e, 'avatar_url')} />
          <div className="feed-header-top" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
            <button className="back-button" onClick={() => setStep(6)} style={{ width: '36px', height: '36px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
              <BackArrowIcon />
            </button>
          </div>
          <div className="feed-scroll-area" style={{ flexGrow: 1, paddingBottom: '120px', overflowY: 'auto', paddingTop: '0' }}>
            <div 
              className="profile-cover-photo" 
              onClick={() => wallpaperInputRef.current.click()}
              style={{ 
                backgroundImage: userProfile?.wallpaper_url ? `url(${userProfile.wallpaper_url})` : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                cursor: 'pointer',
                height: '150px',
                width: 'calc(100% + 40px)', 
                marginLeft: '-20px', 
                marginRight: '-20px', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexShrink: 0
              }}
            >
            </div>

            {isLoadingProfile ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8e9aab' }}>Fetching profile data...</div>
            ) : !userProfile ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b' }}>Profile not found. Please complete your registration.</div>
            ) : (
              <>
                <div className="profile-identity-section">
  <div className="profile-avatar-overlap" onClick={() => avatarInputRef.current.click()} style={{ cursor: 'pointer', zIndex: 10, position: 'relative', display: 'inline-block' }}>
    {userProfile.avatar_url ? (
      <img 
        src={userProfile.avatar_url} 
        alt="Profile" 
        className="profile-avatar-circle" 
        style={{ 
          objectFit: 'cover', 
          border: '4px solid #29beaf', 
          boxSizing: 'border-box'
        }} 
      />
    ) : (
      <div 
        className="profile-avatar-circle"
        style={{ 
          border: '4px solid #29beaf', 
          boxSizing: 'border-box' 
        }}
      >
        {userProfile.full_name ? userProfile.full_name.substring(0, 2).toUpperCase() : 'U'}
      </div>
    )}
    
    {(userProfile.account_type === 'Premium' || userProfile.account_type === 'Apostle') && (
      <div 
        className="profile-verified-badge" 
        title={`${userProfile.account_type} Account`}
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          background: userProfile.account_type === 'Apostle' ? '#f3ca58' : '#3b82f6',
          color: '#101926',
          borderRadius: '50%',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #101926',
          width: '20px',
          height: '20px'
        }}
      >
        <CheckIcon style={{ width: '12px', height: '12px' }} />
      </div>
    )}
  </div>
                  
                  <h2 className="profile-name-main">{userProfile.full_name || 'Kingdom Citizen'}</h2>
                  
                  <div className="profile-status-badge">
                    {userProfile.account_type || 'Standard'} Account
                  </div>

                  <p className="profile-bio-text">{userProfile.bio || 'Add a bio to tell the community about yourself.'}</p>

                  <div className="profile-location-church">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconMapPin /> {userProfile.address || 'Unknown City'}, {userProfile.country || 'Unknown Country'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconChurch /> {userProfile.local_church || 'No church listed'} ({userProfile.denomination || 'N/A'})
                    </span>
                  </div>
                  
                  <div
  className="profile-action-row"
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  }}
>
  <button
    className="profile-btn-primary"
    onClick={openEditModal}
  >
    Edit Profile
  </button>

  <button
    className="profile-btn-secondary"
  >
    Share
  </button>

  <button
    className="profile-btn-icon"
    title="Copy profile link"
  >
    <LinkIcon />
  </button>

  <button
    onClick={handleLogoutUser}
    title="Log out"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      background: 'rgba(231, 76, 60, 0.10)',
      border: '1px solid rgba(231, 76, 60, 0.35)',
      color: '#e74c3c',
      padding: '9px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '700',
      cursor: 'pointer'
    }}
  >
    <LogOutIcon />
    Logout
  </button>

{userProfile?.id === '8da85fd9-c923-4bd2-8d1e-1d317e0d9fde' && (
  <button 
    onClick={() => setStep(24)} 
    style={{
      background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      color: '#fff',
      border: 'none',
      padding: '10px',
      borderRadius: '16px',
      fontWeight: '600',
      fontSize: '13px',
      cursor: 'pointer',
      marginTop: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
    }}
  > ADMIN
  </button>
)}
                  </div>
                </div>

                <div className="profile-fb-tabs">
                  {['All', 'Services', 'Posts'].map(tab => (
                    <div key={tab} className={`profile-fb-tab ${profileTab === tab ? 'active' : ''}`} onClick={() => setProfileTab(tab)}>
                      {tab}
                    </div>
                  ))}
                </div>

                {profileTab === 'All' && (
                  <div className="profile-tab-content">
                    
                    <h3 className="profile-section-heading">Faith Activity</h3>
                    <div className="faith-activity-grid">
                      <div className="faith-activity-card">
                        <div className="activity-icon-container"><IconFlame /></div>
                        <div className="activity-num">{userProfile.login_streak || 0}</div>
                        <div className="activity-label">Day Streak</div>
                      </div>
                      <div className="faith-activity-card">
                        <div className="activity-icon-container"><IconHeadphones /></div>
                        <div className="activity-num">{userProfile.stream_time_hours || 0}h</div>
                        <div className="activity-label">Streamed</div>
                      </div>
                      <div className="faith-activity-card">
                        <div className="activity-icon-container"><IconBook /></div>
                        <div className="activity-num">{userProfile.devotions_read || 0}</div>
                        <div className="activity-label">Devotions</div>
                      </div>
                    </div>

                    <h3 className="profile-section-heading" style={{ marginTop: '25px' }}>Ministries Followed</h3>
                    <div className="ministries-row">
                      {followedMinistries.map(ministry => (
                         <div key={ministry.id} className="ministry-avatar-wrapper">
                          <div className={`ministry-avatar ${ministry.isMain ? 'main-church' : ''}`}>
                            <IconChurch />
                          </div>
                          <span className="ministry-name">{ministry.name}</span>
                          {ministry.isMain && <span className="ministry-main-badge">Home</span>}
                        </div>
                      ))}
                    </div>

                    <h3 className="profile-section-heading" style={{ marginTop: '30px' }}>Personal details</h3>
                    <div className="profile-detail-card">
                      <div className="detail-row">
                        <div className="detail-icon"><IconMail /></div>
                        <div className="detail-text">
                          <span className="detail-label">Email</span>
                          <span className="detail-value">{userProfile.email || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div className="detail-icon"><IconPhone /></div>
                        <div className="detail-text">
                          <span className="detail-label">Phone</span>
                          <span className="detail-value">{userProfile.phone_number || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div className="detail-icon"><IconCalendar /></div>
                        <div className="detail-text">
                          <span className="detail-label">Date of Birth</span>
                          <span className="detail-value">{userProfile.date_of_birth || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div className="detail-icon"><IconGlobe /></div>
                        <div className="detail-text">
                          <span className="detail-label">Country</span>
                          <span className="detail-value">{userProfile.country || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div className="detail-icon"><IconChurch /></div>
                        <div className="detail-text">
                          <span className="detail-label">Denomination</span>
                          <span className="detail-value">{userProfile.denomination || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* SERVICES */}
                {profileTab === 'Services' && (
                  <div className="profile-tab-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h3 className="profile-section-heading" style={{ margin: 0 }}>Offered Services</h3>
                      <span onClick={handleOpenAddService} style={{ color: '#f3ca58', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>+ Add New</span>
                    </div>

                    {userServices.length === 0 ? (
                      <div className="empty-dream-state" style={{ marginTop: '0' }}>
                        <div className="empty-dream-icon">💼</div>
                        <h3>No services listed</h3>
                        <p>Monetize your Kingdom skills by adding a service.</p>
                      </div>
                    ) : (
                      userServices.map(service => (
                        <div key={service.id} className="profile-service-card">
                          <div className="service-header">
                            <h4 className="service-title">{service.title}</h4>
                            <div className="service-price">{service.price} KPC</div>
                          </div>
                          <p className="service-desc">{service.desc}</p>
                          <button className="service-action-btn" onClick={() => handlePurchaseService(service)}>Request Service</button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB CONTENT: POSTS */}
                {profileTab === 'Posts' && (
                  <div className="profile-tab-content">
                    {globalPosts.filter(post => post.user_profiles?.username === userProfile?.username).length === 0 ? (
                      <div className="empty-dream-state" style={{ marginTop: '0' }}>
                        <div className="empty-dream-icon"><IconBook /></div>
                        <h3>No posts yet</h3>
                        <p>When {userProfile?.username || 'you'} shares thoughts or media, they will appear here.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {globalPosts.filter(post => post.user_profiles?.username === userProfile?.username).map(post => {
                          const isVideo = post.image_url?.match(/\.(mp4|webm|ogg|mov)$/i);
                          return (
                            <div key={post.id} className="feed-post-card">
                              <div className="post-header">
                                <div className="post-user-info">
                                  {post.user_profiles?.avatar_url ? (
                                    <img src={post.user_profiles.avatar_url} alt="" className="post-avatar" />
                                  ) : (
                                    <div className="post-avatar" style={{ background: '#29beaf', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                                      {post.user_profiles?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                                    </div>
                                  )}
                                  <div className="post-meta">
                                    <strong style={{ color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      {post.user_profiles?.full_name} 
                                      {(post.user_profiles?.account_type === 'Disciple' || post.user_profiles?.account_type === 'Apostle') && <span style={{ color: '#29beaf', fontSize: '12px' }}><CheckIcon /></span>}
                                    </strong>
                                    <span style={{ color: '#8e9aab', fontSize: '11px' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>{post.content}</p>
                              
                              {post.image_url && (
                                isVideo ? (
                                  <video src={post.image_url} controls style={{ width: '100%', borderRadius: '12px', marginBottom: '12px', maxHeight: '400px', backgroundColor: '#000' }} />
                                ) : (
                                  <img src={post.image_url} alt="Post media" style={{ width: '100%', borderRadius: '12px', marginBottom: '12px' }} />
                                )
                              )}
                              
                              <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                                <span style={{ color: '#8e9aab', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><HeartIcon /> {post.likes_count}</span>
                                <span style={{ color: '#8e9aab', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><MessageIcon /> {post.comments_count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          
          <AppBottomNav />

          {/* =========================================
              EDIT PROFILE MODAL
              ========================================= */}
          {isEditingProfile && (
            <div className="constrained-overlay">
              <div className="create-modal-content" style={{ height: '90%' }}>
                <div className="dream-modal-header">
                  <div className="dream-modal-title">
                    <h2>Edit Profile</h2>
                  </div>
                  <button className="dream-modal-close" onClick={() => setIsEditingProfile(false)}><XIcon /></button>
                </div>
                
                <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '10px' }}>
                  <label className="dream-input-label">FULL NAME</label>
                  <input type="text" className="dream-input" name="full_name" value={editForm.full_name || ''} onChange={handleEditChange} />

                  <label className="dream-input-label">BIO</label>
                  <textarea className="dream-textarea" name="bio" value={editForm.bio || ''} onChange={handleEditChange} style={{ height: '80px' }}></textarea>

                  <label className="dream-input-label">COUNTRY</label>
                  <input type="text" className="dream-input" name="country" value={editForm.country || ''} onChange={handleEditChange} />

                  <label className="dream-input-label">CITY / ADDRESS</label>
                  <input type="text" className="dream-input" name="address" value={editForm.address || ''} onChange={handleEditChange} />
                  
                  <label className="dream-input-label">LOCAL CHURCH</label>
                  <input type="text" className="dream-input" name="local_church" value={editForm.local_church || ''} onChange={handleEditChange} />

                  <label className="dream-input-label">DENOMINATION</label>
                  <input type="text" className="dream-input" name="denomination" value={editForm.denomination || ''} onChange={handleEditChange} />
                </div>

                <div className="modal-actions" style={{ marginTop: '20px' }}>
                  <button className="modal-btn-secondary" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                  <button className="modal-btn-primary" onClick={saveProfileUpdates}>Save Changes</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

{/* =========================================
              ADD SERVICE MODAL
              ========================================= */}
          {isAddServiceModalOpen && (
            <div className="constrained-overlay">
              <div className="create-modal-content" style={{ height: 'auto', paddingBottom: '40px' }}>
                <div className="dream-modal-header">
                  <div className="dream-modal-title">
                    <h2>Add New Service</h2>
                  </div>
                  <button className="dream-modal-close" onClick={() => setIsAddServiceModalOpen(false)}><XIcon /></button>
                </div>
                
                <div style={{ flexGrow: 1 }}>
                  <label className="dream-input-label">SERVICE TITLE</label>
                  <input type="text" className="dream-input" placeholder="e.g. Graphic Design Layouts" value={newServiceForm.title} onChange={e => setNewServiceForm({...newServiceForm, title: e.target.value})} />

                  <label className="dream-input-label">DESCRIPTION</label>
                  <textarea className="dream-textarea" placeholder="Describe what you offer..." value={newServiceForm.desc} onChange={e => setNewServiceForm({...newServiceForm, desc: e.target.value})} style={{ height: '80px' }}></textarea>

                  <label className="dream-input-label">PRICE (KPC)</label>
                  <input type="number" className="dream-input" placeholder="e.g. 100" value={newServiceForm.price} onChange={e => setNewServiceForm({...newServiceForm, price: e.target.value})} />
                </div>

                <div className="modal-actions" style={{ marginTop: '20px' }}>
                  <button className="modal-btn-secondary" onClick={() => setIsAddServiceModalOpen(false)}>Cancel</button>
                  <button className="modal-btn-primary" onClick={handleSaveService}>Save Service</button>
                </div>
              </div>
            </div>
          )}

      
{/* =========================================
          MINISTRY ONBOARDING BRANCH (STEPS 19 - 22)
          ========================================= */}

      {/* STEP 19: MINISTRY IDENTITY */}
      {step === 19 && (
        <div className="inner-pad">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={() => setStep(1)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <BackArrowIcon />
            </button>
            <div style={{ flex: 1, textAlign: 'center', color: '#8e9aab', fontSize: '12px', fontWeight: '800', letterSpacing: '1px' }}>STEP 1 OF 4</div>
            <div style={{ width: '40px' }}></div>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '30px' }}>
            <div style={{ width: '25%', height: '100%', background: 'linear-gradient(90deg, #f3ca58, #29beaf)', borderRadius: '2px' }}></div>
          </div>

          <div className="form-scroll-area">
            <span style={{ color: '#29beaf', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>MINISTRY IDENTITY</span>
            <h1 className="onboarding-title" style={{ marginTop: '8px' }}>Tell us about your Ministry</h1>
            <p className="onboarding-subtitle" style={{ marginBottom: '25px' }}>This is how believers will discover your church or ministry inside the community.</p>

            <div className="input-group"><label className="input-label">CHURCH / MINISTRY NAME</label><input type="text" name="churchName" placeholder="e.g. Grace Fellowship Assembly" value={formData.churchName || ''} onChange={handleChange} className="app-input" /></div>
<div className="input-group">
  <label className="input-label">MINISTRY USERNAME</label>
  <input
    type="text"
    name="username"
    placeholder="e.g. gracefellowship"
    value={formData.username || ''}
    onChange={handleChange}
    className="app-input"
  />
  <div style={{
    color: '#8e9aab',
    fontSize: '11px',
    marginTop: '6px'
  }}>
    This becomes your Ministry @handle.
  </div>
</div>

<div className="input-group">
  <label className="input-label">MINISTRY EMAIL</label>
  <input
    type="email"
    name="email"
    placeholder="e.g. office@gracefellowship.org"
    value={formData.email || ''}
    onChange={handleChange}
    className="app-input"
  />
</div>

<div className="input-group">
  <label className="input-label">PASSWORD</label>
  <input
    type="password"
    name="password"
    placeholder="Create a secure password"
    value={formData.password || ''}
    onChange={handleChange}
    className="app-input"
  />
</div>
            <div className="input-group">
              <label className="input-label">DENOMINATION</label>
              <select
  name="churchDenomination"
  value={formData.churchDenomination || ''}
  onChange={handleChange}
  className="app-select"
>
  <option value="">Select a denomination</option>
  <option value="Anglican / Episcopal">Anglican / Episcopal</option>
  <option value="Assemblies of God">Assemblies of God</option>
  <option value="Baptist">Baptist</option>
  <option value="Catholic">Catholic</option>
  <option value="Evangelical">Evangelical</option>
  <option value="Lutheran">Lutheran</option>
  <option value="Methodist">Methodist</option>
  <option value="Non-denominational">Non-denominational</option>
  <option value="Orthodox">Orthodox</option>
  <option value="Pentecostal">Pentecostal</option>
  <option value="Presbyterian">Presbyterian</option>
  <option value="Seventh-day Adventist">Seventh-day Adventist</option>
  <option value="Other">Other</option>
</select>
            </div>
            <div className="input-group"><label className="input-label">YEAR FOUNDED (OPTIONAL)</label><input type="number" name="yearFounded" placeholder="1998" value={formData.yearFounded || ''} onChange={handleChange} className="app-input" /></div>
            <div className="input-group"><label className="input-label">MISSION STATEMENT (OPTIONAL)</label><textarea name="missionStatement" placeholder="A short sentence about your church's mission and community." value={formData.missionStatement || ''} onChange={handleChange} className="app-input" style={{ minHeight: '80px', resize: 'none' }}></textarea><div style={{ textAlign: 'right', color: '#8e9aab', fontSize: '11px', marginTop: '4px' }}>0/300</div></div>
            <div className="input-group">
              <label className="input-label">LOGO (OPTIONAL)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', padding: '15px', borderRadius: '14px', cursor: 'pointer' }}>
                <div style={{ background: 'linear-gradient(135deg, #f3ca58, #29beaf)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#101926' }}><UploadIcon /></div>
                <div>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>Tap to upload</div>
                  <div style={{ color: '#8e9aab', fontSize: '12px' }}>Square PNG or JPG, up to 2 MB.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-lock">
            <button onClick={() => setStep(20)} className="action-button" style={{ background: 'linear-gradient(90deg, #e5c158, #29beaf)', color: '#101926' }}>Continue</button>
            <div style={{ textAlign: 'center', marginTop: '15px', color: '#8e9aab', fontSize: '12px' }}>Registering a believer account instead? <span style={{ color: '#fff', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => {
  setFormData(prev => ({
    ...prev,
    accountType: 'User'
  }));

  setStep(1);
}}>Go back</span></div>
          </div>
        </div>
      )}

      {/* STEP 20: LOCATION & SERVICE TIMES */}
      {step === 20 && (
        <div className="inner-pad">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={() => setStep(19)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><BackArrowIcon /></button>
            <div style={{ flex: 1, textAlign: 'center', color: '#8e9aab', fontSize: '12px', fontWeight: '800', letterSpacing: '1px' }}>STEP 2 OF 4</div>
            <div style={{ width: '40px' }}></div>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '30px' }}>
            <div style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg, #f3ca58, #29beaf)', borderRadius: '2px' }}></div>
          </div>

          <div className="form-scroll-area">
            <span style={{ color: '#f3ca58', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>WHERE YOU GATHER</span>
            <h1 className="onboarding-title" style={{ marginTop: '8px' }}>Location & service times</h1>
            <p className="onboarding-subtitle" style={{ marginBottom: '25px' }}>Help believers nearby find your services and events.</p>

            <div className="row-group">
              <div className="input-group"><label className="input-label">COUNTRY</label><input type="text" name="churchCountry" placeholder="Nigeria" value={formData.churchCountry || ''} onChange={handleChange} className="app-input" /></div>
              <div className="input-group"><label className="input-label">CITY</label><input type="text" name="churchCity" placeholder="Lagos" value={formData.churchCity || ''} onChange={handleChange} className="app-input" /></div>
            </div>
            <div className="input-group"><label className="input-label">STREET ADDRESS (OPTIONAL)</label><input type="text" name="churchAddress" placeholder="12 Faith Avenue, Ikeja" value={formData.churchAddress || ''} onChange={handleChange} className="app-input" /></div>
            <div className="row-group">
              <div className="input-group">
                <label className="input-label">MAIN SERVICE DAY</label>
                <select name="serviceDay" value={formData.serviceDay || ''} onChange={handleChange} className="app-select">
                  <option value="Sunday">Sunday</option><option value="Saturday">Saturday</option><option value="Friday">Friday</option>
                </select>
              </div>
              <div className="input-group"><label className="input-label">SERVICE TIME</label><input type="time" name="serviceTime" value={formData.serviceTime || ''} onChange={handleChange} className="app-input" /></div>
            </div>
          </div>
          <div className="footer-lock">
            <button onClick={() => setStep(21)} className="action-button" style={{ background: 'linear-gradient(90deg, #e5c158, #29beaf)', color: '#101926' }}>Continue</button>
            <div style={{ textAlign: 'center', marginTop: '15px', color: '#8e9aab', fontSize: '12px' }}>Registering a believer account instead? <span style={{ color: '#fff', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => { handleChange({ target: { name: 'accountType', value: 'Believer' } }); setStep(1); }}>Go back</span></div>
          </div>
        </div>
      )}

      {/* STEP 21: LEADERSHIP & CONTACT  */}
      {step === 21 && (
        <div className="inner-pad">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={() => setStep(20)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><BackArrowIcon /></button>
            <div style={{ flex: 1, textAlign: 'center', color: '#8e9aab', fontSize: '12px', fontWeight: '800', letterSpacing: '1px' }}>STEP 3 OF 4</div>
            <div style={{ width: '40px' }}></div>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '30px' }}>
            <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #f3ca58, #29beaf)', borderRadius: '2px' }}></div>
          </div>

          <div className="form-scroll-area">
            <span style={{ color: '#f3ca58', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>LEADERSHIP & CONTACT</span>
            <h1 className="onboarding-title" style={{ marginTop: '8px' }}>Who leads the ministry?</h1>
            <p className="onboarding-subtitle" style={{ marginBottom: '25px' }}>We'll use this to verify the church and reach out for account matters.</p>

            <div className="input-group"><label className="input-label">SENIOR PASTOR / LEADER</label><input type="text" name="seniorPastor" placeholder="Pastor Samuel Adebayo" value={formData.seniorPastor || ''} onChange={handleChange} className="app-input" /></div>
            <div className="input-group"><label className="input-label">CONTACT EMAIL</label><input type="email" name="churchEmail" placeholder="hello@yourchurch.org" value={formData.churchEmail || ''} onChange={handleChange} className="app-input" /></div>
            <div className="input-group"><label className="input-label">CONTACT PHONE</label><input type="tel" name="churchPhone" placeholder="+234 800 000 0000" value={formData.churchPhone || ''} onChange={handleChange} className="app-input" /></div>
            <div className="input-group"><label className="input-label">WEBSITE OR SOCIAL LINK (OPTIONAL)</label><input type="url" name="churchWebsite" placeholder="https://yourchurch.org" value={formData.churchWebsite || ''} onChange={handleChange} className="app-input" /></div>
          </div>
          <div className="footer-lock">
            <button onClick={() => setStep(22)} className="action-button" style={{ background: 'linear-gradient(90deg, #e5c158, #29beaf)', color: '#101926' }}>Continue</button>
            <div style={{ textAlign: 'center', marginTop: '15px', color: '#8e9aab', fontSize: '12px' }}>Registering a believer account instead? <span style={{ color: '#fff', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => { handleChange({ target: { name: 'accountType', value: 'Believer' } }); setStep(1); }}>Go back</span></div>
          </div>
        </div>
      )}

      {/* STEP 22: VERIFICATION  */}
      {step === 22 && (
        <div className="inner-pad">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={() => setStep(21)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><BackArrowIcon /></button>
            <div style={{ flex: 1, textAlign: 'center', color: '#8e9aab', fontSize: '12px', fontWeight: '800', letterSpacing: '1px' }}>STEP 4 OF 4</div>
            <div style={{ width: '40px' }}></div>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '30px' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #f3ca58, #29beaf)', borderRadius: '2px' }}></div>
          </div>

          <div className="form-scroll-area">
            <span style={{ color: '#29beaf', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>VERIFICATION</span>
            <h1 className="onboarding-title" style={{ marginTop: '8px' }}>Get your verified badge</h1>
            <p className="onboarding-subtitle" style={{ marginBottom: '25px' }}>Upload proof of registration so believers know your ministry is authentic. You can also skip this and complete it later.</p>

            <div className="input-group"><label className="input-label">REGISTRATION NUMBER (OPTIONAL)</label><input type="text" name="registrationNumber" placeholder="CAC / SEC / IRS registration number" value={formData.registrationNumber || ''} onChange={handleChange} className="app-input" /></div>
            <div className="input-group">
              <label className="input-label">REGISTRATION DOCUMENT (OPTIONAL)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', padding: '15px', borderRadius: '14px', cursor: 'pointer', marginBottom: '15px' }}>
                <div style={{ background: 'linear-gradient(135deg, #f3ca58, #29beaf)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#101926' }}><UploadIcon /></div>
                <div>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>Tap to upload</div>
                  <div style={{ color: '#8e9aab', fontSize: '12px' }}>PDF or image up to 8 MB.</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <input type="checkbox" name="isAuthorized" checked={formData.isAuthorized || false} onChange={(e) => handleChange({ target: { name: 'isAuthorized', value: e.target.checked } })} style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#29beaf' }} />
              <div style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.5' }}>
                I confirm I'm authorized to register this church or ministry and that the information provided is accurate.
              </div>
            </div>
          </div>
          
          <div className="footer-lock">
            <button 
              onClick={() => {
                if (!formData.isAuthorized) { alert("Please confirm authorization to proceed."); return; }
                setStep(4);
              }} 
              className="action-button" 
              style={{ background: 'linear-gradient(90deg, #e5c158, #29beaf)', color: '#101926' }}
            >
              Submit for review
            </button>
          </div>
        </div>
      )}

{/* =========================================
    STEP 23: KINGDOMPLUS MESSENGER
    ========================================= */}
{step === 23 && (
  <div className="feed-screen-container" style={{ width: '100vw', maxWidth: '100vw', height: '100vh', overflowX: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', background: 'radial-gradient(circle at top left, #141b2e 0%, #05080f 100%)' }}>
    
    <style>{`
      .glass-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
      .glass-scroll::-webkit-scrollbar-track { background: transparent; }
      .glass-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      .glass-scroll { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.1) transparent; }
    `}</style>

    {!activeDbChat ? (
      /* =========================================
         INBOX
         ========================================= */
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
          <button onClick={() => setStep(6)} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <BackArrowIcon />
          </button>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#f3ca58', fontSize: '24px', fontWeight: '900', margin: 0, fontFamily: 'serif' }}>Messenger</h2>
            <div style={{ color: '#29beaf', fontSize: '10px', fontWeight: '800', letterSpacing: '2px', marginTop: '2px' }}>WEB3 • LIVE</div>
          </div>
          {(userProfile?.account_type === 'Premium' || userProfile?.account_type === 'Apostle') ? (
            <button onClick={toggleDMLock} title={userProfile?.dms_locked ? 'Unlock DMs' : 'Lock DMs'} style={{ width: '40px', height: '40px', borderRadius: '50%', background: userProfile?.dms_locked ? 'rgba(231, 76, 60, 0.1)' : 'rgba(41, 190, 175, 0.1)', border: userProfile?.dms_locked ? '1px solid #e74c3c' : '1px solid #29beaf', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px' }}>
              {userProfile?.dms_locked ? '🔒' : '🔓'}
            </button>
          ) : (
            <div style={{ width: '40px' }}></div>
          )}
        </div>

        {/* --- TABS --- */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderRadius: '30px', margin: '0 20px 20px 20px', padding: '4px' }}>
          {['INBOX', 'GROUPS', 'PEOPLE', 'REQUESTS'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setHubTab(tab)} 
              style={{ 
                flex: 1, 
                padding: '12px 0', 
                border: 'none', 
                borderRadius: '26px', 
                fontSize: '10px', 
                fontWeight: '900', 
                cursor: 'pointer', 
                transition: 'all 0.2s', 
                background: hubTab === tab ? 'rgba(243, 202, 88, 0.1)' : 'transparent', 
                color: hubTab === tab ? '#f3ca58' : '#8e9aab', 
                border: hubTab === tab ? '1px solid rgba(243, 202, 88, 0.3)' : '1px solid transparent' 
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ==================== TAB 1: INBOX & FRIENDS ==================== */}
        {hubTab === 'INBOX' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', width: '100%' }}>
            
            {/* HORIZONTAL FRIENDS LIST */}
            <div style={{ padding: '0 20px', marginBottom: '10px', flexShrink: 0 }}>
              <div style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', marginBottom: '10px' }}>MY CONNECTIONS</div>
              <div className="glass-scroll" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', paddingTop: '4px' }}>
                {friends.length === 0 ? (
                  <span style={{ color: '#55657a', fontSize: '12px' }}>No connections yet. Head to the People tab!</span>
                ) : (
                  friends.map(friend => {
                    const profile = friend.sender_id === userProfile?.id ? friend.receiver : friend.sender;
                    return (
                      <div key={friend.id} onClick={() => handleInitiateDirectChat(profile)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{ padding: '2px', borderRadius: '50%', background: '#29beaf', display: 'flex' }}>
                          <div
  style={{
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#1a8277',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '20px',
    fontWeight: '900',
    border: '3px solid #09101a',
    overflow: 'hidden'
  }}
>
  {profile?.avatar_url ? (
    <img
      src={profile.avatar_url}
      alt={
        profile.full_name ||
        profile.username ||
        'User'
      }
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
      }}
    />
  ) : (
    profile?.full_name?.charAt(0) ||
    profile?.username?.charAt(0) ||
    'U'
  )}
</div>
                        </div>
                        <span style={{ color: '#e2e8f0', fontSize: '11px', fontWeight: '700', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {profile?.full_name?.split(' ')[0]}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div style={{ padding: '0 20px', flexShrink: 0, marginBottom: '10px' }}>
              <div style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '800', letterSpacing: '1px' }}>ACTIVE CHATS</div>
            </div>

            <div className="glass-scroll" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1, paddingBottom: '100px' }}>
              {dbChats.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8e9aab', fontSize: '13px', marginTop: '20px' }}>Your inbox is empty.</div>
              ) : (
                dbChats.map((chat) => {
                  const otherParticipant =
  chat.type !== 'group'
    ? chat.chat_participants?.find(
        participant =>
          participant.user_id !== userProfile?.id
      )?.user_profiles
    : null;

const displayName =
  chat.type === 'group'
    ? chat.name
    : (
        otherParticipant?.full_name ||
        otherParticipant?.username ||
        'Private Chat'
      );
                  const avatarLetter =
  chat.type === 'group'
    ? '⛪'
    : (
        otherParticipant?.full_name?.charAt(0) ||
        otherParticipant?.username?.charAt(0) ||
        '👤'
      );
                  return (
                    <div key={chat.id} onClick={() => setActiveDbChat(chat)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                       <div
  onClick={(e) => {
    if (
      chat.type !== 'group' &&
      otherParticipant?.id
    ) {
      e.stopPropagation();
      handleViewProfile(
        otherParticipant.id
      );
    }
  }}
  style={{
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    overflow: 'hidden',
    background:
      chat.type === 'group'
        ? 'rgba(41, 190, 175, 0.1)'
        : 'linear-gradient(135deg, #101926, #1f3752)',
    border:
  chat.type === 'group'
    ? '2px solid rgba(41, 190, 175, 0.35)'
    : '2px solid #29beaf',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f3ca58',
    fontSize: '20px',
    cursor:
      chat.type !== 'group'
        ? 'pointer'
        : 'default'
  }}
>
  {chat.type === 'group' ? (
  chat.avatar_url ? (
    <img
      src={chat.avatar_url}
      alt={chat.name || 'Group'}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
      }}
    />
  ) : (
    '⛪'
  )
) : otherParticipant?.avatar_url ? (
  <img
    src={otherParticipant.avatar_url}
    alt={
      otherParticipant.full_name ||
      otherParticipant.username ||
      'User'
    }
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }}
  />
) : (
  otherParticipant?.full_name?.charAt(0) ||
  otherParticipant?.username?.charAt(0) ||
  '👤'
)}
</div>
                        <div>
                          <div style={{ color: '#fff', fontSize: '15px', fontWeight: '800' }}>
                            {displayName}
                          </div>
                          <div style={{ color: '#8e9aab', fontSize: '12px', marginTop: '2px' }}>
                            Tap to open conversation
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: GROUPS ==================== */}
        {hubTab === 'GROUPS' && (
          <div className="glass-scroll" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', flex: 1, paddingBottom: '100px', width: '100%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ color: '#29beaf', fontSize: '11px', fontWeight: '800', letterSpacing: '1px' }}>DISCOVER COMMUNITIES</div>
              {(userProfile?.account_type === 'Premium' || userProfile?.account_type === 'Apostle') && (
                <button onClick={() => setIsCreateGroupModalOpen(true)} style={{ background: 'transparent', border: '1px solid #29beaf', color: '#29beaf', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}>+ Create Group</button>
              )}
            </div>

            {/* SUB-SECTION: LOCAL CHURCH GROUPS */}
            {publicGroups.some(g => g.category === 'Local' || g.name.includes(userProfile?.local_church)) && (
              <div style={{ marginBottom: '10px' }}>
                <h4 style={{ color: '#f3ca58', fontSize: '12px', margin: '0 0 10px 0', borderBottom: '1px solid rgba(243, 202, 88, 0.2)', paddingBottom: '4px' }}>
                  {userProfile?.local_church || 'Your Local'} Assemblies
                </h4>
                {publicGroups
                  .filter(g => g.category === 'Local' || g.name.includes(userProfile?.local_church))
                  .map(group => {
                    const isAlreadyJoined = dbChats.some(chat => chat.id === group.id);
                    return (
                      <div key={group.id} onClick={() => { if (isAlreadyJoined) {
  const loadedChat = dbChats.find(
    chat => chat.id === group.id
  );

  setActiveDbChat(
    loadedChat || group
  );

  setHubTab('INBOX');
} }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(243, 202, 88, 0.05)', padding: '16px', borderRadius: '24px', border: '1px solid rgba(243, 202, 88, 0.1)', width: '100%', boxSizing: 'border-box', marginBottom: '10px', cursor: isAlreadyJoined ? 'pointer' : 'default' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
  style={{
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: 'rgba(243,202,88,0.1)',
    border: '2px solid rgba(243,202,88,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f3ca58',
    fontSize: '20px',
    flexShrink: 0
  }}
>
  {group.avatar_url ? (
    <img
      src={group.avatar_url}
      alt={group.name || 'Group'}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
      }}
    />
  ) : (
    '⛪'
  )}
</div>
                          <div>
                            <div style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>{group.name}</div>
                            <div style={{ color: '#8e9aab', fontSize: '12px', marginTop: '2px' }}>{isAlreadyJoined ? 'Tap to open chat' : (group.description || 'Connect with your local assembly')}</div>
                          </div>
                        </div>
                        {!isAlreadyJoined && (
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const { data: { user } } = await supabase.auth.getUser();
                                await supabase.from('chat_participants').insert([{ chat_id: group.id, user_id: user.id }]);
                                fetchMessengerData();
                                setActiveDbChat(group);
                                setHubTab('INBOX');
                              } catch (error) {
                                console.error("Error joining group:", error);
                                alert("Failed to join the group. Please try again.");
                              }
                            }}
                            style={{ color: '#101926', background: '#f3ca58', padding: '8px 16px', borderRadius: '12px', fontSize: '10px', fontWeight: '900', border: 'none', cursor: 'pointer' }}
                          >
                            JOIN
                          </button>
                        )}
                      </div>
                    );
                })}
              </div>
            )}

            {/* SUB-SECTION: GLOBAL GROUPS */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '12px', margin: '0 0 10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                Global Rooms
              </h4>
              {publicGroups
                .filter(g => g.category !== 'Local' && !g.name.includes(userProfile?.local_church))
                .map(group => {
                  const isAlreadyJoined = dbChats.some(chat => chat.id === group.id);
                  return (
                    <div key={group.id} onClick={() => { if (isAlreadyJoined) {
  const loadedChat = dbChats.find(
    chat => chat.id === group.id
  );

  setActiveDbChat(
    loadedChat || group
  );

  setHubTab('INBOX');
} }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', width: '100%', boxSizing: 'border-box', marginBottom: '10px', cursor: isAlreadyJoined ? 'pointer' : 'default' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
  style={{
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: 'rgba(41,190,175,0.1)',
    border: '2px solid rgba(41,190,175,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#29beaf',
    fontSize: '20px',
    flexShrink: 0
  }}
>
  {group.avatar_url ? (
    <img
      src={group.avatar_url}
      alt={group.name || 'Group'}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
      }}
    />
  ) : (
    '🌍'
  )}
</div>
                        <div>
                          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>{group.name}</div>
                          <div style={{ color: '#8e9aab', fontSize: '12px', marginTop: '2px' }}>
                            {isAlreadyJoined ? 'Tap to open chat' : (group.description || 'Public Kingdom Chat')}
                          </div>
                        </div>
                      </div>
                      
                      {!isAlreadyJoined && (
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const { data: { user } } = await supabase.auth.getUser();
                              await supabase.from('chat_participants').insert([{ chat_id: group.id, user_id: user.id }]);
                              fetchMessengerData();
                              setActiveDbChat(group);
                              setHubTab('INBOX');
                            } catch (error) {
                              console.error("Error joining group:", error);
                              alert("Failed to join the group. Please try again.");
                            }
                          }}
                          style={{ color: '#101926', background: '#29beaf', padding: '8px 16px', borderRadius: '12px', fontSize: '10px', fontWeight: '900', border: 'none', cursor: 'pointer' }}
                        >
                          JOIN
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>

            {publicGroups.length === 0 && <div style={{ textAlign: 'center', color: '#8e9aab', fontSize: '13px' }}>No public groups available.</div>}
          </div>
        )}

        {/* ==================== CREATE GROUP MODAL ==================== */}
        {isCreateGroupModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 16, 26, 0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '400px', background: '#101926', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', margin: 0 }}>Create Public Group</h3>
                <button onClick={() => setIsCreateGroupModalOpen(false)} style={{ background: 'none', border: 'none', color: '#8e9aab', cursor: 'pointer' }}><XIcon /></button>
              </div>
              <input type="text" placeholder="Group Name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }} />
              <textarea placeholder="Description" value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', marginBottom: '20px', outline: 'none', height: '80px', resize: 'none', boxSizing: 'border-box' }} />
              <button onClick={handleCreateGroup} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f3ca58, #29beaf)', border: 'none', borderRadius: '12px', color: '#101926', fontWeight: '900', cursor: 'pointer' }}>Create Group</button>
            </div>
          </div>
        )}


        {/* ==================== TAB 3: PEOPLE ==================== */}
        {hubTab === 'PEOPLE' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', width: '100%' }}>
            <div style={{ padding: '0 20px', flexShrink: 0 }}>
              <div className="glass-scroll" style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', overflowX: 'auto' }}>
                {['MY CHURCH', 'DENOMINATION', 'NEARBY', 'GLOBAL'].map(sub => (
                  <button 
                    key={sub}
                    onClick={() => setPeopleSubTab(sub)}
                    style={{ padding: '10px 14px', borderRadius: '12px', border: peopleSubTab === sub ? '1px solid rgba(41, 190, 175, 0.3)' : '1px solid rgba(255,255,255,0.05)', background: peopleSubTab === sub ? 'rgba(41, 190, 175, 0.1)' : 'transparent', color: peopleSubTab === sub ? '#29beaf' : '#8e9aab', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                  >
                    {sub}
                  </button>
                ))}
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
                <SearchIcon />
                <input type="text" placeholder="Search believers..." value={peopleSearch} onChange={(e) => setPeopleSearch(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' }} />
              </div>
            </div>

            <div className="glass-scroll" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1, paddingBottom: '100px' }}>
              {peopleSubTab === 'GLOBAL' ? (
                globalUsers.length > 0 ? (
                  globalUsers.map(user => {
                    const isFriend = friends.some(f => f.sender_id === user.id || f.receiver_id === user.id);
                    const isPending = sentRequests.some(req => req.receiver_id === user.id) || 
                                      incomingRequests.some(req => req.sender_id === user.id);

                    return (
                      <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', width: '100%', boxSizing: 'border-box' }}>
                        <div 
                          onClick={() => handleViewProfile(user.id)} 
                          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
                          title="View Public Profile"
                        >
                          <div
  style={{
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(41,190,175,0.1)',
    border: '2px solid rgba(41,190,175,0.35)',
    color: '#29beaf',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    overflow: 'hidden',
    flexShrink: 0
  }}
>
  {user.avatar_url ? (
    <img
      src={user.avatar_url}
      alt={user.full_name || user.username || 'User'}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
      }}
    />
  ) : (
    user.full_name?.charAt(0) ||
    user.username?.charAt(0) ||
    'U'
  )}
</div>
                          <div>
                            <div style={{ color: '#fff', fontSize: '15px', fontWeight: '800' }}>{user.username || 'Anonymous Believer'}</div>
                            <div style={{ color: '#8e9aab', fontSize: '11px' }}>{user.denomination || 'Kingdom Citizen'}</div>
                          </div>
                        </div>
                        
                        {isFriend ? (
                          <div style={{ background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71', color: '#2ecc71', padding: '6px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: '800' }}>
                            FRIENDS
                          </div>
                        ) : isPending ? (
                          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#8e9aab', padding: '6px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: '800' }}>
                            PENDING
                          </div>
                        ) : (
                          <button 
                            onClick={() => sendFriendRequest(user.id)} 
                            style={{ background: 'transparent', border: '1px solid #f3ca58', color: '#f3ca58', padding: '6px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}
                          >
                            CONNECT
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', color: '#8e9aab', fontSize: '13px' }}>Loading global directory...</div>
                )
              ) : (
                <div style={{ textAlign: 'center', color: '#8e9aab', fontSize: '14px' }}>No one found in this category yet.</div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: REQUESTS ==================== */}
        {hubTab === 'REQUESTS' && (
          <div className="glass-scroll" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '30px', overflowY: 'auto', flex: 1, paddingBottom: '100px', width: '100%' }}>
            
            {/* INCOMING REQUESTS */}
            <div style={{ width: '100%' }}>
              <div style={{ color: '#f3ca58', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', marginBottom: '16px' }}>INCOMING ({incomingRequests.length})</div>
              {incomingRequests.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8e9aab', fontSize: '13px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px' }}>No new requests.</div>
              ) : (
                incomingRequests.map(req => (
  <div
    key={req.id}
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(255,255,255,0.02)',
      padding: '12px',
      borderRadius: '16px',
      marginBottom: '8px',
      border: '1px solid rgba(255,255,255,0.05)',
      gap: '10px'
    }}
  >

    {/* REQUESTER */}
    <div
      onClick={() => handleViewProfile(req.sender_id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: 0,
        flex: 1,
        cursor: 'pointer'
      }}
    >

      {/* AVATAR */}
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'rgba(41,190,175,0.1)',
          border: '2px solid rgba(41,190,175,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#29beaf',
          fontWeight: '900',
          fontSize: '16px'
        }}
      >
        {req.sender?.avatar_url ? (
          <img
            src={req.sender.avatar_url}
            alt={
              req.sender?.full_name ||
              req.sender?.username ||
              'User'
            }
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        ) : (
          req.sender?.full_name?.charAt(0) ||
          req.sender?.username?.charAt(0) ||
          'U'
        )}
      </div>

      {/* NAME */}
      <div
        style={{
          color: '#fff',
          fontSize: '14px',
          fontWeight: '700',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {req.sender?.full_name ||
          req.sender?.username ||
          'Kingdom Citizen'}
      </div>

    </div>

    {/* ACTIONS */}
    <div
      style={{
        display: 'flex',
        gap: '8px',
        flexShrink: 0
      }}
    >
      <button
        onClick={() =>
          handleRequestAction(
            req.id,
            'accepted'
          )
        }
        style={{
          background: '#29beaf',
          color: '#101926',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        ACCEPT
      </button>

      <button
        onClick={() =>
          handleRequestAction(
            req.id,
            'rejected'
          )
        }
        style={{
          background: 'rgba(231,76,60,0.2)',
          color: '#e74c3c',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        DECLINE
      </button>
    </div>

  </div>
))
              )}
            </div>
            
            <div style={{ width: '100%' }}>
              <div style={{ color: '#29beaf', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', marginBottom: '16px' }}>SENT ({sentRequests.length})</div>
              {sentRequests.length === 0 ? (
                 <div style={{ textAlign: 'center', color: '#8e9aab', fontSize: '13px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px' }}>No pending sent requests.</div>
              ) : (
                sentRequests.map(req => (
  <div
    key={req.id}
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(255,255,255,0.02)',
      padding: '12px',
      borderRadius: '16px',
      marginBottom: '8px',
      border: '1px solid rgba(255,255,255,0.05)',
      gap: '10px'
    }}
  >

    {/* RECIPIENT */}
    <div
      onClick={() =>
        handleViewProfile(req.receiver_id)
      }
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: 0,
        flex: 1,
        cursor: 'pointer'
      }}
    >

      {/* AVATAR */}
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'rgba(41,190,175,0.1)',
          border: '2px solid rgba(41,190,175,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#29beaf',
          fontWeight: '900',
          fontSize: '16px'
        }}
      >
        {req.receiver?.avatar_url ? (
          <img
            src={req.receiver.avatar_url}
            alt={
              req.receiver?.full_name ||
              req.receiver?.username ||
              'User'
            }
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        ) : (
          req.receiver?.full_name?.charAt(0) ||
          req.receiver?.username?.charAt(0) ||
          'U'
        )}
      </div>

      {/* NAME */}
      <div
        style={{
          color: '#fff',
          fontSize: '14px',
          fontWeight: '700',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {req.receiver?.full_name ||
          req.receiver?.username ||
          'Kingdom Citizen'}
      </div>

    </div>

    {/* STATUS */}
    <div
      style={{
        color: '#8e9aab',
        fontSize: '10px',
        fontWeight: '800',
        flexShrink: 0
      }}
    >
      PENDING
    </div>

  </div>
))
              )}
            </div>
          </div>
        )}

        {/* FLOATING NEW CHAT BUTTON */}
        <button 
          onClick={() => setIsNewChatModalOpen(true)}
          style={{ 
            position: 'fixed', 
            bottom: '100px', 
            right: '20px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            color: '#29beaf', 
            padding: '14px 15px', 
            borderRadius: '30px', 
            fontSize: '14px', 
            fontWeight: '800', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            zIndex: 100 
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: '1' }}>+</span> New Chat
        </button>

        {/* --- START NEW CHAT MODAL --- */}
        {isNewChatModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#101926', border: '1px solid rgba(41, 190, 175, 0.4)', borderRadius: '20px', padding: '25px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>Start New Chat</h3>
                <button onClick={() => setIsNewChatModalOpen(false)} style={{ background: 'none', border: 'none', color: '#8e9aab', cursor: 'pointer' }}>
                  <XIcon />
                </button>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {friends.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8e9aab', padding: '20px 0', fontSize: '13px' }}>
                    No friends added yet. Connect with believers in the People tab first!
                  </div>
                ) : (
                  friends.map(friendReq => {
                    const friendProfile = friendReq.sender_id === userProfile?.id ? friendReq.receiver : friendReq.sender;
                    
                    return (
                      <div key={friendReq.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(41, 190, 175, 0.1)', color: '#29beaf', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {friendProfile?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>
                            {friendProfile?.full_name || 'Believer'}
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setIsNewChatModalOpen(false);
                            handleInitiateDirectChat(friendProfile);
                          }} 
                          style={{ background: 'rgba(41, 190, 175, 0.1)', border: '1px solid #29beaf', color: '#29beaf', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                        >
                          Message
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
        
        <AppBottomNav />

      </div>
    ) : (

      /* =========================================
         ACTIVE CHAT ROOM VIEW
         ========================================= */
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100%',
          background: 'transparent',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1000
        }}
      >

        {/* CHAT HEADER */}
        <div
          style={{
            position: 'sticky',
                                top: 0,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'rgba(9, 16, 26, 0.4)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            zIndex: 100
          }}
        >

          {/* LEFT SIDE OF HEADER */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: 0
            }}
          >

            {/* BACK BUTTON */}
            <button
              onClick={() => setActiveDbChat(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <BackArrowIcon />
            </button>

            {/* CHAT INFORMATION */}
            {(() => {
              const isGroup = activeDbChat?.type === 'group';

              const activeOtherParticipant = !isGroup
                ? activeDbChat?.chat_participants?.find(
                    p => p.user_id !== userProfile?.id
                  )?.user_profiles
                : null;

              let targetName = isGroup
                ? (activeDbChat?.name || 'Kingdom Group')
                : (
                    activeOtherParticipant?.full_name ||
                    activeOtherParticipant?.username ||
                    activeDbChat?.name ||
                    'Private Message'
                  );

              let targetAvatarUrl = isGroup
                ? (activeDbChat?.avatar_url || null)
                : (activeOtherParticipant?.avatar_url || null);

              let targetLetter = isGroup
                ? '⛪'
                : (
                    targetName !== 'Private Message'
                      ? targetName.charAt(0).toUpperCase()
                      : 'KP'
                  );

              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    minWidth: 0
                  }}
                >

                  {/* AVATAR */}
                  <div
                    onClick={() => {
                      if (!isGroup && activeOtherParticipant?.id) {
                        handleViewProfile(activeOtherParticipant.id);
                      }
                    }}
                    title={
                      !isGroup
                        ? 'View Public Profile'
                        : ''
                    }
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isGroup
                        ? 'rgba(41, 190, 175, 0.1)'
                        : '#1a8277',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: !isGroup
                        ? 'pointer'
                        : 'default',
                      border: isGroup
                        ? '2px solid rgba(41,190,175,0.35)'
                        : '2px solid #09101a',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {targetAvatarUrl ? (
                      <img
                        src={targetAvatarUrl}
                        alt={targetName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    ) : (
                      targetLetter
                    )}
                  </div>

                  {/* NAME + DESCRIPTION */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0
                    }}
                  >

                    <h3
                      style={{
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: '800',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '220px'
                      }}
                    >
                      {targetName}
                    </h3>

                    {isGroup ? (
                      <span
                        style={{
                          color: '#8e9aab',
                          fontSize: '10px',
                          fontWeight: '600',
                          marginTop: '2px',
                          maxWidth: '220px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {activeDbChat?.description ||
                          'Kingdom community'}
                      </span>
                    ) : (
                      <span
                        style={{
                          color: '#2ecc71',
                          fontSize: '11px',
                          fontWeight: '700',
                          marginTop: '2px'
                        }}
                      >
                        Live Chat Sync
                      </span>
                    )}

                  </div>
                </div>
              );
            })()}

          </div>

          {/* RIGHT SIDE OF HEADER */}
          {activeDbChat?.type === 'group' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0
              }}
            >

              {/* VIEW MEMBERS */}
              <button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    openGroupMembers();
  }}
  title="View group members"
  style={{
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    border: '1px solid rgba(41,190,175,0.3)',
    background: 'rgba(41,190,175,0.12)',
    color: '#29beaf',
    cursor: 'pointer',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 100,
    pointerEvents: 'auto'
  }}
>
  👥
</button>

              {/* EDIT GROUP - CREATOR ONLY */}
              {activeDbChat?.created_by === userProfile?.id && (
                <button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    openGroupSettings();
  }}
  title="Edit group"
  style={{
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    border: '1px solid rgba(243,202,88,0.35)',
    background: 'rgba(243,202,88,0.12)',
    color: '#f3ca58',
    cursor: 'pointer',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 100,
    pointerEvents: 'auto'
  }}
>
  ⚙️
</button>
              )}

            </div>
          )}

        </div>

        <div className="glass-scroll" style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'center', color: '#55657a', fontSize: '11px', fontWeight: '700', marginBottom: '10px' }}>
            🔒 Encrypted Web3 Chat
          </div>

          {dbMessages.map((msg) => {
            const isMe = authUserId === msg.sender_id; 
            const isEditing = editingMessageId === msg.id;
            
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
                
                {!isMe && activeDbChat.type === 'group' && (
                  <div 
                    style={{ fontSize: '10px', color: '#8e9aab', marginBottom: '4px', marginLeft: '12px', cursor: 'pointer' }} 
                    onClick={() => handleViewProfile(msg.sender_id)}
                  >
                    {msg.sender?.full_name || msg.sender?.username || 'Unknown'}
                  </div>
                )}

                {msg.intent && msg.intent !== 'NORMAL' && (
                  <span style={{ fontSize: '9px', fontWeight: '900', padding: '2px 8px', borderRadius: '6px', background: msg.intent === 'URGENT PRAYER' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(243, 202, 88, 0.2)', color: msg.intent === 'URGENT PRAYER' ? '#e74c3c' : '#f3ca58', marginBottom: '4px', letterSpacing: '0.5px' }}>
                    {msg.intent}
                  </span>
                )}
                
                {isEditing ? (
                  <form onSubmit={submitEditDbMessage} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '75%', justifyContent: 'flex-end' }}>
                    <input 
                      type="text" 
                      value={editMessageContent} 
                      onChange={(e) => setEditMessageContent(e.target.value)}
                      style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid #f3ca58', borderRadius: '12px', color: '#fff', padding: '8px 12px', outline: 'none' }}
                      autoFocus
                    />
                    <button type="submit" style={{ background: '#f3ca58', color: '#101926', border: 'none', borderRadius: '8px', padding: '0 12px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                    <button type="button" onClick={() => setEditingMessageId(null)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer' }}>Cancel</button>
                  </form>
                ) : (
                  <div style={{ background: isMe ? 'rgba(41, 190, 175, 0.15)' : 'rgba(255,255,255,0.05)', color: isMe ? '#29beaf' : '#fff', padding: '12px 16px', borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', maxWidth: '75%', fontSize: '14px', lineHeight: '1.4', border: isMe ? '1px solid rgba(41, 190, 175, 0.3)' : '1px solid rgba(255,255,255,0.05)', wordBreak: 'break-word', backdropFilter: 'blur(5px)' }}>
                    {msg.content}
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ color: '#55657a', fontSize: '10px', fontWeight: '700' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {isMe && <ChatDoubleCheckIcon />}
                  </span>
                  
                  {isMe && !isEditing && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => { setEditingMessageId(msg.id); setEditMessageContent(msg.content); }}
                        style={{ background: 'none', border: 'none', color: '#f3ca58', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                      >
                        Edit
                      </button>
                      <span style={{ color: '#55657a', fontSize: '10px' }}>•</span>
                      <button 
                        onClick={() => handleDeleteDbMessage(msg.id)}
                        style={{ background: 'none', border: 'none', color: '#e74c3c', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
<div ref={messagesEndRef} />
        </div>

        <div style={{ flexShrink: 0, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.2)' }}>
          <div className="glass-scroll" style={{ display: 'flex', gap: '8px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['URGENT PRAYER', 'COUNSELING', 'TESTIMONY'].map(intent => (
              <span 
                key={intent} onClick={() => setMessageIntent(intent)} 
                style={{ padding: '6px 12px', borderRadius: '14px', fontSize: '10px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', background: messageIntent === intent ? '#f3ca58' : 'rgba(255,255,255,0.05)', color: messageIntent === intent ? '#101926' : '#8e9aab' }}
              >
                {intent}
              </span>
            ))}
          </div>
          
          <form onSubmit={handleSendDbMessage} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '6px 6px 6px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#8e9aab', cursor: 'pointer', display: 'flex', transform: 'rotate(-45deg)' }} onClick={() => alert("Select a document or image to attach.")}>
              <AttachIcon />
            </span>
            <input 
              type="text" placeholder={messageIntent === 'NORMAL' ? "Message..." : `Draft your ${messageIntent.toLowerCase()}...`}
              value={chatInputMessage} onChange={(e) => setChatInputMessage(e.target.value)} 
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '14px', padding: '0 8px' }} 
            />
            <button type="submit" style={{ background: chatInputMessage ? 'linear-gradient(90deg, #f3ca58, #29beaf)' : 'rgba(255,255,255,0.05)', border: 'none', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: chatInputMessage ? '#101926' : '#8e9aab', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    )}
  </div>
)}

{/* ==================== GROUP SETTINGS MODAL ==================== */}
{isGroupSettingsOpen && activeDbChat?.type === 'group' && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5,10,18,0.96)',
      zIndex: 20000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: '420px',
        background: '#101926',
        borderRadius: '24px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxSizing: 'border-box'
      }}
    >

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '22px'
        }}
      >
        <div>
          <div
            style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: '900'
            }}
          >
            Group Settings
          </div>

          <div
            style={{
              color: '#8e9aab',
              fontSize: '11px',
              marginTop: '4px'
            }}
          >
            Only the group creator can edit this group.
          </div>
        </div>

        <button
          onClick={() =>
            setIsGroupSettingsOpen(false)
          }
          style={{
            background: 'none',
            border: 'none',
            color: '#8e9aab',
            cursor: 'pointer'
          }}
        >
          <XIcon />
        </button>
      </div>

      {/* GROUP NAME */}
      <label
        style={{
          display: 'block',
          color: '#cbd5e1',
          fontSize: '10px',
          fontWeight: '900',
          marginBottom: '6px'
        }}
      >
        GROUP NAME
      </label>

      <input
        type="text"
        value={groupEditName}
        onChange={e =>
          setGroupEditName(e.target.value)
        }
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '13px',
          marginBottom: '15px',
          background: 'rgba(0,0,0,0.3)',
          border:
            '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          color: '#fff',
          outline: 'none'
        }}
        placeholder="Group name"
      />

      {/* DESCRIPTION */}
      <label
        style={{
          display: 'block',
          color: '#cbd5e1',
          fontSize: '10px',
          fontWeight: '900',
          marginBottom: '6px'
        }}
      >
        DESCRIPTION
      </label>

      <textarea
        value={groupEditDesc}
        onChange={e =>
          setGroupEditDesc(e.target.value)
        }
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '13px',
          marginBottom: '15px',
          minHeight: '90px',
          resize: 'vertical',
          background: 'rgba(0,0,0,0.3)',
          border:
            '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          color: '#fff',
          outline: 'none'
        }}
        placeholder="Describe this group..."
      />

{/* GROUP PROFILE PHOTO */}
<div
  style={{
    marginBottom: '20px'
  }}
>
  <label
    style={{
      display: 'block',
      color: '#cbd5e1',
      fontSize: '10px',
      fontWeight: '900',
      marginBottom: '8px'
    }}
  >
    GROUP PROFILE PHOTO
  </label>

  {/* PHOTO PREVIEW */}
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '12px'
    }}
  >
    <div
      style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        background: 'rgba(41,190,175,0.1)',
        border:
          '2px solid rgba(41,190,175,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f3ca58',
        fontSize: '26px',
        fontWeight: '900'
      }}
    >
      {groupEditAvatar ? (
        <img
          src={groupEditAvatar}
          alt="Group preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      ) : (
        '⛪'
      )}
    </div>

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '7px'
      }}
    >
      <label
        htmlFor="groupAvatarFile"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '9px 13px',
          borderRadius: '10px',
          background:
            'rgba(41,190,175,0.12)',
          border:
            '1px solid rgba(41,190,175,0.35)',
          color: '#29beaf',
          fontSize: '11px',
          fontWeight: '800',
          cursor: isUploadingGroupAvatar
            ? 'wait'
            : 'pointer',
          opacity: isUploadingGroupAvatar
            ? 0.6
            : 1
        }}
      >
        {isUploadingGroupAvatar
          ? 'Uploading...'
          : 'Choose Photo'}

        <input
          id="groupAvatarFile"
          type="file"
          accept="image/*"
          onChange={handleGroupAvatarUpload}
          disabled={isUploadingGroupAvatar}
          style={{
            display: 'none'
          }}
        />
      </label>

      <div
        style={{
          color: '#64748b',
          fontSize: '10px'
        }}
      >
        JPG, PNG or WEBP • Max 15 MB
      </div>
    </div>
  </div>
</div>

      {/* SAVE */}
      <button
        onClick={saveGroupSettings}
        style={{
          width: '100%',
          padding: '14px',
          border: 'none',
          borderRadius: '12px',
          background:
            'linear-gradient(135deg,#f3ca58,#29beaf)',
          color: '#101926',
          fontWeight: '900',
          cursor: 'pointer'
        }}
      >
        Save Changes
      </button>

    </div>
  </div>
)}

{/* ==================== GROUP MEMBERS MODAL ==================== */}
{isGroupMembersOpen && activeDbChat?.type === 'group' && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5,10,18,0.96)',
      zIndex: 20000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: '420px',
        maxHeight: '80vh',
        overflowY: 'auto',
        background: '#101926',
        borderRadius: '24px',
        padding: '24px',
        border:
          '1px solid rgba(255,255,255,0.1)',
        boxSizing: 'border-box'
      }}
    >

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}
      >
        <div>
          <div
            style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: '900'
            }}
          >
            Group Members
          </div>

          <div
            style={{
              color: '#8e9aab',
              fontSize: '11px',
              marginTop: '4px'
            }}
          >
            {groupMembers.length} member
            {groupMembers.length !== 1 ? 's' : ''}
          </div>
        </div>

        <button
          onClick={() =>
            setIsGroupMembersOpen(false)
          }
          style={{
            background: 'none',
            border: 'none',
            color: '#8e9aab',
            cursor: 'pointer'
          }}
        >
          <XIcon />
        </button>
      </div>

      {groupMembers.length === 0 ? (

        <div
          style={{
            textAlign: 'center',
            color: '#8e9aab',
            fontSize: '13px',
            padding: '30px 10px'
          }}
        >
          No members found.
        </div>

      ) : (

        groupMembers.map(member => {

          const profile =
            member.user_profiles;

          const isOwner =
            member.user_id ===
            activeDbChat.created_by;

          return (
            <div
              key={member.user_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom:
                  '1px solid rgba(255,255,255,0.05)'
              }}
            >

              {/* AVATAR */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background:
                    'linear-gradient(135deg,#101926,#1f3752)',
                  border:
                    '2px solid #29beaf',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f3ca58',
                  fontWeight: '900'
                }}
              >
                {profile?.avatar_url ? (

                  <img
                    src={profile.avatar_url}
                    alt={
                      profile.full_name ||
                      profile.username ||
                      'User'
                    }
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />

                ) : (

                  profile?.full_name?.charAt(0) ||
                  profile?.username?.charAt(0) ||
                  'U'

                )}
              </div>

              {/* USER INFO */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0
                }}
              >
                <div
                  style={{
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '800',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {profile?.full_name ||
                    profile?.username ||
                    'Kingdom User'}
                </div>

                {profile?.username && (
                  <div
                    style={{
                      color: '#8e9aab',
                      fontSize: '10px',
                      marginTop: '2px'
                    }}
                  >
                    @{profile.username}
                  </div>
                )}
              </div>

              {/* CREATOR BADGE */}
              {isOwner && (
                <div
                  style={{
                    background:
                      'rgba(243,202,88,0.1)',
                    border:
                      '1px solid rgba(243,202,88,0.25)',
                    color: '#f3ca58',
                    padding: '5px 8px',
                    borderRadius: '8px',
                    fontSize: '8px',
                    fontWeight: '900'
                  }}
                >
                  CREATOR
                </div>
              )}

            </div>
          );
        })

      )}

    </div>
  </div>
)}


{/* =========================================
          STEP 24: ADMIN DESK
          ========================================= */}
      {step === 24 && (
        <div className="feed-screen-container" style={{ position: 'relative', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
          
          <div className="feed-header-top" style={{ paddingBottom: '10px' }}>
            <button className="back-button" onClick={() => setStep(18)} style={{ width: '36px', height: '36px' }}>
              <BackArrowIcon />
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0' }}>
              <span style={{ color: '#f3ca58' }}>KingdomPlus</span> <span style={{ color: '#29beaf' }}>Admin</span>
            </h2>
            <div style={{ width: '36px' }}></div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="feed-tabs-container" style={{ marginBottom: '15px', padding: '0 20px' }}>
            {['Dreams', 'Music', 'Videos', 'Movies', 'News'].map((tab) => (
              <div key={tab} className={`feed-tab ${adminTab === tab ? 'active' : ''}`} onClick={() => { setAdminTab(tab); setEditingId(null); }}>
                <span style={{ marginLeft: '4px' }}>{tab}</span>
              </div>
            ))}
          </div>

          <div className="feed-scroll-area" style={{ flexGrow: 1, paddingBottom: '120px' }}>

               {adminTab === 'Dreams' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', padding: '0 20px' }}>Pending Interpretations</h3>
                
                {pendingDreams.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8e9aab', padding: '20px' }}>No pending dreams right now.</div>
                ) : (
                  pendingDreams.map(dream => (
                    <div key={dream.id} className="admin-dream-card" style={{ margin: '0 20px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(243, 202, 88, 0.3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#f3ca58', fontSize: '11px', fontWeight: '800' }}>PENDING REVIEW</span>
                      </div>
                      <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '8px' }}>{dream.title}</h4>
                      <p style={{ color: '#e2e8f0', fontSize: '13px', marginBottom: '15px', lineHeight: '1.5' }}>
                        {dream.content}
                      </p>
                      
                      <textarea 
                        className="dream-textarea" 
                        placeholder="Type your prophetic interpretation here..." 
                        value={dreamReply}
                        onChange={(e) => setDreamReply(e.target.value)}
                        style={{ height: '100px', marginBottom: '10px' }}
                      ></textarea>
                      <button onClick={() => handleSendInterpretation(dream.id)} className="modal-btn-primary" style={{ width: '100%' }}>Send Interpretation</button>
                    </div>
                  ))
                )}
              </div>
            )}
            

            {/* --- MEDIA & CONTENT FORM --- */}
            {['Music', 'Videos', 'Movies', 'News'].includes(adminTab) && (
              <>
                <div style={{ margin: '0 20px 25px 20px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: 0 }}>
                      {editingId ? `Edit ${adminTab}` : `Upload New ${adminTab}`}
                    </h3>
                    {editingId && (
                      <button onClick={() => { setEditingId(null); setAdminUpload({ title: '', artist: '', description: '', img: '', src: '', content: '', category: 'Nigerian Gospel' }); }} style={{ background: 'rgba(231, 76, 60, 0.2)', border: 'none', color: '#e74c3c', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}>Cancel Edit</button>
                    )}
                  </div>
                  
                  <label className="dream-input-label">TITLE</label>
                  <input type="text" className="dream-input" placeholder={`Enter ${adminTab.toLowerCase()} title...`} value={adminUpload.title} onChange={(e) => setAdminUpload({...adminUpload, title: e.target.value})} />
      
                  {adminTab !== 'News' && (
                    <>
                      <label className="dream-input-label">ARTIST / CREATOR / CHANNEL</label>
                      <input type="text" className="dream-input" placeholder="Name of creator or channel..." value={adminUpload.artist} onChange={(e) => setAdminUpload({...adminUpload, artist: e.target.value})} />

                      <label className="dream-input-label">REGION / CATEGORY</label>
                      <select className="app-select" value={adminUpload.category} onChange={(e) => setAdminUpload({...adminUpload, category: e.target.value})} style={{ marginBottom: '20px' }}>
                        {adminTab === 'Music' && (
                          <>
                            <option value="Nigerian Gospel">Nigerian Gospel</option>
                            <option value="South African Gospel">South African Gospel</option>
                            <option value="American Gospel">American Gospel</option>
                            <option value="Ghanaian Gospel">Ghanaian Gospel</option>
                            <option value="Most Popular">Most Popular</option>
                            <option value="Trending Now">Trending Now</option>
                            <option value="Afro Gospel">Afro Gospel</option>
                            <option value="Rising Gospel">Rising Gospel</option>

                          </>
                        )}
                        {adminTab === 'Videos' && (
                          <>
                            <option value="Sermons">Sermons</option>
                            <option value="Worship">Worship</option>
                            <option value="Teaching">Teaching</option>
                            <option value="Shorts">Shorts</option>
                            <option value="Prophetic">Prophetic</option>
                          </>
                        )}
                        {adminTab === 'Movies' && (
                          <>
                            <option value="KP Original">KP Original</option>
                            <option value="Trending Now">Trending Now</option>
                            <option value="Faith & Family">Faith & Family</option>
                            <option value="Documentaries">Documentaries</option>
                          </>
                        )}
                      </select>

                      <label className="dream-input-label">SHORT DESCRIPTION</label>
                      <input type="text" className="dream-input" placeholder="Catchy description..." value={adminUpload.description} onChange={(e) => setAdminUpload({...adminUpload, description: e.target.value})} />
                    </>
                  )}

                  <label className="dream-input-label">COVER IMAGE (URL OR FILE)</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input type="text" className="dream-input" placeholder="Paste image link..." value={adminUpload.img} onChange={(e) => setAdminUpload({...adminUpload, img: e.target.value})} style={{ marginBottom: 0, flex: 1 }} />
                    <div style={{ position: 'relative', width: '45px', height: '45px', flexShrink: 0, borderRadius: '12px', background: 'rgba(41, 190, 175, 0.1)', border: '1px solid #29beaf', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#29beaf', cursor: 'pointer', overflow: 'hidden' }}>
                      <span style={{ fontSize: '20px', fontWeight: '900' }}>+</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'img')} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                    </div>
                  </div>

                  {adminTab === 'News' ? (
                    <>
                      <label className="dream-input-label">ARTICLE CONTENT</label>
                      <textarea className="dream-textarea" placeholder="Write or paste full article..." value={adminUpload.content} onChange={(e) => setAdminUpload({...adminUpload, content: e.target.value})}></textarea>
                    </>
                  ) : (
                    <>
                      <label className="dream-input-label">SOURCE MEDIA (URL OR FILE)</label>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input type="text" className="dream-input" placeholder="Paste media link..." value={adminUpload.src} onChange={(e) => setAdminUpload({...adminUpload, src: e.target.value})} style={{ marginBottom: 0, flex: 1 }} />
                        <div style={{ position: 'relative', width: '45px', height: '45px', flexShrink: 0, borderRadius: '12px', background: 'rgba(243, 202, 88, 0.1)', border: '1px solid #f3ca58', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f3ca58', cursor: 'pointer', overflow: 'hidden' }}>
                          <span style={{ fontSize: '20px', fontWeight: '900' }}>+</span>
                          <input type="file" accept="audio/*,video/*" onChange={(e) => handleFileUpload(e, 'src')} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                        </div>
                      </div>
                    </>
                  )}

                  <button onClick={handleAdminPublish} disabled={isUploading} className="modal-btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    {isUploading ? "Uploading file..." : editingId ? `Save Changes to ${adminTab}` : `Publish ${adminTab}`}
                  </button>
                </div>

                {/* --- PUBLISHED LIST MANAGER (EDIT / DELETE) --- */}
                <div style={{ margin: '0 20px' }}>
                  <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '800', marginBottom: '15px' }}>Manage Published {adminTab}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(adminTab === 'Music' ? musicData : adminTab === 'Videos' ? videoData : adminTab === 'Movies' ? movieData : newsData).map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                          <img src={item.img} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ color: '#fff', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{item.title}</div>
                            <div style={{ color: '#8e9aab', fontSize: '11px' }}>{item.category || item.artist || 'Media'}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleStartEdit(item)} style={{ background: 'rgba(41, 190, 175, 0.2)', border: '1px solid #29beaf', color: '#29beaf', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>EDIT</button>
                          <button onClick={() => handleDeleteContent(item.id)} style={{ background: 'rgba(231, 76, 60, 0.2)', border: '1px solid #e74c3c', color: '#e74c3c', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>DELETE</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
          </div>
          
          <AppBottomNav />
        </div>
      )}


{/* =========================================
          STEP 25: PUBLIC PROFILE VIEW
          ========================================= */}
      {step === 25 && viewedProfile && (
        <div className="feed-screen-container" style={{ position: 'relative', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
          
          <div className="feed-header-top" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
            {/* Navigates back to the feed */}
            <button className="back-button" onClick={() => setStep(7)} style={{ width: '36px', height: '36px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
              <BackArrowIcon />
            </button>
          </div>

          <div className="feed-scroll-area" style={{ flexGrow: 1, paddingBottom: '120px', overflowY: 'auto', paddingTop: '0' }}>
            
            {/* Wallpaper */}
            <div 
              className="profile-cover-photo" 
              style={{ 
                backgroundImage: viewedProfile.wallpaper_url ? `url(${viewedProfile.wallpaper_url})` : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                height: '150px', width: 'calc(100% + 40px)', marginLeft: '-20px', marginRight: '-20px', 
                backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0
              }}
            ></div>

            <>
              <div className="profile-identity-section">
                <div className="profile-avatar-overlap" style={{ zIndex: 10 }}>
                  {viewedProfile.avatar_url ? (
                    <img src={viewedProfile.avatar_url} alt="Profile" className="profile-avatar-circle" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="profile-avatar-circle">
                      {viewedProfile.full_name ? viewedProfile.full_name.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                  )}
                  
                  {(viewedProfile.account_type === 'Premium' || viewedProfile.account_type === 'Apostle') && (
                    <div className="profile-verified-badge" title="Premium Account"><CheckIcon /></div>
                  )}
                </div>
                
                <h2 className="profile-name-main">{viewedProfile.full_name || 'Kingdom Citizen'}</h2>
                <div className="profile-status-badge">{viewedProfile.account_type || 'Standard'} Account</div>
                <p className="profile-bio-text">{viewedProfile.bio || 'This user has not added a bio yet.'}</p>

                <div className="profile-location-church">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconMapPin /> {viewedProfile.address || 'Unknown'}, {viewedProfile.country || 'Unknown'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconChurch /> {viewedProfile.local_church || 'No church listed'}</span>
                </div>
                
                {/* Public Actions (Add Friend, Message) instead of Edit Profile */}
                <div className="profile-action-row">
  {(() => {
    const isFriend = friends.some(friend =>
      friend.sender_id === viewedProfile.id ||
      friend.receiver_id === viewedProfile.id
    );

    const hasSentRequest = sentRequests.some(
      request => request.receiver_id === viewedProfile.id
    );

    const hasIncomingRequest = incomingRequests.some(
      request => request.sender_id === viewedProfile.id
    );

    if (isFriend) {
      return (
        <button
          className="profile-btn-primary"
          onClick={() => handleInitiateDirectChat(viewedProfile)}
        >
          Message
        </button>
      );
    }

    if (hasIncomingRequest) {
      const request = incomingRequests.find(
        item => item.sender_id === viewedProfile.id
      );

      return (
        <button
          className="profile-btn-primary"
          onClick={() => handleRequestAction(request.id, 'accepted')}
        >
          Accept Friend
        </button>
      );
    }

    if (hasSentRequest) {
      return (
        <button
          className="profile-btn-secondary"
          disabled
          style={{ opacity: 0.65, cursor: 'default' }}
        >
          Request Sent
        </button>
      );
    }

    return (
      <button
        className="profile-btn-primary"
        onClick={() => {
          sendFriendRequest(viewedProfile.id);
          alert(`Friend request sent to ${viewedProfile.full_name}!`);
        }}
      >
        + Add Friend
      </button>
    );
  })()}

  <button
    className="profile-btn-icon"
    onClick={() => {
      if (navigator.share) {
        navigator.share({
          title: viewedProfile.full_name || 'KingdomPlus Profile',
          text: `Check out ${viewedProfile.full_name || 'this KingdomPlus profile'}.`
        }).catch(() => {});
      }
    }}
  >
    <ShareIcon />
  </button>
</div>
              </div>

              <div className="profile-fb-tabs">
                {['All', 'Services', 'Posts'].map(tab => (
                  <div key={tab} className={`profile-fb-tab ${profileTab === tab ? 'active' : ''}`} onClick={() => setProfileTab(tab)}>
                    {tab}
                  </div>
                ))}
              </div>

              {profileTab === 'All' && (
                <div className="profile-tab-content">
                  <h3 className="profile-section-heading">Faith Activity</h3>
                  <div className="faith-activity-grid">
                    {/* Replaced Day Streak with Friends count for Public View */}
                    <div className="faith-activity-card">
                      <div className="activity-icon-container"><span style={{fontSize: '16px'}}>👥</span></div>
                      <div className="activity-num">{viewedProfile.friends_count || 0}</div>
                      <div className="activity-label">Friends</div>
                    </div>
                    <div className="faith-activity-card">
                      <div className="activity-icon-container"><IconHeadphones /></div>
                      <div className="activity-num">{viewedProfile.stream_time_hours || 0}h</div>
                      <div className="activity-label">Streamed</div>
                    </div>
                    <div className="faith-activity-card">
                      <div className="activity-icon-container"><IconBook /></div>
                      <div className="activity-num">{viewedProfile.devotions_read || 0}</div>
                      <div className="activity-label">Devotions</div>
                    </div>
                  </div>

                  <h3 className="profile-section-heading" style={{ marginTop: '30px' }}>Personal details</h3>
                  <div className="profile-detail-card">
                    <div className="detail-row">
                      <div className="detail-icon"><IconGlobe /></div>
                      <div className="detail-text">
                        <span className="detail-label">Country</span>
                        <span className="detail-value">{viewedProfile.country || 'Not provided'}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-icon"><IconChurch /></div>
                      <div className="detail-text">
                        <span className="detail-label">Denomination</span>
                        <span className="detail-value">{viewedProfile.denomination || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* TAB CONTENT: TARGET USER'S SERVICES */}
              {profileTab === 'Services' && (
                <div className="profile-tab-content">
                  <h3 className="profile-section-heading" style={{ marginBottom: '15px' }}>Offered Services</h3>
                  {viewedUserServices.length === 0 ? (
                    <div className="empty-dream-state" style={{ marginTop: '0' }}>
                      <div className="empty-dream-icon">💼</div>
                      <h3>No services listed</h3>
                      <p>{viewedProfile.full_name} has not listed any services yet.</p>
                    </div>
                  ) : (
                    viewedUserServices.map(service => (
                      <div key={service.id} className="profile-service-card">
                        <div className="service-header">
                          <h4 className="service-title">{service.title}</h4>
                          <div className="service-price">{service.price} KPC</div>
                        </div>
                        <p className="service-desc">{service.desc}</p>
                        <button className="service-action-btn" onClick={() => handlePurchaseService(service)}>Request Service</button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB CONTENT: TARGET USER'S POSTS */}
              {profileTab === 'Posts' && (
                <div className="profile-tab-content">
                  {globalPosts.filter(post => post.author_id === viewedProfile.id).length === 0 ? (
                    <div className="empty-dream-state" style={{ marginTop: '0' }}>
                      <div className="empty-dream-icon"><IconBook /></div>
                      <h3>No posts yet</h3>
                      <p>When {viewedProfile.full_name} shares thoughts or media, they will appear here.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {globalPosts.filter(post => post.author_id === viewedProfile.id).map(post => {
                        const isVideo = post.image_url?.match(/\.(mp4|webm|ogg|mov)$/i);
                        return (
                          <div key={post.id} className="feed-post-card">
                            <div className="post-header">
                              <div className="post-user-info">
                                {viewedProfile.avatar_url ? (
                                  <img src={viewedProfile.avatar_url} alt="" className="post-avatar" />
                                ) : (
                                  <div className="post-avatar" style={{ background: '#29beaf', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                                    {viewedProfile.full_name?.substring(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="post-meta">
                                  <strong style={{ color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {viewedProfile.full_name} 
                                    {(viewedProfile.account_type === 'Premium' || viewedProfile.account_type === 'Apostle') && <span style={{ color: '#29beaf', fontSize: '12px' }}><CheckIcon /></span>}
                                  </strong>
                                  <span style={{ color: '#8e9aab', fontSize: '11px' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>{post.content}</p>
                            
                            {post.image_url && (
                              isVideo ? (
                                <video src={post.image_url} controls style={{ width: '100%', borderRadius: '12px', marginBottom: '12px', maxHeight: '400px', backgroundColor: '#000' }} />
                              ) : (
                                <img src={post.image_url} alt="Post media" style={{ width: '100%', borderRadius: '12px', marginBottom: '12px' }} />
                              )
                            )}
                            
                            <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                              <span style={{ color: '#8e9aab', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><HeartIcon /> {post.likes_count}</span>
                              <span style={{ color: '#8e9aab', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><MessageIcon /> {post.comments_count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          </div>
          <AppBottomNav />
        </div>
      )}


      {renderStreamPlayer()}

    </>
  );
}