import { Command } from "cmdk";
import { useEffect, useState } from "react";
import {
    ChartBarIcon,
    LightBulbIcon,
    MagnifyingGlassIcon,
    PhotoIcon,
} from "@heroicons/react/24/outline";
<<<<<<< HEAD
import { LinearPathIcon } from "./icons";
import clsx from "clsx";
import { useAtom, useSetAtom } from "jotai";
import { Light, isPathPaletteOpenAtom, lightsAtom, showVHLineAtom } from "../../store";
import * as THREE from "three";
=======
import { LinearPath } from "./icons/LinearPath";
import clsx from "clsx";
import { useAtom, useSetAtom } from "jotai";
import {
    Light,
    isCommandPaletteOpenAtom,
    lightsAtom,
    showVHLineAtom,
    isPathPaletteOpenAtom,
    showAddPathLineAtom, pathTypeAtom
} from "../../store";
import * as THREE from "three";

>>>>>>> 1eac22e6d0c73206ad7a07c24fbfb30f63c0bdd4
export function PathPalette() {
    const [open, setOpen] = useAtom(isPathPaletteOpenAtom);
    const [value, setValue] = useState("softbox");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
<<<<<<< HEAD
            if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
=======
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
>>>>>>> 1eac22e6d0c73206ad7a07c24fbfb30f63c0bdd4
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
<<<<<<< HEAD
                    placeholder="Add lights, backgrounds, and flags..."
=======
                    placeholder="Add linear, circular, and ... path"
>>>>>>> 1eac22e6d0c73206ad7a07c24fbfb30f63c0bdd4
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
<<<<<<< HEAD
                                    Path
=======
                                    Markers
>>>>>>> 1eac22e6d0c73206ad7a07c24fbfb30f63c0bdd4
                                </h3>
                            }
                        >
                            <Item
                                label="Linear Path"
                                value="linear_path"
                                subtitle="Linear path with constant speed"
                                colorTheme="orange"
                            >
<<<<<<< HEAD
                                <LinearPathIcon />
=======
                                <LinearPath />
>>>>>>> 1eac22e6d0c73206ad7a07c24fbfb30f63c0bdd4
                            </Item>

                        </Command.Group>

<<<<<<< HEAD

=======
>>>>>>> 1eac22e6d0c73206ad7a07c24fbfb30f63c0bdd4
                    </div>

                    <div className="w-px h-auto block border-none bg-neutral-800" />

                    <div className="flex-[3] flex items-center justify-center relative overflow-hidden">
                        {value && (
                            <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute w-16 h-16 rounded-full bg-white blur-3xl" />
                        )}
<<<<<<< HEAD
                        {value === "linear_path" && <MapLinearImage />}
                        
=======
                        {value === "parrot_bebop_2" && <ParrotBebop2 />}
                        {value === "procedural_scrim" && <Scrim />}
                        {value === "umbrella" && <Umbrella />}
                        {value === "procedural_umbrella" && <Umbrella />}
                        {value === "flash_head" && <FlashHead />}
                        {value === "sky" && <Sky />}
                        {value === "sky_gradient" && <Gradient />}
>>>>>>> 1eac22e6d0c73206ad7a07c24fbfb30f63c0bdd4
                    </div>
                </div>
            </Command.List>
        </Command.Dialog>
    );
}

