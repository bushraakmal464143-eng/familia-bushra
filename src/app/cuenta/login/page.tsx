import AuthForm from "@/components/portal/AuthForm";

export default function CuentaLoginPage() {
  return (
    <AuthForm
      title="Iniciar sesión"
      subtitle="Accede con tu cuenta de cliente o con tus credenciales de administración."
      apiPath="/api/cuenta/login"
      registerPath="/signup"
      registerLabel="Crear cuenta"
      fields="login"
    />
  );
}
