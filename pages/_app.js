import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import Navbar from '../components/Navbar';
// import VerificationAlert from '../components/VerificationAlert';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-4">
          <Component {...pageProps} />
        
        </main>
      </div>
    </SessionProvider>
  );
}

export default MyApp;