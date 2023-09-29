import { BiconomySmartAccountV2 } from "@biconomy/account"
import { ethers } from 'ethers';
import { IHybridPaymaster, SponsorUserOperationDto, PaymasterMode } from '@biconomy/paymaster'
import { abi, contractAddress } from '../constants/ContractConfig';
import { useState } from 'react';
import { useSigner } from "wagmi";

function FundSmartAccount(
    props: {
        smartAccountAddress?: string,
    }
) {

    const [userValue, setUserValue] = useState<string>("0")

    const { data: wagmiSigner } = useSigner()

    const fundSmartAccount = async () => {

        await wagmiSigner?.sendTransaction({
            to: props.smartAccountAddress,
            value: ethers.utils.parseUnits(userValue)
        })

    }

    return (
        <div>
            <button onClick={fundSmartAccount} disabled={!(!!props.smartAccountAddress && userValue)}> Fund Smart Account </button>
            {' '}
            <label>Eth</label>
            {' '}
            <input
                value={userValue}
                type="text"
                onChange={(e) => setUserValue(e.target.value)}
            />
        </div>
    )
}

export default FundSmartAccount;