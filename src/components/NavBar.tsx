import { NavLink } from "react-router-dom"

export default function NavBar() {
  return (
    <nav className="sa-nav">
      <NavLink to="/" className="nav-brand" end>
        SaltaDev<span className="brand-dot"> Trust</span>
      </NavLink>
      <div className="nav-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          Buscar
        </NavLink>
        <NavLink
          to="/avalar"
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          Avalar
        </NavLink>
        <NavLink
          to="/registro"
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          Registro
        </NavLink>
      </div>
    </nav>
  )
}
