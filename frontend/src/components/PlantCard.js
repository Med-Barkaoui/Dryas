export default function PlantCard({ plant, mode }) {

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden p-3 transition ${
        mode === "list" ? "flex gap-4 items-center" : ""
      }`}
    >
      <img
        src={plant.imageUrl}
        alt={plant.name}
        className={`object-cover rounded-lg ${
          mode === "list" ? "w-40 h-40" : "w-full h-56"
        }`}
      />

      <div className="flex flex-col justify-between p-2">
        <div>
          <h3 className="font-semibold text-lg">{plant.name}</h3>
          <p className="text-gray-500 italic">{plant.scientificName}</p>

          <div className="flex gap-2 mt-2">
            {plant.tags?.map((t) => (
              <span
                key={t}
                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 text-green-700 font-bold text-lg">
          ${plant.price}
        </div>
      </div>
    </div>
  );
}
