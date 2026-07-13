import type { ReactNode, ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export type BadgeTone = "voltage" | "amber" | "hot";
export type LucideIcon = ComponentType<LucideProps>;
export type ViewParams = Record<string, unknown>;
export type GoFn = (view: string, params?: ViewParams) => void;

export interface VehicleBadge {
  label: string;
  tone: BadgeTone;
}

export interface Vehicle {
  id: string;
  marque: string;
  model: string;
  year: number;
  img: string;
  price: number;
  was?: number;
  range: number;
  battery: number;
  seats: number;
  zero: number;
  stock: number;
  history: string;
  ext: string;
  badge: VehicleBadge;
}

export interface BtnProps {
  variant?: "primary" | "ghostDark" | "outline" | "quiet";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  children?: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

export interface EyebrowProps {
  children: ReactNode;
  dark?: boolean;
}

export interface SectionHeadProps {
  eyebrow?: string;
  title: string;
  sub?: string;
  dark?: boolean;
  align?: "left" | "center";
}

export interface SpecReadoutProps {
  label: string;
  value: number | string;
  unit?: string;
  dark?: boolean;
}

export interface RangeGaugeProps {
  value: number;
  max?: number;
  size?: number;
  dark?: boolean;
}

export interface BadgeProps {
  badge: VehicleBadge;
}

export interface VehicleCardProps {
  v: Vehicle;
  onView?: (v: Vehicle) => void;
  onCart?: (v: Vehicle) => void;
}
