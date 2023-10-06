import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fund")
const balanceButton = document.getElementById("balanceButton")
const balanceDetails = document.getElementById("balanceDetails")
const withdrawButton = document.getElementById("withdrawButton")


connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw

async function connect() {

    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts"})
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "Connected"
    }else {
        connectButton.innerHTML = "Please install Metamask"
    }
}
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}.....`)
    if (typeof window.ethereum !== "undefined") {
        // provide - that will connect us to the blockchain
        // signer - a wallet that are interacting with
        // abi of the contract to be able to send those ethereum 
        // and contract address
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // wait for the transaction to finish
            await listenForTransactionMine(transactionResponse, provider)
            console.log("done");
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}....`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionRecipt) => {
            console.log(`Completed with ${transactionRecipt.confirmations} confirmations`);
            resolve()
        })
    })
    // listen For Transaction finish
}

async function getBalance() {
    if(typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        balanceDetails.innerHTML = `${ethers.utils.formatEther(balance)} Eth`
        console.log(ethers.utils.formatEther(balance));
        // console.log(balance);
    }
}

async function withdraw () {
    if (typeof window.ethereum != "undefined"){
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer) 
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}