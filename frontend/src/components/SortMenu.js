export default function SortMenu({ onSort }) {
  return (
    <select
      onChange={(e) => onSort(e.target.value)}
      className="p-2 rounded-xl border border-gray-300 shadow-sm"
    >
      <option value="">Most Popular</option>
      <option value="newest">Newest</option>
      <option value="low">Price: Low to High</option>
      <option value="high">Price: High to Low</option>
    </select>
  );
}
