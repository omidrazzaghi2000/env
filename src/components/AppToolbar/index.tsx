import {
    ArrowTopRightOnSquareIcon,
    CodeBracketIcon,
    PaintBrushIcon,
    MapIcon,
    CubeIcon,
    PhotoIcon, BoltIcon,
} from "@heroicons/react/24/solid";
import * as Toolbar from "@radix-ui/react-toolbar";
import {activeModesAtom, curvePathArrayAtom, markersAtom, modeAtom} from "../../store";
import { Logo } from "./Logo";
import { useAtomValue, useSetAtom } from "jotai";
import {Button, Input} from "antd";
import {CaretRightOutlined, PauseOutlined, DeleteColumnOutlined, SaveOutlined, DownloadOutlined} from "@ant-design/icons";
import Search from "antd/es/input/Search";
import {useState} from "react";
import { toast } from "sonner";
import {saveAs} from 'file-saver';
import {useFilePicker} from "use-file-picker";
import {interpolateAndGetLatLng} from "../MapPreview/map_marker/path";
import L from "leaflet";
import {useAtom} from "jotai/index";

export function AppToolbar() {
  const setMode = useSetAtom(modeAtom);
  const activeModes = useAtomValue(activeModesAtom);


  const markers = useAtomValue(markersAtom)
  const setMarkers = useSetAtom(markersAtom)
  const [isSending,setIsSending] = useState(false);
  const [serverAddress,setserverAddress] = useState("");

  //for recording
    const [markerCurvedPathArray, setMarkerCurvedPathArray] = useAtom(curvePathArrayAtom);
    const [from,setFrom] = useState();
    const [to,setTo] = useState();


    const { openFilePicker, filesContent, loading } = useFilePicker({
        accept: '.json',
        multiple: false,
        onFilesSelected: async ({plainFiles, filesContent, errors}) => {
            // this callback is always called, even if there are errors

            let markersFromFile = JSON.parse(filesContent[0].content)
            setMarkers(markersFromFile)
            window.location.reload()


        },
    });


   function loadScenario(){
       openFilePicker();
   }

   function saveScenario(){
       var blob = new Blob([JSON.stringify(markers)], {type: "json/application;charset=utf-8"});
       saveAs(blob, `simulator_${(new Date().toJSON().slice(0,19))}.json`
       );
   }


  function pauseSend (){
      setIsSending(false);
      toast("Stopped Sending to the server", {
          icon: <BoltIcon className="w-4 h-4" />,
      });
  }


  function recordStart(from:number,to:number,sps:number){

       if(from >= to)
       {
        toast.error("Input times are not valid.");
        return;
       }

       let time = from;
       let csvString = "";
       while(time <= to){
           for(let i = 0 ; i < markers.length ; i++)
           {

               let timesArray = markerCurvedPathArray[i]._timesArray;
               let tracePoints =  markerCurvedPathArray[i]._tracePoints;
               let tracePointsIndex = markerCurvedPathArray[i]._tracePointsPathIndex;

               /* check whether path is started */
               if(timesArray.length > 0 && timesArray[0] > time) {

                   continue
               }


               let currentSubPathIndex = 0;
               for(let t = 0 ; t < timesArray.length-1 ; t++){

                   if(time >= timesArray[t] && time <= timesArray[t+1]/*for the middle of path*/){
                       currentSubPathIndex = t;
                       break
                   }

                   else if(t == timesArray.length-2/*for the end of path*/){
                       currentSubPathIndex = timesArray.length-2
                   }

               }


               let new_position_new_yaw = interpolateAndGetLatLng(
                   tracePoints[currentSubPathIndex],tracePoints[currentSubPathIndex+1], time-timesArray[currentSubPathIndex],
                   markers.at(i).path.at(tracePointsIndex).speed)
               let new_position = new_position_new_yaw[0]
               let new_yaw = new_position_new_yaw[1]

               csvString += `${markers.at(i).id},${time},${new_position[0]},${new_position[1]},${new_yaw}\n`;




           }

           time+=1/sps;

       }

      // Create blob object with file content
      let blob = new Blob([csvString], {
          type: "text/plain;charset=utf-8",
      });

      // Create and save the file using the FileWriter library
      saveAs(blob, `${from}-${to}-${Date.now()}.csv`);

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
        <Logo/>
        <h1 className="font-bold tracking-wide text-xl">Mulator</h1>
      </span>

          <Toolbar.ToggleGroup
              type="multiple"
              aria-label="Tools"
              className="flex divide-x divide-white/10 bg-neutral-900 rounded-md overflow-hidden shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20"
              value={activeModes}
              onValueChange={(modes) =>
                  setMode(
                      modes.reduce((acc, mode) => ({...acc, [mode]: true}), {
                          map: false,
                          timeline: false,
                          map_3d: false,
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

              ].map(({value, label, icon: Icon}) => (
                  <Toolbar.ToggleItem
                      key={value}
                      value={value}
                      disabled={value === "map"}
                      className="px-3 py-1.5 leading-4 text-xs tracking-wide uppercase font-semibold bg-white/0 hover:bg-white/10 bg-gradient-to-b data-[state=on]:from-blue-500 data-[state=on]:to-blue-600 data-[state=on]:text-white flex items-center"
                  >
                      <Icon className="w-4 h-4 mr-2"/>
                      <span>{label}</span>
                  </Toolbar.ToggleItem>
              ))}
          </Toolbar.ToggleGroup>
          {/* dumb division to set map and timeline toggle item at center */}

          <div className="flex w-1/4" style={{display: 'flex', justifyContent: 'right'}}
          >



              <div className="flex"
              >
                  <Input value={from} onChange={(v) => setFrom(v.target.value)}
                         placeholder="From time ... " type={"number"} className="mx-1"/>
                  <Input value={to} onChange={(v) => setTo(v.target.value)}
                         placeholder="From time ... " type={"number"} className="mx-1"/>
                  <Button type="primary" shape="circle" icon={<SaveOutlined className="w-4 h-4"/>}
                          onClick={/////////TODO:recordStart(from,to,sps)} title="Save Scenario "></Button>
              </div>


              <div
              >
                  <Button type="primary" shape="circle" icon={<SaveOutlined className="w-4 h-4"/>}
                          onClick={saveScenario} title="Save Scenario "></Button>

              </div>
              <div
              >
                  <Button type="primary" shape="circle" icon={<DownloadOutlined className="w-4 h-4"/>}
                          onClick={loadScenario} title="Load Scenario "></Button>

              </div>
              <form>

                  <div className="flex">
                      <Input value={serverAddress} onChange={(v) => setserverAddress(v.target.value)}
                             placeholder="Insert a server address " type={"text"} className="mx-1"/>
                      {
                          isSending ? <Button type="primary" shape="circle" icon={<PauseOutlined className="w-4 h-4"/>}
                                              onClick={pauseSend}/> :
                              <Button type="primary" shape="circle" icon={<CaretRightOutlined className="w-4 h-4"/>}
                                      onClick={startSend}/>
                      }

                  </div>

              </form>

          </div>
      </Toolbar.Root>
  );
}
