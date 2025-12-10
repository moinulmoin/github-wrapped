import { fetchUserStats } from "../../actions/github";
import { WrappedContainer } from "../../components/WrappedContainer";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s GitHub Wrapped 2025`,
    description: `Check out ${username}'s developer stats and persona!`,
  };
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;

  try {
    // Note: We use server-side token (or public access) here.
    // If a viewer is just visiting, they see the public view.
    // If the USER visits their own link, the `fetchUserStats` would need to be aware of the session
    // but here we are in a Server Component.
    // The current `fetchUserStats` handles session check internally if token is not passed.

    // However, `fetchUserStats` calls `headers()` and check session.
    // So if I am logged in and visit /moinulmoin, it should work with private stats!

    const data = await fetchUserStats(username);
    return <WrappedContainer data={data} />;

  } catch (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-4xl font-bold mb-4">404: Developer Not Found</h1>
        <p className="text-gray-400">Could not generate wrapped for <strong>{username}</strong>.</p>
        <a href="/" className="mt-8 px-6 py-3 bg-white text-black rounded-full font-bold">Go Home</a>
      </div>
    );
  }
}
