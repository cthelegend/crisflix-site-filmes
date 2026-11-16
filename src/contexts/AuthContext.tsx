import { LEGAL_VERSION } from "@/lib/legal";
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { prepareAvatar, safeAvatarUrl, validateDisplayName } from "@/lib/security";
import { clearLegacyProgressCookie } from "@/lib/continueWatching";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  user_id: string;
  slot: number;
  display_name: string;
  avatar_url: string | null;
}
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profiles: UserProfile[];
  profile: UserProfile | null;
  activeProfile: UserProfile | null;
  profilesError: string | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, acceptedTerms: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  selectProfile: (profile: UserProfile) => void;
  clearActiveProfile: () => void;
  createProfile: (payload: { displayName: string; avatarUrl: string | null }) => Promise<UserProfile>;
  uploadAvatar: (file: File, profileId: string) => Promise<string>;
  updateProfile: (profileId: string, payload: { displayName: string; avatarUrl: string | null }) => Promise<UserProfile>;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const selectionKey = (userId: string) => `foice-filme:active-profile:${userId}`;
function storedSelection(userId: string) {
  try { return localStorage.getItem(selectionKey(userId)); } catch { return null; }
}
function sanitizeProfile(profile: UserProfile): UserProfile {
  return { ...profile, avatar_url: safeAvatarUrl(profile.avatar_url, import.meta.env.VITE_SUPABASE_URL, profile.user_id) };
}
async function loadProfiles(currentUser: User): Promise<UserProfile[]> {
  if (!supabase) return [];
  const query = () => supabase.from("viewing_profiles").select("id,user_id,slot,display_name,avatar_url")
    .eq("user_id", currentUser.id).order("slot").limit(3).returns<UserProfile[]>();
  let result = await query();
  if (result.error) throw result.error;
  if (!result.data?.length) {
    const raw = currentUser.user_metadata?.display_name;
    const name = (typeof raw === "string" && raw.trim() ? raw.trim() : currentUser.email?.split("@")[0] || "Meu perfil").slice(0, 80);
    const { error } = await supabase.from("viewing_profiles").upsert({
      id: currentUser.id, user_id: currentUser.id, slot: 1, display_name: name, avatar_url: null,
    }, { onConflict: "user_id,slot", ignoreDuplicates: true });
    if (error) throw error;
    result = await query();
    if (result.error) throw result.error;
  }
  return (result.data || []).map(sanitizeProfile);
}
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionUserId = useRef<string | null>(null);
  const profileVersion = useRef(0);
  const selectedId = useRef<string | null>(null);
  const ownedProfiles = useRef<UserProfile[]>([]);
  const activate = (next: UserProfile | null) => {
    selectedId.current = next?.id ?? null;
    setActiveProfile(next);
    const accountId = next?.user_id || sessionUserId.current;
    if (!accountId) return;
    try {
      if (next) localStorage.setItem(selectionKey(accountId), next.id);
      else localStorage.removeItem(selectionKey(accountId));
    } catch { /* browser storage unavailable */ }
  };
  const applyProfiles = (rows: UserProfile[], accountId: string) => {
    ownedProfiles.current = rows;
    setProfiles(rows);
    setProfilesError(null);
    const preferred = selectedId.current || storedSelection(accountId);
    activate(rows.find((item) => item.id === preferred) || (rows.length === 1 ? rows[0] : null));
  };
  const refreshProfile = async () => {
    if (!user || !supabase) return;
    const version = ++profileVersion.current;
    try {
      const rows = await loadProfiles(user);
      if (sessionUserId.current === user.id && profileVersion.current === version) applyProfiles(rows, user.id);
    } catch (error) {
      if (sessionUserId.current === user.id && profileVersion.current === version) setProfilesError("Não foi possível carregar seus perfis. Tente novamente.");
      throw error;
    }
  };
  useEffect(() => {
    clearLegacyProgressCookie();
    if (!supabase) { setLoading(false); return; }
    let disposed = false;
    const applySession = (nextSession: Session | null) => {
      if (disposed) return;
      const version = ++profileVersion.current;
      const nextId = nextSession?.user.id ?? null;
      const changed = sessionUserId.current !== nextId;
      if (changed) {
        ownedProfiles.current = [];
        setProfiles([]); setActiveProfile(null); setProfilesError(null); selectedId.current = null;
        if (nextId) setLoading(true);
      }
      sessionUserId.current = nextId;
      setSession(nextSession); setUser(nextSession?.user ?? null);
      if (!nextSession?.user) {
        ownedProfiles.current = [];
        setProfiles([]); setActiveProfile(null); selectedId.current = null; setLoading(false);
        return;
      }
      queueMicrotask(() => {
        if (disposed || version !== profileVersion.current) return;
        void loadProfiles(nextSession.user).then((rows) => {
          if (!disposed && version === profileVersion.current) applyProfiles(rows, nextSession.user.id);
        }).catch(() => {
          if (!disposed && version === profileVersion.current) {
            setProfilesError("Não foi possível carregar seus perfis. Tente novamente.");
            if (changed) { setProfiles([]); setActiveProfile(null); }
          }
        }).finally(() => { if (!disposed && version === profileVersion.current) setLoading(false); });
      });
    };
    let authEventSeen = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventSeen = true; applySession(nextSession);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!authEventSeen) applySession(error ? null : data.session);
    }).catch(() => { if (!authEventSeen) applySession(null); });
    return () => { disposed = true; ++profileVersion.current; subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user, session, profiles, profile: activeProfile, activeProfile, profilesError, loading, configured: isSupabaseConfigured,
    refreshProfile,
    selectProfile: (next) => {
      const own = profiles.find((item) => item.id === next.id && item.user_id === user?.id);
      if (own) activate(own);
    },
    clearActiveProfile: () => activate(null),
    signIn: async (email, password) => {
      if (!supabase) throw new Error("Supabase não configurado.");
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    },
    signUp: async (email, password, displayName, acceptedTerms) => {
      if (!acceptedTerms) throw new Error("Aceite os Termos de Serviço para criar sua conta.");
      if (!supabase) throw new Error("Supabase não configurado.");
      const name = validateDisplayName(displayName);
      if (password.length < 12 || password.length > 128) throw new Error("Use uma senha entre 12 e 128 caracteres.");
      const { error } = await supabase.auth.signUp({ email: email.trim(), password,
        options: { data: { display_name: name, terms_version: LEGAL_VERSION, terms_accepted_at: new Date().toISOString() }, emailRedirectTo: `${window.location.origin}/profile` },
      });
      if (error) throw error;
    },
    signOut: async () => {
      if (!supabase) return;
      const accountId = user?.id;
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
      // Do not clear a new account if a stale logout request finishes afterwards.
      if (sessionUserId.current && sessionUserId.current !== accountId) return;
      ++profileVersion.current;
      ownedProfiles.current = [];
      setSession(null); setUser(null); setProfiles([]); setProfilesError(null); activate(null);
      sessionUserId.current = null; setLoading(false);
      try { if (accountId) localStorage.removeItem(selectionKey(accountId)); } catch { /* storage disabled */ }
    },
    createProfile: async ({ displayName, avatarUrl }) => {
      if (!supabase || !user) throw new Error("Sessão indisponível.");
      if (ownedProfiles.current.length >= 3) throw new Error("Esta conta já possui 3 perfis.");
      const name = validateDisplayName(displayName);
      const avatar = safeAvatarUrl(avatarUrl, import.meta.env.VITE_SUPABASE_URL, user.id);
      if (avatarUrl && !avatar?.startsWith("/avatars/")) throw new Error("Escolha um avatar disponível.");
      const { data, error } = await supabase.rpc("create_viewing_profile", {
        p_display_name: name, p_avatar_url: avatar, p_expected_user_id: user.id,
      }).single<UserProfile>();
      if (error) throw error;
      const next = sanitizeProfile(data);
      if (sessionUserId.current !== user.id || next.user_id !== user.id) throw new Error("Sessão alterada. Tente novamente.");
      ++profileVersion.current;
      ownedProfiles.current = [...ownedProfiles.current.filter((item) => item.id !== next.id), next].sort((a, b) => a.slot - b.slot);
      setProfiles(ownedProfiles.current);
      return next;
    },
    uploadAvatar: async (file, profileId) => {
      if (!supabase || !user || !ownedProfiles.current.some((item) => item.id === profileId && item.user_id === user.id)) throw new Error("Perfil indisponível.");
      const accountId = user.id;
      const image = await prepareAvatar(file);
      if (sessionUserId.current !== accountId) throw new Error("Sessão alterada. Tente novamente.");
      const path = `${accountId}/${profileId}.png`;
      const { error } = await supabase.storage.from("avatars").upload(path, image, { cacheControl: "0", contentType: "image/png", upsert: true });
      if (error) throw error;
      if (sessionUserId.current !== accountId) throw new Error("Sessão alterada. Tente novamente.");
      return `${supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl}?v=${crypto.randomUUID()}`;
    },
    updateProfile: async (profileId, { displayName, avatarUrl }) => {
      if (!supabase || !user || !ownedProfiles.current.some((item) => item.id === profileId && item.user_id === user.id)) throw new Error("Perfil indisponível.");
      const name = validateDisplayName(displayName);
      const avatar = safeAvatarUrl(avatarUrl, import.meta.env.VITE_SUPABASE_URL, user.id);
      if (avatarUrl && !avatar) throw new Error("Escolha um avatar disponível ou envie uma imagem.");
      const { data, error } = await supabase.from("viewing_profiles").update({ display_name: name, avatar_url: avatar })
        .eq("user_id", user.id).eq("id", profileId).select("id,user_id,slot,display_name,avatar_url").single<UserProfile>();
      if (error) throw error;
      if (sessionUserId.current !== user.id) throw new Error("Sessão alterada. Tente novamente.");
      const next = sanitizeProfile(data);
      ++profileVersion.current;
      ownedProfiles.current = ownedProfiles.current.map((item) => item.id === profileId ? next : item);
      setProfiles(ownedProfiles.current);
      if (selectedId.current === profileId) activate(next);
      return next;
    },
  }), [user, session, profiles, activeProfile, profilesError, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
