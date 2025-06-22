// React DApp for Weight Loss Diary
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

export default function App() {
  const [account, setAccount] = useState("");
  const [diaryContract, setDiaryContract] = useState(null);
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    weightKg: "",
    steps: "",
    caloriesIn: "",
    caloriesOut: "",
    note: ""
  });

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        setDiaryContract(contract);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      } else {
        alert("Install MetaMask to use this DApp.");
      }
    };
    init();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitEntry = async () => {
    const { weightKg, steps, caloriesIn, caloriesOut, note } = formData;
    try {
      const tx = await diaryContract.addEntry(
        parseInt(weightKg),
        parseInt(steps),
        parseInt(caloriesIn),
        parseInt(caloriesOut),
        note
      );
      await tx.wait();
      alert("Entry added!");
      fetchEntries();
    } catch (err) {
      console.error(err);
      alert("Failed to add entry.");
    }
  };

  const fetchEntries = async () => {
    try {
      const entries = await diaryContract.getMyEntries();
      setEntries(entries);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Weight Loss Diary DApp</h1>
     
      {!account ? (
      <button
        onClick={connectWallet}
        className="px-4 py-2 bg-green-600 text-white rounded mb-4"
      >
        Подключить MetaMask
      </button>
    ) : (
      <p className="mb-4 text-sm text-gray-600">Подключено: {account}</p>
    )}

      <div className="mb-6 space-y-2">
        <input className="w-full p-2 border rounded" placeholder="Weight (kg)" name="weightKg" value={formData.weightKg} onChange={handleChange} />
        <input className="w-full p-2 border rounded" placeholder="Steps" name="steps" value={formData.steps} onChange={handleChange} />
        <input className="w-full p-2 border rounded" placeholder="Calories In" name="caloriesIn" value={formData.caloriesIn} onChange={handleChange} />
        <input className="w-full p-2 border rounded" placeholder="Calories Out" name="caloriesOut" value={formData.caloriesOut} onChange={handleChange} />
        <textarea className="w-full p-2 border rounded" placeholder="Note (optional)" name="note" value={formData.note} onChange={handleChange} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submitEntry}>Submit Entry</button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Your Entries:</h2>
        {entries.length === 0 ? <p>No entries yet.</p> : (
          <ul className="space-y-3">
            {entries.map((entry, index) => (
              <li key={index} className="border p-3 rounded">
                <p><strong>Date:</strong> {new Date(entry.timestamp * 1000).toLocaleDateString()}</p>
                <p><strong>Weight:</strong> {entry.weightKg} kg</p>
                <p><strong>Steps:</strong> {entry.steps}</p>
                <p><strong>Calories In:</strong> {entry.caloriesIn}</p>
                <p><strong>Calories Out:</strong> {entry.caloriesOut}</p>
                <p><strong>Note:</strong> {entry.note}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
