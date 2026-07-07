"use client";

import Link from "next/link";

type GoogleSignInButtonProps = {
  from: string;
  enabled?: boolean;
};

const buttonClass =
  "flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition";

export default function GoogleSignInButton({
  from,
  enabled = true,
}: GoogleSignInButtonProps) {
  const href = `/api/auth/google?from=${encodeURIComponent(from)}`;

  if (!enabled) {
    return (
      <div>
        <button
          type="button"
          disabled
          className={`${buttonClass} cursor-not-allowed opacity-60`}
        >
          <GoogleIcon />
          Continuar con Google
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">
          Añade GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env.local y reinicia
          el servidor.
        </p>
      </div>
    );
  }

  return (
    <Link href={href} className={`${buttonClass} hover:bg-gray-50`}>
      <GoogleIcon />
      Continuar con Google
    </Link>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-5.373 0-10-3.027-12.317-7.463l-6.82 5.253C7.777 38.333 15.317 44 24 44c12.683 0 23-10.317 23-23 0-1.341-.138-2.651-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.659 0 7.023 1.4 9.548 3.686l7.177-7.177C34.523 4.053 29.553 2 24 2 15.317 2 7.777 7.667 4.686 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c6.48 0 11.93-2.13 15.89-5.79l-7.332-5.697C30.654 36.657 27.576 38 24 38c-5.197 0-9.616-3.127-11.279-7.546l-7.18 5.534C9.446 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-1.093 3.13-4.116 5.357-7.303 5.357-2.21 0-4.21-.94-5.614-2.443l-7.18 5.534C9.446 39.556 16.227 44 24 44c12.683 0 23-10.317 23-23 0-1.341-.138-2.651-.389-3.917z"
      />
    </svg>
  );
}
