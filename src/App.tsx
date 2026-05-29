import { BrowserRouter, Routes, Route } from "react-router-dom"
import NavBar from "./components/NavBar"
import Inicio from "./pages/Inicio"
import Perfil from "./pages/Perfil"
import Avalar from "./pages/Avalar"
import Registro from "./pages/Registro"

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-atmosphere" />
      <div className="bg-blob-center" />
      <div className="bg-grid" />
      <NavBar />
      <main className="sa-main">
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
