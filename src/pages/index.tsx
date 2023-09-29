import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

import { useEffect, useState } from 'react'
import { BiconomySmartAccountV2 } from '@biconomy/account'
import dynamic from 'next/dynamic'
import SendGaslessTransaction from '@/components/SendGaslessTransaction'
import { useSigner } from 'wagmi'
import { ethers } from 'ethers'
import { abi, contractAddress } from '@/constants/ContractConfig'
import SendPaidTransaction from '@/components/SendPaidTransaction'
import FundSmartAccount from '@/components/FundSmartAccount'
const Connect = dynamic(() => import("@/components/Connect"), {
  ssr: false,
  });

export default function Home() { 
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);
  const [contractValue, setContractValue] = useState<number>()
  const [contractSetter, setContractSetter] = useState<string>()
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>()
  const [smartAccountBalance, setSmartAccountBalance] = useState<string>('0')
  const { data: wagmiSigner } = useSigner()

  useEffect(() => {
    if(smartAccount){
      smartAccount?.getAccountAddress().then((address: string) => setSmartAccountAddress(address))
    }
  }, [smartAccount])

  useEffect(() => {
    if(smartAccountAddress && wagmiSigner?.provider){
      wagmiSigner?.provider?.getBalance(smartAccountAddress).then((res) => setSmartAccountBalance(ethers.utils.formatEther(res)))
    }
  }, [smartAccountAddress, wagmiSigner?.provider])

  const getValueAndAddress = async () => {
    if(!wagmiSigner){
      alert('Connect Metamask first!')
      return;
    }

    const contract = new ethers.Contract(
      contractAddress,
      abi,
      wagmiSigner
    )

    const value = await contract.getValue()
    const setter = await contract.getSetter()

    setContractSetter(setter)
    setContractValue(Number(value))
  }

  return (
    <>
      <Head>
        <title>Biconomy Test App</title>
        <meta name="description" content="Filmio Test app" />
      </Head>
      <main className={styles.main}>
        <div>
          Current Smart Account: <b>{smartAccountAddress}</b> Balance: <b>{Number(smartAccountBalance).toFixed(5)}</b>
        </div>
        <Connect setSmartAccount={setSmartAccount} smartAccount={smartAccount}/>
        {
          wagmiSigner && <FundSmartAccount smartAccountAddress={smartAccountAddress}/>
        }
        {
          wagmiSigner && smartAccount && <SendGaslessTransaction smartAccount={smartAccount}/>
        }
        {
          wagmiSigner && smartAccount && <SendPaidTransaction smartAccount={smartAccount}/>
        }
        <div>
          <button onClick={getValueAndAddress}>
            Update Values
          </button>
        </div>
        <div>
          Current Value: <b>{contractValue}</b>
          {' , '}
          Current Setter: <b>{contractSetter}</b>
        </div>
      </main>
    </>
  )
}
