import { useAccount, useConnect, useSigner } from 'wagmi'
import { DEFAULT_ECDSA_OWNERSHIP_MODULE, ECDSAOwnershipValidationModule } from '@biconomy/modules'
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { ethers } from 'ethers';
import { IPaymaster, BiconomyPaymaster, IHybridPaymaster, SponsorUserOperationDto, PaymasterMode } from '@biconomy/paymaster'
import { IBundler, Bundler } from '@biconomy/bundler'
import { ChainId } from "@biconomy/core-types"
import { abi } from './ABI';
import { useEffect, useState } from 'react';

const bundler: IBundler = new Bundler({
  // get from biconomy dashboard https://dashboard.biconomy.io/
  bundlerUrl: 'https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44',
  chainId: ChainId.POLYGON_MUMBAI,// or any supported chain of your choice
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
})

const paymaster: IPaymaster = new BiconomyPaymaster({
  // get from biconomy dashboard https://dashboard.biconomy.io/
  paymasterUrl: 'https://paymaster.biconomy.io/api/v1/80001/UCx4uCqqv.ca38b75b-b4b5-48e2-b772-a5c65cb77f20'
})

const contractAddress = '0x8c60aa2d7b5fc485a1b32864007f7ccce702e87a'

const privateProvider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/KHlxZV00WOk1VL949f4Okm2Xw7B3CPyv")  // or any other rpc provider link
const privateSigner = new ethers.Wallet("65df39b0c4f8756c830d91cdbb9e316c8122d0994b5c0283a1c61770c8c62cd1", privateProvider);

function Connect(
  // props: {setSmartAccount: (biconomySmartAccount: BiconomySmartAccountV2) => void}
) {
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);

  useEffect(() => {
    console.log('smart account', smartAccount)
  }, [smartAccount])

  const { connector: activeConnector, isConnected } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()

  const { data: wagmiSigner } = useSigner()

  const biconomyConnect = async () => {
    if (!wagmiSigner) {
      console.log("No wagmi signer!")
    }
    // const { ethereum } = window;
    try {
      // const provider = new ethers.providers.Web3Provider(ethereum)
      // await provider.send("eth_requestAccounts", []);
      const signer = privateSigner!//provider.getSigner();
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
      const address = await biconomySmartAccount.getAccountAddress()
      setSmartAccount(biconomySmartAccount)
      console.log("address: ", await biconomySmartAccount.getAccountAddress())
    } catch (error) {
      console.error(error);
    }
  };


  const handleMint = async () => {

    const contract = new ethers.Contract(
      contractAddress,
      abi,
      privateProvider,
    )

    console.log("1 - Initiated contract instace")

    try {
      const minTx = await contract.populateTransaction.setValue(10);
      console.log("2 - Populated Transaction", minTx.data)

      const tx1 = {
        to: contractAddress,
        data: minTx.data,
      };
      
      let userOp = await smartAccount!.buildUserOp([tx1]);
      console.log("3 - Built userOp", { userOp })

      const biconomyPaymaster = smartAccount!.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

      let paymasterServiceData: SponsorUserOperationDto = {
        mode: PaymasterMode.SPONSORED,
        smartAccountInfo: {
          name: 'BICONOMY',
          version: '2.0.0'
        },
        calculateGasLimits: true
      };

      const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(
          userOp,
          paymasterServiceData
      );
      
      console.log("4 - Got paymaster and data response", { userOp })
      
      // userOp.verificationGasLimit = BigInt(userOp.verificationGasLimit!.toString()) * BigInt(5);
      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      
      console.log("5 - Sending userOp", userOp)
      const userOpResponse = await smartAccount!.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);

    } catch (err: any) {
      console.error(err);
      console.log(err)
    }
  }


  return (
    <>
      {
        isConnected &&
        <div>
          <div>Connected to {activeConnector?.name ?? 'undefined'}</div>
          <button onClick={biconomyConnect} disabled={!(!!wagmiSigner)}> Create Smart Account </button>
          <button onClick={handleMint} disabled={!(!!smartAccount)}> Set Value </button>
        </div>
      }

      {connectors.map((connector) => (
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