"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { searchMedicineById } from "@/lib/api";

type Medicine = {
  openfda?: {
    spl_set_id?: string[];
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    product_type?: string[];
    route?: string[];
  };
};

export default function MedicinePage() {
  const params = useParams();
  const router = useRouter();

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMedicine = async () => {
      const medicineId = decodeURIComponent(String(params.id));

      // First try the already loaded search results
      const stored = sessionStorage.getItem("medicines");

      if (stored) {
        try {
          const medicines: Medicine[] = JSON.parse(stored);

          const foundMedicine = medicines.find(
            (item) =>
              item.openfda?.spl_set_id?.[0] === medicineId
          );

          if (foundMedicine) {
            setMedicine(foundMedicine);
            setLoading(false);
            return;
          }
        } catch {
          // Continue with API request
        }
      }

      // If the medicine isn't in sessionStorage,
      // fetch it using its stable FDA identifier.
      try {
        const result = await searchMedicineById(medicineId);

        if (result) {
          setMedicine(result);
        }
      } catch {
        setMedicine(null);
      } finally {
        setLoading(false);
      }
    };

    loadMedicine();
  }, [params.id]);

  if (loading) {
    return (
      <main>
        <div className="detail-container">
          <p className="status">Loading medicine details...</p>
        </div>
      </main>
    );
  }

  if (!medicine) {
    return (
      <main>
        <div className="detail-container">
          <button
            className="back-button"
            onClick={() => router.push("/")}
          >
            ← Back to search
          </button>

          <p className="status">
            Medicine details are unavailable.
          </p>
        </div>
      </main>
    );
  }

  const data = medicine.openfda;

  return (
    <main>
      <div className="detail-container">
        <button
          className="back-button"
          onClick={() => router.back()}
        >
          ← Back to results
        </button>

        <div className="detail-card">
          <h1>
            {data?.brand_name?.[0] || "Unknown Medicine"}
          </h1>

          <div className="detail-info">
            <div>
              <span>Generic Name</span>
              <p>
                {data?.generic_name?.[0] || "Not available"}
              </p>
            </div>

            <div>
              <span>Manufacturer</span>
              <p>
                {data?.manufacturer_name?.[0] ||
                  "Not available"}
              </p>
            </div>

            <div>
              <span>Product Type</span>
              <p>
                {data?.product_type?.[0] ||
                  "Not available"}
              </p>
            </div>

            <div>
              <span>Route</span>
              <p>
                {data?.route?.join(", ") ||
                  "Not available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}