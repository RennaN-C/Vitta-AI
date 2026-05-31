import { useState } from "react";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import ResetPassword from "./components/ResetPassword";
import Sidebar from "./components/Sidebar";
import api from "./api";

const carregarUsuario = () => {
  const salvo = localStorage.getItem("vitta_user");
  if (!salvo) return null;
  try {
    return JSON.parse(salvo);
  } catch {
    localStorage.removeItem("vitta_user");
    localStorage.removeItem("vitta_token");
    return null;
  }
};

function App() {
  const [usuario, setUsuario] = useState(carregarUsuario);
  const [telaAtiva, setTelaAtiva] = useState("home");

  if (window.location.pathname === "/resetar-senha") {
    return <ResetPassword />;
  }

  const handleLogin = (dadosUsuario, token) => {
    setUsuario(dadosUsuario);
    localStorage.setItem("vitta_user", JSON.stringify(dadosUsuario));
    localStorage.setItem("vitta_token", token);
  };

  const handleUserUpdate = (dadosUsuario) => {
    const atualizado = { ...usuario, ...dadosUsuario };
    setUsuario(atualizado);
    localStorage.setItem("vitta_user", JSON.stringify(atualizado));
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // A sessão local ainda precisa ser descartada se o servidor estiver offline.
    }
    setUsuario(null);
    localStorage.removeItem("vitta_user");
    localStorage.removeItem("vitta_token");
    setTelaAtiva("home");
  };

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#0d1117] text-white">
      <Sidebar telaAtiva={telaAtiva} setTelaAtiva={setTelaAtiva} onLogout={handleLogout} />
      <Dashboard
        usuario={usuario}
        telaAtiva={telaAtiva}
        setTelaAtiva={setTelaAtiva}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
}

export default App;
