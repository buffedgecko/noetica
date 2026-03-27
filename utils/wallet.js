// Wallet utilities for NOETICA

export function shortAddr(addr) {
  if (!addr) return 'Connect';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export function isConnected() {
  if (typeof window === 'undefined') return false;
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
}

export async function connectWallet() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found');
  }
  return accounts[0];
}

export async function getNOETBalance(addr) {
  // Mock balance - in production this would query COTI network
  const bal = localStorage.getItem(`noetica_bal_${addr}`) || '0';
  return bal;
}

export function mockTxHash() {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export async function claimOnChain(type) {
  // Mock on-chain claim - in production this would submit to COTI
  console.log('Claiming on-chain:', type);
  return mockTxHash();
}
