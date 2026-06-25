import { useState, useEffect, useCallback } from 'react';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
}

const STORAGE_KEY = 'sw_family_safe_word';
const MEMBERS_KEY = 'sw_family_members';

function loadSafeWord(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function loadMembers(): FamilyMember[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSafeWord(value: string) {
  if (typeof window === 'undefined') return;
  try {
    if (value.trim()) localStorage.setItem(STORAGE_KEY, value.trim());
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* noop */ }
}

function saveMembers(members: FamilyMember[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  } catch { /* noop */ }
}

export function useFamilySafeWord() {
  const [safeWord, setSafeWordState] = useState<string>('');
  const [members, setMembersState] = useState<FamilyMember[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSafeWordState(loadSafeWord());
    setMembersState(loadMembers());
    setHydrated(true);
  }, []);

  const setSafeWord = useCallback((value: string) => {
    const trimmed = value.trim();
    setSafeWordState(trimmed);
    saveSafeWord(trimmed);
  }, []);

  const addMember = useCallback((name: string, relation: string) => {
    const trimmedName = name.trim();
    const trimmedRelation = relation.trim();
    if (!trimmedName || !trimmedRelation) return;
    setMembersState((prev) => {
      const next = [...prev, { id: 'fam-' + Date.now(), name: trimmedName, relation: trimmedRelation }];
      saveMembers(next);
      return next;
    });
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembersState((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveMembers(next);
      return next;
    });
  }, []);

  return {
    safeWord,
    members,
    hasSafeWord: safeWord.length > 0,
    setSafeWord,
    addMember,
    removeMember,
    hydrated,
  };
}
