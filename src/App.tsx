import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Layout />
                <Toaster position="top-right" />
            </Router>
        </ThemeProvider>
    );
}

export default App;
