import { Toaster } from "sonner";
import { AppContent } from "./components/AppContent";
import { AppLayout } from "./components/AppLayout";
import { AppToolbar } from "./components/AppToolbar";
import { CommandPalette } from "./components/CommandPalette";
import { PathPalette } from "./components/PathPalette";
import {ScenarioPalette} from "./components/ScenarioPalette";
import {DialogDeletePath} from "./components/Dialog";

export default function App() {
  console.log("App created");
  return (
    <>
      <Toaster theme="dark" richColors position="bottom-center" />
      <ScenarioPalette/>
      <CommandPalette />
      <PathPalette/>

      <AppLayout>
        <AppToolbar />
        <AppContent />
      </AppLayout>
    </>
  );
}
