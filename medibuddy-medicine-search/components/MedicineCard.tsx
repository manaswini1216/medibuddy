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

type MedicineCardProps = {
  medicine: Medicine;
  onClick: () => void;
};

export default function MedicineCard({
  medicine,
  onClick,
}: MedicineCardProps) {
  const openfda = medicine.openfda;

  return (
    <div className="medicine-card" onClick={onClick}>
      <h2>{openfda?.brand_name?.[0] || "Unknown Medicine"}</h2>

      <div className="medicine-info">
        <p>
          <strong>Generic:</strong>{" "}
          {openfda?.generic_name?.[0] || "Not available"}
        </p>

        <p>
          <strong>Manufacturer:</strong>{" "}
          {openfda?.manufacturer_name?.[0] || "Not available"}
        </p>

        <p>
          <strong>Product Type:</strong>{" "}
          {openfda?.product_type?.[0] || "Not available"}
        </p>

        <p>
          <strong>Route:</strong>{" "}
          {openfda?.route?.join(", ") || "Not available"}
        </p>
      </div>

      <span className="view-details">View details →</span>
    </div>
  );
}