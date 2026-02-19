import { useEffect, useState, useRef } from "react";
import BrandsForm from "./BrandsForm";
import BrandsTable from "./BrandsTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";

const Brands = () => {

  const [allBrands, setAllBrands] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  const fileInputRef = useRef(null);

  /* ---------------- DUMMY BRAND DATA ---------------- */
  useEffect(() => {
    const dummyData = [
      { id: 1, brand: "DELL" },
      { id: 2, brand: "HP" },
      { id: 3, brand: "LENOVO" },
      { id: 4, brand: "ASUS" },
      { id: 5, brand: "ACER" }
    ];
    setAllBrands(dummyData);
  }, []);

  /* ---------------- DELETE ---------------- */
  const handleDelete = (id) => {
    setAllBrands(prev => prev.filter(b => b.id !== id));
    toast.success("Deleted Successfully");
  };

  /* ---------------- ADD / EDIT ---------------- */
  const handleSubmit = (formData) => {

    if (editMode) {
      setAllBrands(prev =>
        prev.map(b =>
          b.id === formData.id ? { ...b, brand: formData.brand } : b
        )
      );
      toast.success("Updated Successfully");
    } else {
      setAllBrands(prev => [
        ...prev,
        { id: prev.length + 1, brand: formData.brand }
      ]);
      toast.success("Added Successfully");
    }

    setOpenForm(false);
    setEditMode(false);
    setSelectedBrand(null);
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
            currentPage={1}
            itemsPerPage={10}
            onPageChange={() => {}}
            onLimitChange={() => {}}
            onSearch={() => {}}
            searchTerm=""
            loading={false}
            totalCount={allBrands.length}
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
