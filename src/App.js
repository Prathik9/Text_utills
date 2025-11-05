import "./App.css";
import Navbar from "./components/Navbar";
import TextForm from "./components/TextForm";
import Alert from "./components/Alert";
import About from "./components/About";
import Game2048 from "./Pages/2048";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Link --- IGNORE ---
} from "react-router-dom";  


import { useState } from "react";
// import Game2048 from "./Pages/2048";

function App() {
  const [mode, setMode] = useState("light");
  const [alert, setAlert] = useState(null); 

  const showAlert=(message,type)=>{
    setAlert({
      msg: message,
      type: type
    })
    setTimeout(() => {
      setAlert(null);
    }, 1500);
  }



  const toggleMode = () => {
    if (mode === "light") {
      setMode("dark");
      document.body.style.backgroundColor = "#042743";
      showAlert("Dark mode has been enabled","success");
    } else {
      setMode("light");
      document.body.style.backgroundColor = "white";
      showAlert("Loght mode has been enabled","success");
    }
  };

  return (
    <>
    <Router>
      <Navbar title="Textutils" aboutText="About" mode={mode} toggleMode={toggleMode}/>
      <Alert alert={alert} />
      <div className="container my-3">
      <Routes>
          <Route exact path="/about" element={<About />} > </Route>
          <Route exact path="/" element={<TextForm showAlert={showAlert} heading="Enter text to analyze" mode={mode}/>}></Route>
          {/* <Route><Game2048 /></Route> */}

        </Routes>
        
              </div>
              </Router>
      
      
    </>
  );
}

export default App;
