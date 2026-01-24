const LoginForm = () => {
  // const subdomain = window.location.hostname.split(".")[0];

  const authURL = process.env.REACT_APP_API_BASE_URL + "auth/auth.php?portal=vms";

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card p-4 shadow d-flex justify-content-center align-items-center"
        style={{ width: "100%", maxWidth: "400px", borderRadius: "12px" }}
      >
        <h3 className="text-center mb-4">Welcome Back</h3>

        <a href={authURL} className="w-100 text-decoration-none">
          <button
            type="button"
            className="btn w-100 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: "#2F2F2F",
              color: "white",
              fontWeight: "500",
              padding: "10px",
              borderRadius: "8px",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#444")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#2F2F2F")
            }
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
              alt="Microsoft Logo"
              style={{ width: "20px", marginRight: "10px" }}
            />
            Sign in with Microsoft
          </button>
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
