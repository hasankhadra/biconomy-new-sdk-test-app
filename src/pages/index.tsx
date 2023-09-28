import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

import { useEffect, useState } from 'react'
import { BiconomySmartAccountV2 } from '@biconomy/account'
import dynamic from 'next/dynamic'
import SendTransaction from '@/components/SendTransaction'
import { useSigner } from 'wagmi'
import { ethers } from 'ethers'
import { abi, contractAddress } from '@/constants/ContractConfig'
const Connect = dynamic(() => import("@/components/Connect"), {
  ssr: false,
  });

export default function Home() { 
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);
  const [contractValue, setContractValue] = useState<number>()
  const [contractSetter, setContractSetter] = useState<string>()
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>()
  const { data: wagmiSigner } = useSigner()

  useEffect(() => {
    console.log("smart account:", smartAccount)
    smartAccount?.getAccountAddress().then((address: string) => setSmartAccountAddress(address))
  }, [smartAccount])

  const getValueAndAddress = async () => {
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
          Current Smart Account: {smartAccountAddress}
        </div>
        <Connect setSmartAccount={setSmartAccount} smartAccount={smartAccount}/>
        {
          wagmiSigner && smartAccount && <SendTransaction smartAccount={smartAccount}/>
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
