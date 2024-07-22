import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Read from "./components/Read";
import Write from "./components/Write";
import Single from "./components/Single";
import UserManagement from "./components/UserManagement";
import Home from "./components/Home";
import Layout from "./components/Layout";
import Spielwiese from "./pages/spielwiese/Spielwiese";

const basename = process.env.REACT_APP_BASENAME || "/";

function App() {
  return (
    <Router basename={basename}>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="read" element={<Read />} />
            <Route path="single/:firebaseId" element={<Single />} />
            <Route path="write" element={<Write />} />
            <Route path="edit/:firebaseId" element={<Write />} />
            <Route path="user" element={<UserManagement />} />
            <Route path="spielwiese" element={<Spielwiese />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
