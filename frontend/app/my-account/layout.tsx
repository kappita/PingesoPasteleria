import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";
import { MdManageAccounts } from "react-icons/md";
import LogoutIcon from "@/app/components/LogoutIcon";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      <h1 className="text-[40px] font-semibold w-screen text-left ml-30 mt-10 mb-15">
        Mi Cuenta
      </h1>

      <div className="flex">
        <nav className="flex flex-col ml-10 border-r-3 w-70 border-gray-500 text-[20px] text-center items-center">
          <Link href="orders" className="flex items-center gap-3 mb-4">
            <FiShoppingBag />
            Pedidos
          </Link>
          <Link href="edit-account" className="flex items-center gap-3 mb-4">
            <MdManageAccounts />
            Detalles de la cuenta
          </Link>
          <LogoutIcon />
        </nav>

        <div className="ml-10 bg-gray-200 rounded-xl p-5">{children}</div>
      </div>
    </>
  );
}
