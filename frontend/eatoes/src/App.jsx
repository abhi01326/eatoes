import MenuManagement from "./MenuManagement";
import OrdersDashboard from "./OrdersDashboard";
import { useState } from "react";

function App() {
  const [page, setPage] = useState("menu");
  return (
    <div className="bg-gradient-to-br from-cyan-200 to-blue-500 p-4 flex flex-col gap-4 min-h-screen w-screen justify-center items-center">
      <h1 className="text-3xl font-bold mb-6">Eatoes Admin Dashboard</h1>
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${page === "menu" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}
          onClick={() => setPage("menu")}
        >
          Menu Management
        </button>
        <button
          className={`px-4 py-2 rounded ${page === "orders" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setPage("orders")}
        >
          Orders Dashboard
        </button>
      </div>
      {page === "menu" ? <MenuManagement /> : <OrdersDashboard />}
    </div>
  );
}

export default App;
