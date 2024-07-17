import Hero from "./pages/components/Hero/Hero";
import Navbar from "./pages/components/Navbar/Navbar";
import Info from "./pages/components/section/info/Info";

export default function Home() {
  return (
    <>
      <Navbar/>
      <Hero/>
      <Info/>
    </>
  );
}
