'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import styles from './page.module.css';
import { destinations } from './destinations';

export default function NavigationPage() {
  const theme = useTheme();
  const tNav = useTranslations('navigation');
  const tDest = useTranslations('destinations');
  
  // State to track the currently selected destination
  const [selectedDestination, setSelectedDestination] = useState<string>(
    destinations[0].id
  );
  // State to track accessibility requirements (barrier-free navigation)
  const [isAccessible, setIsAccessible] = useState<boolean>(false);

  /**
   * Generate the complete map URL with query parameters
   * @param destinationId - The ID of the selected destination
   * @param accessible - Whether to enable barrier-free navigation
   * @returns Complete URL string with all navigation parameters
   */
  const generateMapUrl = (destinationId: string, accessible: boolean) => {
    // Base URL for the Charite hospital navigation map service
    const BASE_URL =
      'https://charite.catchup-apps.com/next/app/Charite-e15fc400-0de8-4625-893f-c1609cc0a8e9/map';
    // Starting location ID for navigation (default Campus Mitte Notaufnahme)
    const START_LOCATION = '4356cc6c-0640-1ea0-f854-1a584c56095b';

    // Create URL search parameters for the map service
    const params = new URLSearchParams({
      destination: destinationId,
      start: START_LOCATION,
      disabledParkingSpace: 'false',
      movementRestricted: accessible ? 'true' : 'false',
      isEmployee: 'false',
      isSupplier: 'false',
      trafficType: 'walking',
      needParkingSpot: 'false',
    });

    return `${BASE_URL}?${params.toString()}`;
  };

  // Generate the iframe URL based on the selected destination and accessibility setting
  const iframeUrl = generateMapUrl(selectedDestination, isAccessible);

  return (
    <main className={styles.container}>
      {/* Control panel for destination selection and accessibility options */}
      <Box
        className={styles.controls}
        sx={{
          padding: '16px',
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Starting point information */}
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontSize: '0.9rem' }}>
          {tNav('startPoint')}
        </Typography>

        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>{tNav('selectDestination')}</InputLabel>
          {/* Dropdown selector for hospital destinations */}
          <Select
            value={selectedDestination}
            label={tNav('selectDestination')}
            onChange={(e) => setSelectedDestination(e.target.value)}
            MenuProps={{
              PaperProps: {
                sx: {
                  zIndex: 1301,
                },
              },
            }}
          >
            {/* Map available destinations to menu items */}
            {destinations.map((dest) => (
              <MenuItem key={dest.id} value={dest.id}>
                {tDest(dest.labelKey.split('.')[1])}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Toggle switch for barrier-free navigation */}
        <FormControlLabel
          control={
            <Switch
              checked={isAccessible}
              onChange={(e) => setIsAccessible(e.target.checked)}
            />
          }
          label={tNav('barrierFree')}
        />
      </Box>

      {/* Embedded map iframe with navigation functionality */}
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
