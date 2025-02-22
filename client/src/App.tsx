import { useState, useEffect } from "react";
// @ts-ignore
declare global {
  interface Window {
    ReplitAuth?: any;
  }
}

interface ReplitUser {
  name: string;
  username: string;
  image: string;
}

function App() {
  const [user, setUser] = useState<ReplitUser | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ReplitAuth) {
      window.ReplitAuth.onAuth((authUser: ReplitUser) => {
        setUser(authUser);
      });
    }
  }, []);

  const login = () => {
    if (window.ReplitAuth) {
      window.ReplitAuth.login();
    }
  };

  const logout = () => {
    if (window.ReplitAuth) {
      window.ReplitAuth.logout();
      setUser(null);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Replit Auth Test</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <p>Username: {user.username}</p>
          <img src={user.image} alt="User avatar" style={{ borderRadius: "50%" }} />
          <br />
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={login}>Login with Replit</button>
      )}
    </div>
  );
}

export default App;
