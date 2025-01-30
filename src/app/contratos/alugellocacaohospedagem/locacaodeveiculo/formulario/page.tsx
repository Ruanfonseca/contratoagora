'use client'
import Footer from "@/app/pages/components/footer/Footer";
import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import LocacaoVeiculo from "./locacaoveiculo";


export default function FormularioLocacaoVeiculo() {
    return (
        <>
            <Navbar />
            <LocacaoVeiculo />
            <Footer />
        </>
    );
}