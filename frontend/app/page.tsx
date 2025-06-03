import { ReactNode } from "react";

export default function HomePage(): ReactNode {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome Big Change</h1>
      <p className="text-lg">
        Please{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          login
        </a>{" "}
        or{" "}
        <a href="/auth/register" className="text-blue-600 hover:underline">
          sign up
        </a>{" "}
        to continue.
      </p>
    </div>
  );
}
