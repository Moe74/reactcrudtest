// https://github.com/abdulhakim-altunkaya/youtube_react_firebase_database/blob/main/connection_guide.txt

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Write from "./components/Write";
import Read from "./components/Read";

function App() {
  return (
    <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Read/>} />
            <Route path="/write" element={<Write/>} />
          </Routes>
        </Router>
    </div>
  );
}

export default App;
