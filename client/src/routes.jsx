import { useContext } from "react";
import Form from "./form";
import { UserContext } from "./userContext";
import Chat from "./chat";

export default function Routes() {
    const {username, id} = useContext(UserContext);
    if(username) {
        return <Chat />
    }
    return (
        <Form />
    )
}