import { Command } from "cmdk";
import { useEffect, useState } from "react";
import {
  ChartBarIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useAtom, useSetAtom } from "jotai";
import {Light, lightsAtom, showVHLineAtom, isScenarioPaletteOpenAtom} from "../../store";
import { useFilePicker } from 'use-file-picker';
import { toast } from "sonner";
export function ScenarioPaette() {
  const [open, setOpen] = useAtom(isScenarioPaletteOpenAtom);

  const [value, setValue] = useState("softbox");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
      <Command.Dialog
          loop
          value={value}
          onValueChange={(v) => setValue(v)}
          open={open}
          onOpenChange={setOpen}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl p-3 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700 shadow-2xl"
      >
        <div className="flex items-center gap-3 h-12 px-2 border-b border-neutral-800 mb-3 pb-2">
          <MagnifyingGlassIcon className="text-neutral-600 w-5 h-5 translate-y-[1px]" />
          <Command.Input
              autoFocus
              placeholder="Add lights, backgrounds, and flags..."
              className="border-none bg-transparent flex-1 outline-none text-neutral-100 placeholder:text-neutral-600"
          />
        </div>

        <Command.List>
          <div className="flex items-stretch min-h-[300px] overflow-hidden gap-3">
            <div className="flex-[2]">
              {loading && <Command.Loading>Hang on…</Command.Loading>}

              <Command.Empty className="flex items-center justify-center text-sm px-2 py-4 whitespace-pre-wrap text-neutral-600">
                No results found.
              </Command.Empty>

              <Command.Group
                  heading={
                    <h3 className="text-neutral-400 text-xs font-light select-none px-2 my-2">
                      Scenarios
                    </h3>
                  }
              >
                <Item
                    label="ADS-B"
                    value="adsb"
                    subtitle="Automatic Dependent Surveillance-Broadcast (ADS-B)"
                    colorTheme="orange"
                >
                  <ADSBIcon />
                </Item>

              </Command.Group>


            </div>

            <div className="w-px h-auto block border-none bg-neutral-800" />

            <div className="flex-[3] flex items-center justify-center relative overflow-hidden">
              {value && (
                  <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute w-16 h-16 rounded-full bg-white blur-3xl" />
              )}

              {value === "adsb" && <ADSBImage />}
            </div>
          </div>
        </Command.List>
      </Command.Dialog>
  );
}

function Item({
                children,
                value,
                label = value,
                subtitle,
                colorTheme = "orange",
              }: {
  children: React.ReactNode;
  label?: string;
  value: string;
  subtitle: string;
  colorTheme?: "orange" | "blue" | "green" | "red" | "purple";
}) {
  const setOpen = useSetAtom(isScenarioPaletteOpenAtom);
  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: '.bin',
    multiple: false,
    onFilesSelected: async ({plainFiles, filesContent, errors}) => {
      // this callback is always called, even if there are errors
      console.log(filesContent)
      toast.message("Not Implemented")
      // send file to server
      // const formData = new FormData();
      // formData.append('file', filesContent, filesContent.);
      // formData.append('name', 'YourFileName');

      // try {
      //   const response = await fetch('https://localhost:3000/api/upload', {
      //     method: 'POST',
      //     body: formData,
      //   });
      //
      //   if (response.ok) {
      //     const responseData = await response.json();
      //     console.log(responseData);
      //   } else {
      //     console.error('Failed to upload file');
      //   }
      // } catch (error) {
      //   console.error('Error during file upload:', error);
      // }

    },
  });
  function handleSelect(value: string) {

    if (value === "adsb"){
    openFilePicker();

    }

    setOpen(false);
  }

  return (
      <Command.Item
          value={value}
          onSelect={handleSelect}
          className="group cursor-pointer flex items-center rounded-lg text-sm gap-3 text-neutral-100 p-2 mr-2 font-medium transition-all transition-none data-[selected='true']:bg-blue-500 data-[selected='true']:text-white"
          style={{ contentVisibility: "auto" }}
      >
        <div
            className={clsx(
                "flex items-center justify-center w-8 h-8 rounded-md",
                colorTheme === "orange" && "bg-orange-400",
                colorTheme === "blue" && "bg-blue-400",
                colorTheme === "green" && "bg-green-400",
                colorTheme === "red" && "bg-red-400",
                colorTheme === "purple" && "bg-purple-400"
            )}
        >
          {children}
        </div>
        <div className="flex flex-col">
          <span>{label}</span>
          <span className="text-xs font-normal text-neutral-500 group-data-[selected='true']:text-white md:inline hidden">
          {subtitle}
        </span>
        </div>
      </Command.Item>
  );
}

function ADSBIcon() {
  return (
      <img
          src="/textures/scenario_palette/adsb-logo.png"
          alt="ADS-B"
          className="w-12 h-6"
          loading="lazy"
      />
  );
}

function ADSBImage() {
  return (
      <img
          src="/textures/scenario_palette/adsb-logo.png"
          alt="Gradient"
          className="w-48 h-48"
          loading="lazy"
      />
  );
}