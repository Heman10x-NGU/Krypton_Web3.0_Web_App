import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [formData, setFormData] = useState({ addressTo: '',amount: '',keyword: '',message: ''});
  const [isLoading, setIsLoading]=useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
  const [transactions, setTransactions]=useState([]);

   const handleChange = (e, name) =>{
     setFormData((prevState)  => ({ ...prevState,[name]: e.target.value}));
   }

   const getAllTransaction = async () =>{
     try {
       if(!ethereum)
       return alert ("Please Install and connect Metamask");

       const transactionContract = getEthereumContract();
       const availableTransaction = await transactionContract.getAllTransactions();
        
       
       const structuredTransactions= availableTransaction.map((transaction) => ({
         addressTo: transaction.receiver,
         addressFrom:transaction.sender,
         timestamp: new Date(transaction.timestamp.toNumber()*1000).toLocaleString(),
         message: transaction.message,
         keyword:transaction.keyword,
         amount: parseInt(transaction.amount._hex)/ (10 ** 18)

       }))

       setTransactions(structuredTransactions);
       console.log(structuredTransactions);

      }catch (error){
      console.log(error);
     }
   }



  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please Install Metamask Wallet");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        getAllTransaction();
      } else {
        console.log("NO accounts Found");
      }

      console.log(accounts);
    } catch (error) {
      console.log(error);

      throw new Error("NO Ethereum Object.");
    }
  };

   const checkIfTransactionExists = async () => {
     try{
        const transactionContract = getEthereumContract();
        const currentTransactionCount = await transactionContract.getTransactionCount();

        window.localStorage.setItem("transactionCount",currentTransactionCount)
     }
     catch (error){
       console.log(error);

       throw new Error("NO Ethereum Object.");    

     }
   }

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please Install Metamask");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);

      throw new Error("NO Ethereum Object.");
    }
  }

   const sendTransaction = async () => {

    try{
      if (!ethereum) return alert("Please Install Metamask");

      //get the data from the form
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: currentAccount,
          to: addressTo,
          gas: '0x5209', // some gwei in thousands gas fee of ether broo
          value: parsedAmount._hex,
        }]
      });

       
     const transactionHash= await  transactionContract.addToBlockchain(addressTo,parsedAmount,message,keyword);
      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);  
      await transactionHash.wait();   
      
       setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);  
      await transactionHash.wait();  

      const transactionsCount = await transactionContract.getTransactionCount();


      setTransactionCount(transactionsCount.toNumber());

      window.reload();

    }catch (error){
      console.log(error);

      throw new Error("NO Ethereum Object.");
    }
   }

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionExists();
  }, [transactionCount]);

  return (
    <TransactionContext.Provider value={{ transactionCount,connectWallet,currentAccount, formData, setFormData, handleChange,sendTransaction,transactions,isLoading }}>
      {children}
    </TransactionContext.Provider>
  );
};
