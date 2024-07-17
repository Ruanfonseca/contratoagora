"use client"
import logo from '@/app/assets/logocontrato.png';
import menu from '@/app/assets/menumobilewhite.png';
import Image from 'next/image';
import { useEffect, useState } from "react";
import { Link } from 'react-scroll';
import './Navbar.css';

const Navbar: React.FC = () => {
  // Controls of responsivity
  const [sticky, setSticky] = useState<boolean>(false);
  const [mobileMenu, setMobileMenu] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 50);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target || !(event.target instanceof Element)) return;
      if (!event.target.closest('.menu-icon') && !event.target.closest('nav ul')) {
        setMobileMenu(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setMobileMenu((prev) => !prev);
  };

  return (
    <nav className={`containerProject ${sticky ? 'dark-nav' : ''}`}>
      <Image src={logo} className='logo' alt='Logo' />
      <ul className={mobileMenu ? '' : 'hide-mobile-menu'}>
        <li><Link to='HOME' smooth={true} offset={0} duration={500}>Home</Link></li>
        <li><Link to='CONTRATOS' smooth={true} offset={0} duration={500}>Preecher Contrato</Link></li>
        <li><Link to='AJUDA' smooth={true} offset={0} duration={500}>Ajuda</Link></li>
        <li><Link to='SOBRE' smooth={true} offset={0} duration={500}>Sobre nós</Link></li>
        <li><Link to='CONTATO' smooth={true} offset={0} duration={500}>Contato</Link></li>
      </ul>
      <Image src={menu} className='menu-icon' onClick={toggleMenu} alt='Menu icon' />
    </nav>
  );
};

export default Navbar;
