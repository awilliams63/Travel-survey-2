import { Link } from "wouter";
import { ArrowLeft, Loader2, Users, AlertCircle } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { Layout } from "@/components/layout";
import { useSurveyResults, type SurveyResponse } from "@/hooks/use-survey";
import { useMemo } from "react";

// Helper to normalize strings for comparison (lowercase and trim)
const normalize = (str: string) => str.toLowerCase().trim();

// Capitalize first letter of each word for display
const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => text => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

export default function Results() {
  const { data: results, isLoading, isError, error } = useSurveyResults();

  // Process data for charts
  const {
    totalResponses,
    destinationTypesData,
    travelerTypesData,
    activitiesData,
    topDestinationsData
  } = useMemo(() => {
    if (!results || results.length === 0) {
      return {
        totalResponses: 0,
        destinationTypesData: [],
        travelerTypesData: [],
        activitiesData: [],
        topDestinationsData: []
      };
    }

    const destTypeCount: Record<string, number> = {};
    const travelerTypeCount: Record<string, number> = {};
    const activitiesCount: Record<string, number> = {};
    const dreamDestCount: Record<string, number> = {};

    results.forEach(row => {
      // 1. Destination Types
      destTypeCount[row.destination_type] = (destTypeCount[row.destination_type] || 0) + 1;
      
      // 2. Traveler Types
      travelerTypeCount[row.traveler_type] = (travelerTypeCount[row.traveler_type] || 0) + 1;
      
      // 3. Activities
      row.activities.forEach(act => {
        if (act === "Other" && row.other_activity) {
          // Normalize user-entered labels for grouping
          const normOther = normalize(row.other_activity);
          activitiesCount[normOther] = (activitiesCount[normOther] || 0) + 1;
        } else if (act !== "Other") {
          activitiesCount[act] = (activitiesCount[act] || 0) + 1;
        }
      });

      // 4. Dream Destinations
      const normDest = normalize(row.dream_destination);
      dreamDestCount[normDest] = (dreamDestCount[normDest] || 0) + 1;
    });

    // Format for Recharts
    const formatData = (record: Record<string, number>, capitalize = false) => 
      Object.entries(record)
        .map(([name, count]) => ({ name: capitalize ? toTitleCase(name) : name, count }))
        .sort((a, b) => b.count - a.count);

    return {
      totalResponses: results.length,
      destinationTypesData: formatData(destTypeCount),
      travelerTypesData: formatData(travelerTypeCount),
      activitiesData: formatData(activitiesCount, true).slice(0, 15), // Top 15 activities
      topDestinationsData: formatData(dreamDestCount, true).slice(0, 10), // Top 10 destinations
    };
  }, [results]);

  // Color palette for chart bars
  const colors = ['#8A3BDB', '#9D58E1', '#B075E7', '#C291ED', '#D5AEF3'];

  // Custom Tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-lg text-sm">
          <p className="font-bold mb-1">{label}</p>
          <p className="text-primary font-medium">{`${payload[0].value} response${payload[0].value !== 1 ? 's' : ''}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display">Survey Results</h1>
            <p className="text-muted-foreground mt-2">Aggregated insights from all travelers.</p>
          </div>
          
          <div className="glass-panel px-6 py-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Responses</p>
              <p className="text-3xl font-extrabold text-foreground leading-none">
                {isLoading ? "-" : totalResponses}
              </p>
            </div>
          </div>
        </header>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-medium text-muted-foreground">Compiling insights...</p>
          </div>
        )}

        {isError && (
          <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Failed to load results</h2>
            <p className="text-muted-foreground max-w-md">{error?.message || "An unexpected error occurred."}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-6 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !isError && totalResponses === 0 && (
          <div className="glass-panel p-16 rounded-3xl flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <BarChart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No responses yet</h2>
            <p className="text-muted-foreground mb-8">Be the first to share your travel dreams!</p>
            <Link href="/survey" className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
              Take the Survey
            </Link>
          </div>
        )}

        {!isLoading && !isError && totalResponses > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Destination Types */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col">
              <h3 className="text-xl font-bold mb-6 font-display">Preferred Destination Types</h3>
              <div className="h-[300px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={destinationTypesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {destinationTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Traveler Types */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col">
              <h3 className="text-xl font-bold mb-6 font-display">Traveler Personas</h3>
              <div className="h-[300px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={travelerTypesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {travelerTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Top Activities */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl lg:col-span-2">
              <h3 className="text-xl font-bold mb-2 font-display">Most Popular Activities</h3>
              <p className="text-sm text-muted-foreground mb-8">Including custom user responses</p>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={activitiesData} 
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis dataKey="name" type="category" width={150} axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "hsl(var(--foreground))", fontWeight: 500 }} />
                    <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                      {activitiesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Top Dream Destinations */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl lg:col-span-2">
              <h3 className="text-xl font-bold mb-2 font-display">Top 10 Dream Destinations</h3>
              <p className="text-sm text-muted-foreground mb-8">Based on open-ended responses</p>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={topDestinationsData} 
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis dataKey="name" type="category" width={150} axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "hsl(var(--foreground))", fontWeight: 500 }} />
                    <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24} fill="hsl(var(--primary))">
                      {topDestinationsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
}
