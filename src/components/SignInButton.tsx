import { signIn } from 'next-auth/react';

const SignInButton = () => {
  return (
    <button onClick={() => signIn('google')}>Sign in with Google</button>
  );
};

export default SignInButton;
