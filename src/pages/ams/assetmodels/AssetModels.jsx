import { useEffect, useState, useRef } from "react";
import AssetModelForm from "./AssetModelsForm";
import AssetModelTable from "./AssetModelsTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";

const AssetModels = () => {

  const [models, setModels] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  const fileInputRef = useRef(null);

  /* ---------------- DUMMY DATA ---------------- */
  useEffect(() => {
    const dummyData = [
      { id: 1, model_name: "Dell Latitude 5420" },
      { id: 2, model_name: "HP EliteBook 840" },
      { id: 3, model_name: "Canon LBP 2900" },
      { id: 4, model_name: "Cisco Catalyst 2960" }
    ];
    setModels(dummyData);
  }, []);

  /* ---------------- DELETE ---------------- */
  const handleDeleteModel = (id) => {
    setModels(prev => prev.filter(m => m.id !== id));
    toast.success("Deleted Successfully");
  };

  /* ---------------- ADD / EDIT ---------------- */
  const handleSubmitModel = (formData) => {

    if (editMode) {
      setModels(prev =>
        prev.map(m =>
          m.id === formData.id
            ? { ...m, model_name: formData.model_name }
            : m
        )
      );
      toast.success("Updated Successfully");
    } else {
      setModels(prev => [
        ...prev,
        { id: prev.length + 1, model_name: formData.model_name }
      ]);
      toast.success("Added Successfully");
    }

    setOpenForm(false);
    setEditMode(false);
    setSelectedModel(null);
  };

  const handleEditModel = (item) => {
    setSelectedModel(item);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleAddModel = () => {
    setSelectedModel({ model_name: "" });
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
              subtitle="Admin / Asset Models"
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
            deleteModel={handleDeleteModel}
            editModel={handleEditModel}
          />

          {/* FORM */}
          {openForm && (
            <AssetModelForm
              data={selectedModel}
              add={handleSubmitModel}
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