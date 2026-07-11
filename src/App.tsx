import AppProvider from "./providers/AppProvider";
import useRouter from "./routes/useRouter";

const App = () => {
  const router = useRouter();
  return <AppProvider>{router}</AppProvider>;
};

export default App;