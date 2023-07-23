import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { TokenResponse } from "../../src/types/tokens";
import { googleLoginSchema } from "../../src/types/google";
import { LoginGoogle } from "../../src/types/login";
import { login } from "./get-access-token";

const useGoogleAccessToken = (): UseMutationResult<
    TokenResponse,
    unknown,
    { code: string },
    unknown
> => {
    const mutation = useMutation<TokenResponse, unknown, { code: string }>({
        mutationFn: async (params) => {
            const loginGoogle: LoginGoogle = {
                type: "google",
                code: params.code,
            };
            return login(loginGoogle);
        },
        onSuccess(data) {
            console.log(data);
            console.log("SUCCESS");
        },
        onError(error) {
            console.log(error);
            console.log("ERROR");
        },
    });
    return mutation;
};

const GoogleButton: React.FC = () => {
    const mutation = useGoogleAccessToken();
    const handleSuccess = (codeResponse: unknown): void => {
        console.log(codeResponse);
        const loginValidation = googleLoginSchema.safeParse(codeResponse);
        if (loginValidation.success) {
            mutation.mutate({
                code: loginValidation.data.code,
            });
        } else {
            console.log(loginValidation.error);
        }
    };
    const login = useGoogleLogin({
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSuccess: handleSuccess,
        onError: (error) => console.log("Login Failed:", error),
        flow: "auth-code",
    });

    return (
        <button disabled={mutation.isLoading} onClick={() => login()}>
            Login with Google
        </button>
    );
};

export default GoogleButton;
