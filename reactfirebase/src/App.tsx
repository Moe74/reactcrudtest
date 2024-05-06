// https://github.com/abdulhakim-altunkaya/youtube_react_firebase_database/blob/main/connection_guide.txt

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Read from "./components/Read";
import Write from "./components/Write";
import Single from "./components/Single";
import UserManagement from "./components/UserManagement";
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/fluent-light/theme.css";
import 'primeicons/primeicons.css';

function App() {
  return (
    <PrimeReactProvider >
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Read />} />
            <Route path="/single/:firebaseId" element={<Single />} />
            <Route path="/write" element={<Write />} />
            <Route path="/edit/:firebaseId" element={<Write />} />
            <Route path="/user" element={<UserManagement />} />
          </Routes>
        </Router>
      </div>
    </PrimeReactProvider >
  );
}

export default App;
