import { useAccount, useConnect, useSigner } from 'wagmi'
import { DEFAULT_ECDSA_OWNERSHIP_MODULE, ECDSAOwnershipValidationModule } from '@biconomy/modules'
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { ethers } from 'ethers';
import { ChainId } from "@biconomy/core-types"
import { bundler, paymaster } from '@/constants/BiconomyConfig';

function Connect(
  props: {
    smartAccount: BiconomySmartAccountV2 | null,
    setSmartAccount: (biconomySmartAccount: BiconomySmartAccountV2) => void
  }
) {

  const { connector: activeConnector, isConnected } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()

  const { data: wagmiSigner } = useSigner()

  const biconomyConnect = async () => {
    if (!wagmiSigner) {
      console.log("No wagmi signer!")
    }
    const { ethereum } = window;
    try {
      const provider = new ethers.providers.Web3Provider(ethereum!)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const ownerShipModule = await ECDSAOwnershipValidationModule.create({
        signer,
        moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
      })
      let biconomySmartAccount = await BiconomySmartAccountV2.create({
        chainId: ChainId.POLYGON_MUMBAI,// or any supported chain of your choice
        bundler: bundler,
        paymaster: paymaster,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        defaultValidationModule: ownerShipModule,
        activeValidationModule: ownerShipModule
      })
      props.setSmartAccount(biconomySmartAccount)
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {
        isConnected && 
        <div>
          <div>Connected to {activeConnector?.name ?? 'undefined'}</div>
          <button onClick={biconomyConnect} disabled={!(!!wagmiSigner)}> Create Smart Account </button>
        </div>
      }

      {!isConnected && connectors.map((connector) => (
        <button
          // disabled={!connector.ready}
          key={connector.id}
          onClick={() => { console.log("connecting"); connect({ connector }) }}
        >
          {connector.name}
          {isLoading &&
            pendingConnector?.id === connector.id &&
            ' (connecting)'}
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </>
  )
}

export default Connect;