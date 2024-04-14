import {
  Bars2Icon,
  ChevronUpDownIcon,
  EyeSlashIcon,
  FlagIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import {
  EyeIcon as EyeFilledIcon,
  FlagIcon as FlagFilledIcon
} from '@heroicons/react/24/solid'
import * as ContextMenu from '@radix-ui/react-context-menu'
import clsx from 'clsx'
import {
  Light,
  isSoloAtom,
  toggleSoloAtom,
  toggleLightSelectionAtom,
  deleteLightAtom,
  duplicateLightAtom,
  toggleMarkerSelectionAtom, deleteMarkerAtom, mapRefAtom
} from '../../store'
import { PropertiesPanelTunnel } from '../Properties'
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { LightProperties } from './LightProperties'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragHandleIcon } from './DragHandleIcon'
import AtuoAirCraft from '../../utils/classes/AutoAirCraft.js'
import { MarkerProperties } from './MarkerProperties'

function MarkerIcon (props: any) {
  return (
    <svg
      fill='#eee'
      height='12px'
      width='12px'
      version='1.1'
      id='Capa_1'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 447.342 410'
    >
      <path
        d='M443.537,3.805c-3.84-3.84-9.686-4.893-14.625-2.613L7.553,195.239c-4.827,2.215-7.807,7.153-7.535,12.459
 c0.254,5.305,3.727,9.908,8.762,11.63l129.476,44.289c21.349,7.314,38.125,24.089,45.438,45.438l44.321,129.509
 c1.72,5.018,6.325,8.491,11.63,8.762c5.306,0.271,10.244-2.725,12.458-7.535L446.15,18.429
 C448.428,13.491,447.377,7.644,443.537,3.805z'
      />
    </svg>
  )
}

export function MarkerListItem ({
  markerAtom, markerIndex
}: {
  markerAtom: PrimitiveAtom<AtuoAirCraft>
  markerIndex:number
}) {
  const [marker, setMarker] = useAtom(markerAtom)
  const deleteMarker = useSetAtom(deleteMarkerAtom);
  const toggleSelection = useSetAtom(toggleMarkerSelectionAtom);
  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          <div
            onClick={() => toggleSelection(marker.id)}
            className={clsx(
              'group flex text-left p-2 gap-2 rounded-md bg-transparent cursor-pointer transition-colors',
              marker.selected && 'bg-white/20',
              !marker.selected && 'hover:bg-white/10'
            )}
          >
            <input
              type='checkbox'
              hidden
              readOnly
              checked={marker.selected}
              className='peer'
            />
            <MarkerIcon></MarkerIcon>

            <span
              className={clsx(
                'flex-1 text-xs font-mono text-neutral-300 text-ellipsis overflow-hidden whitespace-nowrap'
              )}
            >
              {marker.name}
            </span>
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className='flex flex-col gap-1 bg-neutral-800 text-neutral-50 font-light p-1.5 rounded-md shadow-xl'>

            <ContextMenu.Item
              className='outline-none select-none rounded px-2 py-0.5 text-white highlighted:bg-red-500 highlighted:text-white text-sm'
              onSelect={function(){
                deleteMarker(marker.id);
              }}
            >
              Delete
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      {marker.selected && (
        <PropertiesPanelTunnel.In>
          <MarkerProperties markerAtom={markerAtom} markerIndex={markerIndex} />
        </PropertiesPanelTunnel.In>
      )}
    </>
  )
}
