import { useEffect, useState, useRef } from "react";
import AssetTypeForm from "./AssetTypeForm";
import AssetTypeTable from "./AssetTypeTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";

const AssetType = () => {

  const [assetTypes, setAssetTypes] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState(null);

  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  const fileInputRef = useRef(null);

  /* ---------------- DUMMY DATA ---------------- */
  useEffect(() => {
    const dummyData = [
      { id: 1, type: "Laptops" },
      { id: 2, type: "Desktops" },
      { id: 3, type: "Printers" },
      { id: 4, type: "Monitors" },
      { id: 5, type: "Networking Devices" }
    ];
    setAssetTypes(dummyData);
  }, []);

  /* ---------------- DELETE ---------------- */
  const handleDelete = (id) => {
    setAssetTypes(prev => prev.filter(t => t.id !== id));
    toast.success("Deleted Successfully");
  };

  /* ---------------- ADD / EDIT ---------------- */
  const handleSubmit = (formData) => {

    if (editMode) {
      setAssetTypes(prev =>
        prev.map(t =>
          t.id === formData.id ? { ...t, type: formData.type } : t
        )
      );
      toast.success("Updated Successfully");
    } else {
      setAssetTypes(prev => [
        ...prev,
        { id: prev.length + 1, type: formData.type }
      ]);
      toast.success("Added Successfully");
    }

    setOpenForm(false);
    setEditMode(false);
    setSelectedAssetType(null);
  };

  const handleEdit = (item) => {
    setSelectedAssetType(item);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setSelectedAssetType({ type: "" });
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
      { id: 2, type: "Desktops" },
      { id: 3, type: "Printers" },
      { id: 4, type: "Printers" },
      { id: 5, type: "Printers" },
      { id: 6, type: "Printers" },
      { id: 7, type: "Printers" },
      { id: 8, type: "Printers" },
      { id: 9, type: "Printers" },
      { id: 10, type: "Printers" },
      { id: 11, type: "Printers" },
      { id: 12, type: "Printers" },
      { id: 13, type: "Printers" },
      { id: 14, type: "Printers" }
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
              title="Asset Type Management"
              subtitle="Admin / Asset Types"
            />

            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleAdd}>
                + Add Asset Type
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
          <AssetTypeTable
            assetTypes={assetTypes}
            deleteAssetType={handleDelete}
            editAssetType={handleEdit}
            currentPage={1}
            itemsPerPage={10}
            onPageChange={() => {}}
            onLimitChange={() => {}}
            onSearch={() => {}}
            searchTerm=""
            loading={false}
            totalCount={assetTypes.length}
          />

          {/* FORM */}
          {openForm && (
            <AssetTypeForm
              data={selectedAssetType}
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

                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                          <table className="table table-bordered table-striped">
                            <thead
                              className="table-light"
                              style={{ position: "sticky", top: 0, zIndex: 1 }}
                            >
                              <tr>
                                <th>S.No</th>
                                <th>ID</th>
                                <th>Asset Type</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {duplicateRecords.map((row, index) => (
                                <tr key={row.id}>
                                  <td>{index + 1}</td>
                                  <td>{row.id}</td>
                                  <td>{row.type}</td>
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

export default AssetType;
