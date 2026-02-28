import { useCallback, useEffect, useRef, useState } from "react";
import AssetFamiliesForm from "./AssetFamilesForm";
import AssetFamiliesTable from "./AssetFamiliesTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";
import {
  addAssetFamily,
  deleteAssetFamily,
  editAssetFamily,
  getPaginatedAssetFamilies,
} from "../../../services/ams/assetFamilyService";

const AssetFamilies = () => {
  const [assetFamilies, setAssetFamilies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssetFamily, setSelectedAssetFamily] = useState(null);

  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  const fileInputRef = useRef(null);

  const extractAssetFamiliesFromResponse = (response) => {
    const payload = response?.data?.asset_families;

    // list of asset families
    const list = (Array.isArray(payload) ? payload : []);

    // get total count from response, fallback to list length if not provided
    const total = response?.data?.total ?? (Array.isArray(list) ? list.length : 0);

    return {
      list: Array.isArray(list) ? list : [],
      total: Number.isFinite(Number(total)) ? Number(total) : 0,
    };
  };

  const fetchAssetFamilies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPaginatedAssetFamilies(currentPage, itemsPerPage);
      const { list, total } = extractAssetFamiliesFromResponse(response);
      setAssetFamilies(list);
      setTotalCount(total);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch asset families");
      setAssetFamilies([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchAssetFamilies();
  }, [fetchAssetFamilies]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteAssetFamily(id);
      toast.success("Deleted Successfully");

      if (assetFamilies.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
        return;
      }

      fetchAssetFamilies();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete asset family");
    }
  };

  /* ---------------- ADD / EDIT ---------------- */
  const handleSubmit = async (formData) => {
    const payload = {
      family: (formData?.family || "").trim(),
    };

    if (!payload.family) {
      toast.error("Asset family is required");
      return;
    }

    try {
      if (editMode && formData?.id) {
        await editAssetFamily(formData.id, payload);
        toast.success("Updated Successfully");
      } else {
        await addAssetFamily(payload);
        toast.success("Added Successfully");
      }

      setOpenForm(false);
      setEditMode(false);
      setSelectedAssetFamily(null);
      fetchAssetFamilies();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to save asset family");
    }
  };

  const handleEdit = (family) => {
    setSelectedAssetFamily(family);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setSelectedAssetFamily({ family: "" });
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
      { id: 2, family: "Desktops" },
      { id: 3, family: "Printers" },
      { id: 4, family: "Printers" },
      { id: 5, family: "Printers" },
      { id: 6, family: "Printers" },
      { id: 7, family: "Printers" },
      { id: 8, family: "Printers" },
      { id: 9, family: "Printers" },
      { id: 10, family: "Printers" },
      { id: 11, family: "Printers" },
      { id: 12, family: "Printers" },
      { id: 13, family: "Printers" },
      { id: 14, family: "Printers" }
    ];

    setImportResult(dummyImportResult);
    setDuplicateRecords(dummyDuplicates);
    setShowImportModal(true);

    toast.success("Dummy Import Completed");
  };

  /* ---------------- UPDATE DUPLICATES ---------------- */
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
              title="Asset Family Management"
              subtitle="AMS / Asset Families"
            />

            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleAdd}>
                + Add Asset Family
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
          <AssetFamiliesTable
            families={assetFamilies}
            deleteFamily={handleDelete}
            editFamily={handleEdit}
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
            <AssetFamiliesForm
              data={selectedAssetFamily}
              add={handleSubmit}
              close={() => setOpenForm(false)}
              editMode={editMode}
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

                        {/* SCROLLABLE TABLE */}
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                          <table className="table table-bordered table-striped">
                            <thead
                              className="table-light"
                              style={{ position: "sticky", top: 0, zIndex: 1 }}
                            >
                              <tr>
                                <th>S.No</th>
                                <th>ID</th>
                                <th>Family</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {duplicateRecords.map((row, index) => (
                                <tr key={row.id}>
                                  <td>{index + 1}</td>
                                  <td>{row.id}</td>
                                  <td>{row.family}</td>
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

export default AssetFamilies;
