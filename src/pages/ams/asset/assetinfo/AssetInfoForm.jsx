import { useEffect, useState } from "react";
import { getAssetCategoryBasedOnFamilyId } from "../../../../services/ams/assetCategoryService";
import { getAssetTypeBasedOnCategoryId } from "../../../../services/ams/assetTypeService";
import {
  getAssetBrandInfoFromModelId,
  getAssetModelsBasedOnTypeAndBrand,
} from "../../../../services/ams/assetModelService";

const AssetInfoForm = ({
  data,
  add,
  close,
  editMode,
  assetFamilies = [],
  assetBrands = [],
}) => {
  const [formData, setFormData] = useState({
    id: "",
    asset_family_id: "",
    asset_category_id: "",
    asset_type_id: "",
    brand_id: "",
    asset_model_id: "",
    asset_serial_number: "",
    asset_purchase_date: "",
    asset_price: "",
    asset_warranty_expiry: "",
    asset_extended_warranty: "",
  });

  const [assetCategories, setAssetCategories] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [assetModels, setAssetModels] = useState([]);

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id || "",
        asset_family_id: data.asset_family_id || data.family_id || "",
        asset_category_id: data.asset_category_id || data.category_id || "",
        asset_type_id: data.asset_type_id || data.type_id || "",
        brand_id: data.brand_id || data.asset_brand_id || data.asset_model?.brand_id || "",
        asset_model_id: data.asset_model_id || data.asset_model?.id || "",
        asset_serial_number: data.asset_serial_number || "",
        asset_purchase_date: data.asset_purchase_date || data.purchase_date || "",
        asset_price: data.asset_price || data.price || "",
        asset_warranty_expiry: data.asset_warranty_expiry || data.warranty_expiry || "",
        asset_extended_warranty:
          data.asset_extended_warranty || data.extended_warranty || "",
      });
    } else {
      setFormData({
        id: "",
        asset_family_id: "",
        asset_category_id: "",
        asset_type_id: "",
        brand_id: "",
        asset_model_id: "",
        asset_serial_number: "",
        asset_purchase_date: "",
        asset_price: "",
        asset_warranty_expiry: "",
        asset_extended_warranty: "",
      });
    }
  }, [data]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!formData.asset_family_id) {
        setAssetCategories([]);
        return;
      }

      try {
        const response = await getAssetCategoryBasedOnFamilyId(formData.asset_family_id);
        const root = response?.data;
        const payload = root?.data ?? root;
        const list =
          payload?.rows ??
          payload?.items ??
          payload?.data ??
          (Array.isArray(payload) ? payload : []);

        setAssetCategories(Array.isArray(list) ? list : []);
      } catch {
        setAssetCategories([]);
      }
    };

    fetchCategories();
  }, [formData.asset_family_id]);

  useEffect(() => {
    const fetchTypes = async () => {
      if (!formData.asset_category_id) {
        setAssetTypes([]);
        return;
      }

      try {
        const response = await getAssetTypeBasedOnCategoryId(formData.asset_category_id);
        const root = response?.data;
        const payload = root?.data ?? root;
        const list =
          payload?.rows ??
          payload?.items ??
          payload?.data ??
          (Array.isArray(payload) ? payload : []);

        setAssetTypes(Array.isArray(list) ? list : []);
      } catch {
        setAssetTypes([]);
      }
    };

    fetchTypes();
  }, [formData.asset_category_id]);

  useEffect(() => {
    const hydrateBrandFromModel = async () => {
      if (!editMode || formData.brand_id || !formData.asset_model_id) {
        return;
      }

      try {
        const response = await getAssetBrandInfoFromModelId(formData.asset_model_id);
        const root = response?.data;
        const payload = root?.data ?? root;
        const resolvedBrandId =
          payload?.brand_id ||
          payload?.data?.brand_id ||
          payload?.rows?.[0]?.brand_id ||
          payload?.items?.[0]?.brand_id ||
          "";

        if (!resolvedBrandId) {
          return;
        }

        setFormData((prev) => ({
          ...prev,
          brand_id: prev.brand_id || String(resolvedBrandId),
        }));
      } catch {
      }
    };

    hydrateBrandFromModel();
  }, [editMode, formData.brand_id, formData.asset_model_id]);

  useEffect(() => {
    const fetchModels = async () => {
      if (!formData.asset_type_id || !formData.brand_id) {
        setAssetModels([]);
        return;
      }

      try {
        const response = await getAssetModelsBasedOnTypeAndBrand(
          formData.asset_type_id,
          formData.brand_id
        );
        const root = response?.data;
        const payload = root?.data ?? root;
        const list =
          payload?.rows ??
          payload?.items ??
          payload?.asset_models ??
          payload?.data ??
          (Array.isArray(payload) ? payload : []);

        setAssetModels(Array.isArray(list) ? list : []);
      } catch {
        setAssetModels([]);
      }
    };

    fetchModels();
  }, [formData.asset_type_id, formData.brand_id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "asset_family_id") {
      setFormData((prev) => ({
        ...prev,
        asset_family_id: value,
        asset_category_id: "",
        asset_type_id: "",
        asset_model_id: "",
      }));
      return;
    }

    if (name === "asset_category_id") {
      setFormData((prev) => ({
        ...prev,
        asset_category_id: value,
        asset_type_id: "",
        asset_model_id: "",
      }));
      return;
    }

    if (name === "asset_type_id") {
      setFormData((prev) => ({
        ...prev,
        asset_type_id: value,
        asset_model_id: "",
      }));
      return;
    }

    if (name === "brand_id") {
      setFormData((prev) => ({
        ...prev,
        brand_id: value,
        asset_model_id: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      id: formData.id,
      asset_family_id: (formData.asset_family_id || "").toString(),
      asset_category_id: (formData.asset_category_id || "").toString(),
      asset_type_id: (formData.asset_type_id || "").toString(),
      asset_model_id: (formData.asset_model_id || "").toString(),
      asset_serial_number: (formData.asset_serial_number || "").trim(),
      asset_purchase_date: formData.asset_purchase_date,
      asset_price: (formData.asset_price || "").toString().trim(),
      asset_warranty_expiry: formData.asset_warranty_expiry,
      asset_extended_warranty: formData.asset_extended_warranty,
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
                <label className="form-label">Asset Family</label>
                <select
                  name="asset_family_id"
                  value={formData.asset_family_id}
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

              <div className="mb-3">
                <label className="form-label">Asset Category</label>
                <select
                  name="asset_category_id"
                  value={formData.asset_category_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={!formData.asset_family_id}
                >
                  <option value="">Select Asset Category</option>
                  {assetCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.asset_category || category.category_name || category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Asset Type</label>
                <select
                  name="asset_type_id"
                  value={formData.asset_type_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={!formData.asset_category_id}
                >
                  <option value="">Select Asset Type</option>
                  {assetTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.asset_type || type.type_name || type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Asset Brand</label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Asset Brand</option>
                  {assetBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.brand || brand.brand_name || brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Asset Model</label>
                <select
                  name="asset_model_id"
                  value={formData.asset_model_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={!formData.asset_type_id || !formData.brand_id}
                >
                  <option value="">Select Asset Model</option>
                  {assetModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.asset_model || model.model || model.name}
                    </option>
                  ))}
                </select>
              </div>

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
                <label className="form-label">Extended Expiry Date</label>
                <input
                  type="date"
                  name="asset_extended_warranty"
                  value={formData.asset_extended_warranty}
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
