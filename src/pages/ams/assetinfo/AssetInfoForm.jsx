import { useState, useEffect } from "react";

const AssetModelsForm = ({
  data,
  add,
  close,
  editMode,
  assetCategories = [],   // dropdown 1
  assetBrands = [],       // dropdown 2
}) => {

  const [formData, setFormData] = useState({
    id: "",
    asset_category_id: "",
    asset_brand_id: "",
    model: "",
    config: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id || "",
        asset_category_id: data.asset_category_id || "",
        asset_brand_id: data.asset_brand_id || "",
        model: data.model || "",
        config: data.config || "",
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
      asset_category_id: formData.asset_category_id,
      asset_brand_id: formData.asset_brand_id,
      model: formData.model.trim(),
      config: formData.config.trim(),
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
                {editMode ? "Edit Asset Model" : "Add Asset Model"}
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
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Brand Dropdown */}
              <div className="mb-3">
                <label className="form-label">Asset Brand</label>
                <select
                  name="asset_brand_id"
                  value={formData.asset_brand_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Asset Brand</option>
                  {assetBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.brand_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div className="mb-3">
                <label className="form-label">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Enter Model Name"
                  className="form-control"
                  required
                />
              </div>

              {/* Config */}
              <div className="mb-3">
                <label className="form-label">Configuration</label>
                <input
                  type="text"
                  name="config"
                  value={formData.config}
                  onChange={handleChange}
                  placeholder="Enter Configuration"
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

export default AssetModelsForm;