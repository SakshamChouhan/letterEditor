import { useSession } from 'next-auth/react';
import SignInButton from '../components/SignInButton';
import Dashboard from './dashboard';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="centered-container">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div >
      <div>
        {session ? (
          <Dashboard />
        ) : (
          <div>
            <div className='centered-container'>
                <div className='centered-box'>
                <h1 className="text-3xl font-bold text-gray-800 mb-6 ">LETTER EDITOR</h1>
            <p className="text-lg text-gray-600 mb-4 ">Please sign in to access your dashboard.</p>
            <SignInButton />

                </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
