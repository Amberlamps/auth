import "./App.css";
import GoogleProvider from "./google-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <GoogleProvider />
        </QueryClientProvider>
    );
}

export default App;
