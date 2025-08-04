import React from 'react';
import { Users, MessageCircle, Phone, LifeBuoy, MapPin, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Support = () => {
  const { addActivity } = useAuth();
  // Local support centers in Malawi
  const localSupportCenters = [
    {
      id: 1,
      name: "Vintage Health Wellness Centre",
      type: "Therapy & Wellness",
      location: "Namiwawa, Blantyre, Malawi",
      tel: "+265 (0) 995 260 153 / 888 912 092",
      email: "info@vintagehealthmw.com",
      url: "https://vintagehealthmw.com/"
    },
    {
      id: 2,
      name: "Harmony Mental Wellness Solutions",
      type: "Mental Health Therapy",
      location: "Blantyre, Malawi",
      tel: "+265 (0) 888 200 222 / 994 30 30 49",
      email: "info@harmonymw.org",
      url: "https://harmonymw.org/"
    }
  ];

  const mentalHealthPlatforms = [
    {
      id: 1,
      name: "7 Cups",
      logo: "https://placehold.co/80x80/E0F2F7/0284C7?text=7C",
      description: "Online therapy and free support from trained listeners for emotional support and well-being.",
      website: "https://www.7cups.com"
    },
    {
      id: 2,
      name: "BetterHelp",
      logo: "https://placehold.co/80x80/F0F9FF/0C4A6E?text=BH",
      description: "Professional online counseling for individuals, couples, and teens, accessible from anywhere.",
      website: "https://www.betterhelp.com"
    },
    {
      id: 3,
      name: "Talkspace",
      logo: "https://placehold.co/80x80/ECFDF5/059669?text=TS",
      description: "Online therapy and psychiatry services, connecting you with licensed therapists via text, audio, and video.",
      website: "https://www.talkspace.com"
    },
    {
      id: 4,
      name: "Calmery",
      logo: "https://placehold.co/80x80/FEF2F2/DC2626?text=CY",
      description: "Guided meditations, sleep stories, and mindfulness programs to help you relax and improve mental clarity.",
      website: "https://www.calmery.com"
    },
    {
      id: 5,
      name: "MantraCare",
      logo: "https://placehold.co/80x80/D1FAE5/065F46?text=MC",
      description: "Online therapy, counseling, and mental wellness programs with services available in Malawi.",
      website: "https://mantracare.org/malawi/"
    }
  ];

  const handlePlatformClick = (platform) => {
    addActivity('Support', `Accessed support platform: ${platform.name}`);
    window.open(platform.website, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Available Support Professionals</h2> 
        <p className="text-slate-600 dark:text-slate-300 mb-6">Browse our directory of qualified mental health professionals ready to help you on your journey.</p>
      </div>

      {/* Local Support in Malawi Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
          Local Support in Malawi
        </h3>
        <div className="space-y-6">
          {localSupportCenters.map((center) => (
            <div key={center.id} className="flex flex-col md:flex-row md:items-center md:justify-between border border-slate-200 dark:border-slate-600 rounded-xl p-6 bg-white dark:bg-slate-800 shadow hover:shadow-md transition-all">
              <div className="flex-1 min-w-0">
                <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{center.name}</h4>
                <p className="text-base font-medium text-indigo-700 dark:text-indigo-400 mb-2">{center.type}</p>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{center.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                  <Phone className="w-4 h-4" />
                  <span>{center.tel}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{center.email}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                <a
                  href={center.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white text-base font-semibold rounded-lg shadow hover:bg-indigo-700 transition-colors"
                >
                  Visit Site
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mental Health Platforms */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
          Online Mental Health Platforms
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Connect with trusted online mental health platforms for professional support, therapy, and wellness resources.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {mentalHealthPlatforms.map((platform) => (
            <div key={platform.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex items-center gap-6">
              <img src={platform.logo} alt={platform.name} className="w-20 h-20 rounded-full object-cover" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{platform.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{platform.description}</p>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  onClick={() => handlePlatformClick(platform)}
                >
                  Visit Platform
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;