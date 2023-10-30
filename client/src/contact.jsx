import Avatar from "./avatar";

export default function Contact({id,onClick,username,selected,online}) {
    return(
        <div key={id} onClick={() => onClick(id)} className={"border-b border-gray-100 flex items-center gap-2 cursor-pointer "+(selected ? "bg-purple-100" : "")}>
            {selected && (
                <div className="w-1 bg-purple-500 h-12 rounded-r-md"></div>
            )}
                <div className="flex gap-2 py-2 pl-4 items-center">
                    <Avatar username={username} userId={id} online={online} />
                    <span className="text-gray-500">{username}</span>
                </div>
            </div>
    )
}