import { useCallback, useEffect, useRef, useState } from "react";
import AssetInfoForm from "./AssetInfoForm";
import AssetInfoTable from "./AssetInfoTable";
import Header from "../../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";
import {
  addAssetInfo,
  deleteAssetInfo,
  editAssetInfo,
  getAssetInfoById,
  getPaginatedAssetInfo,
} from "../../../../services/ams/assetInfoService";
import { getAssetCategoryCombo } from "../../../../services/ams/assetCategoryService";
import { getAssetFamiliesCombo } from "../../../../services/ams/assetFamilyService";
import { getAssetModelCombo } from "../../../../services/ams/assetModelService";
import { getAssetBrandCombo } from "../../../../services/ams/assetBrandService";
import { getAssetTypeCombo } from "../../../../services/ams/assetTypeService";

const AssetInfo = () => {
  const [assetInfos, setAssetInfos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [assetFamilies, setAssetFamilies] = useState([]);
  const [assetCategories, setAssetCategories] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [assetBrands, setAssetBrands] = useState([]);
  const [assetModels, setAssetModels] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssetInfo, setSelectedAssetInfo] = useState(null);

  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  const fileInputRef = useRef(null);

  const extractAssetInfoFromResponse = (response) => {
    const payload = response?.data?.asset_info;
    console.log("Extracted Asset Info Payload:", payload);

    // list of asset info
    const list = (Array.isArray(payload) ? payload : []);

    // get total count from response, fallback to list length if not provided
    const total = response?.data?.total ?? (Array.isArray(list) ? list.length : 0);

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

  const fetchAssetInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPaginatedAssetInfo(currentPage, itemsPerPage);
      const { list, total } = extractAssetInfoFromResponse(response);
      setAssetInfos(list);
      setTotalCount(total);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch asset info");
      setAssetInfos([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  const fetchAssetFamilies = useCallback(async () => {
    try {
      const response = await getAssetFamiliesCombo(["id", "family"]);
      setAssetFamilies(extractComboListFromResponse(response));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch asset families");
      setAssetFamilies([]);
    }
  }, []);

  const fetchAssetCategories = useCallback(async () => {
    try {
      const response = await getAssetCategoryCombo(["id", "asset_category", "family_id"]);
      setAssetCategories(extractComboListFromResponse(response));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch asset categories");
      setAssetCategories([]);
    }
  }, []);

  const fetchAssetTypes = useCallback(async () => {
    try {
      const response = await getAssetTypeCombo(["id", "asset_type", "category_id"]);
      setAssetTypes(extractComboListFromResponse(response));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch asset types");
      setAssetTypes([]);
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

  const fetchAssetModels = useCallback(async () => {
    try {
      const response = await getAssetModelCombo(["id", "asset_model"]);
      setAssetModels(extractComboListFromResponse(response));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch asset models");
      setAssetModels([]);
    }
  }, []);

  useEffect(() => {
    fetchAssetInfo();
  }, [fetchAssetInfo]);

  useEffect(() => {
    fetchAssetFamilies();
    fetchAssetCategories();
    fetchAssetTypes();
    fetchAssetBrands();
    fetchAssetModels();
  }, [fetchAssetFamilies, fetchAssetCategories, fetchAssetTypes, fetchAssetBrands, fetchAssetModels]);

  const handleDelete = async (id) => {
    try {
      await deleteAssetInfo(id);
      toast.success("Deleted Successfully");

      if (assetInfos.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
        return;
      }

      fetchAssetInfo();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete asset info");
    }
  };

  const handleSubmit = async (formData) => {
    const payload = {
      asset_family_id: Number(formData?.asset_family_id),
      asset_category_id: Number(formData?.asset_category_id),
      asset_type_id: Number(formData?.asset_type_id),
      asset_model_id: Number(formData?.asset_model_id),
      asset_serial_number: (formData?.asset_serial_number || "").trim(),
      asset_purchase_date: formData?.asset_purchase_date || "",
      asset_price: (formData?.asset_price || "").toString().trim(),
      asset_warranty_expiry: formData?.asset_warranty_expiry || "",
      asset_extended_warranty: formData?.asset_extended_warranty || "",
    };

    if (!payload.asset_family_id) {
      toast.error("Asset family is required");
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

    if (!payload.asset_serial_number) {
      toast.error("Asset serial number is required");
      return;
    }

    if (!payload.asset_purchase_date) {
      toast.error("Asset purchase date is required");
      return;
    }

    if (!payload.asset_price) {
      toast.error("Asset price is required");
      return;
    }

    if (!payload.asset_warranty_expiry) {
      toast.error("Asset warranty expiry is required");
      return;
    }

    if (!payload.asset_model_id) {
      toast.error("Asset model is required");
      return;
    }

    if (!payload.asset_extended_warranty) {
      toast.error("Extended expiry date is required");
      return;
    }

    try {
      if (editMode && formData?.id) {
        await editAssetInfo(formData.id, payload);
        toast.success("Updated Successfully");
      } else {
        await addAssetInfo(payload);
        toast.success("Added Successfully");
      }

      setOpenForm(false);
      setEditMode(false);
      setSelectedAssetInfo(null);
      fetchAssetInfo();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to save asset info");
    }
  };

  const handleEdit = async (item) => {
    try {
      const response = await getAssetInfoById(item?.id);
      const root = response?.data;
      const payload = root?.data ?? root;
      const assetInfoObj =
        payload?.rows?.[0] ||
        payload?.items?.[0] ||
        payload?.asset_info?.[0] ||
        payload?.asset_info ||
        payload;

      setSelectedAssetInfo(assetInfoObj || item);
      setEditMode(true);
      setOpenForm(true);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch asset info details");
    }
  };

  const handleAdd = () => {
    setSelectedAssetInfo({
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
    setEditMode(false);
    setOpenForm(true);
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = () => {
    const dummyImportResult = {
      total_rows: 10,
      inserted: 3,
      skipped_duplicate_db: 7,
    };

    const dummyDuplicates = [
      { id: 2, asset_serial_number: "AST-0002" },
      { id: 3, asset_serial_number: "AST-0003" },
      { id: 4, asset_serial_number: "AST-0003" },
    ];

    setImportResult(dummyImportResult);
    setDuplicateRecords(dummyDuplicates);
    setShowImportModal(true);

    toast.success("Dummy Import Completed");
  };

  const handleUpdateDuplicates = () => {
    toast.success("Duplicate asset info updated (Frontend)");
    setShowImportModal(false);
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
            <Header title="Asset Info Management" subtitle="AMS / Asset Info" />

            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleAdd}>
                + Add Asset Info
              </button>

              <button className="btn btn-info" onClick={handleImportClick}>
                Import
              </button>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".xls,.xlsx,.csv"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <AssetInfoTable
            assetInfos={assetInfos}
            assetFamilies={assetFamilies}
            assetCategories={assetCategories}
            assetTypes={assetTypes}
            assetBrands={assetBrands}
            assetModels={assetModels}
            deleteAssetInfo={handleDelete}
            editAssetInfo={handleEdit}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onLimitChange={setItemsPerPage}
            onSearch={setSearchTerm}
            searchTerm={searchTerm}
            loading={loading}
            totalCount={totalCount}
          />

          {openForm && (
            <AssetInfoForm
              data={selectedAssetInfo}
              add={handleSubmit}
              close={() => setOpenForm(false)}
              editMode={editMode}
              assetFamilies={assetFamilies}
              assetBrands={assetBrands}
            />
          )}

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
                        <h6 className="text-danger mt-3">Duplicate Records Found</h6>

                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                          <table className="table table-bordered table-striped">
                            <thead className="table-light">
                              <tr>
                                <th>S.No</th>
                                <th>ID</th>
                                <th>Asset Serial Number</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {duplicateRecords.map((row, index) => (
                                <tr key={row.id}>
                                  <td>{index + 1}</td>
                                  <td>{row.id}</td>
                                  <td>{row.asset_serial_number}</td>
                                  <td>
                                    <span className="text-danger fw-bold">Duplicate</span>
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
                    <button className="btn btn-success" onClick={handleUpdateDuplicates}>
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

export default AssetInfo;
