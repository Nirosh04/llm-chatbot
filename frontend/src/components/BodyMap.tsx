'use client';

import { Box, Typography, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  BODY_PART_PATHS,
  BODY_OUTLINE,
  FACE_PATHS,
  FRONT_BODY_PART_IDS,
  BACK_BODY_PART_IDS,
  BACK_VIEW_PATH_MAP,
  findBodyPartIdFromLocation,
  type BodyPartId,
} from '../constants/bodyMapConstants';

interface BodyMapProps {
  // Callback when a body part is selected (interactive mode)
  onBodyPartSelect?: (bodyPart: string | null) => void;
  // Highlight this location on the body map (works in both modes, supports any language)
  highlightLocation?: string;
  // Size for display mode (width in pixels)
  size?: number;
  // Whether to show the title and controls (default: true for interactive, false for display)
  showControls?: boolean;
  // Whether to show the selected text below the body map (default: true)
  showSelectedText?: boolean;
}

interface BodyPart {
  id: BodyPartId;
  label: string;
  path: string;
}

export default function BodyMap({ 
  onBodyPartSelect, 
  highlightLocation,
  size,
  showControls: showControlsProp,
  showSelectedText = true,
}: BodyMapProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [view, setView] = useState<'front' | 'back'>('front');
  const t = useTranslations('bodyMap');
  const theme = useTheme();

  // Calculate default sizes based on theme font size
  const defaultSizeInteractive = size || (theme.typography.fontSize * 14);
  const defaultSizeDisplay = size || (theme.typography.fontSize * 12);

  // Determine if we're in display-only mode
  const isDisplayMode = !onBodyPartSelect;
  
  const showControls = showControlsProp ?? !isDisplayMode;

  // Build body parts array with translations
  const frontBodyParts: BodyPart[] = useMemo(() => 
    FRONT_BODY_PART_IDS.map(id => ({
      id,
      label: t(id),
      path: BODY_PART_PATHS[id],
    })),
    [t]
  );

  const backBodyParts: BodyPart[] = useMemo(() => 
    BACK_BODY_PART_IDS.map(id => ({
      id,
      label: t(id),
      path: BACK_VIEW_PATH_MAP[id],
    })),
    [t]
  );

  const bodyParts = view === 'front' ? frontBodyParts : backBodyParts;

  // Build a lookup for body part ID to current locale label
  const idToLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    [...frontBodyParts, ...backBodyParts].forEach(part => {
      if (!map[part.id]) {
        map[part.id] = part.label;
      }
    });
    return map;
  }, [frontBodyParts, backBodyParts]);

  // Find the highlighted part ID from the location string (supports any language)
  const highlightedPartId = highlightLocation ? findBodyPartIdFromLocation(highlightLocation) : null;

  // Auto-switch view when highlighted part is back-only (upperBack, lowerBack)
  useEffect(() => {
    if (highlightedPartId) {
      const isBackOnlyPart = BACK_BODY_PART_IDS.includes(highlightedPartId) && 
                             !FRONT_BODY_PART_IDS.includes(highlightedPartId);
      if (isBackOnlyPart) {
        setView('back');
      } else if (FRONT_BODY_PART_IDS.includes(highlightedPartId)) {
        setView('front');
      }
    }
  }, [highlightedPartId]);

  const handleBodyPartClick = (part: BodyPart) => {
    if (isDisplayMode || !onBodyPartSelect) return;
    
    // Check if clicking the same part that's currently highlighted
    if (highlightedPartId === part.id) {
      onBodyPartSelect(null);
    } else {
      onBodyPartSelect(part.label);
    }
  };

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: 'front' | 'back' | null) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  // Render SVG body map (shared between display and interactive modes)
  const renderBodyMapSVG = () => (
    <svg
      viewBox="0 -3 201 205"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {/* Body silhouette outline */}
      <path
        d={BODY_OUTLINE}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity={isDisplayMode ? 0.5 : 1}
      />

      {/* Face (only in front view) */}
      {view === 'front' && (
        <g strokeWidth="1.0" stroke="currentColor" opacity={isDisplayMode ? 0.5 : 1}>
          <path d={FACE_PATHS.rightEye} fill="currentColor" stroke="none" />
          <path d={FACE_PATHS.leftEye} fill="currentColor" stroke="none" />
          <path d={FACE_PATHS.nose} fill="none" />
          <path d={FACE_PATHS.mouth} fill="currentColor" stroke='none' />
          <path d={FACE_PATHS.chin} fill="none" />
        </g>
      )}

      {/* Body parts */}
      {isDisplayMode ? (
        // Display mode: show only highlighted part
        highlightedPartId && BODY_PART_PATHS[highlightedPartId] && (
          <path
            d={BODY_PART_PATHS[highlightedPartId]}
            fill={theme.palette.bodyMap.highlighted}
            stroke={theme.palette.bodyMap.highlightedStroke}
            strokeWidth="1"
          />
        )
      ) : (
        // Interactive mode: clickable body parts with single highlight source
        bodyParts.map((part) => {
          const isHighlighted = highlightedPartId === part.id;
          const isHovered = hoveredPart === part.id;
          
          return (
            <path
              key={part.id}
              d={part.path}
              fill={isHighlighted ? theme.palette.bodyMap.highlighted : isHovered ? theme.palette.bodyMap.hovered : 'transparent'}
              stroke={isHighlighted ? theme.palette.bodyMap.highlightedStroke : 'transparent'}
              strokeWidth="1"
              style={{
                cursor: 'pointer',
                transition: 'fill 0.15s, stroke 0.15s',
              }}
              onClick={() => handleBodyPartClick(part)}
              onMouseEnter={() => setHoveredPart(part.id)}
              onMouseLeave={() => setHoveredPart(null)}
            />
          );
        })
      )}
    </svg>
  );

  // Display mode: compact view without controls
  if (isDisplayMode) {
    return (
      <Box sx={{ width: defaultSizeDisplay, flexShrink: 0 }}>
        {renderBodyMapSVG()}
      </Box>
    );
  }

  // Interactive mode: full controls
  return (
    <Box>
      {showControls && (
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
          {t('selectArea')}
        </Typography>
      )}

      {/* Body map with front/back toggle positioned next to it */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          mb: 1,
        }}
      >
        {/* Front/Back Toggle */}
        {showControls && (
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            size="small"
            orientation="vertical"
          >
            <ToggleButton value="front" sx={{ textTransform: 'none', px: 2 }}>
              {t('front')}
            </ToggleButton>
            <ToggleButton value="back" sx={{ textTransform: 'none', px: 2 }}>
              {t('back')}
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        {/* Body map with clickable areas */}
        <Box
          sx={{
            position: 'relative',
            width: defaultSizeInteractive,
          }}
        >
          {renderBodyMapSVG()}
        </Box>
      </Box>

      {showSelectedText && (
        <Typography variant="subtitle2" sx={{ mt: 1, textAlign: 'center', fontWeight: 600, minHeight: 21 }}>
          {highlightedPartId ? `${t('selected')}: ${idToLabelMap[highlightedPartId] || highlightedPartId}` : '\u00A0'}
        </Typography>
      )}
    </Box>
  );
}
