import { createContext, useEffect, useContext }from "react";
import { useFetch } from "./hooks/useFetch";
import { getCurrentUser } from "./db/apiAuth";

const UrlContext = createContext()

const UrlProvider = ({children}) =>{
    const{data:user, loading, fn:fetchUser} = useFetch(getCurrentUser)

    const isAuthenticated = user?.role === "authenticated";

    useEffect(()=>{
        fetchUser();
    },[])
    return <UrlContext.Provider value={{user, fetchUser, isAuthenticated, loading}}>
        {children}
    </UrlContext.Provider>
}

export const urlState = ()=>{
    return useContext(UrlContext)
}

export default UrlProvider;

