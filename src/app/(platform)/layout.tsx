import { AuthenticatedShell } from './authenticated-shell';
export default function PlatformLayout({children}:{children:React.ReactNode}){return <AuthenticatedShell>{children}</AuthenticatedShell>}
