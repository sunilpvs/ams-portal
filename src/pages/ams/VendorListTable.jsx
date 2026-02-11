import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { blockVendor, suspendVendor, activateVendor } from "../../services/vms/vendorService";
import { reinitiateVendor } from "../../services/vms/rfqReviewService";

// Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReplayIcon from "@mui/icons-material/Replay";
import EditIcon from "@mui/icons-material/Edit";

// MUI Components
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

function VendorListTable({
  vendors,
  currentPage,
  itemsPerPage,
  onPageChange,
  onLimitChange,
  onSearch,
  searchTerm,
  onRefresh,
}) {
  const theme = useTheme();
  const navigate = useNavigate();

  // Re-initiate modal state
   const [selectedEntity, setSelectedEntity] = useState("");
  const [openReinitiateModal, setOpenReinitiateModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Edit modal state
  const [openEditModal, setOpenEditModal] = useState(false);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

   const entityOptions = [
  ...new Set(
    Array.isArray(vendors)
      ? vendors.map((v) => v.entity_name).filter(Boolean)
      : []
  ),
];

const filteredVendors = Array.isArray(vendors)
  ? vendors.filter((vendor) => {
      const searchText = `
        ${vendor.reference_id ?? ""}
        ${vendor.vendor_code ?? ""}
        ${vendor.contact_person_name ?? ""}
        ${vendor.contact_person_mobile ?? ""}
        ${vendor.entity_name ?? ""}
        ${vendor.expiry_date ?? ""}
        ${vendor.status ?? ""}
      `.toLowerCase();

      const matchesSearch = searchText.includes(
        searchTerm.toLowerCase()
      );

      const matchesEntity =
        selectedEntity === "" ||
        vendor.entity_name === selectedEntity;

      return matchesSearch && matchesEntity;
    })
  : [];




  // Pagination
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = filteredVendors.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

  /* ================= Re-initiate ================= */

  const handleReinitiateClick = (vendor) => {
    // console the difference in days
    console.log("Days to expiry:", (new Date(vendor.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    setSelectedVendor(vendor); 
    setOpenReinitiateModal(true);
  };

  const handleReinitiateSubmit = async () => {
    console.log("Re-initiated vendor:", selectedVendor);
    try{
      await reinitiateVendor(selectedVendor.vendor_code, {});
      toast.success("Vendor re-initiated successfully");
    }
    catch(err){
      console.error("Re-initiate failed", err);
      toast.error(err?.response?.data?.error || "Failed to re-initiate vendor");
    }

    setOpenReinitiateModal(false);
    await onRefresh(currentPage, itemsPerPage);
  };


  /* ================= Edit ================= */

  // Allowed actions per current status, per business rules
  const getStatusOptions = (currentStatus) => {
    const s = (currentStatus || "").toLowerCase();
    switch (s) {
      case "active":
        // Only approved or expired vendors can be suspended; approved can be blocked
        return ["Block", "Suspend"];
      case "blocked":
        // Only blocked vendors can be activated
        return ["Activate"];
      case "suspended":
        // Suspended can be blocked or activated
        return ["Block", "Activate"];
      case "expired":
        // Expired can be blocked or suspended; cannot be activated
        return ["Block", "Suspend"];
      default:
        return ["Block", "Suspend", "Activate"];
    }
  };

  const handleEditClick = (vendor) => {
    setSelectedVendor(vendor);
    setStatus(""); // force user to choose new status
    setOpenEditModal(true);
  };
  const handleEditSubmit = async () => {
    if (!selectedVendor || !status) return;
    const vendorCode = selectedVendor.vendor_code;

    try {
      setIsSubmitting(true);
      let action = status.toLowerCase();
      // call respective service
      if (action === "block") {
        await blockVendor(vendorCode);
        toast.success("Vendor blocked successfully");

      } else if (action === "suspend") {
        await suspendVendor(vendorCode);
        toast.success("Vendor suspended successfully");

      } else if (action === "activate") {
        await activateVendor(vendorCode);
        toast.success("Vendor activated successfully");
        
      } else {
        toast.error("Invalid action selected");
        return;
      }

      // Refresh list
      await onRefresh(currentPage, itemsPerPage);
      setOpenEditModal(false);
    } catch (err) {
      console.error("Status update failed", err);
      toast.error(err?.response?.data?.error || "Failed to update vendor status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box m="20px">
      <Header title="Vendors List" subtitle="Final Vendors List" />

      <div className="container mt-4 p-3 bg-white rounded shadow-sm">
        {/* Search & Limit */}
       <div className="d-flex flex-wrap gap-2 mb-3">
          <input
            type="text"
            placeholder="Search..."
            className="form-control"
            style={{ maxWidth: 300 }}
            value={searchTerm}
            onChange={(e) => {
              onSearch(e.target.value);
              onPageChange(1);
            }}
          />

          <select
            className="form-select"
            style={{ maxWidth: 250 }}
            value={selectedEntity}
            onChange={(e) => {
              setSelectedEntity(e.target.value);
              onPageChange(1);
            }}
          >
            <option value="">All Entities</option>
            {entityOptions.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ maxWidth: 150 }}
            value={itemsPerPage}
            onChange={(e) => {
              onLimitChange(Number(e.target.value));
              onPageChange(1);
            }}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>Active RFQ ID</th>
                <th>Vendor Code</th>
                <th>Entity</th>
                <th>Contact Name</th>
                <th>Contact Person Mobile</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedVendors.length === 0 ? (
                <tr>
                  <td colSpan="7">No records found</td>
                </tr>
              ) : (
                paginatedVendors.map((data) => (
                  <tr key={data.id}>
                    <td>{data.reference_id ? data.reference_id : "N/A"}</td>
                    <td>{data.vendor_code || "N/A"}</td>
                    <td>{data.entity_name}</td>
                    <td>{data.contact_person_name}</td>
                    <td>{data.contact_person_mobile}</td>
                    <td>{data.expiry_date ? new Date(data.expiry_date).toLocaleDateString('en-GB') : "N/A"}</td>
                    <td>{data.status}</td>
                    <td>
                      {/* View */}
                      <Tooltip title="View">
                        <IconButton
                          color="primary"
                          size="small"
                         onClick={() => {
                           navigate(`/vendor-rfqs/${encodeURIComponent(data.vendor_code)}`);
                         }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>

                      {/* Re-initiate only show after approval and before 60 days of expiry date */}
                      {(data.status_id === 11 &&
                        (new Date(data.expiry_date) - new Date()) / (1000 * 60 * 60 * 24) <= 60) && (
                        <Tooltip title="Re-initiate">
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => handleReinitiateClick(data)}
                          > 
                            <ReplayIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {/* Edit */}
                      <Tooltip title="Edit Status">
                        <IconButton
                          color="secondary"
                          size="small"
                          onClick={() => handleEditClick(data)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-3 text-end">
          <button
            className="btn btn-sm btn-outline-secondary me-1"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm me-1 ${currentPage === i + 1
                ? "btn-primary"
                : "btn-outline-secondary"
                }`}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <Dialog
        open={openReinitiateModal}
        onClose={() => setOpenReinitiateModal(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#ffffff",
            borderRadius: 2,
            padding: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: "#000", fontWeight: 700, fontSize: "25px" }}>
          Confirm Re-initiate
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ color: "#000", mb: 1, }}>
            Are you sure you want to re-initiate{" "}
            <strong>{selectedVendor?.entity_name}</strong>?
          </Typography>

          {/* Warning text */}
          <Typography sx={{ color: "red", fontSize: "16px" }}>
            Once submitted, this action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpenReinitiateModal(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"

            onClick={handleReinitiateSubmit}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#ffffff",
            borderRadius: 2,
            padding: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: "#000", fontWeight: 600, fontSize: "24px" }}>
          Edit Vendor Status
        </DialogTitle>

        <DialogContent sx={{ minWidth: 320 }}>
          <Typography sx={{ color: "#000", mb: 1, fontSize: "16px" }}>
            Current Status:{" "}
            <strong>{selectedVendor?.status}</strong>
          </Typography>

          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ color: "#000" }}>
              Select New Status
            </InputLabel>

            <Select
              value={status}
              label="Select New Status"
              // sx={{ color: "#000" }}
              onChange={(e) => setStatus(e.target.value)}
              sx={{
                color: "#000",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#000",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#000",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#000",
                },
              }}
            >
              {getStatusOptions(selectedVendor?.status).map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={!status}
            onClick={handleEditSubmit}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

VendorListTable.propTypes = {
  Rfqs: PropTypes.array.isRequired,
   vendors: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default VendorListTable;
