import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { cn } from "@/lib/utils";
import { useSubmitSurvey, type SurveyInsert } from "@/hooks/use-survey";

// Constants for form options
const DESTINATION_TYPES = ["Beach", "City", "Mountains/Nature", "Cultural/Historical", "Adventure", "Other"];
const TRAVELER_TYPES = ["Luxury traveler", "Budget traveler", "Adventure seeker", "Relaxation-focused", "Solo traveler", "Group traveler"];
const ACTIVITIES = ["Sightseeing", "Food/Restaurants", "Hiking/Outdoors", "Nightlife", "Shopping", "Relaxing (spa/beach)", "Other"];

const surveySchema = z.object({
  dream_destination: z.string().min(1, "Destination is required").max(100, "Destination is too long"),
  destination_type: z.string().min(1, "Please select a destination type"),
  traveler_type: z.string().min(1, "Please select what kind of traveler you are"),
  activities: z.array(z.string()).min(1, "Select at least one activity"),
  other_activity: z.string().optional(),
}).refine(data => {
  if (data.activities.includes("Other") && (!data.other_activity || data.other_activity.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please describe the other activity",
  path: ["other_activity"]
});

type SurveyFormValues = z.infer<typeof surveySchema>;

export default function Survey() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutateAsync: submitSurvey, isPending } = useSubmitSurvey();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      dream_destination: "",
      destination_type: "",
      traveler_type: "",
      activities: [],
      other_activity: "",
    },
  });

  const selectedActivities = watch("activities") || [];
  const hasOtherActivity = selectedActivities.includes("Other");

  const onSubmit = async (data: SurveyFormValues) => {
    try {
      const payload: SurveyInsert = {
        dream_destination: data.dream_destination.trim(),
        destination_type: data.destination_type,
        traveler_type: data.traveler_type,
        activities: data.activities,
        other_activity: hasOtherActivity ? data.other_activity?.trim() || null : null,
      };
      
      await submitSurvey(payload);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      // Error is logged in hook, could add a toast here if desired
    }
  };

  const handleReset = () => {
    reset();
    setIsSuccess(false);
  };

  return (
    <Layout>
      <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <header className="flex items-center justify-between mb-8 sm:mb-12">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <Link href="/results" className="text-sm font-semibold text-primary hover:underline underline-offset-4">
            View Results
          </Link>
        </header>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="glass-panel p-8 sm:p-12 rounded-3xl text-center space-y-6"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-extrabold text-foreground font-display">Thank you!</h2>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Your dream destination has been recorded. Your response helps build our global travel insights map.
              </p>
              
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Submit Another
                </button>
                <Link
                  href="/results"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                >
                  View Live Results
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-8 sm:space-y-12"
            >
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold font-display">Travel Preferences Survey</h1>
                <p className="text-muted-foreground text-lg">Tell us about your ultimate travel dreams.</p>
              </div>

              <div className="space-y-10">
                {/* Question 1 */}
                <div className="glass-panel p-6 sm:p-8 rounded-2xl">
                  <label htmlFor="dream_destination" className="block text-xl font-bold mb-4">
                    1. What is your dream travel destination? <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register("dream_destination")}
                    id="dream_destination"
                    type="text"
                    autoFocus
                    placeholder="e.g. Santorini, Greece"
                    className={cn(
                      "w-full px-5 py-4 rounded-xl bg-background border-2 transition-all duration-200 text-lg",
                      "focus:outline-none focus:ring-4",
                      errors.dream_destination 
                        ? "border-destructive focus:border-destructive focus:ring-destructive/20" 
                        : "border-border focus:border-primary focus:ring-primary/20"
                    )}
                    aria-describedby={errors.dream_destination ? "q1-error" : undefined}
                    aria-invalid={!!errors.dream_destination}
                  />
                  {errors.dream_destination && (
                    <p id="q1-error" className="text-destructive font-medium mt-2 text-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                      {errors.dream_destination.message}
                    </p>
                  )}
                </div>

                {/* Question 2 */}
                <div className="glass-panel p-6 sm:p-8 rounded-2xl">
                  <label htmlFor="destination_type" className="block text-xl font-bold mb-4">
                    2. What type of destination do you prefer? <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("destination_type")}
                      id="destination_type"
                      className={cn(
                        "w-full px-5 py-4 rounded-xl bg-background border-2 transition-all duration-200 text-lg appearance-none cursor-pointer",
                        "focus:outline-none focus:ring-4",
                        errors.destination_type 
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20 text-destructive" 
                          : "border-border focus:border-primary focus:ring-primary/20 text-foreground"
                      )}
                      aria-describedby={errors.destination_type ? "q2-error" : undefined}
                      aria-invalid={!!errors.destination_type}
                    >
                      <option value="" disabled className="text-muted-foreground">Select a preference...</option>
                      {DESTINATION_TYPES.map((type) => (
                        <option key={type} value={type} className="text-foreground">{type}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-muted-foreground">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  {errors.destination_type && (
                    <p id="q2-error" className="text-destructive font-medium mt-2 text-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                      {errors.destination_type.message}
                    </p>
                  )}
                </div>

                {/* Question 3 */}
                <div className="glass-panel p-6 sm:p-8 rounded-2xl">
                  <label className="block text-xl font-bold mb-6">
                    3. What kind of traveler are you? <span className="text-destructive">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="traveler_type"
                    render={({ field }) => (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TRAVELER_TYPES.map((type) => (
                          <label 
                            key={type} 
                            className={cn(
                              "relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-secondary/50",
                              field.value === type 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "border-border bg-background"
                            )}
                          >
                            <input
                              type="radio"
                              className="sr-only"
                              value={type}
                              checked={field.value === type}
                              onChange={field.onChange}
                              aria-describedby={errors.traveler_type ? "q3-error" : undefined}
                            />
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors",
                              field.value === type ? "border-primary" : "border-muted-foreground"
                            )}>
                              {field.value === type && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </div>
                            <span className={cn("font-medium", field.value === type ? "text-primary" : "text-foreground")}>
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                  {errors.traveler_type && (
                    <p id="q3-error" className="text-destructive font-medium mt-3 text-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                      {errors.traveler_type.message}
                    </p>
                  )}
                </div>

                {/* Question 4 */}
                <div className="glass-panel p-6 sm:p-8 rounded-2xl">
                  <label className="block text-xl font-bold mb-2">
                    4. What activities would you want to do? <span className="text-destructive">*</span>
                  </label>
                  <p className="text-muted-foreground text-sm mb-6">Select all that apply.</p>
                  
                  <Controller
                    control={control}
                    name="activities"
                    render={({ field }) => (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ACTIVITIES.map((activity) => {
                          const isChecked = field.value.includes(activity);
                          return (
                            <label 
                              key={activity} 
                              className={cn(
                                "relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-secondary/50",
                                isChecked 
                                  ? "border-primary bg-primary/5 shadow-sm" 
                                  : "border-border bg-background"
                              )}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                value={activity}
                                checked={isChecked}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...field.value, activity]
                                    : field.value.filter((val) => val !== activity);
                                  field.onChange(newValue);
                                }}
                                aria-describedby={errors.activities ? "q4-error" : undefined}
                              />
                              <div className={cn(
                                "w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors",
                                isChecked ? "border-primary bg-primary" : "border-muted-foreground"
                              )}>
                                {isChecked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                              </div>
                              <span className={cn("font-medium", isChecked ? "text-primary" : "text-foreground")}>
                                {activity}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  />
                  {errors.activities && (
                    <p id="q4-error" className="text-destructive font-medium mt-3 text-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                      {errors.activities.message}
                    </p>
                  )}

                  <AnimatePresence>
                    {hasOtherActivity && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <label htmlFor="other_activity" className="block text-sm font-bold text-foreground mb-2">
                          Please describe your other activity <span className="text-destructive">*</span>
                        </label>
                        <input
                          {...register("other_activity")}
                          id="other_activity"
                          type="text"
                          autoFocus
                          placeholder="What else would you like to do?"
                          className={cn(
                            "w-full px-5 py-3 rounded-xl bg-background border-2 transition-all duration-200",
                            "focus:outline-none focus:ring-4",
                            errors.other_activity 
                              ? "border-destructive focus:border-destructive focus:ring-destructive/20" 
                              : "border-border focus:border-primary focus:ring-primary/20"
                          )}
                          aria-describedby={errors.other_activity ? "other-error" : undefined}
                          aria-invalid={!!errors.other_activity}
                        />
                        {errors.other_activity && (
                          <p id="other-error" className="text-destructive font-medium mt-2 text-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                            {errors.other_activity.message}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-lg text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 flex items-center justify-center gap-2",
                    isPending 
                      ? "bg-primary/70 cursor-not-allowed transform-none" 
                      : "bg-primary hover:bg-primary/90 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30"
                  )}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Survey
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
