import { useCallback, useEffect, useRef, useState } from "react";
import AssetModelForm from "./AssetModelsForm";
import AssetModelTable from "./AssetModelsTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";
import {
  addAssetModel,
  deleteAssetModel,
  editAssetModel,
  getPaginatedAssetModels,
} from "../../../services/ams/assetModelService";
import { getAssetCategoryCombo } from "../../../services/ams/assetCategoryService";
import { getAssetBrandCombo } from "../../../services/ams/assetBrandService";
import { getAssetFamiliesCombo } from "../../../services/ams/assetFamilyService";

const AssetModels = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [assetFamilies, setAssetFamilies] = useState([]);
  const [assetCategories, setAssetCategories] = useState([]);
  const [assetBrands, setAssetBrands] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  const fileInputRef = useRef(null);

  const extractAssetModelsFromResponse = (response) => {
    const root = response?.data;
    const payload = root?.data ?? root;

    const list =
      payload?.rows ??
      payload?.items ??
      payload?.asset_models ??
      payload?.data ??
      (Array.isArray(payload) ? payload : []);

    const total =
      payload?.totalCount ??
      payload?.total ??
      payload?.count ??
      payload?.pagination?.total ??
      (Array.isArray(list) ? list.length : 0);

    return {
      list: Array.isArray(list) ? list : [],
      total: Number.isFinite(Number(total)) ? Number(total) : 0,
    };
  };

  const extractComboListFromResponse = (response) => {
    const root = response?.data;
    const payload = root?.data ?? root;

    const list =
      payload?.rows ??
      payload?.items ??
      payload?.data ??
      (Array.isArray(payload) ? payload : []);

    return Array.isArray(list) ? list : [];
  };

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPaginatedAssetModels(currentPage, itemsPerPage);
      const { list, total } = extractAssetModelsFromResponse(response);
      setModels(list);
      setTotalCount(total);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch asset models");
      setModels([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  const fetchAssetCategories = useCallback(async () => {
    try {
      const response = await getAssetCategoryCombo(["id", "asset_category", "family_id"]);
      setAssetCategories(extractComboListFromResponse(response));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch asset categories");
      setAssetCategories([]);
    }
  }, []);

  const fetchAssetFamilies = useCallback(async () => {
    try {
      const response = await getAssetFamiliesCombo(["id", "family"]);
      setAssetFamilies(extractComboListFromResponse(response));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch asset families");
      setAssetFamilies([]);
    }
  }, []);

  const fetchAssetBrands = useCallback(async () => {
    try {
      const response = await getAssetBrandCombo(["id", "brand"]);
      setAssetBrands(extractComboListFromResponse(response));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch asset brands");
      setAssetBrands([]);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    fetchAssetFamilies();
    fetchAssetCategories();
    fetchAssetBrands();
  }, [fetchAssetFamilies, fetchAssetCategories, fetchAssetBrands]);

  /* ---------------- DELETE ---------------- */
  const handleDeleteModel = async (id) => {
    try {
      await deleteAssetModel(id);
      toast.success("Deleted Successfully");

      if (models.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
        return;
      }

      fetchModels();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete asset model");
    }
  };

  /* ---------------- ADD / EDIT ---------------- */
  const handleSubmitModel = async (formData) => {
    const payload = {
      asset_model: (formData?.asset_model || formData?.model || "").trim(),
      config: (formData?.config || "").trim(),
      asset_type_id: Number(formData?.asset_type_id),
      asset_category_id: Number(formData?.asset_category_id),
      brand_id: Number(formData?.brand_id || formData?.asset_brand_id),
    };

    if (!payload.asset_model) {
      toast.error("Asset model is required");
      return;
    }

    if (!payload.config) {
      toast.error("Configuration is required");
      return;
    }

    if (!payload.asset_category_id) {
      toast.error("Asset category is required");
      return;
    }

    if (!payload.asset_type_id) {
      toast.error("Asset type is required");
      return;
    }

    if (!payload.brand_id) {
      toast.error("Asset brand is required");
      return;
    }

    try {
      if (editMode && formData?.id) {
        await editAssetModel(formData.id, payload);
        toast.success("Updated Successfully");
      } else {
        await addAssetModel(payload);
        toast.success("Added Successfully");
      }

      setOpenForm(false);
      setEditMode(false);
      setSelectedModel(null);
      fetchModels();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to save asset model");
    }
  };

  const handleEditModel = (item) => {
    setSelectedModel(item);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleAddModel = () => {
    setSelectedModel({
      asset_model: "",
      config: "",
      asset_family_id: "",
      asset_category_id: "",
      asset_type_id: "",
      brand_id: "",
    });
    setEditMode(false);
    setOpenForm(true);
  };

  /* ---------------- IMPORT (Dummy) ---------------- */
  const handleModelImportClick = () => {
    fileInputRef.current.click();
  };

  const handleModelFileChange = () => {

    const dummyImportResult = {
      total_rows: 10,
      inserted: 3,
      skipped_duplicate_db: 7
    };

    const dummyDuplicates = [
      { id: 2, model_name: "HP EliteBook 840" },
      { id: 3, model_name: "Canon LBP 2900" },
      { id: 4, model_name: "Canon LBP 2900" }
    ];

    setImportResult(dummyImportResult);
    setDuplicateRecords(dummyDuplicates);
    setShowImportModal(true);

    toast.success("Dummy Import Completed");
  };

  const handleUpdateModelDuplicates = () => {
    toast.success("Duplicate models updated (Frontend)");
    setShowImportModal(false);
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
            <Header
              title="Asset Model Management"
              subtitle="AMS / Asset Models"
            />

            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleAddModel}>
                + Add Asset Model
              </button>

              <button className="btn btn-info" onClick={handleModelImportClick}>
                Import
              </button>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".xls,.xlsx,.csv"
                onChange={handleModelFileChange}
              />
            </div>
          </div>

          {/* TABLE */}
          <AssetModelTable
            models={models}
            assetCategories={assetCategories}
            assetBrands={assetBrands}
            deleteModel={handleDeleteModel}
            editModel={handleEditModel}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onLimitChange={setItemsPerPage}
            onSearch={setSearchTerm}
            searchTerm={searchTerm}
            loading={loading}
            totalCount={totalCount}
          />

          {/* FORM */}
          {openForm && (
            <AssetModelForm
              data={selectedModel}
              add={handleSubmitModel}
              close={() => setOpenForm(false)}
              editMode={editMode}
              assetFamilies={assetFamilies}
              allAssetCategories={assetCategories}
              assetBrands={assetBrands}
            />
          )}

          {/* IMPORT RESULT MODAL */}
          {showImportModal && importResult && (
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">

                  <div className="modal-header">
                    <h5 className="modal-title">Import Result</h5>
                    <button
                      className="btn-close"
                      onClick={() => setShowImportModal(false)}
                    ></button>
                  </div>

                  <div className="modal-body">

                    <p><strong>Total Rows:</strong> {importResult.total_rows}</p>
                    <p><strong>Inserted:</strong> {importResult.inserted}</p>
                    <p><strong>Duplicate in DB:</strong> {importResult.skipped_duplicate_db}</p>

                    {duplicateRecords.length > 0 && (
                      <>
                        <h6 className="text-danger mt-3">
                          Duplicate Models Found
                        </h6>

                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                          <table className="table table-bordered table-striped">
                            <thead className="table-light">
                              <tr>
                                <th>S.No</th>
                                <th>ID</th>
                                <th>Model Name</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {duplicateRecords.map((row, index) => (
                                <tr key={row.id}>
                                  <td>{index + 1}</td>
                                  <td>{row.id}</td>
                                  <td>{row.model_name}</td>
                                  <td>
                                    <span className="text-danger fw-bold">
                                      Duplicate
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-success"
                      onClick={handleUpdateModelDuplicates}
                    >
                      Update
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowImportModal(false)}
                    >
                      Close
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AssetModels;