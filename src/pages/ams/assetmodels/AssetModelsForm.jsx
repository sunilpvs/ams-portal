import { useState, useEffect } from "react";
import {
  getAssetCategoryBasedOnFamilyId,
  getAssetFamilyIdFromCategoryId,
} from "../../../services/ams/assetCategoryService";
import { getAssetTypeBasedOnCategoryId, getAssetTypeById } from "../../../services/ams/assetTypeService";

const AssetModelsForm = ({
  data,
  add,
  close,
  editMode,
  assetFamilies = [],
  allAssetCategories = [],
  assetBrands = [],
}) => {

  const [formData, setFormData] = useState({
    id: "",
    asset_family_id: "",
    asset_category_id: "",
    asset_type_id: "",
    brand_id: "",
    asset_model: "",
    config: "",
  });
  const [assetCategories, setAssetCategories] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);

  useEffect(() => {
    if (data) {
      const selectedCategoryId =
        data.asset_category_id ||
        data.category_id ||
        data.asset_category?.id ||
        data.asset_type?.category_id ||
        data.asset_type?.asset_category_id ||
        "";

      const derivedFamilyIdFromCategory =
        selectedCategoryId && allAssetCategories.length > 0
          ? allAssetCategories.find(
              (category) => String(category?.id) === String(selectedCategoryId)
            )?.family_id ||
            allAssetCategories.find(
              (category) => String(category?.id) === String(selectedCategoryId)
            )?.asset_family_id
          : "";

      setFormData({
        id: data.id || "",
        asset_family_id:
          data.asset_family_id ||
          data.family_id ||
          data.asset_family?.id ||
          data.asset_category?.family_id ||
          data.asset_category?.asset_family_id ||
          derivedFamilyIdFromCategory ||
          "",
        asset_category_id: selectedCategoryId,
        asset_type_id: data.asset_type_id || data.type_id || data.asset_type?.id || "",
        brand_id: data.brand_id || data.asset_brand_id || data.brand?.id || "",
        asset_model: data.asset_model || data.model || "",
        config: data.config || "",
      });
    } else {
      setFormData({
        id: "",
        asset_family_id: "",
        asset_category_id: "",
        asset_type_id: "",
        brand_id: "",
        asset_model: "",
        config: "",
      });
    }
  }, [data, allAssetCategories]);

  useEffect(() => {
    const hydrateCategoryAndFamilyFromType = async () => {
      if (!formData.asset_type_id || formData.asset_category_id) {
        return;
      }

      try {
        const response = await getAssetTypeById(formData.asset_type_id);
        const root = response?.data;
        const payload = root?.data ?? root;
        const typeObj = payload?.rows?.[0] || payload?.items?.[0] || payload?.data?.[0] || payload?.data || payload;

        const resolvedCategoryId =
          typeObj?.category_id ||
          typeObj?.asset_category_id ||
          typeObj?.asset_category?.id ||
          "";

        if (!resolvedCategoryId) {
          return;
        }

        const resolvedFamilyId =
          allAssetCategories.find((category) => String(category?.id) === String(resolvedCategoryId))?.family_id ||
          allAssetCategories.find((category) => String(category?.id) === String(resolvedCategoryId))?.asset_family_id ||
          "";

        setFormData((prev) => ({
          ...prev,
          asset_category_id: prev.asset_category_id || String(resolvedCategoryId),
          asset_family_id: prev.asset_family_id || (resolvedFamilyId ? String(resolvedFamilyId) : prev.asset_family_id),
        }));
      } catch {
      }
    };

    hydrateCategoryAndFamilyFromType();
  }, [formData.asset_type_id, formData.asset_category_id, allAssetCategories]);

  useEffect(() => {
    const hydrateFamilyFromCategory = async () => {
      if (!editMode || !formData.asset_category_id || formData.asset_family_id) {
        return;
      }

      try {
        const response = await getAssetFamilyIdFromCategoryId(formData.asset_category_id);
        const root = response?.data;
        const payload = root?.data ?? root;
        const familyId =
          payload?.family_id ||
          payload?.data?.family_id ||
          payload?.rows?.[0]?.family_id ||
          payload?.items?.[0]?.family_id ||
          "";

        if (!familyId) {
          return;
        }

        setFormData((prev) => ({
          ...prev,
          asset_family_id: prev.asset_family_id || String(familyId),
        }));
      } catch {
      }
    };

    hydrateFamilyFromCategory();
  }, [editMode, formData.asset_category_id, formData.asset_family_id]);

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
        const list = payload?.rows ?? payload?.items ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
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
        const list = payload?.rows ?? payload?.items ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
        setAssetTypes(Array.isArray(list) ? list : []);
      } catch {
        setAssetTypes([]);
      }
    };

    fetchTypes();
  }, [formData.asset_category_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "asset_family_id") {
      setFormData((prev) => ({
        ...prev,
        asset_family_id: value,
        asset_category_id: prev.asset_family_id !== value ? "" : prev.asset_category_id,
      }));
      return;
    }

    if (name === "asset_category_id") {
      setFormData((prev) => ({
        ...prev,
        asset_category_id: value,
        asset_type_id: "",
      }));
      return;
    }

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
      asset_type_id: formData.asset_type_id,
      brand_id: formData.brand_id,
      asset_model: formData.asset_model.trim(),
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

              {/* Asset Family Dropdown */}
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

              {/* Asset Category Dropdown */}
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

              {/* Asset Type Dropdown */}
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

              {/* Asset Brand Dropdown */}
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

              {/* Model */}
              <div className="mb-3">
                <label className="form-label">Model</label>
                <input
                  type="text"
                  name="asset_model"
                  value={formData.asset_model}
                  onChange={handleChange}
                  placeholder="Enter Model Name"
                  className="form-control"
                  required
                />
              </div>

              {/* Config */}
              <div className="mb-3">
                <label className="form-label">Configuration</label>
                <textarea
                  name="config"
                  value={formData.config}
                  onChange={handleChange}
                  placeholder="Enter Configuration"
                  className="form-control"
                  style={{ height: "120px" }}
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