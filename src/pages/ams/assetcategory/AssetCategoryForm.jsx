import { useState, useEffect } from "react";

const AssetCategoryForm = ({
  data,
  add,
  close,
  editMode,
  assetFamilies = [],
}) => {
  const [formData, setFormData] = useState({
    id: "",
    asset_category: "",
    family_id: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id || "",
        asset_category: data.asset_category || data.category || "",
        family_id: data.family_id || data.asset_family_id || data.asset_family?.id || "",
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
      asset_category: formData.asset_category.trim(),
      family_id: formData.family_id,
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
                {editMode ? "Edit Asset Category" : "Add Asset Category"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={close}
              ></button>
            </div>

            <div className="modal-body">

              {/* ID - Only in Edit Mode */}
              {editMode && (
                <div className="mb-3">
                  <label className="form-label" hidden>ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.id}
                    hidden
                    disabled
                  />
                </div>
              )}

              {/* Asset Category */}
              <div className="mb-3">
                <label className="form-label">Asset Category</label>
                <input
                  type="text"
                  name="asset_category"
                  value={formData.asset_category}
                  onChange={handleChange}
                  placeholder="Enter Asset Category"
                  className="form-control"
                  required
                />
              </div>

              {/* Asset Family Dropdown */}
              <div className="mb-3">
                <label className="form-label">Asset Family</label>
                <select
                  name="family_id"
                  value={formData.family_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Asset Family</option>
                  {assetFamilies.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.family || family.asset_family || family.name}
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

export default AssetCategoryForm;
