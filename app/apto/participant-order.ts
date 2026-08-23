"use client";

import { useSyncExternalStore } from "react";

import { aptoParticipants } from "./content";

export const featuredParticipantIds = ["northwestern", "uchicago"] as const;

export type ParticipantSection = "program" | "projects" | "tools";
export type ParticipantOrders = Record<ParticipantSection, string[]>;

const participantSections: ParticipantSection[] = ["program", "projects", "tools"];
const canonicalParticipantIds = aptoParticipants.map((participant) => participant.id);
const participantTextLabelOverrides = new Map<string, string>([["aperture", "Apperture.AI"]]);
const participantOrderStorageKey = "apto-participant-orders-v1";

function shuffled<T>(items: readonly T[], random: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.min(index, Math.floor(random() * (index + 1)));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function createParticipantOrder(random: () => number = Math.random) {
  const featured = shuffled(featuredParticipantIds, random);
  const supporting = shuffled(
    canonicalParticipantIds.filter((id) => !featuredParticipantIds.includes(id as (typeof featuredParticipantIds)[number])),
    random,
  );
  return [...featured, ...supporting];
}

export function createParticipantOrders(random: () => number = Math.random): ParticipantOrders {
  return Object.fromEntries(
    participantSections.map((section) => [section, createParticipantOrder(random)]),
  ) as ParticipantOrders;
}

function isParticipantOrders(value: unknown): value is ParticipantOrders {
  if (!value || typeof value !== "object") return false;
  return participantSections.every((section) => {
    const order = (value as Partial<ParticipantOrders>)[section];
    return Array.isArray(order)
      && order.length === canonicalParticipantIds.length
      && canonicalParticipantIds.every((participantId) => order.includes(participantId));
  });
}

function sameParticipantOrder(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((participantId, index) => participantId === right[index]);
}

function nextParticipantOrders(previous: ParticipantOrders | undefined) {
  const next = createParticipantOrders();
  if (!previous) return next;

  for (const section of participantSections) {
    if (sameParticipantOrder(previous[section], next[section])) {
      next[section] = participantOrderForOccurrence(next[section], 1);
    }
  }
  return next;
}

export function participantOrderForOccurrence(order: readonly string[], occurrence: number) {
  if (occurrence % 2 === 0 || order.length < 2) return [...order];
  return [order[1], order[0], ...order.slice(2)];
}

export function orderByParticipant<T extends { participantId: string }>(
  items: readonly T[],
  participantOrder: readonly string[],
) {
  const rank = new Map(participantOrder.map((participantId, index) => [participantId, index]));
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => (
      (rank.get(left.item.participantId) ?? Number.MAX_SAFE_INTEGER)
      - (rank.get(right.item.participantId) ?? Number.MAX_SAFE_INTEGER)
      || left.index - right.index
    ))
    .map(({ item }) => item);
}

export function featuredRows<T extends { participantId: string }>(
  items: readonly T[],
  participantOrder: readonly string[],
) {
  const featuredItems = Object.fromEntries(featuredParticipantIds.map((participantId) => [
    participantId,
    items.filter((item) => item.participantId === participantId),
  ])) as Record<(typeof featuredParticipantIds)[number], T[]>;
  const rowCount = Math.max(...featuredParticipantIds.map((participantId) => featuredItems[participantId].length));

  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const rowOrder = participantOrderForOccurrence(participantOrder, rowIndex).slice(0, 2);
    return rowOrder
      .map((participantId) => featuredItems[participantId as (typeof featuredParticipantIds)[number]]?.[rowIndex])
      .filter((item): item is T => Boolean(item));
  });
}

export function participantNames(participantOrder: readonly string[]) {
  const participantsById = new Map(aptoParticipants.map((participant) => [participant.id, participant]));
  return participantOrder
    .map((participantId) => (
      participantTextLabelOverrides.get(participantId) ?? participantsById.get(participantId)?.displayName
    ))
    .filter((name): name is string => Boolean(name));
}

export function formatParticipantList(participantOrder: readonly string[]) {
  const names = participantNames(participantOrder);
  if (names.length < 2) return names[0] ?? "";
  if (names.length === 2) return names.join(" and ");
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

const escapedParticipantNames = participantNames(canonicalParticipantIds).map((participantName) => (
  participantName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
));
const participantNamePattern = `(?:${escapedParticipantNames.join("|")})`;
const completeCohortPattern = new RegExp(
  `${participantNamePattern}(?:,\\s*${participantNamePattern}){3},?\\s+and\\s+(?:the\\s+)?${participantNamePattern}`,
  "g",
);
const featuredPairPattern = /(?:the\s+)?(?:Northwestern University|University of Chicago)\s+and\s+(?:the\s+)?(?:Northwestern University|University of Chicago)/g;
const supportingParticipantPattern = /(?:Apperture\.AI|Insilicom|Macrocosm),\s*(?:Apperture\.AI|Insilicom|Macrocosm),?\s+and\s+(?:Apperture\.AI|Insilicom|Macrocosm)/g;

export function orderParticipantMentions(text: string, participantOrder: readonly string[]) {
  const completeList = formatParticipantList(participantOrder);
  const featuredList = formatParticipantList(participantOrder.slice(0, 2));
  const supportingList = formatParticipantList(participantOrder.slice(2));
  return text
    .replace(completeCohortPattern, completeList)
    .replace(featuredPairPattern, featuredList)
    .replace(supportingParticipantPattern, supportingList);
}

const serverParticipantOrders = Object.fromEntries(
  participantSections.map((section) => [section, [...canonicalParticipantIds]]),
) as ParticipantOrders;
let browserParticipantOrders: ParticipantOrders | undefined;

function subscribeToParticipantOrders() {
  return () => undefined;
}

function browserSnapshot() {
  if (!browserParticipantOrders) {
    let previous: ParticipantOrders | undefined;
    try {
      const stored = window.sessionStorage.getItem(participantOrderStorageKey);
      const parsed: unknown = stored ? JSON.parse(stored) : undefined;
      if (isParticipantOrders(parsed)) previous = parsed;
    } catch {
      // Storage can be unavailable in privacy-restricted browsing contexts.
    }

    browserParticipantOrders = nextParticipantOrders(previous);
    try {
      window.sessionStorage.setItem(participantOrderStorageKey, JSON.stringify(browserParticipantOrders));
    } catch {
      // Randomization still works when persistence is unavailable.
    }
  }
  return browserParticipantOrders;
}

function serverSnapshot() {
  return serverParticipantOrders;
}

export function useParticipantOrders() {
  return useSyncExternalStore(subscribeToParticipantOrders, browserSnapshot, serverSnapshot);
}
