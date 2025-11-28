import { Button } from "@mui/joy";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

type CustomButtonProps = {
  /** Icon inside the button (optional) */
  icon?: ReactNode;

  /** Text inside the button (optional, ignored for icon-only usage) */
  label?: string;

  /** If given, button becomes a clickable link */
  to?: string;

  /** Click handler */
  onClick?: () => void;

  /** Disabled state */
  disabled?: boolean;

  /** Button color */
  color?: "primary" | "danger" | "neutral" | "success" | "warning";

  /** Additional styling or props */
  sx?: any;

  /** Button size */
  size?: "sm" | "md" | "lg";
};

export default function CustomButton({
  icon,
  label,
  to,
  onClick,
  disabled = false,
  color = "primary",
  sx = {},
  size = "sm",
}: CustomButtonProps) {
  const content = (
    <Button
      onClick={onClick}
      disabled={disabled}
      color={color}
      size={size}
      sx={{ py: 0, px: 1, ...sx }}
    >
      {icon}
      {label && <span style={{ marginLeft: icon ? 6 : 0 }}>{label}</span>}
    </Button>
  );

  // If "to" exists → render as a link
  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  // Otherwise → normal button
  return content;
}
