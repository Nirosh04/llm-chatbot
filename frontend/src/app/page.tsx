// app/page.tsx
"use client";

import { Button, Stack, ButtonProps } from "@mui/material";
import { useRouter } from "next/navigation";



// Define CustomButton component in the same file
function CustomButton({ children, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      variant="contained"
      sx={{
        //backgroundColor: colors.buttonColor,
        //color: colors.textColor,
        //'&:hover': {
        //  backgroundColor: colors.buttonHoverColor,
        //},
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 600,
        borderRadius: '8px',
        textTransform: 'none', // Prevents uppercase transformation
        ...props.sx, // Allow custom styles to override
      }}
    >
      {children}
    </Button>
  );
}

export default function LanderPage() {
  const router = useRouter();

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      marginTop: "50px",
      minHeight: '100vh',
      padding: '20px',
    }}>
      <Stack spacing={2} direction="column">
        <CustomButton onClick={() => router.push("/welcome")}>
          Welcome
        </CustomButton>
        <CustomButton onClick={() => router.push("/tabMain")}>
          Main
        </CustomButton>
        <CustomButton onClick={() => console.log('Page 3 not implemented yet.')}>
          Page 3
        </CustomButton>
      </Stack>
    </div>
  );
}