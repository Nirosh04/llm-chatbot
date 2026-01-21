import { ListItem, ListItemText, Select, MenuItem } from "@mui/material";

type FontSizeSelectProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  options?: number[];
};

export function FontSizeSelect({
  label,
  value,
  onChange,
  options = [12, 14, 16, 18, 20],
}: FontSizeSelectProps) {
  return (
    <ListItem
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <ListItemText primary={label} />
      <Select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        size="small"
        sx={{ minWidth: 100 }}
      >
        {options.map((size) => (
          <MenuItem key={size} value={size}>
            {size}px
          </MenuItem>
        ))}
      </Select>
    </ListItem>
  );
}
