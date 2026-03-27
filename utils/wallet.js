// NOETICA — Wallet utilities
export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask not installed')
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  return accounts[0]
}
export function isConnected() {
  return !!(window.ethereum?.selectedAddress)
}
export function shortAddr(addr) {
  if (!addr) return '...'
  return addr.slice(0,6) + '...' + addr.slice(-4)
}
export function getNOETBalance(addr) {
  return Promise.resolve('0')
}
export function claimOnChain(type) {
  return Promise.resolve({ hash: mockTxHash() })
}
export function mockTxHash() {
  return '0x' + Array.from({length:64}, () => Math.floor(Math.random()*16).toString(16)).join('')
}
