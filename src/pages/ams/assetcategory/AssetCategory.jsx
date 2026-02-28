import { useCallback, useEffect, useRef, useState } from "react";
import AssetCategoryForm from "./AssetCategoryForm";
import AssetCategoryTable from "./AssetCategoryTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";
import {
  addAssetCategory,
  deleteAssetCategory,
  editAssetCategory,
  getPaginatedAssetCategories,
} from "../../../services/ams/assetCategoryService";
import { getAssetFamiliesCombo } from "../../../services/ams/assetFamilyService";

const AssetCategory = () => {
  const [assetCategories, setAssetCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [assetFamilies, setAssetFamilies] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssetCategory, setSelectedAssetCategory] = useState(null);

  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  const fileInputRef = useRef(null);

  const extractAssetCategoriesFromResponse = (response) => {
    const payload = response?.data?.asset_categories;

    // list of asset categories
    const list = (Array.isArray(payload) ? payload : []);

    // get total count from response, fallback to list length if not provided
    const total = response?.data?.total ?? (Array.isArray(list) ? list.length : 0);

    return {
      list: Array.isArray(list) ? list : [],
      total: Number.isFinite(Number(total)) ? Number(total) : 0,
    };
  };

  const extractAssetFamiliesFromResponse = (response) => {
    const root = response?.data;
    const payload = root?.data ?? root;

    const list =
      payload?.rows ??
      payload?.items ??
      payload?.asset_families ??
      payload?.data ??
      (Array.isArray(payload) ? payload : []);

    return Array.isArray(list) ? list : [];
  };

  const fetchAssetCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPaginatedAssetCategories(currentPage, itemsPerPage);
      const { list, total } = extractAssetCategoriesFromResponse(response);
      setAssetCategories(list);
      setTotalCount(total);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch asset categories");
      setAssetCategories([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  const fetchAssetFamilies = useCallback(async () => {
    try {
      const response = await getAssetFamiliesCombo(["id", "family"]);
      setAssetFamilies(extractAssetFamiliesFromResponse(response));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch asset families");
      setAssetFamilies([]);
    }
  }, []);

  useEffect(() => {
    fetchAssetCategories();
  }, [fetchAssetCategories]);

  useEffect(() => {
    fetchAssetFamilies();
  }, [fetchAssetFamilies]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteAssetCategory(id);
      toast.success("Deleted Successfully");

      if (assetCategories.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
        return;
      }

      fetchAssetCategories();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete asset category");
    }
  };

  /* ---------------- ADD / EDIT ---------------- */
  const handleSubmit = async (formData) => {
    const payload = {
      asset_category: (formData?.asset_category || "").trim(),
      family_id: formData?.family_id || formData?.asset_family_id,
    };

    if (!payload.asset_category) {
      toast.error("Asset category is required");
      return;
    }

    if (!payload.family_id) {
      toast.error("Asset family is required");
      return;
    }

    try {
      if (editMode && formData?.id) {
        await editAssetCategory(formData.id, payload);
        toast.success("Updated Successfully");
      } else {
        await addAssetCategory(payload);
        toast.success("Added Successfully");
      }

      setOpenForm(false);
      setEditMode(false);
      setSelectedAssetCategory(null);
      fetchAssetCategories();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to save asset category");
    }
  };

  const handleEdit = (item) => {
    setSelectedAssetCategory(item);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setSelectedAssetCategory({ asset_category: "", family_id: "" });
    setEditMode(false);
    setOpenForm(true);
  };

  /* ---------------- IMPORT (Dummy) ---------------- */
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = () => {

    const dummyImportResult = {
      total_rows: 20,
      inserted: 5,
      skipped_duplicate_db: 15
    };

    const dummyDuplicates = [
      { id: 2, category: "Desktops" },
      { id: 3, category: "Printers" },
      { id: 4, category: "Printers" },
      { id: 5, category: "Printers" },
      { id: 6, category: "Printers" },
      { id: 7, category: "Printers" },
      { id: 8, category: "Printers" },
      { id: 9, category: "Printers" },
      { id: 10, category: "Printers" },
      { id: 11, category: "Printers" },
      { id: 12, category: "Printers" },
      { id: 13, category: "Printers" },
      { id: 14, category: "Printers" }
    ];

    setImportResult(dummyImportResult);
    setDuplicateRecords(dummyDuplicates);
    setShowImportModal(true);

    toast.success("Dummy Import Completed");
  };

  const handleUpdateDuplicates = () => {
    toast.success("Duplicate records updated (Frontend)");
    setShowImportModal(false);
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
            <Header
              title="Asset Category Management"
              subtitle="AMS / Asset Categories"
            />

            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleAdd}>
                + Add Asset Category
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

          {/* TABLE */}
          <AssetCategoryTable
            assetCategories={assetCategories}
            assetFamilies={assetFamilies}
            deleteAssetCategory={handleDelete}
            editAssetCategory={handleEdit}
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
            <AssetCategoryForm
              data={selectedAssetCategory}
              add={handleSubmit}
              close={() => setOpenForm(false)}
              editMode={editMode}
              assetFamilies={assetFamilies}
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
                          Duplicate Records Found
                        </h6>

                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                          <table className="table table-bordered table-striped">
                            <thead
                              className="table-light"
                              style={{ position: "sticky", top: 0, zIndex: 1 }}
                            >
                              <tr>
                                <th>S.No</th>
                                <th>ID</th>
                                <th>Asset Category</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {duplicateRecords.map((row, index) => (
                                <tr key={row.id}>
                                  <td>{index + 1}</td>
                                  <td>{row.id}</td>
                                  <td>{row.category}</td>
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
                      onClick={handleUpdateDuplicates}
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

export default AssetCategory;
