import { useCallback, useEffect, useRef, useState } from "react";
import BrandsForm from "./BrandsForm";
import BrandsTable from "./BrandsTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";
import {
  addAssetBrand,
  deleteAssetBrand,
  editAssetBrand,
  getPaginatedAssetBrands,
} from "../../../services/ams/assetBrandService";

const Brands = () => {
  const [allBrands, setAllBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  const fileInputRef = useRef(null);

  const extractBrandsFromResponse = (response) => {
    const payload = response?.data?.asset_brands;

    // list of brands
    const list = (Array.isArray(payload) ? payload : []);

    // get total count from response, fallback to list length if not provided
    const total = response?.data?.total ?? (Array.isArray(list) ? list.length : 0);

    return {
      list: Array.isArray(list) ? list : [],
      total: Number.isFinite(Number(total)) ? Number(total) : 0,
    };
  };

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPaginatedAssetBrands(currentPage, itemsPerPage);
      const { list, total } = extractBrandsFromResponse(response);
      setAllBrands(list);
      setTotalCount(total);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch brands");
      setAllBrands([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteAssetBrand(id);
      toast.success("Deleted Successfully");

      if (allBrands.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
        return;
      }

      fetchBrands();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete brand");
    }
  };

  /* ---------------- ADD / EDIT ---------------- */
  const handleSubmit = async (formData) => {
    const payload = {
      brand: (formData?.brand || "").trim(),
    };

    if (!payload.brand) {
      toast.error("Brand name is required");
      return;
    }

    try {
      if (editMode && formData?.id) {
        await editAssetBrand(formData.id, payload);
        toast.success("Updated Successfully");
      } else {
        await addAssetBrand(payload);
        toast.success("Added Successfully");
      }

      setOpenForm(false);
      setEditMode(false);
      setSelectedBrand(null);
      fetchBrands();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to save brand");
    }
  };

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setSelectedBrand({ brand: "" });
    setEditMode(false);
    setOpenForm(true);
  };

  /* ---------------- IMPORT (Dummy) ---------------- */
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = () => {

    const dummyImportResult = {
      total_rows: 15,
      inserted: 5,
      skipped_duplicate_db: 10
    };

    const dummyDuplicates = [
      { id: 2, brand: "HP" },
      { id: 3, brand: "LENOVO" },
      { id: 4, brand: "LENOVO" },
      { id: 5, brand: "LENOVO" },
      { id: 6, brand: "LENOVO" },
      { id: 7, brand: "LENOVO" },
      { id: 8, brand: "LENOVO" },
      { id: 9, brand: "LENOVO" },
      { id: 10, brand: "LENOVO" },
      { id: 11, brand: "LENOVO" },
      { id: 12, brand: "LENOVO" },
      { id: 13, brand: "LENOVO" },
      { id: 14, brand: "LENOVO" }
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
            <Header title="Brand Management" subtitle="Admin / Brands" />

            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleAdd}>
                + Add Brand
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

          {/* MAIN TABLE */}
          <BrandsTable
            brands={Array.isArray(allBrands) ? allBrands : []}
            deleteBrand={handleDelete}
            editBrand={handleEdit}
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
            <BrandsForm
              data={selectedBrand}
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
                        <h6 className="text-danger mt-3">Duplicate Records Found</h6>

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
                                <th>Brand</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {duplicateRecords.map((row, index) => (
                                <tr key={row.id}>
                                  <td>{index + 1}</td>
                                  <td>{row.id}</td>
                                  <td>{row.brand}</td>
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

export default Brands;
