"use client";

import UserMenu from "./UserMenu";
import Link from "next/link";

const Header = () => {
  return (
    <>
      <header className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="w-24"></div>

            <div className="flex justify-start flex-1">
              <img
                src="/assets/logo.png"
                alt="Tortas con Diseños"
                className="h-48 w-auto object-contain"
              />
            </div>

            <div className="flex items-center space-x-3 translate-y-18">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className=""
              >
                <img 
                  src="/assets/instagram.png" 
                  alt="Instagram"
                  className="w-10 h-10"
                />
              </a>

              <Link
                href="/cart"
                className="text-gray-700 hover:text-pink-500 transition p-1 rounded-full hover:bg-gray-100" // padding para PNG
              >
                <img
                  src="/assets/cart.png"
                  alt="Carrito"
                  className="w-10 h-10"
                />
              </Link>


              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar Rosa */}
      <nav className="bg-[#E985A7] shadow-md">
        <div className="hidden md:flex justify-center items-center py-1 gap-16 text-md">
          <Link
            href="/"
            className="flex items-center justify-center text-center text-white hover:text-pink-100 font-medium transition h-12 w-40"
          >
            Inicio
          </Link>
          <Link
            href="/products?page=1&category=33"
            className="flex items-center justify-center text-center text-white hover:text-pink-100 font-medium  transition h-8 w-40"
          >
            Pasteleria
          </Link>
          <Link
            href="/products?page=1&category=34"
            className="flex items-center justify-center text-center text-white hover:text-pink-100 font-medium  transition h-8 w-40"
          >
            Catering
          </Link>
          <Link
            href="/products?page=1&category=18"
            className="flex items-center justify-center text-center text-white hover:text-pink-100 font-medium  transition h-8 w-40"
          >
            Tortas
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Header;
