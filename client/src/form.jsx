import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./userContext";

export default function RegisterAndLoginForm() {
    const [username, setUserName] = useState('');
    const [password, setPassWord] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('Register');
    const {setUserName:setLoggedInUsername, setId} = useContext(UserContext);
    async function handleSubmit(ev) {
        ev.preventDefault();
        const url = isLoginOrRegister === "Register" ? "Register" : "Login";
        const {data} = await axios.post(url, {username, password});
        setLoggedInUsername(username);
        setId(data.id);
    }
    return (
        <div className="bg-purple-100 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <input value={username} 
                       onChange={ev => setUserName(ev.target.value)} 
                       type="text" 
                       placeholder="username" 
                       className="block w-full rounded-md p-2 mb-2 border" />
                <input value={password}
                       onChange={ev => setPassWord(ev.target.value)} 
                       type="password" 
                       placeholder="password" 
                       className="block w-full rounded-md p-2 mb-2 border" />
                <button className="bg-purple-700 text-white block w-full rounded-md p-2">{isLoginOrRegister === "Register" ? "Register" : "Login"}</button>
                <div className="text-center mt-2">
                {isLoginOrRegister === "Register" && (
                       <div>
                            Already a friend? 
                            <button onClick={() => setIsLoginOrRegister("Login")}>
                                Login
                            </button>
                       </div> 
                        )}
                        {isLoginOrRegister === "Login" && (
                            <div>
                            Dont have an account?
                            <button onClick={() => setIsLoginOrRegister("Register")}>
                                Register
                            </button>
                       </div> 
                        )}
                    </div>
            </form>
        </div>
    )
}