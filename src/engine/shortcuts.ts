export type ShortcutAction =
  | 'tool:move' | 'tool:marquee' | 'tool:text' | 'tool:rect' | 'tool:ellipse'
  | 'tool:line' | 'tool:pen' | 'tool:eyedropper' | 'tool:hand' | 'tool:zoom'
  | 'edit:undo' | 'edit:redo' | 'edit:copy' | 'edit:paste' | 'edit:cut'
  | 'edit:duplicate' | 'edit:delete' | 'edit:selectAll' | 'edit:group' | 'edit:ungroup'
  | 'layer:bringForward' | 'layer:sendBackward' | 'layer:bringToFront' | 'layer:sendToBack'
  | 'view:zoomIn' | 'view:zoomOut' | 'view:fitScreen' | 'view:zoom100'
  | 'file:save' | 'file:new' | 'file:export';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: ShortcutAction;
  label: string;
}

export const SHORTCUTS: Shortcut[] = [
  { key: 'v',          action: 'tool:move',          label: 'Move / Select'        },
  { key: 'm',          action: 'tool:marquee',        label: 'Marquee Select'       },
  { key: 't',          action: 'tool:text',           label: 'Text'                 },
  { key: 'r',          action: 'tool:rect',           label: 'Rectangle'            },
  { key: 'e',          action: 'tool:ellipse',        label: 'Ellipse'              },
  { key: 'l',          action: 'tool:line',           label: 'Line'                 },
  { key: 'p',          action: 'tool:pen',            label: 'Pen'                  },
  { key: 'i',          action: 'tool:eyedropper',     label: 'Eyedropper'           },
  { key: 'h',          action: 'tool:hand',           label: 'Hand / Pan'           },
  { key: 'z',          action: 'tool:zoom',           label: 'Zoom'                 },
  { key: 'z', ctrl: true,  action: 'edit:undo',       label: 'Undo'                 },
  { key: 'y', ctrl: true,  action: 'edit:redo',       label: 'Redo'                 },
  { key: 'z', ctrl: true, shift: true, action: 'edit:redo', label: 'Redo (alt)'    },
  { key: 'c', ctrl: true,  action: 'edit:copy',       label: 'Copy'                 },
  { key: 'v', ctrl: true,  action: 'edit:paste',      label: 'Paste'               },
  { key: 'x', ctrl: true,  action: 'edit:cut',        label: 'Cut'                  },
  { key: 'd', ctrl: true,  action: 'edit:duplicate',  label: 'Duplicate'            },
  { key: 'Delete',     action: 'edit:delete',         label: 'Delete'               },
  { key: 'Backspace',  action: 'edit:delete',         label: 'Delete (Backspace)'   },
  { key: 'a', ctrl: true,  action: 'edit:selectAll',  label: 'Select All'           },
  { key: 'g', ctrl: true,  action: 'edit:group',      label: 'Group'                },
  { key: 'g', ctrl: true, shift: true, action: 'edit:ungroup', label: 'Ungroup'    },
  { key: ']',          action: 'layer:bringForward',  label: 'Bring Forward'        },
  { key: '[',          action: 'layer:sendBackward',  label: 'Send Backward'        },
  { key: ']', ctrl: true, action: 'layer:bringToFront', label: 'Bring to Front'    },
  { key: '[', ctrl: true, action: 'layer:sendToBack',  label: 'Send to Back'       },
  { key: '+',          action: 'view:zoomIn',         label: 'Zoom In'              },
  { key: '-',          action: 'view:zoomOut',        label: 'Zoom Out'             },
  { key: '0', ctrl: true,  action: 'view:fitScreen',  label: 'Fit to Screen'       },
  { key: '1', ctrl: true,  action: 'view:zoom100',    label: 'Zoom 100%'           },
  { key: 's', ctrl: true,  action: 'file:save',       label: 'Save'                 },
  { key: 'n', ctrl: true,  action: 'file:new',        label: 'New Project'          },
  { key: 'e', ctrl: true,  action: 'file:export',     label: 'Quick Export'         },
];

export function matchShortcut(e: KeyboardEvent): ShortcutAction | null {
  for (const s of SHORTCUTS) {
    const kMatch = e.key === s.key || e.key === s.key.toUpperCase();
    const ctrlMatch = !!s.ctrl === (e.ctrlKey || e.metaKey);
    const shiftMatch = !!s.shift === e.shiftKey;
    const altMatch = !!s.alt === e.altKey;
    if (kMatch && ctrlMatch && shiftMatch && altMatch) return s.action;
  }
  return null;
}
