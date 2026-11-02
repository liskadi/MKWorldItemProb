import { MKW_DATA } from '../data/mkwData';
import type {
  ColumnDistribution,
  EffectiveRankInfo,
  ItemProbabilityCell,
  Matrix24Layout,
  PhaseInfo,
  PlayerCountOption,
  TableId,
} from '../types/mkw';

const ORDINAL_SUFFIXES = ['th', 'st', 'nd', 'rd'];

export function ordinal(n: number): string {
  const v = n % 100;
  return n + (ORDINAL_SUFFIXES[(v - 20) % 10] || ORDINAL_SUFFIXES[v] || ORDINAL_SUFFIXES[0]);
}

export function getPhaseForSeconds(seconds: number): PhaseInfo {
  if (seconds < 25) return MKW_DATA.phases[0];
  if (seconds < 30) return MKW_DATA.phases[1];
  if (seconds < 35) return MKW_DATA.phases[2];
  if (seconds < 45) return MKW_DATA.phases[3];
  return MKW_DATA.phases[4];
}

export function resolveEffectiveRank(
  placement: number,
  lobbySize: number,
  seconds: number,
  distanceMeters = 0
): EffectiveRankInfo {
  const rankRow = MKW_DATA.itemRankTable[lobbySize] ?? MKW_DATA.itemRankTable[12];
  const baseRank = rankRow[Math.min(Math.max(1, placement), rankRow.length) - 1];

  let promotedRank = baseRank;
  let distancePromotions = 0;

  if (distanceMeters > 0 && placement > 1) {
    let bonus = 0;
    for (const threshold of MKW_DATA.farDistances) {
      if (distanceMeters >= threshold) bonus++;
    }
    if (bonus > 0) {
      promotedRank = Math.min(12, baseRank + bonus);
      distancePromotions = promotedRank - baseRank;
    }
  }

  let finalRank = promotedRank;
  let clampApplied: string | null = null;

  if (finalRank === 1 && seconds < 25) {
    finalRank = 4;
    clampApplied = '4th (Clamped)';
  } else if (finalRank > 1 && finalRank < 5 && seconds < 25) {
    finalRank = 5;
    clampApplied = '5th (Clamped)';
  } else if (finalRank > 7 && seconds < 30) {
    finalRank = 7;
    clampApplied = '7th (Clamped)';
  }

  return {
    baseRank,
    promotedRank,
    distancePromotions,
    finalRank,
    isClamped: clampApplied !== null,
    clampApplied,
  };
}

export interface ComputeColumnArgs {
  placement: number;
  lobbySize: number;
  seconds: number;
  tableId: TableId;
  heldItemKey?: string;
  distanceMeters?: number;
}

export function computeColumnDistribution({
  placement,
  lobbySize,
  seconds,
  tableId,
  heldItemKey = 'None',
  distanceMeters = 0,
}: ComputeColumnArgs): ColumnDistribution {
  const rankInfo = resolveEffectiveRank(placement, lobbySize, seconds, distanceMeters);
  const rankIdx = rankInfo.finalRank - 1;
  const tableWeights = MKW_DATA.itemTables[tableId];

  const items: Record<string, ItemProbabilityCell> = {};
  let totalWeight = 0;

  for (const item of MKW_DATA.items) {
    const rawWeight = tableWeights[item.key][rankIdx];
    let effectiveWeight = rawWeight;
    let status = 'available';

    if (item.openingLockoutSeconds > seconds) {
      effectiveWeight = 0;
      status = `Locked until ${item.openingLockoutSeconds}s`;
    } else if (heldItemKey === item.key && !item.canHaveSameItem) {
      effectiveWeight = 0;
      status = 'Blocked (Already held in Slot 1)';
    }

    items[item.key] = { rawWeight, effectiveWeight, pct: 0, status };
    totalWeight += effectiveWeight;
  }

  if (totalWeight > 0) {
    for (const item of MKW_DATA.items) {
      const cell = items[item.key];
      cell.pct = (cell.effectiveWeight / totalWeight) * 100;
    }
  }

  return {
    placement,
    lobbySize,
    seconds,
    rankInfo,
    totalWeight,
    items,
  };
}

export interface MatrixColumnDef {
  label: string;
  repPlacement: number;
}

export function getColumnsForMatrix(
  players: PlayerCountOption,
  layout24: Matrix24Layout
): MatrixColumnDef[] {
  if (players === 12 || layout24 === 'expanded') {
    return Array.from({ length: players }, (_, idx) => ({
      label: ordinal(idx + 1),
      repPlacement: idx + 1,
    }));
  }

  const row24 = MKW_DATA.itemRankTable[24];
  const groups = new Map<number, number[]>();
  row24.forEach((poolRank, idx) => {
    const list = groups.get(poolRank) ?? [];
    list.push(idx + 1);
    groups.set(poolRank, list);
  });

  return Array.from(groups.values()).map((positions) => ({
    label:
      positions.length === 1
        ? ordinal(positions[0])
        : `${ordinal(positions[0])}–${ordinal(positions[positions.length - 1])}`,
    repPlacement: positions[0],
  }));
}

export function getHeatmapBg(pct: number): string {
  if (pct <= 0) return 'transparent';
  if (pct < 8) {
    const alpha = 0.14 + (pct / 8) * 0.16;
    return `linear-gradient(180deg, rgba(0, 210, 255, ${(alpha * 0.85).toFixed(3)}), rgba(0, 140, 255, ${alpha.toFixed(3)}))`;
  }
  if (pct < 25) {
    const alpha = 0.24 + ((pct - 8) / 17) * 0.24;
    return `linear-gradient(180deg, rgba(0, 230, 118, ${(alpha * 0.85).toFixed(3)}), rgba(0, 180, 90, ${alpha.toFixed(3)}))`;
  }
  if (pct < 50) {
    const alpha = 0.34 + ((pct - 25) / 25) * 0.26;
    return `linear-gradient(180deg, rgba(255, 206, 0, ${(alpha * 0.85).toFixed(3)}), rgba(255, 136, 0, ${alpha.toFixed(3)}))`;
  }
  const alpha = Math.min(0.78, 0.56 + ((pct - 50) / 50) * 0.22);
  return `linear-gradient(180deg, rgba(255, 56, 92, ${(alpha * 0.9).toFixed(3)}), rgba(220, 20, 60, ${alpha.toFixed(3)}))`;
}
