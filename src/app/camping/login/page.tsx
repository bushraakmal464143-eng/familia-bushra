import AuthForm from "@/components/portal/AuthForm";

export default function CampingLoginPage() {
  return (
    <AuthForm
      title="Espacio del camping"
      subtitle="Gestiona fotos, ofertas y cobros de tus servicios."
      apiPath="/api/camping/login"
      registerPath="/camping/registro"
      registerLabel="Registrar mi camping"
      fields="login"
    />
  );
}
