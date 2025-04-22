import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <h1>Welcome to OpenHouse</h1>
            <button onClick={() => navigate('/login')}>Login</button>
        </div>
    );
}
