import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage.jsx";
import SkinUpload from "./components/sections/SkinAnalysis/SkinUpload.jsx";
import SkinPage from "./pages/SkinPage/SkinPage.jsx";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/skin-upload" element={<SkinUpload />} />
        <Route path="/skin-page" element={<SkinPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
