"use client";
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    (<Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
          classNames: {
              toast:
                  "group toast group-[.toaster]:bg-black group-[.toaster]:text-white group-[.toaster]:border-none group-[.toaster]:shadow-xl group-[.toaster]:rounded-lg group-[.toaster]:p-4 group-[.toaster]:transition-all group-[.toaster]:duration-300",
              description:
                  "group-[.toast]:text-gray-300 group-[.toast]:text-sm group-[.toast]:mt-1",
              actionButton:
                  "group-[.toast]:bg-blue-500 group-[.toast]:text-white group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:rounded-md group-[.toast]:hover:bg-blue-600 transition-all duration-200",
              cancelButton:
                  "group-[.toast]:bg-gray-700 group-[.toast]:text-white group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:rounded-md group-[.toast]:hover:bg-gray-600 transition-all duration-200",
          },
      }}
      {...props} />)
  );
}

export { Toaster }
