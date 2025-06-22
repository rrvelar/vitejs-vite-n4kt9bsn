import { useEffect, useState } from "react";
import { ethers } from "ethers";

const contractAddress = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";
const abi = [
  {
    "inputs": [
      { "internalType": "uint16", "name": "weightKg", "type": "uint16" },
      { "internalType": "uint32", "name": "steps", "type": "uint32" },
      { "internalType": "uint16", "name": "caloriesIn", "type": "uint16" },
      { "internalType": "uint16", "name": "caloriesOut", "type": "uint16" },
      { "internalType": "string", "name": "note", "type": "string" }
    ],
    "name": "addEntry",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyEntries",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "uint16", "name": "weightKg", "type": "uint16" },
          { "internalType": "uint32", "name": "steps", "type": "uint32" },
          { "internalType": "uint16", "name": "caloriesIn", "type": "uint16" },
          { "internalType": "uint16", "name": "caloriesOut", "type": "uint16" },
          { "internalType": "string", "name": "note", "type": "string" }
        ],
        "internalType": "struct WeightLossDiary.Entry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [account, setAccount] = useState(null);
  const [entries, setEntries] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Установите MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const { chainId } = await provider.getNetwork();

    if (chainId !== 8453) {
      return alert("Пожалуйста, переключитесь на сеть Base (Chain ID 8453)");
    }

    const contract = new ethers.Contract(contractAddress, abi, signer);
    const data = await contract.getMyEntries();
    setEntries(data);
    setAccount(address);
  };

  return (
    <div>
      <h1>Weight Loss Diary</h1>
      {!account ? (
        <button onClick={connectWallet}>Подключить MetaMask</button>
      ) : (
        <div>
          <p>Подключено: {account}</p>
          <ul>
            {entries.map((entry, idx) => (
              <li key={idx}>
                {new Date(Number(entry.timestamp) * 1000).toLocaleDateString()} — Вес: {entry.weightKg} кг, Шаги: {entry.steps}, Калории: +{entry.caloriesIn} / -{entry.caloriesOut}
                <br />
                Заметка: {entry.note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;