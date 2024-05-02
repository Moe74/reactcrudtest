import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    return (
        <div style={{ background: "rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.3)" }}>
            <button onClick={() => navigate("/")} className='btn'>Read</button>
            <button onClick={() => navigate("/write")} className='btn'>Write</button>
        </div>
    );
}
export default Header;