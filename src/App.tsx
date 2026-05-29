import { BrowserRouter, Routes, Route } from "react-router-dom"
import NavBar from "./components/NavBar"
import Inicio from "./pages/Inicio"
import Perfil from "./pages/Perfil"
import Avalar from "./pages/Avalar"
import Registro from "./pages/Registro"

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main style={{ padding: "2rem" }}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/perfil/:id" element={<Perfil />} />
          <Route path="/avalar" element={<Avalar />} />
          <Route path="/registro" element={<Registro />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
