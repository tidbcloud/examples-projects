import { Header } from "@/todo/Header";
import { Main } from "@/todo/Main";
import { Footer } from "@/todo/Footer";

function App() {
  return (
    <>
      <h1>todos</h1>

      <div className="todoapp">
        <Header />
        <Main />
        <Footer />
      </div>
    </>
  );
}

export default function Home() {
  return <App />;
}
