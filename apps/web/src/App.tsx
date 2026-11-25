import React, { useState } from "react";

type Page = "home" | "plugins" | "pluginId" | "login" | "register" | "favorites";

const App: React.FC = () => {
  const [page, setPage] = useState<Page>("home");

  return (
    <div style={{ fontFamily: "system-ui", padding: "1rem" }}>
      <nav>
        <button onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("plugins")}>Plugins</button>
        <button onClick={() => setPage("favorites")}>Favorites</button>
        <button onClick={() => setPage("login")}>Login</button>
        <button onClick={() => setPage("register")}>Register</button>
      </nav>

      <main>
        {page === "home" && <Home setPage={setPage} />}
        {page === "plugins" && <PluginsList />}
        {page === "pluginId" && <PluginDetail />}
        {page === "login" && <LoginForm setPage={setPage} />}
        {page === "register" && <RegisterForm setPage={setPage} />}
        {page === "favorites" && <FavoritesList />}
      </main>
    </div>
  );
};

const Home: React.FC<{ setPage: (p: Page) => void }> = ({ setPage }) => (
  <div>
    <h1>Welcome to Idea Market Plugin</h1>
    <p>Explore our catalog of JetBrains plugins.</p>
    <button onClick={() => setPage("plugins")}>Browse Plugins</button>
  </div>
);

const PluginsList: React.FC = () => (
  <div>
    <h2>Plugins List</h2>
    <p>Loading...</p>
  </div>
);

const PluginDetail: React.FC = () => (
  <div>
    <h2>Plugin Detail</h2>
    <p>Loading...</p>
  </div>
);

const LoginForm: React.FC<{ setPage: (p: Page) => void }> = ({ setPage }) => (
  <div>
    <h2>Login</h2>
    <input placeholder="Email" />
    <br />
    <input type="password" placeholder="Password" />
    <br />
    <button onClick={() => alert("Login clicked")}>Log In</button>
    <br />
    <button onClick={() => setPage("register")}>Create Account</button>
  </div>
);

const RegisterForm: React.FC<{ setPage: (p: Page) => void }> = ({ setPage }) => (
  <div>
    <h2>Register</h2>
    <input placeholder="Email" />
    <br />
    <input type="password" placeholder="Password (min 8 chars)" />
    <br />
    <button onClick={() => alert("Register clicked")}>Create Account</button>
    <br />
    <button onClick={() => setPage("login")}>Back to Login</button>
  </div>
);

const FavoritesList: React.FC = () => (
  <div>
    <h2>Favorites</h2>
    <p>Your favorite plugins will appear here.</p>
  </div>
);

export default App;
