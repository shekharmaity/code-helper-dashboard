// App.jsx
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import MocksList from "./pages/MockList";
import CreateMock from "./pages/CreateMock";
import EditMock from "./pages/EditMock";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MocksList />} />
        <Route path="create" element={<CreateMock />} />
        <Route path="edit/:id" element={<EditMock />} />
      </Route>
    </Routes>
  );
}
