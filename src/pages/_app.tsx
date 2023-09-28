import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { WagmiConfig, configureChains, createClient } from 'wagmi'
import { polygonMumbai, mainnet, polygon } from 'wagmi/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { publicProvider } from 'wagmi/providers/public'
 
const chains = [polygonMumbai]

const { provider } = configureChains(
  chains,
  [publicProvider()],
)

const metamaskConnector = new MetaMaskConnector({
  chains,
  options: {
    shimDisconnect: true,
  },
})
 
const client = createClient({
  autoConnect: true,
  provider,
  connectors: [
    metamaskConnector
  ]
})
 
export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <Component {...pageProps} />
    </WagmiConfig>
  )
}
