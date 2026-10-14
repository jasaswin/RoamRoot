import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import * as favoriteApi from "../services/favoriteApi";

// Saved listings of the current user + a function to save / unsave
export default function useFavorites() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["favorites"],
    queryFn: favoriteApi.getFavorites,
    enabled: isAuthenticated,
  });

  const savedIds = new Set((query.data?.listings || []).map((l) => l._id));

  const mutation = useMutation({
    mutationFn: ({ listingId, saved }) => (saved ? favoriteApi.removeFavorite(listingId) : favoriteApi.addFavorite(listingId)),
    onSuccess: (data) => {
      toast.success(data.saved ? "Saved to your list" : "Removed from saved");
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return {
    ...query,
    listings: query.data?.listings || [],
    savedIds,
    isSaved: (id) => savedIds.has(id),
    toggle: (listingId) => mutation.mutate({ listingId, saved: savedIds.has(listingId) }),
    toggling: mutation.isPending,
  };
}
