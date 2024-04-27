import {
    ArrowTopRightOnSquareIcon,
    CodeBracketIcon,
    PaintBrushIcon,
    MapIcon,
    CubeIcon,
    PhotoIcon, BoltIcon,
} from "@heroicons/react/24/solid";
import * as Toolbar from "@radix-ui/react-toolbar";
import {activeModesAtom, markersAtom, modeAtom} from "../../store";
import { Logo } from "./Logo";
import { useAtomValue, useSetAtom } from "jotai";
import {Button, Input} from "antd";
import {CaretRightOutlined, PauseOutlined, DeleteColumnOutlined} from "@ant-design/icons";
import Search from "antd/es/input/Search";
import {useState} from "react";
import { toast } from "sonner";

export function AppToolbar() {
  const setMode = useSetAtom(modeAtom);
  const activeModes = useAtomValue(activeModesAtom);


  const markers = useAtomValue(markersAtom)
  const [isSending,setIsSending] = useState(false);
  const [serverAddress,setserverAddress] = useState("")

  function pauseSend (){
      setIsSending(false);
      toast("Stopped Sending to the server", {
          icon: <BoltIcon className="w-4 h-4" />,
      });
  }

  function startSend(){


          fetch(`http://${serverAddress}`, {
                  method: "post",
                  body:JSON.stringify(
                      markers
                  )
              }
          ).then((e)=>{
              setIsSending(true)
              //send Again
              startSend()
          }).catch(
              (error)=>{
                  console.log(error)
                  setIsSending(false)
                  toast.error(`Error Occured ${error}`, {
                      icon: <DeleteColumnOutlined  className="w-4 h-4" />,
                      duration: 1000,

                  });
              }
          )


  }
  return (
    <Toolbar.Root
      aria-label="Editing options"
      className="flex items-center justify-between min-w-[max-content] px-4 pt-1"
    >
      <span className="p-3 flex items-center gap-4">
        <Logo />
        <h1 className="font-bold tracking-wide text-xl">Mulator</h1>
      </span>

      <Toolbar.ToggleGroup
        type="multiple"
        aria-label="Tools"
        className="flex divide-x divide-white/10 bg-neutral-900 rounded-md overflow-hidden shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20"
        value={activeModes}
        onValueChange={(modes) =>
          setMode(
            modes.reduce((acc, mode) => ({ ...acc, [mode]: true }), {
              map: false,
              timeline: false,
              map_3d:false,
            })
          )
        }
      >
        {[
          {
            value: "map",
            label: "Map",
            icon: MapIcon,
          },
          {
            value: "timeline",
            label: "Timeline",
            icon: CodeBracketIcon,
          },
          {
            value: "map_3d",
            label: "3D Map",
            icon: CubeIcon,
          },
          
        ].map(({ value, label, icon: Icon }) => (
          <Toolbar.ToggleItem
            key={value}
            value={value}
            disabled={value === "map"}
            className="px-3 py-1.5 leading-4 text-xs tracking-wide uppercase font-semibold bg-white/0 hover:bg-white/10 bg-gradient-to-b data-[state=on]:from-blue-500 data-[state=on]:to-blue-600 data-[state=on]:text-white flex items-center"
          >
            <Icon className="w-4 h-4 mr-2" />
            <span>{label}</span>
          </Toolbar.ToggleItem>
        ))}
      </Toolbar.ToggleGroup>
      {/* dumb division to set map and timeline toggle item at center */}
      <div  className="w-1/4"
      >
          <form>

              <div className="flex">
                  <Input value={serverAddress} onChange={(v)=>setserverAddress(v.target.value)} placeholder="Insert a server address " type={"text"} className="mr-1"/>
                  {
                     isSending ? <Button type="primary" shape="circle" icon={<PauseOutlined className="w-4 h-4"/>} onClick={pauseSend}/>:
                         <Button type="primary" shape="circle" icon={<CaretRightOutlined className="w-4 h-4"/>} onClick={startSend}/>
                  }

              </div>

          </form>

      </div>
    </Toolbar.Root>
  );
}
