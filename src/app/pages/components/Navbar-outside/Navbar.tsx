"use client";
import logo from "@/app/assets/logocontrato.png";
import menu from "@/app/assets/menumobilewhite.png";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const [sticky, setSticky] = useState<boolean>(false);
  const [mobileMenu, setMobileMenu] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 50);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target || !(event.target instanceof Element)) return;
      if (
        !event.target.closest(".menu-icon") &&
        !event.target.closest("nav ul")
      ) {
        setMobileMenu(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setMobileMenu((prev) => !prev);
  };

  return (
    <nav className="dark-nav">
      <Image src={logo} className="logo" alt="Logo" />
      <ul className={mobileMenu ? "" : "hide-mobile-menu"}>
        <li>
          <Link href="/#HOME" scroll={false}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/contratos" scroll={false}>
            Preencher Contrato
          </Link>
        </li>
        <li>
          <a href="/#AJUDA">Ajuda</a>
        </li>
        <li>
          <a href="/#SOBRE">Sobre nós</a>
        </li>
        <li>
          <a href="/#CONTATO">Contato</a>
        </li>
      </ul>
      <Image
        src={menu}
        className="menu-icon"
        onClick={toggleMenu}
        alt="Menu icon"
      />
    </nav>
  );
};

export default Navbar;
