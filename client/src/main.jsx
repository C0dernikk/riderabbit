import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { persistor, store } from "./app/store.js";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";
import { SocketProvider } from "./context/SocketContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate persistor={persistor} loading={null}>
      <SocketProvider>
        <div className="min-h-screen font-sans antialiased text-slate-900">
          <App />
          <Toaster position="bottom-right" richColors />
        </div>
      </SocketProvider>
    </PersistGate>
  </Provider>,
);
