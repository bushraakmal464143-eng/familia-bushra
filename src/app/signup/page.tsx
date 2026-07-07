import AuthForm from "@/components/portal/AuthForm";

export const metadata = {
  title: "Crear cuenta",
  description: "Registrate para reservar campings y gestionar tus reservas.",
};

export default function SignupPage() {
  return (
    <AuthForm
      title="Crear cuenta"
      subtitle="Registrate para reservar ofertas, pagar online y ver tus reservas."
      apiPath="/api/cuenta/register"
      registerPath="/cuenta/login"
      registerLabel="Iniciar sesion"
      fields="register-customer"
    />
  );
}
