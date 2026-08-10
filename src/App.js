import React, { useState, useEffect, useRef } from 'react';
import { Connection, Keypair, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import './App.css';
import { supabase } from './supabaseClient';
import { Buffer } from 'buffer';

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
 const [kpcBalance, setKpcBalance] = useState(() => {
    const saved = localStorage.getItem('kp_current_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.wallet_balance || parsed.kpcBalance || 0;
    }
    return 0;
  });

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
  setNotifications(notifications.map(n => ({ ...n, isRead: false })));
};

// Notification State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
  const saved = localStorage.getItem(`kp_notifs_${currentUser?.id || 'guest'}`);
  return saved ? JSON.parse(saved) : [
    { id: 1, type: 'SYSTEM', title: 'Welcome to KingdomPlus', message: 'Your Kingdom Vault is ready. Start exploring!', time: '1d ago', isRead: false }
  ];
});


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

  // Media Hub State
  const [mediaTab, setMediaTab] = useState('Music'); 
  const [videoSubTab, setVideoSubTab] = useState('All');

  // Social Feed Posts
  const [newPostText, setNewPostText] = useState('');
  const [posts, setPosts] = useState([
    { id: 1, authorName: 'Sarah_f', authorHandle: '@sarah', time: '2h ago', avatar: 'https://images.unsplash.com/photo-1506804886640-ed09fb0317e0?auto=format&fit=crop&w=100&h=100', content: 'Feeling incredibly blessed today! Just finished reading Psalm 23 and it really spoke to my current situation. God is truly our shepherd. 🙏✨', image: null, likes: 0, comments: 0, isVerified: false },
    { id: 2, authorName: 'Pastor David', authorHandle: '@pdavid', time: '5h ago', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=100&h=100', content: 'Such a powerful time of worship at Grace Sanctuary this morning. The presence of God was so heavy in the room. Who else was blessed?', image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=400&q=80', likes: 0, comments: 0, isVerified: true }
  ]);

  const [prayerRooms, setPrayerRooms] = useState([
    { id: 'Breakthrough', title: 'Breakthrough', sub: 'Strongholds broken, new doors', color: '#e5c158', bg: '#8C7A3E', img: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=150&q=80', reqs: 1, lifted: 0 },
    { id: 'Family', title: 'Family', sub: 'Marriages, parenting, reconciliation', color: '#f39c12', bg: '#2980B9', img: 'https://images.unsplash.com/photo-1476611317561-60117649dd94?auto=format&fit=crop&w=150&q=80', reqs: 0, lifted: 0 },
    { id: 'Healing', title: 'Healing', sub: 'Bodies, hearts, and minds restored', color: '#ff4757', bg: '#4E8B61', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=150&q=80', reqs: 0, lifted: 0 },
    { id: 'Nations', title: 'Nations', sub: 'Governments, peace, and justice', color: '#4facfe', bg: '#2C3E50', img: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=150&q=80', reqs: 0, lifted: 0 },
    { id: 'Provision', title: 'Provision', sub: 'Work, finances, daily bread', color: '#2ecc71', bg: '#E74C3C', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=150&q=80', reqs: 0, lifted: 0 },
    { id: 'Salvation', title: 'Salvation', sub: 'Souls coming to Christ', color: '#9b59b6', bg: '#D81B60', img: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=150&q=80', reqs: 0, lifted: 0 },
    { id: 'Love', title: 'Love', sub: 'Walking in unconditional love', color: '#1abc9c', bg: '#16a085', img: 'https://images.unsplash.com/photo-1518199266791-5375a83164ba?auto=format&fit=crop&w=150&q=80', reqs: 0, lifted: 0 },
    { id: 'Peace', title: 'Peace', sub: 'Calming the storms of life', color: '#e67e22', bg: '#d35400', img: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=150&q=80', reqs: 0, lifted: 0 },
    { id: 'Anxiety', title: 'Anxiety', sub: 'Casting all your cares on Him', color: '#fd79a8', bg: '#e84393', img: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=150&q=80', reqs: 0, lifted: 0 },
    { id: 'Depression', title: 'Depression', sub: 'Finding joy in the morning', color: '#a3b18a', bg: '#588157', img: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&w=150&q=80', reqs: 0, lifted: 0 },
  ]);

  const [activeRoom, setActiveRoom] = useState(null);
  const [roomTitleInput, setRoomTitleInput] = useState('');
  const [roomDetailInput, setRoomDetailInput] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [roomRequests, setRoomRequests] = useState([
    { id: 1, roomId: 'Breakthrough', author: 'Tobi oba', time: '5d', isUrgent: true, title: 'Divine breakthrough', detail: 'Pray for my breakthrough', prayedCount: 0, hasPrayed: false }
  ]);

  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', password: '', dob: '', country: '', phone: '', denomination: '', customDenomination: '', churchName: '', isCustomChurch: false
  });

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

  // Kingdom Screen State
  const [hasClaimedChapter, setHasClaimedChapter] = useState(false);

  // Rewards mechanism for Bible Reading
  const claimBibleReward = () => {
    if (!hasClaimedChapter) {
      setKpcBalance(prev => prev + 5);
      logTransaction('Daily Scripture Study', +5, 'EARN');
      setHasClaimedChapter(true);
      alert("Hallelujah! +5 KPC added to your Treasury.");
    }
  };


  const handleNextSlide = () => setCurrentSlide((prev) => (prev + 1) % announcements.length);
  const handlePrevSlide = () => setCurrentSlide((prev) => (prev - 1 + announcements.length) % announcements.length);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
 
 // --- STEP 1 VALIDATION ---
  const handleStep1Validation = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.username || !formData.email || !formData.password) {
      alert("Please fill in all required fields (Full Name, Username, Email, and Password).");
      return;
    }

    if (formData.accountType === 'Church') {
      setStep(19);
    } else {
      setStep(2);
    }
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



  const handleCreatePost = () => {
    if (!newPostText.trim()) return;
    const newPost = { id: Date.now(), authorName: formData.fullName || 'You', authorHandle: `@${formData.username || 'user'}`, time: 'Just now', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', content: newPostText, image: null, likes: 0, comments: 0, isVerified: false };
    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  const handleCreateRoomPrayer = () => {
    if (!roomTitleInput.trim() || !activeRoom) return;
    const newReq = { id: Date.now(), roomId: activeRoom.id, author: isAnonymous ? 'Anonymous' : (formData.fullName || 'You'), time: 'Just now', isUrgent: isUrgent, title: roomTitleInput, detail: roomDetailInput, prayedCount: 0, hasPrayed: false };
    setRoomRequests([newReq, ...roomRequests]);
    setPrayerRooms(prev => prev.map(r => r.id === activeRoom.id ? { ...r, reqs: r.reqs + 1 } : r));
    setRoomTitleInput(''); setRoomDetailInput(''); setIsUrgent(false); setIsAnonymous(false);
  };

  const handleToggleRoomPray = (reqId) => {
    setRoomRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const increment = !req.hasPrayed ? 1 : -1;
        setPrayerRooms(rooms => rooms.map(r => r.id === req.roomId ? { ...r, lifted: r.lifted + increment } : r));
        return { ...req, hasPrayed: !req.hasPrayed, prayedCount: req.prayedCount + increment };
      }
      return req;
    }));
  };

  const openPrayerRoom = (room) => { setActiveRoom(room); setStep(9); };

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
        const profileData = {
          id: userId,
          email: formData.email,
          full_name: formData.fullName,
          username: formData.username,
          account_type: formData.accountType,
          denomination: formData.denomination || formData.customDenomination,
          phone_number: formData.phone,
          wallet_address: generatedAddress,
          wallet_balance: finalBalance,
          created_at: new Date().toISOString()
        };

const sessionRecord = { ...formData, generatedAddress, kpcBalance: finalBalance };
      setCurrentUser(sessionRecord);
      localStorage.setItem('kp_current_user', JSON.stringify(sessionRecord));

        if (formData.accountType === 'Church' || formData.accountType === 'Minister') {
          await supabase.from('church_profiles').insert([{ ...profileData, church_name: formData.churchName || formData.fullName }]);
        } else {
          await supabase.from('user_profiles').insert([profileData]);
        }
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
      let { data: fullUserProfile } = await supabase.from('user_profiles').select('*').eq('id', userId).single();

      if (fullUserProfile) {
        profileData = fullUserProfile;
      } else {
        let { data: fullChurchProfile } = await supabase.from('church_profiles').select('*').eq('id', userId).single();
        profileData = fullChurchProfile;
      }

      if (profileData) {
        if (profileData.wallet_address) setGeneratedAddress(profileData.wallet_address);
        if (profileData.wallet_balance !== undefined && profileData.wallet_balance !== null) setKpcBalance(Number(profileData.wallet_balance));
        setFormData(prev => ({
          ...prev,
          fullName: profileData.full_name || profileData.church_name || '',
          username: profileData.username || '',
          email: profileData.email || '',
          accountType: profileData.account_type || 'Believer',
          denomination: profileData.denomination || '',
          churchName: profileData.church_name || profileData.local_church || ''
        }));
      }

      alert(`Welcome back, ${profileData?.full_name || profileData?.church_name || 'Believer'}!`);
      
      const sessionRecord = {
        ...profileData,
        wallet_address: profileData?.wallet_address || '',
        wallet_balance: Number(profileData?.wallet_balance || 0)
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
      setStep(1);
    }
  };

  const [userTier, setUserTier] = useState('Seeker');
  const [selectedUpgrade, setSelectedUpgrade] = useState('Disciple');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const upgradeTiers = {
    'Seeker': { price: 0 },
    'Disciple': { price: 250 },
    'Apostle': { price: 900 }
  };

  const handleUpgradeSubscription = async () => {
    const cost = upgradeTiers[selectedUpgrade].price;

    if (userTier === selectedUpgrade) {
      alert(`You are already on the ${selectedUpgrade} plan!`);
      return;
    }

    if (kpcBalance < cost) {
      alert(`Insufficient funds. You need ${cost} KPC for the ${selectedUpgrade} monthly plan.`);
      return;
    }

    setIsUpgrading(true);

    try {
      const KPC_MINT_ADDRESS = new PublicKey(GLOBAL_KPC_MINT);
      const feePayerKeypair = Keypair.fromSecretKey(GLOBAL_TREASURY_KEY);
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

      const treasuryVaultPubKey = feePayerKeypair.publicKey;
      const userPubKey = new PublicKey(generatedAddress);

      const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection, feePayerKeypair, KPC_MINT_ADDRESS, userPubKey
      );
      const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection, feePayerKeypair, KPC_MINT_ADDRESS, treasuryVaultPubKey
      );

      const paymentValue = cost * Math.pow(10, 8);

      const txSignature = await transfer(
        connection,
        feePayerKeypair,
        sourceTokenAccount.address,
        destinationTokenAccount.address,
        feePayerKeypair.publicKey,
        paymentValue
      );

      setKpcBalance(prev => prev - cost);
      logTransaction(`Upgraded Vault to ${selectedUpgrade}`, -cost, 'SPEND');
      setUserTier(selectedUpgrade);
      alert(`Hallelujah! You are now a Kingdom ${selectedUpgrade}.\nTransaction ID: ${txSignature}`);
      setStep(11);
    } catch (error) {
      console.error("Upgrade transaction failed:", error);
      alert("Network timeout. Simulating successful upgrade for app demonstration!");
      setKpcBalance(prev => prev - cost);
      setUserTier(selectedUpgrade);
      setStep(11);
    } finally {
      setIsUpgrading(false);
    }
  };

  const [claimedVideos, setClaimedVideos] = useState({});
  const [isClaiming, setIsClaiming] = useState(false);
  const musicData = [
    { id: 'm1', title: 'Atmosphere of Grace', artist: 'Kingdom Worship', reward: 5, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', img: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=300&q=80' },
    { id: 'm2', title: 'Deep Calls To Deep', artist: 'Grace Collective', reward: 5, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80' },
    { id: 'm3', title: 'Rivers of Joy', artist: 'David O.', reward: 5, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', img: 'https://images.unsplash.com/photo-1510915361894-faa8b36259f9?auto=format&fit=crop&w=300&q=80' }
  ];

  const videoData = [
    { id: 'v1', title: 'The Power of Prayer in Hard Times', channel: 'Pastor Josh', views: '14K views', duration: '45:20', reward: 15, src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', avatarBg: '#e74c3c', letter: 'P', img: 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&w=800&q=80' },
    { id: 'v2', title: 'Walking by Faith, Not by Sight', channel: 'Devotional Hub', views: '8.2K views', duration: '28:15', reward: 10, src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', avatarBg: '#e5c158', letter: 'D', img: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80' },
  ];

  const movieData = [
    { id: 'f1', title: "Kingdom Journey", reward: 50, src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80' },
    { id: 'f2', title: "Overcomer's Path", reward: 50, src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', img: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=300&q=80' },
    { id: 'f3', title: "God's Not Dead", reward: 50, src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80' },
    { id: 'f4', title: "War Room", reward: 50, src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', img: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=300&q=80' },
    { id: 'f5', title: "Breakthrough", reward: 50, src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=300&q=80' },
    { id: 'f6', title: "Overcomer", reward: 50, src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', img: 'https://images.unsplash.com/photo-1551008475-4533d141425e?auto=format&fit=crop&w=300&q=80' }
  ];

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
  const [isPlaying, setIsPlaying] = useState(false);
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
    
    // Fetch real comments for this specific media file
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

      try {
        const connection = new Connection('https://rpc.ankr.com/solana_devnet', 'confirmed');
        const feePayer = Keypair.fromSecretKey(GLOBAL_TREASURY_KEY);
        const userPub = new PublicKey(generatedAddress);
        const KPC_MINT = new PublicKey(GLOBAL_KPC_MINT);

        const src = await getOrCreateAssociatedTokenAccount(connection, feePayer, KPC_MINT, feePayer.publicKey);
        const dest = await getOrCreateAssociatedTokenAccount(connection, feePayer, KPC_MINT, userPub);

        await transfer(connection, feePayer, src.address, dest.address, feePayer.publicKey, activeMedia.reward * Math.pow(10, 8));

        setKpcBalance(prev => prev + activeMedia.reward);
        logTransaction(`Stream Reward: ${activeMedia.title}`, +activeMedia.reward, 'EARN');
        setClaimedVideos(prev => ({ ...prev, [activeMedia.id]: true }));
      } catch (error) {

        setKpcBalance(prev => prev + activeMedia.reward);
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

  const dashboardWorship = [
    { id: 'dw1', title: 'Ministration-Tape-2026', artist: 'Frank-Edwards', reward: 5, src: '/media/Frank-Edwards-FRANK-EDWARDS-MINISTRATION-TAPE-2026-(CeeNaija.com).mp3', img: '/album/Frank-Edwards-Ministration-TAPE-2026.jpg' },
    { id: 'dw2', title: 'Back To Jesus', artist: 'Matthew West', reward: 5, src: '/media/Matthew-West-Back-To-Jesus-Lyric-Video-(CeeNaija.com).mp3', img: '/album/Matthew-West-Back-To-Jesus.jpg' },
    { id: 'dw3', title: 'I Want Jesus', artist: 'William McDowell', reward: 5, src: '/media/William-McDowell-I-Want-Jesus-(CeeNaija.com).mp3', img: '/album/William-McDowell-I-Want-Jesus.jpg' },
    { id: 'dw4', title: 'Oh You Bring', artist: 'Hillsong United', reward: 5, src: '/media/Hillsong_United_-_Oh_You_Bring_CeeNaija.com_.mp3', img: '/album/Hillsong-United-Rythm-of-Grace-1.png' }
  ];

  const newsData = [
    {
      id: 'n1', badge: 'UPDATE', title: 'Most adults in England and Wales not in a traditional marriage',
      desc: 'The Coalition for Marriage has criticised plans to give the "rewards of marriage" to the unmarried.',
      content:`'The Coalition for Marriage (C4M) has condemned government plans to give marriages legal rewards to unmarried couples, noting that official figures now show that most adults in the country are not married to a person of the opposite sex.

Last week the Office for National Statistics released data suggesting that 51.1 per cent of adults in England and Wales are married or in a civil partnership. C4M took issue with this claim, however. While the group did not dispute the figure, they pointed out that it included civil partnerships and same-sex marriages.

When these are filtered out, the percentage of adults married to a person of the opposite sex is in fact 49.8 per cent.

C4M said that ONS figures had shown a slow but real decline in the percentage of those in traditional marriages. In the last 10 years the percentage of adults who have never married has risen from 32.6 to 34.9, while the percentage of cohabiting adults has increased from 9.8 to 10.8.

Two age groups in particular have seen a sharp rise in the percentage who have never married: 25 to 34 year olds and 45 to 69 year olds. While the first group could be explained by young people simply not getting married yet, C4M noted that in the case of older people, marriage hasn’t been postponed, it has been skipped.

Given such statistics, C4M questioned the wisdom of the government’s consultation on giving the rights of married couples to those who cohabit.

Under the plans, in the event of a break up with a couple that lives together for three years, or has a child together, the lower earner could expect some form of financial contribution from the higher earner for a certain period – unless both partners opt out. In the event of death without a valid will, a cohabiting partner could receive the same automatic inheritance rights as a husband or wife.

C4M noted that anyone who wanted these rights is already able to gain them, either by actually getting married or by making a will.

Marriage matters not least because children need stability. Across ten years of UK household data, cohabiting parents were 3.4 times more likely to split up in any given year than married parents. And that gap holds true at every income level, said Dr Tony Rucinski, Director of Supporter Strategy at C4M.

Even the poorest married parents hold together slightly better than the richest cohabiting ones. Marriage is not a luxury for the comfortable, its what keeps a child’s home in one piece.

The group urged supporters to respond to the governments consultation on marriage before it closes on 14 August.`,
     reward: 2, img: 'https://www.christiantoday.com/media/cache/img/9/89/98920sp_385w_217h_361x_221y.webp'
    },
    {
      id: 'n2', badge: 'WORLD NEWS', title: 'Practising Christians embracing AI faster than pastors, research finds',
      desc: 'Practising Christians in the US are using artificial intelligence more frequently than the general population',
      content: `Practising Christians in the US are using artificial intelligence more frequently than the general population and considerably more than pastors, according to new research from Barna.

The study found 44 per cent of practising Christians use AI "very often" or "often" in their personal lives, compared with 31 per cent of US adults overall and 29 per cent of non-practising Christians.

A similar gap emerged in the workplace, where 39 per cent of practising Christians reported using AI often or very often, compared with 26 per cent of adults nationally.

Pastors appear to be adopting the technology more slowly. In a separate Barna survey, 16 per cent said they use AI "often" in their personal lives, while a third use it "sometimes" and 45 per cent said they use it "not very much" or "not at all".

For work, 24 per cent of pastors reported using AI often or very often, compared with 39 per cent of practising Christians.

“Ask people yes-or-no whether they use AI, and the average pastor and the average American look about the same,” said Daniel Copeland, Barna’s vice president of research. “It’s frequency of use where the difference actually shows up.”

He warned that church leaders risk underestimating how embedded the technology has already become in the lives of their congregations.

“Pastors understand that AI is out there, but they’re not immersed in it the way their engaged congregants may be,” Copeland said. “The danger for pastors is underestimating just how normal AI is for the people around them. For most practicing Christians, AI isn’t for occasional use. It’s already woven into how they work, learn and make decisions.”

The research suggests Christians are primarily turning to AI for everyday purposes, including finding information, learning how to complete tasks, seeking advice, following the news and improving their writing.

Religious uses were less common, with around a third of practising Christians saying they had used AI for spiritual guidance or Bible-related questions during the previous month.

However, Barna found nearly half of practising Christians would trust AI with something relating to their spiritual growth.

The findings also highlight a potential challenge for churches. One in three practising Christians said they would like guidance from their pastor on navigating AI, but just 12 per cent of pastors said they felt prepared to provide it.

Copeland said ministers did not necessarily need to become experts in artificial intelligence to respond.

“The better move is for pastors to double down on what they already do well: teaching people how to engage scripture, building real relationships, making space for analog discipleship. That’s what people can lean on when AI gives them an answer that’s incomplete, misleading or just wrong.”

The research forms part of Barna's Faith & AI project, produced in partnership with Gloo as part of its multi-year State of the Church initiative.`,
      reward: 2, img: 'https://premierchristian.news/image_cache/d/e/7/c/5/de7c5541cd49b93ad03762f1e79aeb62a698b604.webp'
    },
    {
      id: 'n3', badge: 'UK NEWS', title: 'Churches urged to take up free Home Office security training',
      desc: 'Churches across England and Wales are being encouraged to sign up for a free Home Office security training programme',
      content: `Churches across England and Wales are being encouraged to sign up for a free Home Office security training programme designed to help places of worship prepare for security threats and hate crime.

The scheme, launched by the Home Office earlier this year and provided by CDS Support, gives guidance on recognising threats and improving preparedness when responding to incidents.

The programme has been in development since the 2019 Christchurch terror attacks in New Zealand, after the then Home Secretary committed to providing security training for places of worship. Following a pilot last year, the scheme officially launched in February.

Security Minister Dan Jarvis told Premier Christian News: “Everyone should feel safe and secure at their place of worship.

“This free training is helping faith organisations better understand security threats and prepare for incidents. It teaches them practical steps to protect their congregants and property.

“We’ve provided record funding this year to strengthen protective security at faith sites.

“The Government is proud to work closely with churches and all faith groups to keep their communities safe.”

The Home Office says it is providing a record £77 million this financial year to improve protective security at faith sites, including £5 million specifically for churches and other non-Jewish and non-Muslim places of worship.

Training is available in both multi-faith and faith-specific formats, with dedicated modules for Christian, Hindu, Jewish, Muslim and Sikh communities. Sessions are delivered in person at places of worship and community venues, through live online classes, and via an e-learning platform.

Ella Rees, Marketing Manager at CDS Support, said the programme had already seen strong engagement from churches.

"We've seen a really good uptake across all faith communities, including across all Christian denominations, with hundreds of people trained so far," she told Premier.

She said the training helps churches prepare for a range of risks, from theft and antisocial behaviour to hate crime and serious terrorist incidents, while allowing each place of worship to tailor security measures to its own circumstances.

Rees also said the programme has brought churches and other faith communities together to share experiences and practical ways of addressing common security challenges.

For church leaders unsure whether the training is necessary, she said many participants have adopted the same approach: "We hope it never happens, but we want to be prepared if it does."

Training is free and available both in person and online. Churches can register through the Faith Security Training website or by contacting CDS Support directly.`,
      reward: 2, img: 'https://premierchristian.news/image_cache/9/5/7/d/8/957d86eaf907444d666004b25987fc7f5a42795c.webp'
    },
    {
      id: 'n4', badge: 'WORLD NEWS', title: 'Vatican wealth rises to €2.7bn as gold and property values surge',
      desc: `The Vatican's asset management arm said on Friday its operating surplus fell more than 60% in 2025`,
      content: `The Vatican's asset management arm said on Friday its operating surplus fell more than 60% in 2025, but its overall wealth rose thanks to gains in gold, real estate and investments.

In a year marked by the transition from Pope Francis to Pope Leo, the Vatican's operating result totalled €22.8 million ($26.2 million), down from €62.2 million in 2024, while net assets rose by €89 million to €2.686 billion.

The Administration of the Patrimony of the Holy See, which manages the Vatican's financial investments and real-estate portfolio, said in a statement it had transferred €22.7 million to help finance the Holy See's operations.

The figures offer fresh insight into the Vatican's finances as Leo, elected in May after the death of Francis, faces the challenge of overcoming years of budget shortfalls.

'RETURN TO ORDINARY OPERATING CONDITIONS'

The Vatican had reported a 35.5% year-on-year increase in profits from holdings in 2024, but said accounts then had been boosted by a one-off restructuring of its investment portfolio.

"By contrast, 2025 represents a return to ordinary operating conditions," said Archbishop Giordano Piccinotti, the president of APSA, adding that the priority was not to maximise profit but to preserve and strengthen the Church's patrimony.

It said the Vatican shunned high levels of risk, with some 17% of its investments tied up in equity markets in 2025, 32% in bonds and 29% in physical gold. It also has a sizeable real estate portfolio, managing almost 5,500 properties worldwide.

The investment portfolio showed an accounting loss of €3.7 million last year under new Vatican accounting rules, but stronger real-estate earnings ensured a positive overall operating result.

REVALUATION OF GOLD

The strongest asset gains came from a revaluation of the gold holdings, which added €40.8 million to the Vatican's net wealth. A rise in real-estate values contributed a further €39.2 million, while securities valuations added €16.3 million.

Real estate remained APSA's main source of ordinary income, generating €44.5 million in 2025, up €9.4 million from a year earlier, which the agency attributed to more efficient management, higher rental income and lower maintenance costs.

The agency said it had launched a three-year programme running from 2025 to 2027 aimed at selling non-strategic properties.

The Vatican has become increasingly focused on professional management of its real estate after a series of scandals, including a failed London investment that led to a major fraud trial.`,
      reward: 2, img: 'https://premierchristian.news/image_cache/e/6/d/4/4/e6d442a4e5ef8cf0738d4e8cab7220e1c0beae13.webp'
    }

  ];

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
      <div className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => { setActiveTab('chat'); setStep(23); }}>
        <div className="nav-icon-wrapper"><ChatIcon /></div>
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

// --- SAFE AUTO-SYNC ENGINE ---
  useEffect(() => {
    if (!currentUser || !currentUser.email || step < 6) return;

    const updatedProfile = {
      ...currentUser,
      formData: formData,
      kpcBalance: kpcBalance,
      generatedAddress: generatedAddress,
      userTier: userTier,
      claimedVideos: claimedVideos,
      claimedArticles: claimedArticles,
      txHistory: txHistory
    };

    localStorage.setItem('kp_current_user', JSON.stringify(updatedProfile));

 const syncToSupabase = async () => {
      const userId = currentUser.id;
      if (userId) {
        const tableName = currentUser.account_type === 'Church' ? 'church_profiles' : 'user_profiles';
        await supabase.from(tableName).update({
          wallet_address: generatedAddress,
          wallet_balance: kpcBalance
        }).eq('id', userId);
      }
    };
    syncToSupabase();
  }, [kpcBalance, generatedAddress, userTier, formData, txHistory, currentUser?.id]);


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

  const [storeBooksList, setStoreBooksList] = useState([
    { id: 'b1', title: 'The Purpose Driven Life', author: 'Rick Warren', price: 150, img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=200&q=80' },
    { id: 'b2', title: 'Mere Christianity', author: 'C.S. Lewis', price: 120, img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=200&q=80' },
    { id: 'b3', title: 'Crazy Love', author: 'Francis Chan', price: 100, img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=200&q=80' },
    { id: 'b4', title: 'Knowing God', author: 'J.I. Packer', price: 180, img: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=200&q=80' }
  ]);

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
  
  const [attendanceRoster, setAttendanceRoster] = useState([
    { id: 'att_1', name: 'Pastor Josh', handle: '@pjosh', time: '08:55 AM', tier: 'Apostle', avatar: 'P' },
    { id: 'att_2', name: 'Grace Adeleke', handle: '@gracedesigns', time: '09:02 AM', tier: 'Disciple', avatar: 'G' },
    { id: 'att_3', name: 'Sarah F.', handle: '@sarah', time: '09:14 AM', tier: 'Seeker', avatar: 'S' },
    { id: 'att_4', name: 'Daniel O.', handle: '@inkofdaniel', time: '09:20 AM', tier: 'Disciple', avatar: 'D' }
  ]);

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

  const handleViewProfile = (e, entity) => {
    e.stopPropagation();
    
    const isDBUser = !!entity.email && !entity.id?.startsWith('c');
    setSelectedProfile({
      id: entity.id || entity.email,
      name: isDBUser ? (entity.formData?.fullName || 'Believer') : entity.name,
      handle: isDBUser ? `@${entity.formData?.username || entity.email?.split('@')[0]}` : entity.handle,
      avatar: isDBUser ? entity.formData?.avatar : entity.avatar,
      isMinistry: entity.type === 'Ministry Groups' || entity.intent === 'COUNSELING' || entity.accountType === 'Minister',
      originalData: entity
    });
  };

  useEffect(() => {
    let timer;
    if (activeNewsArticle) {
      timer = setTimeout(() => {
        alert(`You earned Kingdom Tokens for reading: ${activeNewsArticle.title}!`);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [activeNewsArticle]);

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
  const [pendingDreams, setPendingDreams] = useState([
    {
      id: 'dummy-1',
      title: 'A river of gold...',
      desc: 'I saw a river flowing with bright yellow light, and people were gathering around it to drink...',
      user: '@user_wallet'
    }
  ]);
  
  const [interpretationText, setInterpretationText] = useState("");
  const submitInterpretation = (dreamId, text) => {
    if (!text.trim()) {
      alert("Please enter an interpretation before submitting.");
      return;
    }
    
    console.log("Updating Dream ID:", dreamId, "with interpretation:", text);
    alert("Interpretation submitted successfully!");
    
    setInterpretationText("");
  };

const [profileTab, setProfileTab] = useState('All');
// ==========================================
  // LIVE SUPABASE PROFILE FETCH
  // ==========================================
  
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;

        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          setUserProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching real profile data:", error.message);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    // Trigger the fetch
    fetchUserProfile();
  }, []);

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
        .select(`
          *,
          user_profile:author_id (full_name, avatar_url, account_type, local_church)
        `)
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
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                {['Believer', 'Church'].map(type => (
                  <button
                    key={type} type="button"
                    onClick={() => handleChange({ target: { name: 'accountType', value: type } })}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                      background: (formData.accountType || 'Believer') === type ? 'linear-gradient(135deg, #f3ca58, #29beaf)' : 'rgba(255,255,255,0.05)',
                      color: (formData.accountType || 'Believer') === type ? '#101926' : '#8e9aab',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {type === 'Church' ? 'Church / Ministry' : 'Individual'}
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
            <h1 className="onboarding-title">Your local church</h1>
            <p className="onboarding-subtitle">Choose your home church or add a new one to connect locally.</p>
            {!formData.isCustomChurch ? (
              <><div className="input-group"><label className="input-label">LOCAL CHURCH</label><select name="churchName" value={formData.churchName} onChange={handleChange} className="app-select"><option value="">No churches yet — add yours</option><option value="Grace Sanctuary">Grace Sanctuary</option><option value="Winners Chapel">Winners Chapel</option></select></div><button className="add-link" onClick={() => setFormData({ ...formData, isCustomChurch: true })}>+ My church isn't listed</button></>
            ) : (
              <><div className="input-group"><label className="input-label">CHURCH NAME</label><input type="text" name="churchName" placeholder="e.g. Grace Chapel International" value={formData.churchName} onChange={handleChange} className="app-input" /></div><p style={{ color: '#8e9aab', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer', marginTop: '5px', textAlign: 'center' }} onClick={() => setFormData({ ...formData, isCustomChurch: false })}>Pick from the list instead</p></>
            )}
          </div>
          <div className="footer-lock"><button onClick={handleNext} className="action-button">Continue</button></div>
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

            {formData?.accountType === 'Church' || currentUser?.accountType === 'Church' ? (
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

                  <div className="announcement-card">
                    <div className="announcer-info">
                      <div className="announcer-avatar">G</div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="announcer-name">Grace <span style={{ color: '#fff', fontSize: '10px' }}>✓</span></span>
                        <span className="announcer-handle">@grace • Just now</span>
                      </div>
                    </div>
                    <div className="badge-announcement">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
                      {announcements[currentSlide].badge}
                    </div>
                    <h3>{announcements[currentSlide].title}</h3>
                    <p>{announcements[currentSlide].desc}</p>
                  </div>

                  <div className="carousel-dots">
                    {announcements.map((_, index) => (
                      <div key={index} className={`dot ${currentSlide === index ? 'active' : ''}`}></div>
                    ))}
                  </div>
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
                  {dashboardWorship.map((track) => (
                    <div
                      key={track.id}
                      className="media-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openPlayer(track, 'audio')}
                    >
                      <img src={track.img} alt={track.title} className="media-bg" />
                      <div className="media-content">
                        <h4 className="media-title">{track.title}</h4>
                        <span className="media-subtitle"><span style={{ color: '#29beaf' }}>|</span> {track.artist}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interactive Read-To-Earn News Section */}
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
                  <div className="community-card feed-card" onClick={() => setStep(12)}>
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
                        <span>{prayerRooms.find(r => r.id === 'Breakthrough').reqs}</span>
                      </li>
                      <li className="prayer-item">
                        <div className="prayer-label-wrap"><span className="prayer-dot" style={{ backgroundColor: '#2980B9' }}></span>Family</div>
                        <span>{prayerRooms.find(r => r.id === 'Family').reqs}</span>
                      </li>
                      <li className="prayer-item">
                        <div className="prayer-label-wrap"><span className="prayer-dot" style={{ backgroundColor: '#4E8B61' }}></span>Healing</div>
                        <span>{prayerRooms.find(r => r.id === 'Healing').reqs}</span>
                      </li>
                      <li className="prayer-item">
                        <div className="prayer-label-wrap"><span className="prayer-dot" style={{ backgroundColor: '#2C3E50' }}></span>Nations</div>
                        <span>{prayerRooms.find(r => r.id === 'Nations').reqs}</span>
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

      {step === 7 && (
        <div className="feed-screen-container">

          <div className="feed-header-top">
            <button className="back-button" onClick={() => setStep(6)} style={{ width: '36px', height: '36px' }}><BackArrowIcon /></button>
            <h2>Kingdom Feed</h2>
            <div className="feed-header-actions"><SearchIcon /><BellIcon /></div>
          </div>

          <div className="feed-tabs-container">
            {['For You', 'Following', 'Church', 'Global'].map((tab) => (
              <div key={tab} className={`feed-tab ${feedTab === tab ? 'active' : ''}`} onClick={() => setFeedTab(tab)}>
                {tab === 'For You' && <span style={{ fontSize: '12px' }}></span>} {tab}
              </div>
            ))}
          </div>

          <div className="feed-scroll-area">
            <div className="create-post-card">
              <div className="create-post-top">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="You" className="create-avatar" />
                <input type="text" placeholder="Share a verse, testimony, or thought..." className="create-input" value={newPostText} onChange={(e) => setNewPostText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreatePost()} />
              </div>
              <div className="create-post-bottom">
                <button className="post-media-btn"><ImageIcon /> Photo</button>
                <button className="post-media-btn" style={{ color: '#29beaf' }} onClick={handleCreatePost}><ShareIcon /> Post</button>
              </div>
            </div>

            {posts.map((post) => (
              <div key={post.id} className="feed-post-card">
                <div className="post-header">
                  <div className="post-user-info">
                    <img src={post.avatar} alt={post.authorName} className="post-avatar" />
                    <div className="post-meta">
                      <span className="post-name">{post.authorName} {post.isVerified && <span style={{ color: '#29beaf', fontSize: '12px' }}>✓</span>}</span>
                      <span className="post-time">{post.authorHandle} • {post.time}</span>
                    </div>
                  </div>
                  <div className="post-options"><DotsIcon /></div>
                </div>
                <div className="post-content">
                  <p className="post-text">{post.content}</p>
                  {post.image && <img src={post.image} alt="Attachment" className="post-image-attachment" />}
                </div>
                <div className="post-actions">
                  <div className="engage-btn"><HeartIcon /> {post.likes}</div>
                  <div className="engage-btn"><MessageIcon /> {post.comments}</div>
                  <div className="engage-btn"><ShareIcon /> Share</div>
                </div>
              </div>
            ))}
          </div>

          <AppBottomNav />

        </div>
      )}

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
                <div key={room.id} className="prayer-tile" style={{ backgroundColor: room.bg }} onClick={() => openPrayerRoom(room)}>
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

      {/* STEP 9: INDIVIDUAL PRAYER ROOM */}
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

            {roomRequests.filter(req => req.roomId === activeRoom.id).map(req => (
              <div key={req.id} className="room-request-card" style={{ borderColor: activeRoom.bg }}>
                <div className="req-meta">
                  <strong style={{ color: '#fff' }}>{req.author}</strong> • {req.time}
                  {req.isUrgent && <span className="req-urgent-badge" style={{ color: activeRoom.color, background: `${activeRoom.color}20` }}>URGENT</span>}
                </div>
                <h3 className="req-title">{req.title}</h3>
                {req.detail && <p className="req-detail">{req.detail}</p>}
                <button className={`i-prayed-btn ${req.hasPrayed ? 'active' : ''}`} style={req.hasPrayed ? { borderColor: activeRoom.color, color: activeRoom.color } : {}} onClick={() => handleToggleRoomPray(req.id)}>
                  <HeartIcon /> I prayed • {req.prayedCount}
                </button>
              </div>
            ))}
          </div>

          <AppBottomNav />

        </div>
      )}

     {/* =========================================
          STEP 10: KINGDOM TAB (CORE MODULES)
          ========================================= */}
      {step === 10 && (
        <div className="feed-screen-container">
          
          {/* Top Header with Back & Bookstore Button */}
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

          {/* Kingdom Tabs */}
          <div className="feed-tabs-container" style={{ marginBottom: '10px' }}>
            {['Devotions', 'Bible Plans', 'Messages', 'Bible'].map((tab) => (
              <div key={tab} className={`feed-tab ${kingdomTab === tab ? 'active' : ''}`} onClick={() => setKingdomTab(tab)}>
                {tab}
              </div>
            ))}
          </div>

          <div className="feed-scroll-area" style={{ padding: '0 20px 120px 20px' }}>

            {/* ==================== 1. DEVOTIONS (DYNAMIC) ==================== */}
            {kingdomTab === 'Devotions' && (
              <>
                {devotionsList.filter(d => d.isFeatured).map(item => (
                  <div key={item.id} style={{ marginBottom: '20px' }}>
                    <h3 className="kingdom-section-title">Today's Pick</h3>
                    <div className="devotion-card" style={{ background: 'linear-gradient(135deg, rgba(41, 190, 175, 0.15) 0%, rgba(16, 25, 38, 0.8) 100%)', borderColor: 'rgba(41, 190, 175, 0.3)' }}>
                      <img src={item.img} alt="devotion" className="devotion-img" />
                      <div className="devotion-info">
                        <h4 className="devotion-title">{item.title}</h4>
                        <span className="devotion-desc">{item.scripture} • {item.time}</span>
                        <div className="reward-pill">✨ Earn +{item.reward} KPC</div>
                      </div>
                    </div>
                  </div>
                ))}

                <h3 className="kingdom-section-title">Explore Daily Bread <span className="kingdom-section-link">View all</span></h3>
                {devotionsList.filter(d => !d.isFeatured).map(item => (
                  <div key={item.id} className="devotion-card">
                    <img src={item.img} alt="devotion" className="devotion-img" />
                    <div className="devotion-info">
                      <h4 className="devotion-title">{item.title}</h4>
                      <span className="devotion-desc">{item.scripture} • {item.time} • <i style={{ color: '#f3ca58' }}>By {item.author || 'Ministry'}</i></span>
                      <div className="reward-pill">✨ Earn +{item.reward} KPC</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ==================== 2. BIBLE PLANS (DYNAMIC) ==================== */}
            {kingdomTab === 'Bible Plans' && (
              <>
                <h3 className="kingdom-section-title">Your Active Plans</h3>
                {biblePlansList.filter(p => p.isActive).map(plan => (
                  <div key={plan.id} className="devotion-card" style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                      <img src={plan.img} alt="plan" className="devotion-img" />
                      <div className="devotion-info">
                        <h4 className="devotion-title">{plan.title}</h4>
                        <span className="devotion-desc">{plan.desc}</span>
                        <div className="reward-pill" style={{ color: '#e5c158', background: 'rgba(229, 193, 88, 0.1)', borderColor: 'rgba(229, 193, 88, 0.3)' }}>
                          {plan.rewardText}
                        </div>
                      </div>
                    </div>
                    <div style={{ width: '100%', marginTop: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#8e9aab', marginBottom: '4px' }}>
                        <span>Progress</span> <span>{plan.progress}%</span>
                      </div>
                      <div className="progress-container" style={{ marginBottom: '0', background: 'rgba(255,255,255,0.05)' }}>
                        <div className="progress-fill" style={{ width: `${plan.progress}%`, background: '#e5c158' }}></div>
                      </div>
                    </div>
                  </div>
                ))}

                <h3 className="kingdom-section-title" style={{ marginTop: '20px' }}>Discover New Plans</h3>
                {biblePlansList.filter(p => !p.isActive).map(plan => (
                  <div key={plan.id} className="devotion-card">
                    <img src={plan.img} alt="plan" className="devotion-img" />
                    <div className="devotion-info">
                      <h4 className="devotion-title">{plan.title}</h4>
                      <span className="devotion-desc">{plan.desc}</span>
                      <div className="reward-pill" style={{ marginTop: '4px' }}>{plan.rewardText}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ==================== 3. MESSAGES (DYNAMIC) ==================== */}
            {kingdomTab === 'Messages' && (
              <>
                <h3 className="kingdom-section-title">Recent Messages <span className="kingdom-section-link">View all</span></h3>
                <div className="horizontal-scroll" style={{ paddingBottom: '10px' }}>
                  {messagesList.filter(m => !m.isSeries).map(msg => (
                    <div key={msg.id} className="message-card">
                      <div className="message-img-wrapper">
                        <img src={msg.img} alt="msg" className="message-img" />
                        <div className="message-play-btn"><PlayIcon /></div>
                        <span className="message-duration">{msg.duration}</span>
                      </div>
                      <span className="message-title">{msg.title}</span>
                      <span className="message-author">{msg.author}</span>
                    </div>
                  ))}
                </div>

                <h3 className="kingdom-section-title" style={{ marginTop: '15px' }}>Trending Series</h3>
                {messagesList.filter(m => m.isSeries).map(series => (
                  <div key={series.id} className="message-card" style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: '12px', padding: '12px', marginBottom: '10px' }}>
                    <div className="message-img-wrapper" style={{ width: '80px', height: '80px', marginBottom: '0' }}>
                      <img src={series.img} alt="series" className="message-img" />
                    </div>
                    <div className="devotion-info">
                      <h4 className="message-title">{series.title}</h4>
                      <span className="message-author">{series.author}</span>
                      <div className="reward-pill" style={{ marginTop: '6px' }}>✨ +{series.reward} KPC / msg</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ==================== 4. BIBLE READER (UNTOUCHED) ==================== */}
            {kingdomTab === 'Bible' && (
              <div className="bible-reader-card">
                <div className="bible-header">
                  <span className="bible-book-title">Psalms 23</span>
                  <div className="bible-version-selector">KJV ▼</div>
                </div>

                <div className="bible-text-body">
                  <div className="verse-line"><span className="verse-num">1</span><span className="verse-text">The Lord is my shepherd; I shall not want.</span></div>
                  <div className="verse-line"><span className="verse-num">2</span><span className="verse-text">He maketh me to lie down in green pastures: he leadeth me beside the still waters.</span></div>
                  <div className="verse-line"><span className="verse-num">3</span><span className="verse-text">He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.</span></div>
                  <div className="verse-line"><span className="verse-num">4</span><span className="verse-text">Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.</span></div>
                  <div className="verse-line"><span className="verse-num">5</span><span className="verse-text">Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.</span></div>
                  <div className="verse-line"><span className="verse-num">6</span><span className="verse-text">Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.</span></div>
                </div>

                <div className="bible-reward-banner">
                  <div className="reward-text">
                    <strong>Daily Reading Goal</strong>
                    <span>Read 1 Chapter daily to earn rewards.</span>
                  </div>
                  <button
                    className="claim-btn"
                    style={hasClaimedChapter ? { background: '#1a2533', color: '#4a5a6e', boxShadow: 'none' } : {}}
                    onClick={claimBibleReward}
                    disabled={hasClaimedChapter}
                  >
                    {hasClaimedChapter ? 'Claimed ✓' : 'Finish & Claim +5 KPC'}
                  </button>
                </div>
              </div>
            )}

            {/* ==================== 5. STORE (DYNAMIC) ==================== */}
            {kingdomTab === 'Store' && (
              <>
                <h3 className="kingdom-section-title">Featured Books & Ministry Resources</h3>
                <div className="store-grid">
                  {storeBooksList.map(book => (
                    <div key={book.id} className="store-card">
                      <img src={book.img} alt="book" className="store-book-cover" />
                      <span className="store-book-title">{book.title}</span>
                      <span className="store-book-author">{book.author}</span>
                      <button className="store-buy-btn">{book.price} KPC</button>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>

          <AppBottomNav />

        </div>
      )}

    {/* =========================================
          STEP 11: TREASURY (CLEAN & UPGRADED)
          ========================================= */}
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

            {/* Quick Action Buttons */}
            <div className="treasury-actions-row">
              <div className="treasury-action-item" onClick={() => setActiveModal('send')}>
                <div className="treasury-action-circle" style={{ color: '#f3ca58', background: 'rgba(243, 202, 88, 0.1)' }}><SendIcon /></div>
                <span className="treasury-action-label">Give /<br />Send</span>
              </div>
              
              {currentUser?.accountType === 'Church' ? (
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

            {/* Dynamic Activity Ledger Section */}
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
                  txHistory.filter(tx => txFilter === 'ALL' || tx.type === txFilter || (txFilter === 'EARN' && tx.type === 'AIRDROP')).map((tx, idx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <div key={tx.id || idx} className="activity-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="activity-icon-wrap" style={{ color: isPositive ? '#2ecc71' : '#e74c3c' }}>
                          {tx.type === 'AIRDROP' ? <HandCoinIcon /> : isPositive ? <LightningIcon /> : <ChurchIcon />}
                        </div>
                        <div className="activity-details" style={{ flex: 1, padding: '0 12px', overflow: 'hidden' }}>
                          <span className={`activity-amount ${isPositive ? 'amount-plus' : 'amount-minus'}`}>{isPositive ? `+${tx.amount}` : tx.amount} KPC</span>
                          <span className="activity-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{tx.title}</span>
                          <span className="activity-time">{tx.date} • <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{tx.signature ? tx.signature.substring(0, 8) + '...' : 'Confirmed'}</span></span>
                        </div>
                        <div className={`activity-badge ${isPositive ? 'badge-earned' : 'badge-spent'}`}>{isPositive ? 'Earned' : 'Spent'}</div>
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
          
          {/* 1. GIVE / SEND MODAL */}
          {activeModal === 'send' && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 15, 26, 0.9)', backdropFilter: 'blur(15px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', maxWidth: '500px', background: '#1e293b', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', animation: 'slideUp 0.3s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '900' }}>Give & Send KPC</h3>
                  <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#8e9aab', cursor: 'pointer' }}><XIcon /></button>
                </div>

                <form onSubmit={handleSendByUsername} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>RECIPIENT (@USERNAME OR WALLET ADDRESS)</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 15px' }}>
                      <span style={{ color: '#29beaf', fontWeight: '800' }}>@</span>
                      <input 
                        type="text" value={transferUsername} onChange={(e) => setTransferUsername(e.target.value)} 
                        placeholder="gracesanctuary OR 5K2p..." required 
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

          {/* 2A. CHURCH QR PROJECTION MODAL */}
          {activeModal === 'qr' && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 15, 26, 0.95)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
              <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XIcon /></button>
              <h2 className="metallic-gold-text" style={{ fontSize: '28px', marginBottom: '5px', textAlign: 'center' }}>{formData.churchName || 'Your Ministry'}</h2>
              <p style={{ color: '#29beaf', fontSize: '18px', fontWeight: '800', marginBottom: '40px', textAlign: 'center' }}>@{formData.username || 'church_treasury'}</p>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '24px', boxShadow: '0 0 50px rgba(243, 202, 88, 0.2)' }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${generatedAddress}&color=101926`} alt="Church QR Code" style={{ width: '250px', height: '250px', borderRadius: '8px' }} />
              </div>
              <p style={{ color: '#8e9aab', marginTop: '30px', textAlign: 'center', maxWidth: '300px', lineHeight: '1.5' }}>Project this on your screens. Believers scan to tithe KPC directly into the church Web3 treasury.</p>
            </div>
          )}

          {/* 2B. SCAN QR VIEWFINDER MODAL */}
          {activeModal === 'scan' && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 15, 26, 0.95)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
              <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XIcon /></button>
              <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', marginBottom: '10px' }}>Scan to Give / Tithe</h3>
              <p style={{ color: '#8e9aab', fontSize: '13px', marginBottom: '30px', textAlign: 'center' }}>Point your camera at the church screen QR code</p>
              
              {/* FIXED: justifyContent is properly camelCased here! */}
              <div style={{ width: '260px', height: '260px', border: '2px dashed #29beaf', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'rgba(41, 190, 175, 0.05)' }}>
                <div style={{ width: '100%', height: '2px', background: '#f3ca58', position: 'absolute', top: '50%', boxShadow: '0 0 15px #f3ca58' }}></div>
                <span style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: '700' }}>Searching for Web3 QR...</span>
              </div>

              <button 
                onClick={() => {
                  alert("Simulated QR Read: Connected to @gracesanctuary treasury!");
                  setActiveModal('send');
                  setTransferUsername('@gracesanctuary');
                }}
                style={{ marginTop: '40px', padding: '15px 30px', background: 'linear-gradient(135deg, #f3ca58, #29beaf)', border: 'none', borderRadius: '14px', color: '#101926', fontWeight: '900', cursor: 'pointer' }}
              >
                Simulate QR Scan Match
              </button>
            </div>
          )}

          {/* 3. HIRE SERVICES MODAL */}
          {activeModal === 'hire' && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 15, 26, 0.9)', backdropFilter: 'blur(15px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', maxWidth: '500px', background: '#1e293b', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', animation: 'slideUp 0.3s ease-out', maxHeight: '85vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '900' }}>Hire Verified Ministers</h3>
                  <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#8e9aab', cursor: 'pointer' }}><XIcon /></button>
                </div>
                <p style={{ color: '#8e9aab', fontSize: '13px', marginBottom: '20px' }}>Select a verified spiritual service. KPC tokens are held in smart contract escrow until service completion.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                  {[
                    { id: 1, title: '1-on-1 Marriage Counseling (45m)', minister: 'Pastor David O.', price: 250, desc: 'Biblical relationship guidance & prayer.' },
                    { id: 2, title: 'Guest Worship Leading (Sunday)', minister: 'Min. Grace D.', price: 1000, desc: 'Anointed worship ministration for your event.' },
                    { id: 3, title: 'Prophetic Prayer & Deliverance', minister: 'Apostle John K.', price: 150, desc: 'Dedicated intercessory session.' }
                  ].map(srv => (
                    <div 
                      key={srv.id} onClick={() => setSelectedService(srv)}
                      style={{ padding: '15px', borderRadius: '16px', border: '1px solid', borderColor: selectedService?.id === srv.id ? '#29beaf' : 'rgba(255,255,255,0.08)', background: selectedService?.id === srv.id ? 'rgba(41, 190, 175, 0.1)' : 'rgba(0,0,0,0.3)', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ color: '#fff', fontWeight: '800', fontSize: '15px' }}>{srv.title}</span>
                        <span style={{ color: '#f3ca58', fontWeight: '900', fontSize: '16px' }}>{srv.price} KPC</span>
                      </div>
                      <div style={{ color: '#29beaf', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>{srv.minister} ✓</div>
                      <div style={{ color: '#8e9aab', fontSize: '12px' }}>{srv.desc}</div>
                    </div>
                  ))}
                </div>

                <button onClick={handleHireSubmit} style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #9b59b6, #29beaf)', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}>
                  {selectedService ? `BOOK SERVICE FOR ${selectedService.price} KPC` : 'SELECT A SERVICE ABOVE'}
                </button>
              </div>
            </div>
          )}

          {/* 4. UPGRADE PREMIUM TIER MODAL */}
          {activeModal === 'upgrade' && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 15, 26, 0.9)', backdropFilter: 'blur(15px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', maxWidth: '500px', background: '#1e293b', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', animation: 'slideUp 0.3s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '900' }}>Upgrade Vault Rank</h3>
                  <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#8e9aab', cursor: 'pointer' }}><XIcon /></button>
                </div>
                <p style={{ color: '#8e9aab', fontSize: '13px', marginBottom: '25px' }}>Unlock higher staking rewards, verified minister badges, and zero-fee devnet transfers.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '25px' }}>
                  {[
                    { tier: 'Disciple', price: 100, benefits: '• 2x Watch-to-Earn Multiplier\n• Staking Vault Access\n• Custom Denomination Badge' },
                    { tier: 'Apostle', price: 500, benefits: '• 5x Watch-to-Earn Multiplier\n• Verified Minister Profile (✓)\n• Zero Gas Fee Transfers & Governance' }
                  ].map(t => (
                    <div 
                      key={t.tier} onClick={() => setSelectedTier(t.tier)}
                      style={{ padding: '18px', borderRadius: '18px', border: '1px solid', borderColor: selectedTier === t.tier ? '#f3ca58' : 'rgba(255,255,255,0.08)', background: selectedTier === t.tier ? 'rgba(243, 202, 88, 0.1)' : 'rgba(0,0,0,0.3)', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ color: '#fff', fontWeight: '900', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>{t.tier} Rank</span>
                        <span style={{ color: '#f3ca58', fontWeight: '900', fontSize: '18px' }}>{t.price} KPC</span>
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '12px', whiteSpace: 'pre-line', lineHeight: '1.6' }}>{t.benefits}</div>
                    </div>
                  ))}
                </div>

                <button onClick={handleTierUpgradeSubmit} style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #f3ca58, #29beaf)', border: 'none', borderRadius: '14px', color: '#101926', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}>
                  UPGRADE TO {selectedTier.toUpperCase()} RANK
                </button>
              </div>
            </div>
          )}
{/* 5. SWAP MODAL */}
{activeModal === 'swap' && (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 15, 26, 0.9)', backdropFilter: 'blur(15px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
    <div style={{ width: '100%', maxWidth: '500px', background: '#1e293b', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', animation: 'slideUp 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '900' }}>Swap Tokens (DEX)</h3>
        <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#8e9aab', cursor: 'pointer' }}><XIcon /></button>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', marginBottom: '10px' }}>
        <label style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '800' }}>YOU PAY</label>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <input type="number" placeholder="0" style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', fontWeight: '900', outline: 'none', width: '60%' }} />
          <div style={{ background: '#29beaf', color: '#101926', padding: '8px 12px', borderRadius: '20px', fontWeight: '800', fontSize: '14px' }}>SOL</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '-15px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ background: '#1e293b', padding: '8px', borderRadius: '50%', border: '4px solid #0a0f1a', color: '#f3ca58' }}>
          <SwapIcon />
        </div>
      </div>

      <div style={{ background: 'rgba(243,202,88,0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(243,202,88,0.2)', marginBottom: '20px' }}>
        <label style={{ color: '#f3ca58', fontSize: '11px', fontWeight: '800' }}>YOU RECEIVE (ESTIMATED)</label>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <span style={{ color: '#fff', fontSize: '24px', fontWeight: '900' }}>0.00</span>
          <div style={{ background: '#f3ca58', color: '#101926', padding: '8px 12px', borderRadius: '20px', fontWeight: '800', fontSize: '14px' }}>KPC</div>
        </div>
      </div>

      <button style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #e67e22, #f3ca58)', border: 'none', borderRadius: '14px', color: '#101926', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}>
        REVIEW SWAP
      </button>
    </div>
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

            {/* Seeker (Free) */}
            <div className="upgrade-card" onClick={() => { if (userTier === 'Seeker') setSelectedUpgrade('Seeker'); }}>
              <div className="tier-header-top">
                <div className="tier-icon-box" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#8e9aab' }}><ShieldIcon /></div>
                <div className="tier-title-wrap">
                  <span className="tier-title">Seeker</span>
                  <span className="tier-desc">Begin the journey</span>
                </div>
              </div>
              <div className="tier-pricing">
                <span className="tier-price" style={{ color: '#fff' }}>Free</span>
                <span className="tier-period">— Free forever</span>
              </div>
              <div className="tier-features">
                <div className="feature-item"><div className="feature-check"><CheckIcon /></div>Daily devotionals & Sanctuary feed</div>
                <div className="feature-item"><div className="feature-check"><CheckIcon /></div>Earn KPC for engagement</div>
                <div className="feature-item"><div className="feature-check"><CheckIcon /></div>Publish free e-books to Bookstore</div>
              </div>
            </div>

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

          {/* Sticky Bottom Action */}
          <div className="footer-lock">
            <button
              className="action-button"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              onClick={handleUpgradeSubscription}
              disabled={isUpgrading || userTier === selectedUpgrade || selectedUpgrade === 'Seeker'}
            >
              <LightningIcon />
              {isUpgrading
                ? 'Processing...'
                : userTier === selectedUpgrade
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

          {/* Header */}
          <div className="feed-header-top" style={{ paddingBottom: '10px' }}>
            <button className="back-button" onClick={() => setStep(6)} style={{ width: '36px', height: '36px' }}>
              <BackArrowIcon />
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0' }}>
              <span style={{ color: '#f3ca58' }}>Dream</span> <span style={{ color: '#29beaf' }}>Diary</span>
            </h2>
            <div style={{ width: '36px' }}></div>
          </div>

          {/* Scrollable Content Area */}
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

            {/* List or Empty State */}
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
              NEW DREAM CREATION MODAL
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
          STEP 15: LOGIN PAGE (FUNCTIONAL & DATA-TRACKED)
          ========================================= */}
      {step === 15 && (
        <div className="feed-screen-container">
          <div className="login-container">

            <div className="login-logo-box">
              <CrownIcon />
            </div>

            <h1 className="login-title metallic-gold-text">Welcome back</h1>
            <p className="login-subtitle">Sign in to your Kingdom sanctuary</p>

            {/* Google Social Login Simulation */}
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

                {/* Horizontally scrollable recent contacts */}
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
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#8e9aab' }}>
                <SwapIcon />
                <p style={{ marginTop: '15px', fontSize: '15px' }}>Token swapping is coming soon.</p>
              </div>
            )}

          </div>

          {/* Sticky Bottom Button for Sending */}
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
          STEP 17: MEDIA HUB (FULLY INTERACTIVE)
          ========================================= */}
      {step === 17 && (
        <div className="feed-screen-container">

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

          <div className="media-search-container">
            <input
              type="text"
              className="media-search-input"
              placeholder={
                mediaTab === 'Music' ? 'Songs, artists, albums' :
                  mediaTab === 'Videos' ? 'Search sermons & teachings' : 'Titles, genres'
              }
            />
          </div>

          <div className="feed-scroll-area" style={{ paddingBottom: '100px' }}>

            {/* ======================= MUSIC ======================= */}
            {mediaTab === 'Music' && (
              <>
                <div
                  className="music-hero-card"
                  style={{ backgroundImage: `url('${musicData[0]?.img}')`, cursor: 'pointer' }}
                  onClick={() => openPlayer(musicData[0], 'audio')}
                >
                  <div className="music-hero-overlay"></div>
                  <div className="music-hero-content">
                    <div className="music-featured-badge"><FlameIcon /> FEATURED TRACK</div>
                    <h3 className="music-hero-title">{musicData[0]?.title}</h3>
                    <span className="music-hero-artist">{musicData[0]?.artist} • Click to Stream</span>
                  </div>
                  <div className="music-play-btn"><PlaySolidIcon /></div>
                </div>

                <div className="section-header">
                  <div className="section-title"><TrendingIcon /> Trending Now</div>
                  <ChevronRightIcon />
                </div>

                <div className="h-scroll-container">
                  {musicData.map((song) => (
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

                <div className="section-header" style={{ marginTop: '10px' }}>
                  <div className="section-title"><FlameIcon /> Top Tracks This Week</div>
                  <ChevronRightIcon />
                </div>

                <div>
                  {musicData.map((track, i) => (
                    <div
                      key={track.id}
                      className="top-list-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openPlayer(track, 'audio')}
                    >
                      <div className="top-list-num">{i + 1}</div>
                      <div className="top-list-img">
                        <img src={track.img} alt={track.title} className="media-cover-img" />
                      </div>
                      <div className="top-list-info">
                        <div className="top-list-title">{track.title} <VerifiedIcon /></div>
                        <div className="top-list-artist">{track.artist} • <HeadphonesIcon /> 142k streams</div>
                      </div>
                      <div style={{ color: '#f3ca58' }}><PlayOutlineIcon /></div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ======================= VIDEOS ======================= */}
            {mediaTab === 'Videos' && (
              <>
                <div className="video-subtabs">
                  {['All', 'Sermons', 'Worship', 'Teaching', 'Shorts', 'Prophetic'].map(tab => (
                    <div key={tab} className={`video-subtab scroll-snap-item ${videoSubTab === tab ? 'active' : ''}`} onClick={() => setVideoSubTab(tab)}>
                      {tab}
                    </div>
                  ))}
                </div>

                {videoData.map((vid) => (
                  <div key={vid.id} className="video-card">
                    <div
                      className="video-thumbnail-container"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openPlayer(vid, 'video')}
                    >
                      <img src={vid.img} alt={vid.title} className="media-cover-img" />

                      {!claimedVideos[vid.id] && (
                        <div className="video-reward-badge">
                          <CrownIcon /> EARN {vid.reward} KPC
                        </div>
                      )}

                      <div className="video-duration-badge">{vid.duration}</div>
                    </div>

                    <div className="video-info-row">
                      <div className="video-avatar" style={{ background: vid.avatarBg }}>{vid.letter}</div>
                      <div style={{ flex: 1 }}>
                        <div className="video-title" style={{ cursor: 'pointer' }} onClick={() => openPlayer(vid, 'video')}>{vid.title}</div>
                        <div className="video-channel">{vid.channel} <VerifiedIcon /> • {vid.views}</div>

                        <button
                          className={`video-reward-btn ${claimedVideos[vid.id] ? 'claimed' : ''}`}
                          onClick={() => openPlayer(vid, 'video')}
                        >
                          {claimedVideos[vid.id] ? (
                            <><CheckIcon /> Reward Claimed — Play Again</>
                          ) : (
                            <><PlaySolidIcon /> Watch & Earn {vid.reward} KPC</>
                          )}
                        </button>

                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ======================= MOVIES ======================= */}
            {mediaTab === 'Movies' && (
              <>
                <div className="movie-hero" style={{ backgroundImage: `url('${movieData[0]?.img}')` }}>
                  <div className="movie-hero-overlay"></div>
                  <div className="movie-hero-content">
                    <div className="movie-hero-badge">KP ORIGINAL</div>
                    <h3 className="movie-hero-title">{movieData[0]?.title}</h3>
                    <div className="movie-hero-meta">
                      <span style={{ color: '#2ecc71', fontWeight: '800' }}>98% Match</span>
                      <div className="movie-meta-box">PG-13</div>
                      <span>2026</span>
                      <span>Faith • Drama</span>
                    </div>
                    <div className="movie-actions">
                      <button className="movie-btn-play" onClick={() => openPlayer(movieData[0], 'video')}>
                        <PlaySolidIcon /> Play Stream
                      </button>
                      <button className="movie-btn-info"><InfoIcon /> Details</button>
                    </div>
                  </div>
                </div>

                {['Trending Now', 'Faith & Family', 'Documentaries'].map((section, idx) => (
                  <div key={section} style={{ marginBottom: '30px' }}>
                    <div className="section-header" style={{ marginBottom: '12px' }}>
                      <div className="section-title" style={{ fontSize: '18px' }}>{section}</div>
                      <ChevronRightIcon />
                    </div>

                    <div className="h-scroll-container">
                      {movieData.map((movie, i) => (
                        <div
                          key={movie.id || i}
                          className="movie-portrait-card scroll-snap-item"
                          style={{ cursor: 'pointer' }}
                          onClick={() => openPlayer(movie, 'video')}
                        >
                          <div className="movie-poster">
                            <img src={movie.img} alt={movie.title} className="media-cover-img" />
                            {i === 0 && idx === 0 && <div className="movie-kp-icon">KP</div>}
                          </div>
                          <div className="movie-poster-title">{movie.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
          
          {/* Hidden File Inputs for Uploading */}
          <input type="file" hidden ref={wallpaperInputRef} accept="image/*" onChange={(e) => handleImageSelect(e, 'wallpaper_url')} />
          <input type="file" hidden ref={avatarInputRef} accept="image/*" onChange={(e) => handleImageSelect(e, 'avatar_url')} />

          {/* Fixed Header (Sits above the scroll area) */}
          <div className="feed-header-top" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
            <button className="back-button" onClick={() => setStep(6)} style={{ width: '36px', height: '36px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
              <BackArrowIcon />
            </button>
          </div>

          {/* MAIN SCROLL AREA - Cover photo and profile now scroll together naturally */}
          <div className="feed-scroll-area" style={{ flexGrow: 1, paddingBottom: '120px', overflowY: 'auto', paddingTop: '0' }}>
            
            {/* Wallpaper Area - Now INSIDE the scroll area */}
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
                  {/* Avatar Area - Overlaps the cover photo perfectly now */}
                  <div className="profile-avatar-overlap" onClick={() => avatarInputRef.current.click()} style={{ cursor: 'pointer', zIndex: 10 }}>
                    {userProfile.avatar_url ? (
                      <img src={userProfile.avatar_url} alt="Profile" className="profile-avatar-circle" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="profile-avatar-circle">
                        {userProfile.full_name ? userProfile.full_name.substring(0, 2).toUpperCase() : 'U'}
                      </div>
                    )}
                    
                    {(userProfile.account_type === 'Premium' || userProfile.account_type === 'Apostle') && (
                      <div className="profile-verified-badge" title="Premium Account">
                        <CheckIcon />
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
                  
                  <div className="profile-action-row">
                    <button className="profile-btn-primary" onClick={openEditModal}>Edit Profile</button>
                    <button className="profile-btn-secondary">Share</button>
                    <button className="profile-btn-icon"><LinkIcon /></button>
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
                
                {/* TAB CONTENT: SERVICES */}
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

                {profileTab === 'Posts' && (
                  <div className="profile-tab-content">
                     <div className="empty-dream-state" style={{ marginTop: '0' }}>
                      <div className="empty-dream-icon"><IconBook /></div>
                      <h3>No posts yet</h3>
                      <p>When {userProfile.username} shares thoughts or media, they will appear here.</p>
                    </div>
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
          CHURCH ONBOARDING BRANCH (STEPS 19 - 22)
          ========================================= */}

      {/* STEP 19: CHURCH IDENTITY */}
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
            <span style={{ color: '#29beaf', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>CHURCH IDENTITY</span>
            <h1 className="onboarding-title" style={{ marginTop: '8px' }}>Tell us about your church</h1>
            <p className="onboarding-subtitle" style={{ marginBottom: '25px' }}>This is how believers will discover your church or ministry inside the community.</p>

            <div className="input-group"><label className="input-label">CHURCH / MINISTRY NAME</label><input type="text" name="churchName" placeholder="e.g. Grace Fellowship Assembly" value={formData.churchName || ''} onChange={handleChange} className="app-input" /></div>
            <div className="input-group">
              <label className="input-label">DENOMINATION</label>
              <select name="churchDenomination" value={formData.churchDenomination || ''} onChange={handleChange} className="app-select">
                <option value="">Select a denomination</option><option value="Pentecostal">Pentecostal</option><option value="Baptist">Baptist</option><option value="Catholic">Catholic</option><option value="Non-denominational">Non-denominational</option><option value="Other">Other</option>
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
            <div style={{ textAlign: 'center', marginTop: '15px', color: '#8e9aab', fontSize: '12px' }}>Registering a believer account instead? <span style={{ color: '#fff', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => { handleChange({ target: { name: 'accountType', value: 'Believer' } }); setStep(1); }}>Go back</span></div>
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
                setStep(4); // Route directly back to Wallet Generation to finalize the account!
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
        <div className="feed-screen-container" style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden', paddingBottom: '90px', background: '#09101a', minHeight: '100vh', position: 'relative', boxSizing: 'border-box' }}>
          
          <style>{`
            .glass-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
            .glass-scroll::-webkit-scrollbar-track { background: transparent; }
            .glass-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            .glass-scroll { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.1) transparent; }
          `}</style>

          {!activeChat ? (
            <>
              {/* --- TOP HEADER (From Screenshot) --- */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                <button onClick={() => setStep(6)} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <BackArrowIcon />
                </button>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ color: '#f3ca58', fontSize: '24px', fontWeight: '900', margin: 0, fontFamily: 'serif' }}>Messenger</h2>
                  <div style={{ color: '#29beaf', fontSize: '10px', fontWeight: '800', letterSpacing: '2px', marginTop: '2px' }}>ENCRYPTED • LIVE</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(41, 190, 175, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '10px', height: '10px', background: '#29beaf', borderRadius: '50%', boxShadow: '0 0 10px #29beaf' }}></div>
                </div>
              </div>

              {/* --- MAIN 4-TAB NAVIGATION PILLS --- */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderRadius: '30px', margin: '0 20px 20px 20px', padding: '4px' }}>
                {['CHATS', 'GROUPS', 'PEOPLE', 'REQUESTS'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setHubTab(tab)}
                    style={{
                      flex: 1, padding: '12px 0', border: 'none', borderRadius: '26px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', cursor: 'pointer', transition: 'all 0.2s',
                      background: hubTab === tab ? 'rgba(243, 202, 88, 0.05)' : 'transparent',
                      color: hubTab === tab ? '#f3ca58' : '#8e9aab',
                      border: hubTab === tab ? '1px solid rgba(243, 202, 88, 0.3)' : '1px solid transparent'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ==================== TAB 1: CHATS ==================== */}
              {hubTab === 'CHATS' && (
                <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Ministry Intent Filters */}
                  <div className="glass-scroll" style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '6px' }}>
                    {['ALL', 'URGENT PRAYER', 'COUNSELING', 'TESTIMONY'].map(sub => (
                      <button 
                        key={sub}
                        onClick={() => setChatSubTab(sub)}
                        style={{ padding: '8px 14px', borderRadius: '20px', border: chatSubTab === sub ? '1px solid rgba(41, 190, 175, 0.3)' : '1px solid rgba(255,255,255,0.05)', background: chatSubTab === sub ? 'rgba(41, 190, 175, 0.1)' : 'transparent', color: chatSubTab === sub ? '#29beaf' : '#8e9aab', fontSize: '10px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>

                  {/* Chat List */}
                  <div className="glass-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', height: 'calc(100vh - 280px)' }}>
                    {chatInbox
                      .filter(c => chatSubTab === 'ALL' || c.intent === chatSubTab)
                      .map((chat) => (
                      <div key={chat.id} onClick={() => setActiveChat(chat)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          
                          {/* UPDATED: Avatar Wrapper with handleViewProfile */}
                          <div onClick={(e) => handleViewProfile(e, chat)} style={{ position: 'relative', cursor: 'pointer' }}>
                            <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg, #101926, #1f3752)', border: '1px solid rgba(243, 202, 88, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f3ca58', fontWeight: '900', fontSize: '18px' }}>
                              {chat.name.charAt(0)}
                            </div>
                            {chat.status === 'online' && <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#29beaf', borderRadius: '50%', border: '2px solid #09101a' }}></div>}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: '#fff', fontSize: '15px', fontWeight: '800' }}>{chat.name}</span>
                              {chat.intent && chat.intent !== 'NORMAL' && (
                                <span style={{ fontSize: '8px', fontWeight: '900', padding: '2px 6px', borderRadius: '6px', background: chat.intent === 'URGENT PRAYER' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(243, 202, 88, 0.2)', color: chat.intent === 'URGENT PRAYER' ? '#e74c3c' : '#f3ca58' }}>
                                  {chat.intent}
                                </span>
                              )}
                            </div>
                            <div style={{ color: '#8e9aab', fontSize: '13px', marginTop: '2px' }}>{chat.lastMsg}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <span style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '700' }}>{chat.time}</span>
                          {chat.unread > 0 && <div style={{ background: '#29beaf', color: '#101926', fontSize: '10px', fontWeight: '900', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{chat.unread}</div>}
                        </div>
                      </div>
                    ))}
                    {chatInbox.filter(c => chatSubTab === 'ALL' || c.intent === chatSubTab).length === 0 && (
                      <div style={{ textAlign: 'center', color: '#8e9aab', fontSize: '13px', padding: '20px' }}>No messages found in this category.</div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== TAB 2: ROOMS ==================== */}
              {hubTab === 'GROUPS' && (
                <div className="glass-scroll" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', height: 'calc(100vh - 220px)' }}>
                  <div>
                    <div style={{ color: '#f3ca58', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px' }}>FEATURED · MY CHURCH</div>
                    <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(41, 190, 175, 0.2)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '14px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(243, 202, 88, 0.1)', border: '1px solid rgba(243, 202, 88, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f3ca58' }}>⛪</div>
                          <div>
                            <div style={{ color: '#f3ca58', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px' }}>FEATURED ROOM</div>
                            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '800', margin: '4px 0' }}>Mary Mother of Jesus</div>
                            <div style={{ color: '#8e9aab', fontSize: '13px' }}>Your local church community</div>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(41, 190, 175, 0.15)', color: '#29beaf', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(41, 190, 175, 0.3)' }}><span style={{ width: '6px', height: '6px', background: '#29beaf', borderRadius: '50%' }}></span> LIVE</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#29beaf', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px' }}>MY DENOMINATION</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(41, 190, 175, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#29beaf', fontSize: '20px' }}>👥</div>
                        <div>
                          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>Catholic</div>
                          <div style={{ color: '#8e9aab', fontSize: '12px', marginTop: '2px' }}>Denomination room</div>
                        </div>
                      </div>
                      <div style={{ color: '#8e9aab', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px', textAlign: 'right' }}>ENTER<br/>→</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><GlobeIcon /> GLOBAL ROOMS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(243, 202, 88, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f3ca58', fontSize: '20px' }}>#</div>
                          <div>
                            <div style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>Worship & Praise</div>
                            <div style={{ color: '#8e9aab', fontSize: '12px', marginTop: '2px' }}>Songs, testimonies, and worship</div>
                          </div>
                        </div>
                        <div style={{ color: '#8e9aab', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px', textAlign: 'right' }}>ENTER<br/>→</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(41, 190, 175, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#29beaf', fontSize: '20px' }}>#</div>
                          <div>
                            <div style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>Prayer Wall</div>
                            <div style={{ color: '#8e9aab', fontSize: '12px', marginTop: '2px' }}>Share and lift up prayer requests</div>
                          </div>
                        </div>
                        <div style={{ color: '#8e9aab', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px', textAlign: 'right' }}>ENTER<br/>→</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

             {/* ==================== TAB 3: PEOPLE ==================== */}
              {hubTab === 'PEOPLE' && (
                <div style={{ padding: '0 20px' }}>
                  <div className="glass-scroll" style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', overflowX: 'auto' }}>
                    {['MY CHURCH', 'DENOMINATION', 'NEARBY', 'GLOBAL'].map(sub => (
                      <button 
                        key={sub}
                        onClick={() => setPeopleSubTab(sub)}
                        style={{ padding: '10px 14px', borderRadius: '12px', border: peopleSubTab === sub ? '1px solid rgba(41, 190, 175, 0.3)' : '1px solid rgba(255,255,255,0.05)', background: peopleSubTab === sub ? 'rgba(41, 190, 175, 0.1)' : 'transparent', color: peopleSubTab === sub ? '#29beaf' : '#8e9aab', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                      >
                        {sub === 'MY CHURCH' && <span><ChurchIcon /></span>}
                        {sub === 'DENOMINATION' && <span><RosterUsersIcon /></span>}
                        {sub === 'NEARBY' && <span>📍</span>}
                        {sub === 'GLOBAL' && <span><GlobeIcon /></span>}
                        {sub}
                      </button>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
                    <SearchIcon />
                    <input type="text" placeholder="Search believers..." value={peopleSearch} onChange={(e) => setPeopleSearch(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' }} />
                  </div>
                  <div className="glass-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', height: 'calc(100vh - 300px)' }}>
                    {peopleSubTab === 'GLOBAL' ? (
                      [].filter(u => u.email !== currentUser?.email).length > 0 ? (
                        [].filter(u => u.email !== currentUser?.email).map((dbUser, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              
                              {/* UPDATED: Avatar Wrapper with handleViewProfile for DB Users */}
                              <div onClick={(e) => handleViewProfile(e, dbUser)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: dbUser.formData?.avatar || 'rgba(41, 190, 175, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#29beaf', fontWeight: '900', cursor: 'pointer' }}>
                                {!dbUser.formData?.avatar && (dbUser.formData?.fullName?.charAt(0) || dbUser.email.charAt(0).toUpperCase())}
                              </div>

                              <div>
                                <div style={{ color: '#fff', fontSize: '14px', fontWeight: '800' }}>{dbUser.formData?.fullName || 'Believer'}</div>
                                <div style={{ color: '#8e9aab', fontSize: '11px' }}>@{dbUser.formData?.username || dbUser.email.split('@')[0]}</div>
                              </div>
                            </div>
                            <button onClick={() => handleAddFriend(dbUser)} style={{ background: friendsList.some(f => f.email === dbUser.email) ? 'rgba(41, 190, 175, 0.1)' : 'linear-gradient(90deg, #f3ca58, #29beaf)', border: friendsList.some(f => f.email === dbUser.email) ? '1px solid rgba(41, 190, 175, 0.3)' : 'none', padding: '6px 12px', borderRadius: '8px', color: friendsList.some(f => f.email === dbUser.email) ? '#29beaf' : '#101926', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}>
                              {friendsList.some(f => f.email === dbUser.email) ? '✓ Added' : 'Add Friend'}
                            </button>
                          </div>
                        ))
                      ) : <div style={{ textAlign: 'center', color: '#8e9aab', fontSize: '13px' }}>No other users registered in the global database yet.</div>
                    ) : (
                      <div style={{ textAlign: 'center', color: '#8e9aab', fontSize: '14px' }}>No one found in this category yet.</div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== TAB 4: REQUESTS ==================== */}
              {hubTab === 'REQUESTS' && (
                <div className="glass-scroll" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '40px', overflowY: 'auto', height: 'calc(100vh - 220px)' }}>
                  <div>
                    <div style={{ color: '#f3ca58', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', marginBottom: '20px' }}>INCOMING</div>
                    {friendRequests.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#8e9aab', fontSize: '14px' }}>No new requests.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {friendRequests.map(req => (
                          <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(41, 190, 175, 0.1)', color: '#29beaf', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>{req.name.charAt(0)}</div>
                              <div>
                                <div style={{ color: '#fff', fontSize: '14px', fontWeight: '800' }}>{req.name}</div>
                                <div style={{ color: '#8e9aab', fontSize: '11px' }}>{req.handle}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => { setFriendsList(prev => [...prev, { ...req, status: 'online' }]); setFriendRequests(prev => prev.filter(r => r.id !== req.id)); }} style={{ background: '#2ecc71', border: 'none', padding: '6px 12px', borderRadius: '8px', color: '#101926', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}>Accept</button>
                              <button onClick={() => setFriendRequests(prev => prev.filter(r => r.id !== req.id))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '6px 12px', borderRadius: '8px', color: '#fff', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}>Reject</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ color: '#29beaf', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', marginBottom: '20px' }}>SENT</div>
                    <div style={{ textAlign: 'center', color: '#8e9aab', fontSize: '14px' }}>No pending sent requests.</div>
                  </div>
                  <div>
                    <div style={{ color: '#8e9aab', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', marginBottom: '20px' }}>FRIENDS ({friendsList.length})</div>
                    {friendsList.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#8e9aab', fontSize: '14px' }}>No friends yet — send a request from People.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {friendsList.map(friend => (
                          <div key={friend.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            
                            {/* UPDATED: Avatar Wrapper with handleViewProfile for Friends */}
                            <div onClick={(e) => handleViewProfile(e, friend)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: friend.avatar ? `url(${friend.avatar}) center/cover no-repeat` : 'linear-gradient(135deg, #101926, #1f3752)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f3ca58', fontWeight: '900', border: '1px solid rgba(243, 202, 88, 0.3)', cursor: 'pointer' }}>
                              {!friend.avatar && friend.name.charAt(0)}
                            </div>

                            <div>
                              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '800' }}>{friend.name}</div>
                              <div style={{ color: '#8e9aab', fontSize: '11px' }}>{friend.handle}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- FLOATING ACTION BUTTON --- */}
              {hubTab === 'CHATS' && (
                <div 
                  onClick={() => setIsNewChatModalOpen(true)}
                  style={{ position: 'absolute', bottom: '90px', right: '20px', width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #f3ca58, #29beaf)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(41, 190, 175, 0.4)', cursor: 'pointer', zIndex: 9999, transition: 'transform 0.2s' }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <NewChatIcon />
                </div>
              )}

              {/* --- NEW CHAT CONTACTS MODAL OVERLAY --- */}
              {isNewChatModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#09101a', zIndex: 10000, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(9, 16, 26, 0.95)' }}>
                    <button onClick={() => setIsNewChatModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><BackArrowIcon /></button>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>Select Believer</h3>
                      <div style={{ color: '#8e9aab', fontSize: '12px', marginTop: '2px' }}>{friendsList.length} Friends</div>
                    </div>
                  </div>
                  <div className="glass-scroll" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    {friendsList.length === 0 ? (
                      <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <h4 style={{ color: '#fff', fontSize: '16px', margin: '0 0 8px 0' }}>No Contacts Yet</h4>
                        <p style={{ color: '#8e9aab', fontSize: '13px', margin: '0 0 20px 0' }}>Head to the PEOPLE tab and search the GLOBAL directory to add believers.</p>
                        <button onClick={() => { setIsNewChatModalOpen(false); setHubTab('PEOPLE'); setPeopleSubTab('GLOBAL'); }} style={{ background: 'linear-gradient(90deg, #f3ca58, #29beaf)', border: 'none', padding: '10px 20px', borderRadius: '12px', color: '#101926', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>Find Believers</button>
                      </div>
                    ) : (
                      friendsList.map(friend => (
                        <div key={friend.id} onClick={() => { setActiveChat(friend); setIsNewChatModalOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                          <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: friend.avatar ? `url(${friend.avatar}) center/cover no-repeat` : 'linear-gradient(135deg, #101926, #1f3752)', border: '1px solid rgba(243, 202, 88, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f3ca58', fontWeight: '900', fontSize: '18px' }}>
                            {!friend.avatar && friend.name.charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontSize: '15px', fontWeight: '800' }}>{friend.name}</div>
                            <div style={{ color: '#8e9aab', fontSize: '13px', marginTop: '2px' }}>{friend.handle}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* =========================================
                  DYNAMIC PROFILE VIEW MODAL
                  ========================================= */}
              {selectedProfile && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
                  
                  {/* Invisible background click to close */}
                  <div onClick={() => setSelectedProfile(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}></div>
                  
                  {/* The Profile Card */}
                  <div style={{ width: '100%', maxWidth: '500px', background: '#09101a', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 10001, overflow: 'hidden', animation: 'slideUp 0.3s ease-out' }}>
                    
                    <style>{`
                      @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                    `}</style>

                    {/* Cover Photo Area */}
                    <div style={{ height: '120px', background: selectedProfile.isMinistry ? 'linear-gradient(135deg, #1f3752, #09101a)' : 'linear-gradient(135deg, rgba(41, 190, 175, 0.2), rgba(243, 202, 88, 0.1))', position: 'relative' }}>
                      <button onClick={() => setSelectedProfile(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ✕
                      </button>
                    </div>

                    {/* Avatar Overlapping Cover */}
                    <div style={{ padding: '0 24px 24px 24px', position: 'relative', top: '-40px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: selectedProfile.avatar ? `url(${selectedProfile.avatar}) center/cover` : (selectedProfile.isMinistry ? 'linear-gradient(135deg, #f3ca58, #b89020)' : 'linear-gradient(135deg, #29beaf, #1a8277)'), border: '4px solid #09101a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px', fontWeight: '900' }}>
                          {!selectedProfile.avatar && selectedProfile.name.charAt(0)}
                        </div>
                        
                        {/* Dynamic Action Button */}
                        <button 
                          onClick={() => { setActiveChat(selectedProfile.originalData); setSelectedProfile(null); }}
                          style={{ background: 'linear-gradient(135deg, #f3ca58, #29beaf)', border: 'none', padding: '10px 20px', borderRadius: '24px', color: '#101926', fontWeight: '900', fontSize: '13px', cursor: 'pointer' }}
                        >
                          Message
                        </button>
                      </div>

                      {/* Profile Info */}
                      <div style={{ marginTop: '16px' }}>
                        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '900', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {selectedProfile.name}
                          {selectedProfile.isMinistry && <VerifiedChurchIcon />}
                        </h2>
                        <div style={{ color: '#8e9aab', fontSize: '14px', fontWeight: '700' }}>
                          {selectedProfile.handle || `@${selectedProfile.name.replace(/\s+/g, '').toLowerCase()}`}
                        </div>
                        
                        {/* Dynamic Badge */}
                        <div style={{ display: 'inline-block', marginTop: '12px', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', background: selectedProfile.isMinistry ? 'rgba(243, 202, 88, 0.1)' : 'rgba(41, 190, 175, 0.1)', color: selectedProfile.isMinistry ? '#f3ca58' : '#29beaf', border: `1px solid ${selectedProfile.isMinistry ? 'rgba(243, 202, 88, 0.3)' : 'rgba(41, 190, 175, 0.3)'}` }}>
                          {selectedProfile.isMinistry ? '⛪ Ordained Ministry' : '🕊️ Verified Believer'}
                        </div>
                      </div>

                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '20px 0' }}></div>

                      {/* Extended Actions */}
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {selectedProfile.isMinistry ? (
                          <>
                            <button onClick={() => setActiveModal('send')} style={{ flex: 1, background: 'rgba(243, 202, 88, 0.1)', border: '1px solid rgba(243, 202, 88, 0.3)', color: '#f3ca58', padding: '12px', borderRadius: '16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>
                              Support / Tithe
                            </button>
                            <button style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>
                              Join Service
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setActiveModal('send')} style={{ flex: 1, background: 'rgba(41, 190, 175, 0.1)', border: '1px solid rgba(41, 190, 175, 0.3)', color: '#29beaf', padding: '12px', borderRadius: '16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>
                              Send KPC Tip
                            </button>
                            {!friendsList.some(f => f.email === selectedProfile.id) && (
                              <button onClick={() => handleAddFriend(selectedProfile.originalData)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>
                                Add Friend
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      
                    </div>
                  </div>
                </div>
              )}

            </>
          ) : (

            /* --- VIEW 2: ACTIVE KINGDOM CHAT ROOM --- */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#09101a', overflow: 'hidden', position: 'relative', zIndex: 1000 }}>
              
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(9, 16, 26, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setActiveChat(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                    <BackArrowIcon />
                  </button>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: activeChat.type === 'Ministry Groups' ? 'rgba(41, 190, 175, 0.1)' : 'linear-gradient(135deg, #101926, #1f3752)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeChat.type === 'Ministry Groups' ? '#29beaf' : '#f3ca58', fontWeight: '900', fontSize: '16px', border: '1px solid rgba(243, 202, 88, 0.3)' }}>
                    {activeChat.name.charAt(0)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '800', margin: 0 }}>{activeChat.name}</h3>
                    <span style={{ color: activeChat.status === 'online' ? '#2ecc71' : '#8e9aab', fontSize: '11px', fontWeight: '700' }}>
                      {activeChat.status === 'online' ? 'Online' : `last seen at ${activeChat.lastSeen || 'recently'}`}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#8e9aab' }}>
                  {activeChat.type !== 'Ministry Groups' && (
                    <button onClick={() => setActiveModal('send')} style={{ background: 'rgba(243, 202, 88, 0.1)', border: '1px solid rgba(243, 202, 88, 0.3)', color: '#f3ca58', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Tip
                    </button>
                  )}
                  <span style={{ cursor: 'pointer', display: 'flex' }} onClick={() => alert("Initiating Kingdom Call...")}>
                    <VoiceCallIcon />
                  </span>
                  
                  <div style={{ position: 'relative' }}>
                    <span style={{ cursor: 'pointer', display: 'flex' }} onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}>
                      <ThreeDotsIcon />
                    </span>
                    {isChatMenuOpen && (
                      <>
                        <div onClick={() => setIsChatMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}></div>
                        <div style={{ position: 'absolute', top: '30px', right: 0, background: '#101926', border: '1px solid rgba(41, 190, 175, 0.2)', borderRadius: '12px', width: '160px', padding: '8px 0', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', zIndex: 100 }}>
                          {['Pin Chat', 'Mute Notifications', 'Block User', 'Delete Chat'].map(action => (
                            <div key={action} onClick={() => { alert(`${action} applied.`); setIsChatMenuOpen(false); }} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: action === 'Block User' || action === 'Delete Chat' ? '#e74c3c' : '#fff', transition: 'all 0.2s' }}>{action}</div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-scroll" style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center', color: '#55657a', fontSize: '11px', fontWeight: '700', marginBottom: '10px' }}>
                  🔒 Encrypted Kingdom Chat
                </div>

                {activeConversation.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isMe ? 'flex-end' : 'flex-start' }}>
                    {msg.intent && msg.intent !== 'NORMAL' && (
                      <span style={{ fontSize: '9px', fontWeight: '900', padding: '2px 8px', borderRadius: '6px', background: msg.intent === 'URGENT PRAYER' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(243, 202, 88, 0.2)', color: msg.intent === 'URGENT PRAYER' ? '#e74c3c' : '#f3ca58', marginBottom: '4px', letterSpacing: '0.5px' }}>
                        {msg.intent}
                      </span>
                    )}
                    <div style={{ background: msg.isMe ? 'rgba(41, 190, 175, 0.15)' : 'rgba(255,255,255,0.05)', color: msg.isMe ? '#29beaf' : '#fff', padding: '12px 16px', borderRadius: msg.isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', maxWidth: '75%', fontSize: '14px', lineHeight: '1.4', border: msg.isMe ? '1px solid rgba(41, 190, 175, 0.3)' : '1px solid rgba(255,255,255,0.05)', wordBreak: 'break-word' }}>
                      {msg.text}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#55657a', fontSize: '10px', fontWeight: '700' }}>
                      {msg.time} {msg.isMe && <ChatDoubleCheckIcon />}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ flexShrink: 0, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', width: '100%', boxSizing: 'border-box' }}>
                <div className="glass-scroll" style={{ display: 'flex', gap: '8px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {['URGENT PRAYER', 'COUNSELING', 'TESTIMONY'].map(intent => (
                    <span 
                      key={intent} 
                      onClick={() => setMessageIntent(intent)} 
                      style={{ padding: '6px 12px', borderRadius: '14px', fontSize: '10px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', background: messageIntent === intent ? '#f3ca58' : 'rgba(255,255,255,0.05)', color: messageIntent === intent ? '#101926' : '#8e9aab' }}
                    >
                      {intent}
                    </span>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '6px 6px 6px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#8e9aab', cursor: 'pointer', display: 'flex', transform: 'rotate(-45deg)' }} onClick={() => alert("Select a document or image to attach.")}>
                    <AttachIcon />
                  </span>
                  <input 
                    type="text" 
                    placeholder={messageIntent === 'NORMAL' ? "Message..." : `Draft your ${messageIntent.toLowerCase()}...`}
                    value={chatInputMessage} 
                    onChange={(e) => setChatInputMessage(e.target.value)} 
                    style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '14px', padding: '0 8px' }} 
                  />
                  <button type="submit" style={{ background: chatInputMessage ? 'linear-gradient(90deg, #f3ca58, #29beaf)' : 'rgba(255,255,255,0.05)', border: 'none', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: chatInputMessage ? '#101926' : '#8e9aab', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
                    <SendIcon />
                  </button>
                </form>
              </div>

            </div>
          )}

         {!activeChat && <AppBottomNav />}
        </div>
      )}

{/* =========================================
          STEP 24: ADMIN DESK
          ========================================= */}
      {step === 24 && (
        <div className="feed-screen-container" style={{ position: 'relative', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
          
          <div className="feed-header-top" style={{ paddingBottom: '10px' }}>
            <button className="back-button" onClick={() => setStep(6)} style={{ width: '36px', height: '36px' }}>
              <BackArrowIcon />
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0' }}>
              <span style={{ color: '#f3ca58' }}>KingdomPlus</span> <span style={{ color: '#29beaf' }}>Admin</span>
            </h2>
            <div style={{ width: '36px' }}></div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="feed-tabs-container" style={{ marginBottom: '15px', padding: '0 20px' }}>
            {['Dreams', 'Music', 'Movies', 'News'].map((tab) => (
              <div key={tab} className={`feed-tab ${adminTab === tab ? 'active' : ''}`} onClick={() => setAdminTab(tab)}>
                <span style={{ marginLeft: '4px' }}>{tab}</span>
              </div>
            ))}
          </div>

          <div className="feed-scroll-area" style={{ flexGrow: 1, paddingBottom: '120px' }}>
            
            {/* --- DREAMS / PROPHET DESK --- */}
            {adminTab === 'Dreams' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', padding: '0 20px' }}>Pending Interpretations</h3>
                
                {/* Example of a Pending Dream Card */}
                <div className="admin-dream-card" style={{ margin: '0 20px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(243, 202, 88, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#f3ca58', fontSize: '11px', fontWeight: '800' }}>PENDING REVIEW</span>
                    <span style={{ color: '#8e9aab', fontSize: '11px' }}>@user_wallet</span>
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '8px' }}>A river of gold...</h4>
                  <p style={{ color: '#e2e8f0', fontSize: '13px', marginBottom: '15px', lineHeight: '1.5' }}>
                    I saw a river flowing with bright yellow light, and people were gathering around it to drink...
                  </p>
                  
                  <textarea 
                    className="dream-textarea" 
                    placeholder="Type your prophetic interpretation here..." 
                    style={{ height: '100px', marginBottom: '10px' }}
                  ></textarea>
                  <button className="modal-btn-primary" style={{ width: '100%' }}>Send Interpretation</button>
                </div>
              </div>
            )}

            {/* --- MEDIA & CONTENT UPLOAD (Music, Movies, News) --- */}
            {['Music', 'Movies', 'News'].includes(adminTab) && (
              <div style={{ margin: '0 20px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Upload New {adminTab}</h3>
                
                <label className="dream-input-label">TITLE</label>
                <input type="text" className="dream-input" placeholder={`Enter ${adminTab.toLowerCase()} title...`} />

                {adminTab !== 'News' && (
                  <>
                    <label className="dream-input-label">ARTIST / CREATOR</label>
                    <input type="text" className="dream-input" placeholder="Name of creator..." />
                  </>
                )}

                <label className="dream-input-label">COVER IMAGE</label>
                <div style={{ border: '2px dashed rgba(41, 190, 175, 0.3)', padding: '25px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px', color: '#29beaf', cursor: 'pointer', background: 'rgba(41, 190, 175, 0.05)' }}>
                   + Click to upload artwork
                </div>

                <label className="dream-input-label">SOURCE MEDIA URL</label>
                <input type="text" className="dream-input" placeholder="Paste link to media file..." />

                <button className="modal-btn-primary" style={{ width: '100%', marginTop: '10px' }}>Publish {adminTab}</button>
              </div>
            )}
            
          </div>
          
          <AppBottomNav />
        </div>
      )}

      {renderStreamPlayer()}

    </>
  );
}