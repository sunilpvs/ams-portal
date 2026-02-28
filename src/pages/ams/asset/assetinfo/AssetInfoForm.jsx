import { useEffect, useState } from "react";

const AssetInfoForm = ({
  data,
  add,
  close,
  editMode,
  assetModels = [],
}) => {
  const [formData, setFormData] = useState({
    id: "",
    asset_serial_number: "",
    asset_purchase_date: "",
    asset_price: "",
    asset_warranty_expiry: "",
    asset_model_id: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id || "",
        asset_serial_number: data.asset_serial_number || "",
        asset_purchase_date: data.asset_purchase_date || data.purchase_date || "",
        asset_price: data.asset_price || data.price || "",
        asset_warranty_expiry:
          data.asset_warranty_expiry || data.warranty_expiry || "",
        asset_model_id: data.asset_model_id || data.asset_model?.id || "",
      });
    }
  }, [data]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      id: formData.id,
      asset_serial_number: (formData.asset_serial_number || "").trim(),
      asset_purchase_date: formData.asset_purchase_date,
      asset_price: (formData.asset_price || "").toString().trim(),
      asset_warranty_expiry: formData.asset_warranty_expiry,
      asset_model_id: (formData.asset_model_id || "").toString(),
    };

    add(payload);
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {editMode ? "Edit Asset Info" : "Add Asset Info"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={close}
              ></button>
            </div>

            <div className="modal-body">
              {editMode && (
                <div className="mb-3">
                  <label className="form-label" hidden>ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.id}
                    disabled
                    hidden
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Asset Serial Number</label>
                <input
                  type="text"
                  name="asset_serial_number"
                  value={formData.asset_serial_number}
                  onChange={handleChange}
                  placeholder="Enter Asset Serial Number"
                  className="form-control"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Asset Purchase Date</label>
                <input
                  type="date"
                  name="asset_purchase_date"
                  value={formData.asset_purchase_date}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Asset Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="asset_price"
                  value={formData.asset_price}
                  onChange={handleChange}
                  placeholder="Enter Asset Price"
                  className="form-control"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Asset Warranty Expiry</label>
                <input
                  type="date"
                  name="asset_warranty_expiry"
                  value={formData.asset_warranty_expiry}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Asset Model</label>
                <select
                  name="asset_model_id"
                  value={formData.asset_model_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Asset Model</option>
                  {assetModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.asset_model || model.model || model.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-success">
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={close}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssetInfoForm;