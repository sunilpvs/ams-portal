import { useState, useEffect } from "react";
import styles from "./vms.module.css";
import { getAllVendorsList } from "../../services/vms/vendorService";
import { getStatusByModule } from "../../services/admin/statusService";

const ReInitiatedForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    vendor_id: "",
    status: "",
  });

  const [vendors, setVendors] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      const vendorRes = await getAllVendorsList(1, 100);
      const statusRes = await getStatusByModule(["VMS"]);

      setVendors(vendorRes.data?.vendors || []);
      setStatuses(statusRes.data || []);
    } catch (err) {
      console.error("Failed to fetch dropdowns", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 shadow-sm">

      {/* VENDOR */}
      <div className="mb-3">
        <label className={styles["form-label"]}>Vendor</label>
        <select
          name="vendor_id"
          className="form-control"
          value={formData.vendor_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.vendor_name}
            </option>
          ))}
        </select>
      </div>

      {/* STATUS */}
      <div className="mb-3">
        <label className={styles["form-label"]}>Status</label>
        <select
          name="status"
          className="form-control"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="">Select Status</option>
          {statuses
            .filter((status) => status.id === 7) // Reinitiated
            .map((status) => (
              <option key={status.id} value={status.id}>
                {status.status}
              </option>
            ))}
        </select>
      </div>

      {/* SUBMIT */}
      <div className="text-end">
        <button type="submit" className="btn btn-primary">
          Re-Initiate Vendor
        </button>
      </div>

    </form>
  );
};

export default ReInitiatedForm;
