import { Bundler, IBundler } from "@biconomy/bundler"
import { ChainId } from "@biconomy/core-types"
import { DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/modules"
import { BiconomyPaymaster, IPaymaster } from "@biconomy/paymaster"

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

export { bundler, paymaster }