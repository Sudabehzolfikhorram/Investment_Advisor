"use client";
// آیکون‌ها از پک Iconsax
import {
  Buildings, Routing, Drop, Flash, Box, Tree, Cpu, Sun1, Courthouse, Map1, Home2,
  TrendUp, Chart21, Ruler, Shop, Key, Lovely, Setting2, LampOn, Book1, Convertshape2, FolderOpen, DocumentUpload, Buliding, UserSquare, ArchiveBook, Global, Map, Refresh2, type Icon,
} from "@/components/iconsax";

export const groupIcons: Record<string, Icon> = {
  building: Buildings, transport: Routing, water: Drop, energy: Flash, industry: Box,
  urban: Tree, digital: Cpu, agriculture: Sun1, heritage: Courthouse, land: Map1, landhousing: Home2,
};

export const routeIcons: Record<string, Icon> = {
  investor: TrendUp, fund: Chart21, contractor: Ruler, buyer: Shop,
  lessee: Key, heritage: Courthouse, charity: Lovely, operator: Setting2,
};

export const toolIcons: Record<string, Icon> = {
  proposal: DocumentUpload, ideas: LampOn, "land-preparation": Map, "foreign-investment": Global,
  "ma-notice": FolderOpen, "ma-renewal": Refresh2, "ma-manager": Buliding, "ma-exchange": Convertshape2, "ma-profile": UserSquare,
  library: Book1, drafts: ArchiveBook, charity: Lovely,
};
