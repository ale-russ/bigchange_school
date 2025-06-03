import RegisterForm from "@/app/components/auth/RegistrationForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
