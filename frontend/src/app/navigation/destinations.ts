// Interface defining the structure of a navigation destination
interface Destination {
  labelKey: string;
  id: string;
}

// Array of available hospital destinations for navigation
// Using i18n keys instead of hardcoded labels
const destinations: Destination[] = [
  {
    labelKey: 'destinations.xray',
    id: 'cad7b801-a1a8-401f-8bc5-954f6629281d',
  },
  {
    labelKey: 'destinations.intensiveCare',
    id: 'b82087ab-659b-488a-a227-890f625ef886',
  },
  {
    labelKey: 'destinations.gynecology',
    id: 'f77cd865-ec69-4b75-a998-4886fab18fe8',
  },
  {
    labelKey: 'destinations.ent',
    id: '9a583b46-4d02-4d09-8f41-c08cdc81a6f5',
  },
  {
    labelKey: 'destinations.restroom',
    id: 'dc5062ed-0c36-4717-b8cb-a29cc3367fa2',
  },
];

export { destinations };
export type { Destination };
