import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface SurveyResponse {
  id: string;
  created_at: string;
  dream_destination: string;
  destination_type: string;
  traveler_type: string;
  activities: string[];
  other_activity: string | null;
}

export interface SurveyInsert extends Omit<SurveyResponse, 'id' | 'created_at'> {}

// Fetch all survey results
export function useSurveyResults() {
  return useQuery({
    queryKey: ["survey_results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("travel_survey_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch survey results:", error);
        throw new Error(error.message);
      }

      return data as SurveyResponse[];
    },
  });
}

// Submit a new survey response
export function useSubmitSurvey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: SurveyInsert) => {
      const { data, error } = await supabase
        .from("travel_survey_results")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("Failed to submit survey:", error);
        throw new Error(error.message);
      }

      return data as SurveyResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey_results"] });
    },
  });
}
