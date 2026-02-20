import { useState, useEffect } from "react";

const AssetCategoryForm = ({
  data,
  add,
  close,
  editMode,
  assetTypes = [],        // dropdown 1
  assignmentTypes = [],   // dropdown 2
}) => {

  const [formData, setFormData] = useState({
    id: "",
    asset_category: "",
    asset_type_id: "",
    assignment_type_id: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id || "",
        asset_category: data.asset_category || "",
        asset_type_id: data.asset_type_id || "",
        assignment_type_id: data.assignment_type_id || "",
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
      asset_type_id: formData.asset_type_id,
      assignment_type_id: formData.assignment_type_id,
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

              {/* Asset Type Dropdown */}
              <div className="mb-3">
                <label className="form-label">Asset Type</label>
                <select
                  name="asset_type_id"
                  value={formData.asset_type_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Asset Type</option>
                  {assetTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.asset_type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment Type Dropdown */}
              <div className="mb-3">
                <label className="form-label">Assignment Type</label>
                <select
                  name="assignment_type_id"
                  value={formData.assignment_type_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Assignment Type</option>
                  {assignmentTypes.map((assign) => (
                    <option key={assign.id} value={assign.id}>
                      {assign.assignment_type}
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
