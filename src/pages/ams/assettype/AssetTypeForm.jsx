import { useState, useEffect } from "react";

const AssetTypeForm = ({
  data,
  add,
  close,
  editMode,
  assetCategories = [],
  assignmentTypes = [],
}) => {

  const [formData, setFormData] = useState({
    id: "",
    asset_type: "",
    asset_category_id: "",
    assignment_type_id: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id || "",
        asset_type: data.asset_type || data.name || "",
        asset_category_id: data.asset_category_id || data.asset_category?.id || "",
        assignment_type_id: data.assignment_type_id || data.assignment_type?.id || "",
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
      asset_category_id: formData.asset_category_id,
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
                {editMode ? "Edit Asset Type" : "Add Asset Type"}
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

              {/* Asset Category Dropdown */}
              <div className="mb-3">
                <label className="form-label">Asset Category</label>
                <select
                  name="asset_category_id"
                  value={formData.asset_category_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Asset Category</option>
                  {assetCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.asset_category || category.name}
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
                      {assign.assignment_type || assign.name}
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
