import { Toaster } from "sonner";
import { AppContent } from "./components/AppContent";
import { AppLayout } from "./components/AppLayout";
import { AppToolbar } from "./components/AppToolbar";
import { CommandPalette } from "./components/CommandPalette";
import { PathPalette } from "./components/PathPalette";
import {ScenarioPaette} from "./components/ScenarioPalette";

export default function App() {
  console.log("App created");
  return (
    <>
      <Toaster theme="dark" richColors position="bottom-center" />
      <ScenarioPaette/>
      <CommandPalette />
      <PathPalette/>
      <AppLayout>
        <AppToolbar />
        <AppContent />
      </AppLayout>
    </>
  );
}
