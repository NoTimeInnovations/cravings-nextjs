'use client';

// import { auth } from '@/lib/firebase';
// import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';

export default function SamplePage() {
  const { signInWithGoogle } = useAuthStore();
  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    console.log(user);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <button
        onClick={handleGoogleSignIn}
        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-md cursor-pointer font-roboto transition-colors hover:bg-gray-50"
      >
        <Image 
          src="https://www.google.com/favicon.ico" 
          alt="Google logo" 
          width={20}
          height={20}
        />
        Sign in with Google
      </button>
    </div>
  );
}
