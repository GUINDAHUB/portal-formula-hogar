import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/ui/Logo";

function LoginFormFallback() {
  return (
    <div className="hero-surface h-64 animate-pulse" />
  );
}

export default function AdminLoginPage() {
  return (
    <div className="app-shell min-h-screen px-4 py-16">
      <div className="mx-auto mb-10 flex justify-center">
        <Logo variant="light" />
      </div>
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
