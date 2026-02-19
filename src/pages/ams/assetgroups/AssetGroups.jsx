import { useEffect, useState, useRef } from "react";
import AssetGroupForm from "./AssetGroupsForm";
import AssetGroupTable from "./AssetGroupsTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";

const AssetGroups = () => {

  const [assetGroups, setAssetGroups] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssetGroup, setSelectedAssetGroup] = useState(null);

  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  const fileInputRef = useRef(null);

  /* ---------------- DUMMY DATA ---------------- */
  useEffect(() => {
    const dummyData = [
      { id: 1, group: "Laptops" },
      { id: 2, group: "Desktops" },
      { id: 3, group: "Printers" },
      { id: 4, group: "Monitors" },
      { id: 5, group: "Networking Devices" }
    ];
    setAssetGroups(dummyData);
  }, []);

  /* ---------------- DELETE ---------------- */
  const handleDelete = (id) => {
    setAssetGroups(prev => prev.filter(g => g.id !== id));
    toast.success("Deleted Successfully");
  };

  /* ---------------- ADD / EDIT ---------------- */
  const handleSubmit = (formData) => {

    if (editMode) {
      setAssetGroups(prev =>
        prev.map(g =>
          g.id === formData.id ? { ...g, group: formData.group } : g
        )
      );
      toast.success("Updated Successfully");
    } else {
      setAssetGroups(prev => [
        ...prev,
        { id: prev.length + 1, group: formData.group }
      ]);
      toast.success("Added Successfully");
    }

    setOpenForm(false);
    setEditMode(false);
    setSelectedAssetGroup(null);
  };

  const handleEdit = (group) => {
    setSelectedAssetGroup(group);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setSelectedAssetGroup({ group: "" });
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
      { id: 2, group: "Desktops" },
      { id: 3, group: "Printers" },
      { id: 4, group: "Printers" },
      { id: 5, group: "Printers" },
      { id: 6, group: "Printers" },
      { id: 7, group: "Printers" },
      { id: 8, group: "Printers" },
      { id: 9, group: "Printers" },
      { id: 10, group: "Printers" },
      { id: 11, group: "Printers" },
      { id: 12, group: "Printers" },
      { id: 13, group: "Printers" },
      { id: 14, group: "Printers" }
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
              title="Asset Group Management"
              subtitle="Admin / Asset Groups"
            />

            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleAdd}>
                + Add Asset Group
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
          <AssetGroupTable
            assetGroups={assetGroups}
            deleteAssetGroup={handleDelete}
            editAssetGroup={handleEdit}
            currentPage={1}
            itemsPerPage={10}
            onPageChange={() => {}}
            onLimitChange={() => {}}
            onSearch={() => {}}
            searchTerm=""
            loading={false}
            totalCount={assetGroups.length}
          />

          {/* FORM */}
          {openForm && (
            <AssetGroupForm
              data={selectedAssetGroup}
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
                                <th>Group</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {duplicateRecords.map((row, index) => (
                                <tr key={row.id}>
                                  <td>{index + 1}</td>
                                  <td>{row.id}</td>
                                  <td>{row.group}</td>
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

export default AssetGroups;
