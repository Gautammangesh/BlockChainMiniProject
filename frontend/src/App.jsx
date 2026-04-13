import { useState } from 'react';
import Login from './components/Login';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';

function App() {
  const [role, setRole] = useState(null);

  return (
    <div className="app-container">
      <header>
        <h1>Medical Records DApp</h1>
      </header>
      <main>
        {!role && <Login onSelectRole={setRole} />}
        {role === 'patient' && <PatientDashboard />}
        {role === 'doctor' && <DoctorDashboard />}
      </main>
    </div>
  );
}

export default App;
