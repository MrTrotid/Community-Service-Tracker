import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Home: FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showTeamInfo, setShowTeamInfo] = useState(false);

  const teamMembers = [
    {
      name: "Baman Prasad Guragain",
      role: "Project Lead & Developer",
      class: "2023-2025 Batch",
    },
    {
      name: "Prachetash Dhakal",
      role: "UI Designer & Developer",
      class: "2024-2026 Batch",
    },
    {
      name: "Samragyi Lamichhane",
      role: "Frontend Developer",
      class: "2024-2026 Batch",
    },
    {
      name: "Samip Aryal",
      role: "Frontend Developer",
      class: "2023-2025 Batch",
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FF] relative overflow-hidden flex items-center">
      {/* Main content */}
      <div className="container mx-auto px-4 relative">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <h1 className="text-[#0A1041] text-5xl md:text-6xl font-bold leading-tight">
              Community Service Tracker
            </h1>
            <p className="text-[#4A5568] text-lg md:max-w-xl">
              CST is the digitized and efficient version of tracking, planning and organizing your community service
              hours. Easily track your hours and milestones with CST.
            </p>
            {!currentUser && <p className="text-[#4A5568]">Login to continue further</p>}
            <div className="flex gap-4 pt-4">
              {!currentUser && (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-[#0A1041] text-white px-8 py-2 rounded hover:bg-[#0A1041]/90"
                >
                  Login
                </button>
              )}
              <button 
                onClick={() => setShowTeamInfo(true)}
                className="border border-[#0A1041] text-[#0A1041] px-8 py-2 rounded hover:bg-[#0A1041]/10"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img-idMv2BD6UjEjuG0Laz3flmskODT34V.png"
              alt="Person interacting with computer screen"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Centered Modal */}
      <AnimatePresence>
        {showTeamInfo && (
          <>
            {/* Fixed Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTeamInfo(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
              >
                {/* Modal Header */}
                <div className="bg-[#0A1041] text-white px-4 py-3 flex justify-between items-center">
                  <h3 className="text-xl font-bold">Our Team</h3>
                  <button
                    onClick={() => setShowTeamInfo(false)}
                    className="text-white/80 hover:text-white text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
                
                {/* Modal Body */}
                <div className="p-4">
                  <div className="grid gap-3">
                    {teamMembers.map((member, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-lg border border-gray-100 hover:border-blue-500 transition-colors"
                      >
                        <h4 className="text-base font-semibold text-[#0A1041]">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        <p className="text-xs text-gray-500">{member.class}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-center text-xs text-gray-600">
                      Project developed for St. Xavier's College
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Background Shape */}
      <div
        className="absolute top-0 left-0 w-full h-full -z-10"
        style={{
          background: "radial-gradient(circle at 0% 0%, #F8F9FF 0%, #F8F9FF 60%, #E8EEFF 100%)",
        }}
      />
    </div>
  );
};

