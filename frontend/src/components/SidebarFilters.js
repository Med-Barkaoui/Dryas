export default function SidebarFilters({ categories, tags, setCategory, setTag }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-xl space-y-6">

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <ul className="space-y-1">
          {categories.map((c) => (
            <li key={c}>
              <button
                onClick={() => setCategory(c)}
                className="text-left w-full px-2 py-1 rounded hover:bg-green-50"
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div>
        <h3 className="font-semibold mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              onClick={() => setTag(tag)}
              className="cursor-pointer text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
