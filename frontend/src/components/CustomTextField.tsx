'use client';


import React from 'react';
import { TextField, useTheme } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSettings } from '@/context/SettingsContext';

interface CustomTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  hintText?: string;
}

export const CustomTextField: React.FC<CustomTextFieldProps> = ({
  ...props
}) => {
  const theme = useTheme();
  const t = useTranslations('chat');
  const { fontSize } = useSettings();
  
  console.log('CustomTextField fontSize:', fontSize);
  
  const hintText = t('typeMessage');

  // Define colors using theme
  const textColor = theme.palette.text.primary;
  const cursorColor = theme.palette.primary.main;
  const backgroundColor = theme.palette.background.default;


  return (

    <TextField
      {...props}
      fullWidth
      placeholder={hintText}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor,
          color: textColor,
          borderRadius: '20px',
          '& fieldset': {
            border: 'none',
          },
          '&:hover fieldset': {
            border: 'none',
          },
          '&.Mui-focused fieldset': {
            border: 'none',
          },
        },
        '& .MuiInputBase-input': {
          color: textColor,
          caretColor: cursorColor,
          fontSize: `${fontSize}px`,
        },
        '& .MuiInputLabel-root': {
          color: `${textColor}99`,
        },
      }}
    />
  );
};