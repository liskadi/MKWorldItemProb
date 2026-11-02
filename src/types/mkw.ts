export type TableId = 'ItemTableStandard' | 'ItemTableSimpleCom';
export type PlayerCountOption = 12 | 24;
export type Matrix24Layout = 'expanded' | 'grouped';
export type MatrixDisplayMode = 'pct' | 'both' | 'weight';
export type AvailabilityFilter =
  | 'all'
  | 'phase-1'
  | 'phase-2'
  | 'phase-3'
  | 'phase-4'
  | 'phase-5'
  | 'cooldown'
  | 'permission';

export interface ItemMetadata {
  key: string;
  name: string;
  jpName: string;
  itemType: string;
  notes: string;
  icon: string;
  entryNum: number;
  worldActorCap: number;
  maxHolders12P: number;
  maxHolders24P: number;
  maxSlots12P: number;
  maxSlots24P: number;
  eligibleCount12P: number;
  eligibleCount24P: number;
  eligibleRanks: number[];
  canHaveSameItem: boolean;
  isEnablePermission: boolean;
  useMaxSeconds: number | null;
  openingLockoutSeconds: number;
  unlockPhase: number;
  cooldownSeconds: number;
}

export interface PhaseInfo {
  id: number;
  name: string;
  timeRange: string;
  subtitle: string;
  repSeconds: number;
  clampSummary: string;
  unlockedCount: number;
  newlyUnlocked: string[];
  description: string;
}

export interface TableMeta {
  id: TableId;
  name: string;
}

export interface MKWDataPayload {
  gameVersion: string;
  items: ItemMetadata[];
  phases: PhaseInfo[];
  tablesMeta: TableMeta[];
  itemTables: Record<TableId, Record<string, number[]>>;
  itemRankTable: Record<number, number[]>;
  farDistances: number[];
}

export interface EffectiveRankInfo {
  baseRank: number;
  promotedRank: number;
  distancePromotions: number;
  finalRank: number;
  isClamped: boolean;
  clampApplied: string | null;
}

export interface ItemProbabilityCell {
  rawWeight: number;
  effectiveWeight: number;
  pct: number;
  status: string;
}

export interface ColumnDistribution {
  placement: number;
  lobbySize: number;
  seconds: number;
  rankInfo: EffectiveRankInfo;
  totalWeight: number;
  items: Record<string, ItemProbabilityCell>;
}
