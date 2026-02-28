import { useState, useEffect } from "react";

const AssetTypeForm = ({
  data,
  add,
  close,
  editMode,
  assetGroups = [], // 👈 receive groups for dropdown
}) => {
  const [formData, setFormData] = useState({
    id: "",
    asset_type: "",
    asset_group_id: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id || "",
        asset_type: data.asset_type || "",
        asset_group_id: data.asset_group_id || "",
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
      asset_type: formData.asset_type.trim(),
      asset_group_id: formData.asset_group_id,
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
                {editMode ? "Edit Asset Type" : "Add Asset Type"}
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
                  <label className="form-label">ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.id}
                    disabled
                  />
                </div>
              )}

              {/* Asset Type */}
              <div className="mb-3">
                <label className="form-label">Asset Type</label>
                <input
                  type="text"
                  name="asset_type"
                  value={formData.asset_type}
                  onChange={handleChange}
                  placeholder="Enter Asset Type"
                  className="form-control"
                  required
                />
              </div>

              {/* Asset Group Dropdown */}
              <div className="mb-3">
                <label className="form-label">Asset Group</label>
                <select
                  name="asset_group_id"
                  value={formData.asset_group_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Asset Group</option>
                  {assetGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.group}
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

export default AssetTypeForm;
