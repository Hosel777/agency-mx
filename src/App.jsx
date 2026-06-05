import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import NewRequest from './pages/NewRequest'
import RequestDetail from './pages/RequestDetail'
import Agents from './pages/Agents'
import Approvals from './pages/Approvals'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/nueva-solicitud" element={<NewRequest />} />
        <Route path="/solicitud/:id" element={<RequestDetail />} />
        <Route path="/agentes" element={<Agents />} />
        <Route path="/aprobaciones" element={<Approvals />} />
        <Route path="/configuracion" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
