import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import Header from "./components/Header";
import Home from "./components/Home";
import Health from "./components/Health";
import Emergency from "./components/Emergency";
import Shopping from "./components/Shopping";
import Wellbeing from "./components/Wellbeing";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
          <Header />

          <div className="pt-24">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/health" element={<Health />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/shopping" element={<Shopping />} />
              <Route path="/wellbeing" element={<Wellbeing />} />
            </Routes>

            <footer className="text-center text-xs text-gray-400 py-6">
              MomCare LK — CCS2313 Mini Project Demo · Group 05
            </footer>
          </div>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
