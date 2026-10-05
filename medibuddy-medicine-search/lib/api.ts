const FDA_API_URL = "https://api.fda.gov/drug/label.json";

const searchCache = new Map<string, unknown[]>();
const medicineCache = new Map<string, unknown>();

export async function searchMedicines(
  query: string,
  signal?: AbortSignal
) {
  const cacheKey = query.trim().toLowerCase();

  const cachedResults = searchCache.get(cacheKey);

  if (cachedResults) {
    return cachedResults;
  }

  const url = new URL(FDA_API_URL);

  url.searchParams.set(
    "search",
    `openfda.brand_name:"${query}"`
  );

  url.searchParams.set("limit", "20");

  const response = await fetch(url.toString(), {
    signal,
  });

  if (response.status === 404) {
    searchCache.set(cacheKey, []);
    return [];
  }

  if (!response.ok) {
    throw new Error("Failed to fetch medicines");
  }

  const data = await response.json();
  const results = data.results ?? [];

  searchCache.set(cacheKey, results);

  return results;
}

export async function searchMedicineById(
  id: string,
  signal?: AbortSignal
) {
  const cacheKey = id.trim();

  const cachedMedicine = medicineCache.get(cacheKey);

  if (cachedMedicine) {
    return cachedMedicine;
  }

  const url = new URL(FDA_API_URL);

  url.searchParams.set(
    "search",
    `openfda.spl_set_id:"${id}"`
  );

  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    signal,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch medicine");
  }

  const data = await response.json();
  const medicine = data.results?.[0] ?? null;

  if (medicine) {
    medicineCache.set(cacheKey, medicine);
  }

  return medicine;
}