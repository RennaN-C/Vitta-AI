import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState("home");

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("vitta_user");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  const handleLogin = (dadosUsuario) => {
    setUsuario(dadosUsuario);
    localStorage.setItem("vitta_user", JSON.stringify(dadosUsuario));
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem("vitta_user");
    setTelaAtiva("home");
  };

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#0d1117] text-white">
      <Sidebar 
        usuario={usuario}
        setTelaAtiva={setTelaAtiva} 
        telaAtiva={telaAtiva} 
        onLogout={handleLogout} 
      />
      
      {}
      <Dashboard 
        usuario={usuario}
        telaAtiva={telaAtiva} 
        setTelaAtiva={setTelaAtiva} 
      />
    </div>
  );
}

export default App;