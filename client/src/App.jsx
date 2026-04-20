import AppRouter from "./app/router.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import MessengerHub from "./components/shared/MessengerHub.jsx";

function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
      <MessengerHub />
    </ErrorBoundary>
  );
}

export default App;
