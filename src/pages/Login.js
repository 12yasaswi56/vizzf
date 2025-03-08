import { useState } from "react";
import { loginUser } from "../services/api";
import { CometChat } from "@cometchat-pro/chat";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await loginUser({ email, password });

    // Login to CometChat
    CometChat.login(res.data.user.cometchatUID, COMETCHAT_CONFIG.AUTH_KEY)

      .then(() => {
        setUser(res.data.user);
        localStorage.setItem("token", res.data.token);
      })
      .catch((error) => console.log("CometChat Login Failed:", error));
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
