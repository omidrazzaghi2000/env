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
  duplicateLightAtom
} from '../../store'
import { PropertiesPanelTunnel } from '../Properties'
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { LightProperties } from './LightProperties'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragHandleIcon } from './DragHandleIcon'
import AtuoAirCraft from '../../utils/classes/AutoAirCraft.js'

export function MarkerListItem ({
  markerAtom
}: {
  markerAtom: PrimitiveAtom<AtuoAirCraft>
}) {
  const [marker, setMarker] = useAtom(markerAtom);
  console.log("OMID");
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div>{marker.name}</div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
          <ContextMenu.Content className="flex flex-col gap-1 bg-neutral-800 text-neutral-50 font-light p-1.5 rounded-md shadow-xl">
            <ContextMenu.Item
              className="outline-none select-none rounded px-2 py-0.5 highlighted:bg-white highlighted:text-neutral-900 text-sm"
              onSelect={() => console.log("Duplicate")}
            >
              Duplicate
            </ContextMenu.Item>
            <ContextMenu.Item
              className="outline-none select-none rounded px-2 py-0.5 text-white highlighted:bg-red-500 highlighted:text-white text-sm"
              onSelect={() => console.log("Delete")}
            >
              Delete
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
