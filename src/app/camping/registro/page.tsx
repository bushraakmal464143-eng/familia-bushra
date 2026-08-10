import AuthForm from "@/components/portal/AuthForm";

export default function CampingRegistroPage() {
  return (
    <AuthForm
      title="Alta de camping"
      subtitle="Crea tu cuenta. Luego completarás los datos del camping y un administrador aprobará tu alta."
      apiPath="/api/camping/register"
      fields="register-camping"
    />
  );
}
