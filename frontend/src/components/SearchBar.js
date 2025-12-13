export default function SearchBar({ onSearch }) {
  return (
    <input
      type="text"
      placeholder="Search plants by name..."
      onChange={(e) => onSearch(e.target.value)}
      className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-600"
    />
  );
}
