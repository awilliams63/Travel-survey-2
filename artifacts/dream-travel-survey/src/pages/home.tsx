import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Compass } from "lucide-react";
import { Layout } from "@/components/layout";

export default function Home() {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 shadow-sm border border-primary/20">
              <Compass className="w-4 h-4" />
              <span>Share your wanderlust</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-foreground mb-6">
              Discover your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#b875ff]">
                Dream Travel
              </span>
              <br /> Destinations.
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
              We're exploring the travel preferences and dream destinations of wanderers everywhere. Take our quick survey to contribute to the global travel map.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link 
                href="/survey" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground shadow-[0_8px_20px_-4px_rgba(138,59,219,0.4)] hover:shadow-[0_12px_25px_-4px_rgba(138,59,219,0.5)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Take the Survey
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link 
                href="/results" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg bg-white border-2 border-border text-foreground hover:border-primary/30 hover:bg-secondary/50 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <BarChart3 className="w-5 h-5 text-primary" />
                View Results
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-white/40 group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent z-10 opacity-60"></div>
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
              alt="Abstract travel background" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
            />
            {/* Glassmorphism floating card */}
            <div className="absolute bottom-8 left-8 right-8 glass-panel rounded-2xl p-6 z-20">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[#b875ff] flex items-center justify-center shadow-inner">
                  <Compass className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Where to next?</h3>
                  <p className="text-sm text-muted-foreground">Join hundreds of others who shared their dream.</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
}
