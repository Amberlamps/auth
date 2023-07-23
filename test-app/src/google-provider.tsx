import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleButton from "./google-button";

const GoogleProvider: React.FC = () => {
    return (
        <div className="flex gap-4 flex-col">
            <GoogleOAuthProvider clientId="206876384048-72nmikrntdbfi1ebmvjd2607inm2gf8m.apps.googleusercontent.com">
                <GoogleButton />
            </GoogleOAuthProvider>
        </div>
    );
};

export default GoogleProvider;
