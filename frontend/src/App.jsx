import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ChatBot from "./components/ChatBot";
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

  // Se não houver usuário, renderiza o Login
  if (!usuario) {
    // 3. AGORA A PROP "onLogin" BATE COM O LOGIN.JSX
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-black text-white selection:bg-yellow-500/30">
      <Sidebar 
        usuario={usuario}
        setTelaAtiva={setTelaAtiva} 
        telaAtiva={telaAtiva} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Dashboard 
          usuario={usuario}
          telaAtiva={telaAtiva} 
          setTelaAtiva={setTelaAtiva} 
        />
      </main>

      <ChatBot />
    </div>
  );
}

export default App;