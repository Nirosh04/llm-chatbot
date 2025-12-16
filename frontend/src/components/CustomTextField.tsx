'use client';


import React from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { colors } from "./../styles/colors";

interface CustomTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  hintText?: string;
  textColor?: string;
  cursorColor?: string;
  backgroundColor?: string;
}

export const CustomTextField: React.FC<CustomTextFieldProps> = ({
  hintText = "Type a message...",
  textColor = colors.textColor,
  cursorColor = colors.fabColor,
  backgroundColor = colors.backgroundColor,
  ...props
}) => {
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
        },
        '& .MuiInputLabel-root': {
          color: `${textColor}99`,
        },
      }}
    />
  );
};