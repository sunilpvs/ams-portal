import { useEffect, useState, useRef, useCallback } from "react";
import AssetGroupForm from "./AssetGroupsForm";
import AssetGroupTable from "./AssetGroupsTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import {
  addAssetGroup,
  deleteAssetGroup,
  editAssetGroup,
  getPaginatedAssetGroups,
} from "../../../services/ams/assetGroupService";

const AssetGroups = () => {
  const [assetGroups, setAssetGroups] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssetGroup, setSelectedAssetGroup] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  /* ---------------- FETCH ---------------- */
  const extractResponse = (response) => {
    const payload = response?.data;
    const data = payload?.asset_groups ?? payload;

    const list =
      data?.data ??
      data?.items ??
      data?.rows ??
      (Array.isArray(data) ? data : []);

    const total =
      payload?.total ??
      payload?.count ??
      payload?.totalCount ??
      data?.total ??
      data?.count ??
      (Array.isArray(list) ? list.length : 0);

    return { list, total };
  };

  const fetchAssetGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPaginatedAssetGroups(page, limit);
      const { list, total } = extractResponse(response);
      setAssetGroups(list);
      setTotalCount(total);
    } catch (error) {
      setAssetGroups([]);
      setTotalCount(0);
      toast.error(error?.response?.data?.error || "Failed to load asset groups");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchAssetGroups();
  }, [fetchAssetGroups]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteAssetGroup(id);
      toast.success("Asset Group deleted successfully");

      if (assetGroups.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchAssetGroups();
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete asset group");
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (formData) => {
    const payload = {
      group: formData.group,
    };

    try {
      if (editMode && formData.id) {
        await editAssetGroup(formData.id, payload);
        toast.success("Asset Group updated successfully");
      } else {
        await addAssetGroup(payload);
        toast.success("Asset Group added successfully");
      }

      setOpenForm(false);
      setSelectedAssetGroup(null);
      setEditMode(false);
      fetchAssetGroups();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to save asset group");
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (group) => {
    setSelectedAssetGroup({
      ...group,
      group: group.group ?? group.name ?? "",
    });
    setEditMode(true);
    setOpenForm(true);
  };

  /* ---------------- ADD ---------------- */
  const handleAdd = () => {
    setSelectedAssetGroup({ group: "" });
    setEditMode(false);
    setOpenForm(true);
  };

  /* ---------------- IMPORT ---------------- */
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const importedData = XLSX.utils.sheet_to_json(sheet);

      try {
        await Promise.all(
          importedData.map((item) =>
            addAssetGroup({
              group: item.group ?? item.name ?? "",
            })
          )
        );

        toast.success("Asset Groups imported successfully");
        fetchAssetGroups();
      } catch (error) {
        toast.error(error?.response?.data?.error || "Failed to import asset groups");
      } finally {
        e.target.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">

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

          <AssetGroupTable
            assetGroups={assetGroups}
            totalCount={totalCount}
            deleteAssetGroup={handleDelete}
            editAssetGroup={handleEdit}
            currentPage={page}
            itemsPerPage={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onSearch={setSearchTerm}
            searchTerm={searchTerm}
            loading={loading}
          />

          {openForm && (
            <AssetGroupForm
              data={selectedAssetGroup}
              add={handleSubmit}
              close={() => setOpenForm(false)}
              editMode={editMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetGroups;
