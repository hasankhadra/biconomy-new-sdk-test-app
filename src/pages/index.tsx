import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })
// import Connect from '@/components/Connect'
import { useEffect, useState } from 'react'
import { BiconomySmartAccountV2 } from '@biconomy/account'
import dynamic from 'next/dynamic'
const Connect = dynamic(() => import("@/components/Connect"), {
  ssr: false,
  });

export default function Home() { 


  return (
    <>
      <Head>
        <title>Test app New Biconomy SDL</title>
        <meta name="description" content="Filmio Test app" />
      </Head>
      <main className={styles.main}>
        <Connect />

      </main>
    </>
  )
}
