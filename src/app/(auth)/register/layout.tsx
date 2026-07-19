import { RegistrationGate } from "@/components/shared/PlatformGates";

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <RegistrationGate>{children}</RegistrationGate>;
}
