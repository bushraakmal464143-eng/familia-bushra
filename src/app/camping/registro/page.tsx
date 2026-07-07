import AuthForm from "@/components/portal/AuthForm";

export default function CampingRegistroPage() {
  return (
    <AuthForm
      title="Alta de camping"
      subtitle="Regístrate para publicar ofertas. Revisaremos tu alta antes de activarla."
      apiPath="/api/camping/register"
      fields="register-camping"
    />
  );
}
