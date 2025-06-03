import LoginForm from "@/app/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">
          Login
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
