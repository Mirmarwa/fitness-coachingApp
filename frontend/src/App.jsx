import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Coaches from "./pages/Coaches";
import Programs from "./pages/Programs";
import ProgramDetail from "./pages/ProgramDetail";
import Dashboard from "./pages/Dashboard";



function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/programmes" element={<Programs />} />
          <Route path="/program/:id" element={<ProgramDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

const styles = {
  main: {
    minHeight: "80vh",
    padding: 0,
  },
};

export default App;
