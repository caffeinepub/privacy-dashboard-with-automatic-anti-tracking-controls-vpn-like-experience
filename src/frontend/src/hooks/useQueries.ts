import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, PrivacySettings, BlocklistUpdateResult } from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// Privacy Settings Queries
export function useGetPrivacySettings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PrivacySettings>({
    queryKey: ['privacySettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPrivacySettings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetAutoStopTracking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (autoStop: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAutoStopTracking(autoStop);
    },
    onMutate: async (autoStop) => {
      await queryClient.cancelQueries({ queryKey: ['privacySettings'] });
      const previousSettings = queryClient.getQueryData<PrivacySettings>(['privacySettings']);
      
      if (previousSettings) {
        queryClient.setQueryData<PrivacySettings>(['privacySettings'], {
          ...previousSettings,
          autoStopTracking: autoStop,
        });
      }
      
      return { previousSettings };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(['privacySettings'], context.previousSettings);
      }
      toast.error(`Failed to update setting: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacySettings'] });
    },
  });
}

// Blocklist Mutations
export function useAddBlockEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domain: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBlockEntry(domain);
    },
    onMutate: async (domain) => {
      await queryClient.cancelQueries({ queryKey: ['privacySettings'] });
      const previousSettings = queryClient.getQueryData<PrivacySettings>(['privacySettings']);
      
      if (previousSettings) {
        queryClient.setQueryData<PrivacySettings>(['privacySettings'], {
          ...previousSettings,
          blockList: [...previousSettings.blockList, domain],
        });
      }
      
      return { previousSettings };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(['privacySettings'], context.previousSettings);
      }
      toast.error(`Failed to add domain: ${error.message}`);
    },
    onSuccess: (result: BlocklistUpdateResult) => {
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
      queryClient.invalidateQueries({ queryKey: ['privacySettings'] });
    },
  });
}

export function useRemoveBlockEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domain: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeBlockEntry(domain);
    },
    onMutate: async (domain) => {
      await queryClient.cancelQueries({ queryKey: ['privacySettings'] });
      const previousSettings = queryClient.getQueryData<PrivacySettings>(['privacySettings']);
      
      if (previousSettings) {
        queryClient.setQueryData<PrivacySettings>(['privacySettings'], {
          ...previousSettings,
          blockList: previousSettings.blockList.filter(d => d !== domain),
        });
      }
      
      return { previousSettings };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(['privacySettings'], context.previousSettings);
      }
      toast.error(`Failed to remove domain: ${error.message}`);
    },
    onSuccess: (result: BlocklistUpdateResult) => {
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
      queryClient.invalidateQueries({ queryKey: ['privacySettings'] });
    },
  });
}
