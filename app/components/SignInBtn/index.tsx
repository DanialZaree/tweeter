import Link from 'next/link';

export default function SignInBtn() {
  return (
    <Link
      href="/auth"
      className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
    >
      Sign In
    </Link>
  );
}
