import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const company = localStorage.getItem("company");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getCompanyName = (code) => {
    switch (code) {
      case "vel":
        return "Vel Gravure";
      case "bharath":
        return "Bharath Enterprises";
      case "shree_ganaapathy":
        return "Shree Ganaapathy Roto Prints";
      default:
        return code;
    }
  };

  return (
    <div className="sp-navbar">
      <div className="flex items-center gap-3">
        <h2>💊 Smart Pharma</h2>
        {company && (
          <span className="company-badge">{getCompanyName(company)}</span>
        )}
      </div>

      <div className="nav-actions">
        {!token ? (
          <>
            <Link to="/login">
              <button className="sp-btn sp-btn-nav-solid sp-btn-sm">Login</button>
            </Link>
            <Link to="/signup">
              <button className="sp-btn sp-btn-nav sp-btn-sm">Sign Up</button>
            </Link>
          </>
        ) : (
          <button onClick={logout} className="sp-btn sp-btn-nav-danger sp-btn-sm">
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;
