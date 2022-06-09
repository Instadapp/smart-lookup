import { ethers } from "ethers";
import { VNode } from "vue";
import { gnosisSafeAbi, networkScanBaseUrl } from "./web3";

export type TaskCheckResponse = {
    status: "success" | "error" | "warning";
    metadata?: object;
};

export type TaskCheckFun = ({
    address: string,
    provider: any,
}) => PromiseLike<TaskCheckResponse>;

export type Task = {
    description: string;
    networkResults?: {
        [network: string]: TaskCheckResponse;
    };
    renderMetadata?: ({ network: Network, metadata: object }) => VNode;
    renderMetadataValue?: ({ network: Network, key: string, value: any }) => VNode;
    statusStrategy?: "some" | "every";
    check: TaskCheckFun;
};

export const tasks: Array<Task> = [
    {
        description: "This is an EOA",

        async check({ address, provider }) {
            const code = await provider.getCode(address);

            if (code != "0x") {
                return { status: "error" };
            }

            return { status: "success" };
        },
    },

    {
        description: "This is a smart contract address",

        statusStrategy: "some",

        async check({ address, provider }) {
            const code = await provider.getCode(address);

            if (code === "0x") {
                return { status: "error" };
            }

            return { status: "success" };
        },
    },

    {
        description: "This is a gnosis safe address",

        statusStrategy: "some",

        async check({ address, provider }) {
            const contract = new ethers.Contract(address, gnosisSafeAbi, provider);

            try {
                const [owners, threshold] = await Promise.all([
                    contract.getOwners(),
                    contract.getThreshold(),
                ]);
                return {
                    status: "success",
                    metadata: { owners, threshold: threshold.toString() },
                };
            } catch (error) {
                return { status: "error" };
            }
        },

        renderMetadataValue({ network, key, value }) {

            if (key === "owners") {
                return <div class="ml-8 sm:ml-10" >
                    <ul class="list-decimal">
                        {
                            value.map((owner) => <li>
                                <a
                                    class="hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`${networkScanBaseUrl[network]}address/${owner}`}>{owner}
                                </a>
                            </li>)
                        }
                    </ul>
                </div>
            }

            return <span class='text-sm'> {String(value)} </span>
        }
    },

    {
        description: "This address has transactions",

        statusStrategy: "some",

        async check({ address, provider }) {
            const count = await provider.getTransactionCount(address);

            if (count === 0) {
                return { status: "error" };
            }

            return { status: "success", metadata: { count } };
        },

        renderMetadata({ metadata }) {
            return <span> {metadata.count} transaction(s) </span>
        }
    },
];
