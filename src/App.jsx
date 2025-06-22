import { useEffect, useState } from "react";
import { ethers } from "ethers";

// ⬇️ ВСТАВЬ СЮДА АДРЕС СВОЕГО КОНТРАКТА
const contractAddress = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";

// ⬇️ ABI ТВОЕГО КОНТРАКТА
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

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Пожалуйста, установи MetaMask");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const ct = new ethers.Contract(contractAddress, abi, signer);
      const accs = await provider.listAccounts();

      setDiaryContract(ct);
      setAccount(accs[0]);
      fetchEntries(ct);
    } catch (err) {
      console.error(err);
      alert("Не удалось подключить MetaMask");
    }
  };

  const fetchEntries = async (contractOverride = null) => {
    try {
      const contractToUse = contractOverride || diaryContract;
      const result = await contractToUse.getMyEntries();
      setEntries(result);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitEntry = async () => {
    if (!diaryContract) return alert("Сначала подключите MetaMask");
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
      alert("Запись добавлена!");
      setFormData({
        weightKg: "",
        steps: "",
        caloriesIn: "",
        caloriesOut: "",
        note: ""
      });
      fetchEntries();
    } catch (err) {
      console.error(err);
      alert("Ошибка при добавлении записи");
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
        <input
          className="w-full p-2 border rounded"
          placeholder="Вес (кг)"
          name="weightKg"
          value={formData.weightKg}
          onChange={handleChange}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Шагов за день"
          name="steps"
          value={formData.steps}
          onChange={handleChange}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Калорий потреблено"
          name="caloriesIn"
          value={formData.caloriesIn}
          onChange={handleChange}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Калорий сожжено"
          name="caloriesOut"
          value={formData.caloriesOut}
          onChange={handleChange}
        />
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Заметка (необязательно)"
          name="note"
          value={formData.note}
          onChange={handleChange}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={submitEntry}
        >
          Добавить запись
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Ваши записи:</h2>
        {entries.length === 0 ? (
          <p>Пока записей нет.</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry, index) => (
              <li key={index} className="border p-3 rounded">
                <p><strong>Дата:</strong> {new Date(entry.timestamp * 1000).toLocaleDateString()}</p>
                <p><strong>Вес:</strong> {entry.weightKg} кг</p>
                <p><strong>Шагов:</strong> {entry.steps}</p>
                <p><strong>Калорий потреблено:</strong> {entry.caloriesIn}</p>
                <p><strong>Калорий сожжено:</strong> {entry.caloriesOut}</p>
                <p><strong>Заметка:</strong> {entry.note}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
