import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useDebounce } from "../src/hooks/useDebounce";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const categories = ["All", "Appetizer", "Main Course", "Dessert", "Beverage"];

export default function MenuManagement() {
  const [menu, setMenu] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Appetizer",
    price: "",
    ingredients: "",
    preparationTime: "",
    imageUrl: "",
    isAvailable: true,
  });
  const [formError, setFormError] = useState("");
  const [editId, setEditId] = useState(null);

  // Debounced search
  const debouncedSearch = useDebounce(search, 400);

  // Fetch menu items
  useEffect(() => {
    fetchMenu();
    // eslint-disable-next-line
  }, [debouncedSearch, category, availability]);

  async function fetchMenu() {
    setLoading(true);
    let url = `${API_URL}/menu`;
    const params = [];
    if (category !== "All")
      params.push(`category=${encodeURIComponent(category)}`);
    if (availability !== "All")
      params.push(`isAvailable=${availability === "Available"}`);
    if (debouncedSearch) {
      // Always include category and availability in search
      const searchParams = [`q=${encodeURIComponent(debouncedSearch)}`];
      if (category !== "All")
        searchParams.push(`category=${encodeURIComponent(category)}`);
      if (availability !== "All")
        searchParams.push(`isAvailable=${availability}`);
      url = `${API_URL}/menu/search?${searchParams.join("&")}`;
    } else if (params.length) {
      url += `?${params.join("&")}`;
    }
    try {
      const res = await fetch(url);
      const data = await res.json();
      setMenu(data);
    } catch {
      setMenu([]);
    }
    setLoading(false);
  }

  function openAddModal() {
    setModalType("add");
    setForm({
      name: "",
      description: "",
      category: "Appetizer",
      price: "",
      ingredients: "",
      preparationTime: "",
      imageUrl: "",
      isAvailable: true,
    });
    setFormError("");
    setEditId(null);
    setModalOpen(true);
  }

  function openEditModal(item) {
    setModalType("edit");
    setForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "Appetizer",
      price: item.price || "",
      ingredients: (item.ingredients || []).join(", "),
      preparationTime: item.preparationTime || "",
      imageUrl: item.imageUrl || "",
      isAvailable: item.isAvailable,
    });
    setFormError("");
    setEditId(item._id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setFormError("");
    setEditId(null);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    // Validation
    if (!form.name.trim() || !form.category || !form.price) {
      setFormError("Name, category, and price are required.");
      return;
    }
    setFormError("");
    setLoading(true);
    const payload = {
      ...form,
      price: Number(form.price),
      ingredients: form.ingredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      preparationTime: form.preparationTime
        ? Number(form.preparationTime)
        : undefined,
    };
    try {
      let res, data;
      if (modalType === "add") {
        res = await fetch(`${API_URL}/menu`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to add item");
        setMenu([data, ...menu]);
      } else {
        res = await fetch(`${API_URL}/menu/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update item");
        setMenu(menu.map((m) => (m._id === editId ? data : m)));
        
      }
       toast.success(`Menu item ${modalType === "add" ? "added" : "updated"} successfully!`);
      closeModal();
       
    } catch (e) {
      setFormError(e.message);
    }
    setLoading(false);
  }

  async function handleDelete(item) {
    if (!window.confirm("Delete this menu item?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/menu/${item._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setMenu(menu.filter((m) => m._id !== item._id));
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  }

  // ...existing JSX code (UI) remains unchanged...
  return (
    <div
      className="max-w-5xl mx-auto p-6 bg-linear-to-br from-white to-blue-50 rounded-xl shadow-xl min-h-[80vh] w-full flex flex-col   text-black
    "
    >
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-blue-900">
          Menu Management
        </h2>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded shadow transition"
        >
          Add Menu Item
        </button>
      </div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
          placeholder="Search by name or ingredient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-blue-200 rounded px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="border border-blue-200 rounded px-3 py-2"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        >
          <option>All</option>
          <option>Available</option>
          <option>Unavailable</option>
        </select>
      </div>
      {/* Table */}
      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-blue-100 text-blue-900">
                  <th className="p-3 border-b font-semibold text-left">Name</th>
                  <th className="p-3 border-b font-semibold text-left">
                    Category
                  </th>
                  <th className="p-3 border-b font-semibold text-left">
                    Price
                  </th>
                  <th className="p-3 border-b font-semibold text-left">
                    Available
                  </th>
                  <th className="p-3 border-b font-semibold text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {menu.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-blue-50 transition group"
                  >
                    <td className="p-3 border-b font-medium text-blue-900 group-hover:font-bold">
                      {item.name}
                    </td>
                    <td className="p-3 border-b">{item.category}</td>
                    <td className="p-3 border-b">${item.price}</td>
                    <td className="p-3 border-b">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold shadow-sm ${item.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {item.isAvailable ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-3 border-b flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <button
                        className="bg-gradient-tl from-yellow-200 to-yellow-400 text-yellow-600 font-semibold px-3 py-1 rounded shadow-sm transition"
                        onClick={async () => {
                          // Optimistic UI update
                          const prevMenu = [...menu];
                          setMenu(
                            menu.map((m) =>
                              m._id === item._id
                                ? { ...m, isAvailable: !m.isAvailable }
                                : m,
                            ),
                          );
                          try {
                            const res = await fetch(
                              `${API_URL}/menu/${item._id}/availability`,
                              { method: "PATCH" },
                            );
                            if (res){
                                toast.success("Availability updated successfully!");
                            }
                            if (!res.ok)
                              throw new Error("Failed to update availability");
                          } catch {
                            // Rollback on error
                            setMenu(prevMenu);
                            toast.error(
                              "Failed to update availability. Please try again.",
                            );
                            // Show toast
                            alert(
                              "Failed to update availability. Please try again.",
                            );
                          }
                        }}
                      >
                        Toggle Availability
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold px-3 py-1 rounded shadow-sm transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold px-3 py-1 rounded shadow-sm transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Toaster  reverseOrder={false} />
          </div>
        )}

      </div>
      {/* Modal for Add/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-800/60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl min-w-[320px] max-w-100 w-full">
            <h3 className="text-xl font-bold mb-4">
              {modalType === "add" ? "Add" : "Edit"} Menu Item
            </h3>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
              <input
                className="border border-blue-200 rounded px-3 py-2"
                placeholder="Name*"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <textarea
                className="border border-blue-200 rounded px-3 py-2"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <select
                className="border border-blue-200 rounded px-3 py-2"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories
                  .filter((c) => c !== "All")
                  .map((c) => (
                    <option key={c}>{c}</option>
                  ))}
              </select>
              <input
                className="border border-blue-200 rounded px-3 py-2"
                type="number"
                placeholder="Price*"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                className="border border-blue-200 rounded px-3 py-2"
                placeholder="Ingredients (comma separated)"
                value={form.ingredients}
                onChange={(e) =>
                  setForm({ ...form, ingredients: e.target.value })
                }
              />
              <input
                className="border border-blue-200 rounded px-3 py-2"
                type="number"
                placeholder="Preparation Time (min)"
                value={form.preparationTime}
                onChange={(e) =>
                  setForm({ ...form, preparationTime: e.target.value })
                }
              />
              <input
                className="border border-blue-200 rounded px-3 py-2"
                placeholder="Image URL"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) =>
                    setForm({ ...form, isAvailable: e.target.checked })
                  }
                />
                <span className="text-sm">Available</span>
              </label>
              {formError && (
                <div className="text-red-600 text-sm">{formError}</div>
              )}
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  {modalType === "add" ? "Add" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
