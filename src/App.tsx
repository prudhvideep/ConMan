import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import PasswordReset from "./pages/PasswordReset";
import SignOut from "./pages/SignOut";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <Router>
      <div>
        <section>
          <Routes>
            <Route index element={<SignIn />}></Route>
            <Route path="/dashboard" element={<Dashboard />}></Route>
            <Route path="/signout" element={<SignOut />}></Route>
            <Route path="/signup" element={<SignUp />}></Route>
            <Route path="/passwordreset" element={<PasswordReset />}></Route>
          </Routes>
        </section>
      </div>
    </Router>
  );
}

export default App;
