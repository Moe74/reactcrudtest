// https://github.com/abdulhakim-altunkaya/youtube_react_firebase_database/blob/main/connection_guide.txt

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Read from "./components/Read";
import Write from "./components/Write";
import Single from "./components/Single";
import UserManagement from "./components/UserManagement";
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/fluent-light/theme.css";
import 'primeicons/primeicons.css';
import Home from "./components/Home";
import Header from "./components/Header";
import Layout from "./components/Layout";

function App() {
  return (
    <PrimeReactProvider >
      <Header />
      <div className="App">
        <Router>
          <Routes>
            <Route element={<Layout />} path="/">
              <Route index element={<Home />} />
            </Route>
            <Route element={<Layout />} path="/read">
              <Route index element={<Read />} />
            </Route>
            <Route element={<Layout />} path="/single/:firebaseId">
              <Route index element={<Single />} />
            </Route>
            <Route element={<Layout />} path="/write">
              <Route index element={<Write />} />
            </Route>
            <Route element={<Layout />} path="/edit/:firebaseId">
              <Route index element={<Write />} />
            </Route>
            <Route element={<Layout />} path="/user">
              <Route index element={<UserManagement />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </PrimeReactProvider >
  );
}

export default App;
