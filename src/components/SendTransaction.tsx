import { BiconomySmartAccountV2 } from "@biconomy/account"
import { ethers } from 'ethers';
import { IHybridPaymaster, SponsorUserOperationDto, PaymasterMode } from '@biconomy/paymaster'
import { abi, contractAddress } from '../constants/ContractConfig';
import { useState } from 'react';

function SendTransaction(
    props: {
        smartAccount: BiconomySmartAccountV2 | null,
    }
) {

    const [userValue, setUserValue] = useState<number>()

    const setValue = async () => {

        const contract = new ethers.Contract(
            contractAddress,
            abi
        )

        console.log("1 - Initiated contract instace")

        try {
            const minTx = await contract.populateTransaction.setValue(userValue);
            console.log("2 - Populated Transaction", minTx.data)

            const tx1 = {
                to: contractAddress,
                data: minTx.data,
            };

            let userOp = await props.smartAccount!.buildUserOp([tx1]);
            console.log("3 - Built userOp", { userOp })

            const biconomyPaymaster = props.smartAccount!.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

            let paymasterServiceData: SponsorUserOperationDto = {
                mode: PaymasterMode.SPONSORED,
                smartAccountInfo: {
                    name: 'BICONOMY',
                    version: '2.0.0',
                },
                calculateGasLimits: true,
            };

            const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(
                userOp,
                paymasterServiceData
            );

            console.log("4 - Got paymaster and data response", { userOp })

            userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;

            if (
                paymasterAndDataResponse.callGasLimit &&
                paymasterAndDataResponse.verificationGasLimit &&
                paymasterAndDataResponse.preVerificationGas
            ) {

                // Returned gas limits must be replaced in your op as you update paymasterAndData.
                // Because these are the limits paymaster service signed on to generate paymasterAndData
                // If you receive AA34 error check here..   

                userOp.callGasLimit = paymasterAndDataResponse.callGasLimit;
                userOp.verificationGasLimit = paymasterAndDataResponse.verificationGasLimit;
                userOp.preVerificationGas = paymasterAndDataResponse.preVerificationGas;
            }


            console.log("5 - Sending userOp", userOp)
            const userOpResponse = await props.smartAccount!.sendUserOp(userOp);
            console.log("userOpHash", userOpResponse);
            const { receipt } = await userOpResponse.wait(1);
            console.log("txHash", receipt.transactionHash);

        } catch (err: any) {
            console.error(err);
            console.log(err)
        }
    }

    return (
        <div>
            <button onClick={setValue} disabled={!(!!props.smartAccount && userValue)}> Set Value </button>
            {' '}
            <label>Number</label>
            {' '}
            <input
                value={userValue}
                type={"number"}
                onChange={(e) => setUserValue(parseInt(e.target.value))}
            />
        </div>
    )
}

export default SendTransaction;