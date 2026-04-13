export default function Login({ onSelectRole }) {
  return (
    <section>
      <p>Connect with MetaMask and choose your role.</p>
      <button onClick={() => onSelectRole('patient')}>Patient</button>
      <button onClick={() => onSelectRole('doctor')}>Doctor</button>
    </section>
  );
}
