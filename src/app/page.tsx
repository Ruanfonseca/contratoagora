import Footer from "./pages/components/footer/Footer";
import Hero from "./pages/components/Hero/Hero";
import Navbar from "./pages/components/Navbar/Navbar";
import About from "./pages/components/section/about/About";
import Contact from "./pages/components/section/formContact/contact";
import Info from "./pages/components/section/info/Info";

export default function Home() {
  return (
    <>
      <Navbar/>
      <Hero/>
      <Info/>
      <About/>
      <Contact/>
      <Footer/>
    </>
  );
}