function Item({
<<<<<<< HEAD
    children,
    value,
    label = value,
    subtitle,
    colorTheme = "orange",
}: {
=======
                  children,
                  value,
                  label = value,
                  subtitle,
                  colorTheme = "orange",
              }: {
>>>>>>> 1eac22e6d0c73206ad7a07c24fbfb30f63c0bdd4
    children: React.ReactNode;
    label?: string;
    value: string;
    subtitle: string;
    colorTheme?: "orange" | "blue" | "green" | "red" | "purple";
}) {
    const setOpen = useSetAtom(isPathPaletteOpenAtom);
    const setShowPathLine = useSetAtom(showAddPathLineAtom);
    const setPathType = useSetAtom(pathTypeAtom);
    const [lights, setLights] = useAtom(lightsAtom);
    const addLight = (light: Light) => setLights((lights) => [...lights, light]);

    function handleSelect(value: string) {
        const commonProps = {
            name: `${value} ${String.fromCharCode(lights.length + 65)}`,
            id: THREE.MathUtils.generateUUID(),
            ts: Date.now(),
            shape: "rect" as const,
            latlon: { x: 0, y: 0 },
            intensity: 1,
            rotation: 0,
            scale: 1,
            scaleX: 1,
            scaleY: 1,
            target: { x: 0, y: 0, z: 0 },
            visible: true,
            solo: false,
            selected: false,
            opacity: 1,
            animate: false,
        };

<<<<<<< HEAD
        if (value === "softbox") {
            addLight({
                ...commonProps,
                type: "texture",
                color: "#ffffff",
                map: "/textures/softbox-octagon.exr",
            });
        } else if (value === "procedural_scrim") {
            addLight({
                ...commonProps,
                type: "procedural_scrim",
                color: "#ffffff",
                lightDistance: 0.3,
                lightPosition: { x: 0, y: 0 },
            });
        } else if (value === "umbrella") {
            addLight({
                ...commonProps,
                type: "texture",
                color: "#ffffff",
                map: "/textures/umbrella.exr",
            });
        } else if (value === "flash_head") {
            addLight({
                ...commonProps,
                type: "texture",
                color: "#ffffff",
                map: "/textures/flash-head.exr",
            });
        } else if (value === "procedural_umbrella") {
            addLight({
                ...commonProps,
                type: "procedural_umbrella",
                color: "#ffffff",
                lightSides: 3,
            });
        } else if (value === "sky_gradient") {
            addLight({
                ...commonProps,
                type: "sky_gradient",
                color: "#ff0000",
                color2: "#0000ff",
            });
        }

        else if (value === "linear_path") {
            console.log("OMID")
        }

=======
        if (value === "linear_path") {
            /* Show helper line for user */
            setShowPathLine(true);
        }
        else if(value === ""){

        }


        setPathType(value);
>>>>>>> 1eac22e6d0c73206ad7a07c24fbfb30f63c0bdd4
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
<<<<<<< HEAD
                    {subtitle}
                </span>
=======
          {subtitle}
        </span>
>>>>>>> 1eac22e6d0c73206ad7a07c24fbfb30f63c0bdd4
            </div>
        </Command.Item>
    );
}

<<<<<<< HEAD
function MapLinearImage() {
    return (
        <img
            src="/textures/path_palette/map_linear_path.png"
=======
function ParrotBebop2() {
    return (
        <img
            src="/textures/ParrotBebop.jpg"
>>>>>>> 1eac22e6d0c73206ad7a07c24fbfb30f63c0bdd4
            alt="Parrot Bebop 2"
            className=" h-48"
            loading="lazy"
        />
    );
}

<<<<<<< HEAD
=======
function Softbox() {
    return (
        <img
            src="/textures/softbox-octagon.png"
            alt="Softbox"
            className="w-48 h-48"
            loading="lazy"
        />
    );
}

function Scrim() {
    return (
        <img
            src="/textures/scrim.png"
            alt="Scrim"
            className="w-48 h-48"
            loading="lazy"
        />
    );
}

function FlashHead() {
    return (
        <img
            src="/textures/flash-head.png"
            alt="Softbox"
            className="w-48 h-48"
            loading="lazy"
        />
    );
}

function Umbrella() {
    return (
        <img
            src="/textures/umbrella.png"
            alt="Umbrella"
            className="w-48 h-48"
            loading="lazy"
        />
    );
}

function Sky() {
    return (
        <img
            src="https://tr.rbxcdn.com/c6742afbb50ca048d1fa07b532ecffb5/420/420/Hat/Png"
            alt="Sky"
            className="w-48 h-48"
            loading="lazy"
        />
    );
}

function Gradient() {
    return (
        <img
            src="https://t4.ftcdn.net/jpg/05/24/17/45/360_F_524174530_5vVjWkJ4AHkWNUKt07DVd61ImlITjoi1.png"
            alt="Gradient"
            className="w-48 h-48"
            loading="lazy"
        />
    );
}
>>>>>>> 1eac22e6d0c73206ad7a07c24fbfb30f63c0bdd4
