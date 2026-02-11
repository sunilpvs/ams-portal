import { Box } from "@mui/material";
import Header from "../../components/Header";
import ReInitiatedForm from "./ReInitiateVendorForm";

const ReInitiateVendorPage = () => {
  const handleSubmit = (data) => {
    console.log("Re-Initiate Payload:", data);
  };

  return (
    <Box m="50px">
      <Header
        title="Re-Initiate Vendor"
        subtitle="Vendor / Re-Initiation"
      />

      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <ReInitiatedForm onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </Box>
    
  );
};

export default ReInitiateVendorPage;
