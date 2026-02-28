import { useState, useEffect } from "react";

const AssetInfoForm = ({
  data,
  add,
  close,
  editMode,
  assetModels = [], // dropdown
}) => {

  const [formData, setFormData] = useState({
    id: "",
    asset_model_id: "",
    asset_serial_number: "",
    asset_purchase_date: "",
    asset_price: "",
    asset_warrenty_expiry: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id || "",
        asset_model_id: data.asset_model_id || "",
        asset_serial_number: data.asset_serial_number || "",
        asset_purchase_date: data.asset_purchase_date || "",
        asset_price: data.asset_price || "",
        asset_warrenty_expiry: data.asset_warrenty_expiry || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      id: formData.id,
      asset_model_id: formData.asset_model_id,
      asset_serial_number: formData.asset_serial_number.trim(),
      asset_purchase_date: formData.asset_purchase_date,
      asset_price: Number(formData.asset_price),
      asset_warrenty_expiry: formData.asset_warrenty_expiry,
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

              {/* ID (Edit Only) */}
              {editMode && (
                <div className="mb-3">
                  <label className="form-label">ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.id}
                    disabled
                  />
                </div>
              )}

              {/* Asset Model Dropdown */}
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
                      {model.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Serial Number */}
              <div className="mb-3">
                <label className="form-label">Serial Number</label>
                <input
                  type="text"
                  name="asset_serial_number"
                  value={formData.asset_serial_number}
                  onChange={handleChange}
                  placeholder="Enter Serial Number"
                  className="form-control"
                  required
                />
              </div>

              {/* Purchase Date */}
              <div className="mb-3">
                <label className="form-label">Purchase Date</label>
                <input
                  type="date"
                  name="asset_purchase_date"
                  value={formData.asset_purchase_date}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              {/* Price */}
              <div className="mb-3">
                <label className="form-label">Asset Price</label>
                <input
                  type="number"
                  name="asset_price"
                  value={formData.asset_price}
                  onChange={handleChange}
                  placeholder="Enter Price"
                  className="form-control"
                  required
                />
              </div>

              {/* Warranty Expiry */}
              <div className="mb-3">
                <label className="form-label">Warranty Expiry</label>
                <input
                  type="date"
                  name="asset_warrenty_expiry"
                  value={formData.asset_warrenty_expiry}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
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