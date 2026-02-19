import { useState } from "react";

function App() {
  const [names, setNames] = useState([]);
  const [input, setInput] = useState("");

  function addName() {
    if (!input) return;

    const newItem = {
      id: Date.now(),   // unique id
      name: input
    };

    setNames([...names, newItem]);
    setInput("");
  }

  function deleteName(id) {
    const filtered = names.filter((n) => n.id !== id);
    setNames(filtered);
  }

  return (
    <div>
      <h1>React Local Test</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter name"
      />

      <button onClick={addName}>Add</button>

      <ul>
        {names.map((n) => (
          <li key={n.id}>
            {n.name}
            <button onClick={() => deleteName(n.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
