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

            <div className="flex justify-center flex-1">
              <img
                src="/assets/logo.png"
                alt="Tortas con Diseños"
                className="h-48 w-auto object-contain"
              />
            </div>

            <div className="flex items-center space-x-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2.5 rounded-full hover:scale-110 transition shadow-md"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <Link
                href="/cart"
                className="text-gray-700 hover:text-pink-500 transition"
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
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
            href="/products?page=1"
            className="flex items-center justify-center text-center text-white hover:text-pink-100 font-medium transition h-12 w-40"
          >
            Tienda
          </Link>
          <Link
            href="/us"
            className="flex items-center justify-center text-center text-white hover:text-pink-100 font-medium transition h-12 w-40"
          >
            Nosotros
          </Link>
          <Link
            href="/events"
            className="flex items-center justify-center text-center text-white hover:text-pink-100 font-medium  transition h-8 w-40"
          >
            Eventos
          </Link>
          <Link
            href="/cards"
            className="flex items-center justify-center text-center text-white hover:text-pink-100 font-medium transition h-12 w-40"
          >
            Cartas
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Header;
