"use client";
// آیکون‌ها از پک Iconsax
import {
  Buildings, Routing, Drop, Flash, Box, Tree, Cpu, Sun1, Courthouse, Map1,
  TrendUp, Chart21, Ruler, Shop, Key, Lovely, Setting2, type Icon,
} from "@/components/iconsax";

export const groupIcons: Record<string, Icon> = {
  building: Buildings, transport: Routing, water: Drop, energy: Flash, industry: Box,
  urban: Tree, digital: Cpu, agriculture: Sun1, heritage: Courthouse, land: Map1,
};

export const routeIcons: Record<string, Icon> = {
  investor: TrendUp, fund: Chart21, contractor: Ruler, buyer: Shop,
  lessee: Key, heritage: Courthouse, charity: Lovely, operator: Setting2,
};
