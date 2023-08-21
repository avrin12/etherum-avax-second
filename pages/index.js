import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

import styles from "./index.module.css";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactions, setTransactions] = useState(undefined);
  const [userInput, setUserInput] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async () => {
    if (atm) {
      if (userInput < 0) {
        return;
      }
      let tx = await atm.deposit(userInput);
      await tx.wait()
      getBalance();
      get_transactions();
    }
  }

  const withdraw = async () => {
    if (atm) {
      if (userInput < 0) {
        return;
      }
      let tx = await atm.withdraw(userInput);
      await tx.wait()
      getBalance();
      get_transactions();
    }
  }

  const get_transactions = async () => {
    if (atm) {
      let transactions = await atm.get_transactions()
      setTransactions(transactions);
    }
  }

  const inputChange = (event) => {
    setUserInput(+event.target.value);
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    if (!transactions) {
      get_transactions()
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>

        <div className={styles['transaction-container']}>
          <div className={styles['input-container']}>
            Amount:
            <input type="number" value={userInput} onChange={inputChange} />
          </div>

          <div className={styles['button-container']}>
            <button onClick={deposit}>Deposit</button>
            <button onClick={withdraw}>Withdraw</button>
          </div>

          {
            transactions && transactions.length > 0 && <div className={styles['table-container']}>
              <h2>Transactions</h2>
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>

                </thead>
                <tbody>

                  {
                    transactions.map(
                      (t) => {
                        const amount = parseInt(t._hex);
                        console.log(amount);
                        return <tr key={Math.random().toString()}>
                          <td>{amount < 0 ? "Withdraw" : "Deposit"}</td>
                          <td>{amount}</td>

                        </tr>
                      }
                    )
                  }

                </tbody>
              </table>
            </div>
          }


        </div>

      </div>
    )
  }

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          border:2px solid red;
          padding: 2rem;
          width:60%;
          margin:auto;
          border-radius:10px;
        }
      `}
      </style>
    </main>
  )
}
