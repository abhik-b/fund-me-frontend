import { ABI, contractAddress } from './constants.js'

//get elements
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const getBalanceButton = document.getElementById("getBalanceButton")
const withdrawButton = document.getElementById("withdrawButton")
const ethAmount = document.getElementById("ethAmount")
const message = document.getElementById("message")

//add event listeners
connectButton.addEventListener("click", connect)
fundButton.addEventListener("click", fund)
getBalanceButton.addEventListener("click", getBalance)
withdrawButton.addEventListener("click", withdraw)



//connect
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        window.ethereum.request({ method: "eth_requestAccounts" })
        console.log("Connected !!")
        connectButton.textContent = "Connected"
    } else {
        connectButton.textContent = "Please Install Metamask"
        console.log("No Metamask found!")
    }
}


//fund
async function fund(event) {
    const ethAmountValue = ethAmount.value
    const sendValue = ethAmountValue ? ethAmountValue.toString() : "0.1"
    console.log(`Funding with ${ethAmountValue}... ${sendValue} ...`)
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, ABI, signer)
    try {
        const transactionResponse = await contract.fund({ value: ethers.utils.parseEther(sendValue) })
        await listenForTransactionMine(transactionResponse, provider)
        console.log("Done !")
        message.textContent = `Funded with ${sendValue} 💯`
        getBalance()
    } catch (e) {
        console.log(e)
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash} ...`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReciept) => {
            console.log(`Completed with ${transactionReciept.confirmations} confirmations`)
            resolve()
        })

    })
}

//balance
async function getBalance() {
    if (typeof window.ethereum !== undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
        message.textContent += `\nContract Balance : ${ethers.utils.formatEther(balance)}`
    }
}

//withdraw
async function withdraw() {
    console.log("Withdrawing ...")
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, ABI, signer)
    try {
        const transactionResponse = await contract.withdraw()
        await listenForTransactionMine(transactionResponse, provider)
        console.log("Withdrawn !")
        message.textContent = `Funds Withdraw Successful!`
        getBalance()
    } catch (error) {
        console.log('error : ', error)
    }
}