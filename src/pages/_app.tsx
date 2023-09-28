import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { WagmiConfig, createClient } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { getDefaultProvider } from 'ethers'
 
const connector = new MetaMaskConnector({
  chains: [polygonMumbai],
  options: {
    shimDisconnect: true,
  },
})
 
const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
  connectors: [connector]
})
 
export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <Component {...pageProps} />
    </WagmiConfig>
  )
}
