import ToolsIndex from '@/components/ToolsIndex';

/* ═══════════════════════════════════════════════════════
   /all-tools — unlinked full tool directory.
   Shows every tool, including ones hidden from the main
   index. Not linked from anywhere; behind the main admin
   login like the rest of the toolbox (see middleware.ts).
   ═══════════════════════════════════════════════════════ */

export default function AllToolsPage() {
  return <ToolsIndex showHidden />;
}
