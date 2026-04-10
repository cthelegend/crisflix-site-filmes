import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { getContinueWatching } from "@/lib/continueWatching";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { saveRemoteContinueWatching } from "@/lib/userMedia";

const ACTIVE_PROFILE_KEY = "crisflix-active-profile";

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  activeProfile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  selectProfile: (profile: UserProfile) => void;
  clearActiveProfile: () => void;
  uploadAvatar: (file: File) => Promise<string>;
  updateProfile: (payload: { displayName: string; avatarUrl: string | null }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle<UserProfile>();
  if (error) throw error;
  return data;
}

async function getOrCreateProfile(currentUser: User) {
  if (!supabase) return null;

  const existingProfile = await fetchProfile(currentUser.id);
  if (existingProfile) return existingProfile;

  const fallbackName =
    typeof currentUser.user_metadata?.display_name === "string" && currentUser.user_metadata.display_name.trim()
      ? currentUser.user_metadata.display_name.trim()
      : currentUser.email?.split("@")[0] || "Meu perfil";

  const { error } = await supabase.from("profiles").upsert({
    id: currentUser.id,
    display_name: fallbackName,
    avatar_url: null,
  });
  if (error) throw error;

  return fetchProfile(currentUser.id);
}

function getAuthRedirectUrl() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/profile`;
}

function getSafeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-");
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const selectProfile = (nextProfile: UserProfile) => {
    setActiveProfile(nextProfile);
    localStorage.setItem(ACTIVE_PROFILE_KEY, nextProfile.id);
  };

  const clearActiveProfile = () => {
    setActiveProfile(null);
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  };

  const refreshProfile = async () => {
    if (!user || !supabase) {
      setProfile(null);
      setActiveProfile(null);
      return;
    }

    const nextProfile = await getOrCreateProfile(user);
    setProfile(nextProfile);

    if (nextProfile) {
      const storedId = localStorage.getItem(ACTIVE_PROFILE_KEY);
      if (storedId === nextProfile.id || !storedId) {
        setActiveProfile(nextProfile);
      }
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      const currentSession = data.session;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const nextProfile = await getOrCreateProfile(currentSession.user);
        setProfile(nextProfile);
        if (nextProfile) {
          const storedId = localStorage.getItem(ACTIVE_PROFILE_KEY);
          if (storedId === nextProfile.id || !storedId) {
            setActiveProfile(nextProfile);
          }
        }
      }

      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      queueMicrotask(async () => {
        if (nextSession?.user) {
          const nextProfile = await getOrCreateProfile(nextSession.user);
          setProfile(nextProfile);

          if (nextProfile) {
            const storedId = localStorage.getItem(ACTIVE_PROFILE_KEY);
            if (storedId === nextProfile.id || !storedId) {
              setActiveProfile(nextProfile);
            }
          }

          const localProgress = getContinueWatching();
          await Promise.allSettled(localProgress.map((entry) => saveRemoteContinueWatching(nextSession.user.id, entry)));
        } else {
          setProfile(null);
          setActiveProfile(null);
          localStorage.removeItem(ACTIVE_PROFILE_KEY);
        }
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      activeProfile,
      loading,
      configured: isSupabaseConfigured,
      signIn: async (email, password) => {
        if (!supabase) throw new Error("Supabase não configurado.");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUp: async (email, password, displayName) => {
        if (!supabase) throw new Error("Supabase não configurado.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: getAuthRedirectUrl(),
          },
        });
        if (error) throw error;

        if (data.user && data.session) {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            display_name: displayName,
            avatar_url: null,
          });
          if (profileError) throw profileError;
          await supabase.auth.signOut();
        }
      },
      signOut: async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
      refreshProfile,
      selectProfile,
      clearActiveProfile,
      uploadAvatar: async (file) => {
        if (!supabase || !user) throw new Error("Sessão indisponível.");
        if (!file.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");

        const safeName = getSafeFileName(file.name || "avatar.jpg");
        const path = `${user.id}/${Date.now()}-${safeName}`;

        const { error } = await supabase.storage.from("avatars").upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: true,
        });
        if (error) throw error;

        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        return data.publicUrl;
      },
      updateProfile: async ({ displayName, avatarUrl }) => {
        if (!supabase || !user) throw new Error("Sessão indisponível.");
        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          display_name: displayName,
          avatar_url: avatarUrl,
        });
        if (error) throw error;
        const nextProfile = await fetchProfile(user.id);
        setProfile(nextProfile);
        if (nextProfile) {
          setActiveProfile(nextProfile);
          localStorage.setItem(ACTIVE_PROFILE_KEY, nextProfile.id);
        }
      },
    }),
    [activeProfile, loading, profile, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
