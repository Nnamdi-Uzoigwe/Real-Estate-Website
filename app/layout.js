
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Header from "./components/Header";
export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
      <body>
          <Header />
          {children}      
      </body>
      </html> 
     </ClerkProvider>  
  );
}
