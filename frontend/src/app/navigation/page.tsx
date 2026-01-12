'use client';

import React, { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import styles from './page.module.css';

interface Destination {
  label: string;
  id: string;
}

const destinations: Destination[] = [
  {
    label: 'Röntgendiagnostik',
    id: 'cad7b801-a1a8-401f-8bc5-954f6629281d',
  },
  {
    label: 'Intensivmedizin',
    id: 'b82087ab-659b-488a-a227-890f625ef886',
  },
];

const BASE_URL = 'https://charite.catchup-apps.com/next/app/Charite-e15fc400-0de8-4625-893f-c1609cc0a8e9/map';
const START_LOCATION = '4356cc6c-0640-1ea0-f854-1a584c56095b';

export default function NavigationPage() {
  const [selectedDestination, setSelectedDestination] = useState<string>(destinations[0].id);

  const generateMapUrl = (destinationId: string) => {
    const params = new URLSearchParams({
      destination: destinationId,
      start: START_LOCATION,
      disabledParkingSpace: 'false',
      movementRestricted: 'false',
      isEmployee: 'false',
      isSupplier: 'false',
      trafficType: 'walking',
      needParkingSpot: 'false',
    });
    return `${BASE_URL}?${params.toString()}`;
  };

  const iframeUrl = generateMapUrl(selectedDestination);

  return (
    <main className={styles.container}>
      <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5' }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Ziel auswählen</InputLabel>
          <Select
            value={selectedDestination}
            label="Ziel auswählen"
            onChange={(e) => setSelectedDestination(e.target.value)}
          >
            {destinations.map((dest) => (
              <MenuItem key={dest.id} value={dest.id}>
                {dest.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <iframe
        title="Navigation"
        src={iframeUrl}
        className={styles.frame}
        sandbox="allow-scripts allow-same-origin allow-forms"
        allow="clipboard-read; clipboard-write; geolocation; microphone; camera"
      />
    </main>
  );
}