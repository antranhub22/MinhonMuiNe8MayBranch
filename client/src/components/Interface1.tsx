import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import hotelImage from '../assets/hotel-exterior.jpeg';
import { t } from '../i18n';
import { ActiveOrder } from '@/types';
import { initVapi, getVapiInstance } from '@/lib/vapiClient';

interface Interface1Props {
  isActive: boolean;
}

const Interface1: React.FC<Interface1Props> = ({ isActive }) => {
  const { setCurrentInterface, setTranscripts, setModelOutput, setCallDetails, setCallDuration, setEmailSentForCurrentSession, activeOrders, language, setLanguage } = useAssistant();
  
  // Track current time for countdown calculations
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hàm dùng chung cho cả English, French, Chinese
  const handleCall = async (lang: 'en' | 'fr' | 'zh') => {
    setEmailSentForCurrentSession(false);
    setCallDetails({
      id: `call-${Date.now()}`,
      roomNumber: '',
      duration: '0',
      category: ''
    });
    setTranscripts([]);
    setModelOutput([]);
    setCallDuration(0);
    let publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    let assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;
    if (lang === 'fr') {
      publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY_FR;
      assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_FR;
    } else if (lang === 'zh') {
      publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY_ZH;
      assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_ZH;
    }
    const vapi = await initVapi(lang);
    if (vapi && assistantId) {
      await vapi.start(assistantId);
      setCurrentInterface('interface2');
    }
  };

  return (
    <div 
      className={`absolute w-full min-h-screen h-full transition-opacity duration-500 ${
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } z-10 overflow-y-auto`} 
      id="interface1"
      style={{
        backgroundImage: `linear-gradient(rgba(26, 35, 126, 0.8), rgba(63, 81, 181, 0.8)), url(${hotelImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto flex flex-col items-center justify-start text-white p-3 pt-6 sm:p-5 sm:pt-10 lg:pt-16 overflow-y-auto">
        {/* Language Switcher */}
        <div className="flex justify-end w-full max-w-2xl mb-2">
          <label className="mr-2 font-semibold">{t('language', language)}:</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as 'en' | 'fr' | 'zh' | 'ru')}
            className="rounded px-2 py-1 text-gray-900"
          >
            <option value="en">{t('english', language)}</option>
            <option value="fr">{t('french', language)}</option>
            <option value="zh">中文</option>
            <option value="ru">Русский</option>
          </select>
        </div>
        <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-amber-400 mb-2 text-center">{t('hotel_name', language)}</h2>
        <p className="text-xs sm:text-lg lg:text-xl text-center max-w-full mb-4 truncate sm:whitespace-nowrap overflow-x-auto">{t('hotel_subtitle', language)}</p>
        
        {/* Main Call Button */}
        <div className="relative mb-4 sm:mb-12 flex items-center justify-center">
          {/* Ripple Animation (luôn hiển thị, mạnh hơn khi hover) */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-[ripple_1.5s_linear_infinite] pointer-events-none transition-opacity duration-300 group-hover:opacity-80 opacity-60"></div>
          <div className="absolute inset-0 rounded-full border-4 border-amber-400/70 animate-[ripple_2s_linear_infinite] pointer-events-none transition-opacity duration-300 group-hover:opacity-60 opacity-40"></div>
          {/* Main Button */}
          {language === 'fr' ? (
            <button 
              id="vapiButtonFr"
              className="group relative w-36 h-36 sm:w-40 sm:h-40 lg:w-56 lg:h-56 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-primary-dark font-poppins font-bold flex flex-col items-center justify-center shadow-2xl transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-300 overflow-hidden"
              onClick={() => handleCall('fr')}
            >
              <span className="material-icons text-4xl sm:text-6xl lg:text-7xl mb-2 animate-mic-pulse group-hover:animate-mic-bounce text-shadow-lg">mic</span>
              <span className="text-sm sm:text-base lg:text-lg font-bold whitespace-normal px-2 text-center leading-tight">{t('press_to_call', language)}</span>
              <span className="absolute w-full h-full rounded-full pointer-events-none group-hover:animate-wave-pulse"></span>
            </button>
          ) : (
            <button 
              id="vapiButtonEn"
              className="group relative w-36 h-36 sm:w-40 sm:h-40 lg:w-56 lg:h-56 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-primary-dark font-poppins font-bold flex flex-col items-center justify-center shadow-2xl transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-300 overflow-hidden"
              onClick={() => handleCall('en')}
            >
              <span className="material-icons text-4xl sm:text-6xl lg:text-7xl mb-2 animate-mic-pulse group-hover:animate-mic-bounce text-shadow-lg">mic</span>
              <span className="text-lg sm:text-2xl lg:text-3xl font-bold whitespace-nowrap">{t('press_to_call', language)}</span>
              <span className="absolute w-full h-full rounded-full pointer-events-none group-hover:animate-wave-pulse"></span>
            </button>
          )}
        </div>
        {/* Services Section */}
        <div className="text-center w-full max-w-5xl">
          <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-y-2 md:gap-3 text-left mx-auto w-full">
            {/* Room & Stay */}
            <div className="bg-white/10 p-0.5 sm:p-2 rounded-lg backdrop-blur-sm w-4/5 mx-auto md:w-64 mb-0 min-h-[40px]">
              <h4 className="font-medium text-amber-400 border-b border-amber-400/30 pb-0.5 mb-1 text-xs sm:text-sm">{t('room_and_stay', language)}</h4>
              <ul className="grid grid-cols-5 gap-0.5 sm:gap-2 py-0.5 sm:py-2">
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">login</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">hourglass_empty</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">info</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">policy</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">wifi</span></li>
              </ul>
            </div>
            {/* Room Services */}
            <div className="bg-white/10 p-0.5 sm:p-2 rounded-lg backdrop-blur-sm w-4/5 mx-auto md:w-64 mb-0 min-h-[40px]">
              <h4 className="font-medium text-amber-400 border-b border-amber-400/30 pb-0.5 mb-1 text-xs sm:text-sm">{t('room_services', language)}</h4>
              <ul className="grid grid-cols-7 gap-0.5 sm:gap-2 py-0.5 sm:py-2">
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">restaurant</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">local_bar</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">cleaning_services</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">local_laundry_service</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">alarm</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">add_circle</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">build</span></li>
              </ul>
            </div>
            {/* Bookings & Facilities */}
            <div className="bg-white/10 p-0.5 sm:p-2 rounded-lg backdrop-blur-sm w-4/5 mx-auto md:w-64 mb-0 min-h-[40px]">
              <h4 className="font-medium text-amber-400 border-b border-amber-400/30 pb-0.5 mb-1 text-xs sm:text-sm">{t('bookings_and_facilities', language)}</h4>
              <ul className="grid grid-cols-7 gap-0.5 sm:gap-2 py-0.5 sm:py-2">
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">event_seat</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">spa</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">fitness_center</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">pool</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">directions_car</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">medical_services</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">support_agent</span></li>
              </ul>
            </div>
            {/* Tourism & Exploration */}
            <div className="bg-white/10 p-0.5 sm:p-2 rounded-lg backdrop-blur-sm w-4/5 mx-auto md:w-64 mb-0 min-h-[40px]">
              <h4 className="font-medium text-amber-400 border-b border-amber-400/30 pb-0.5 mb-1 text-xs sm:text-sm">{t('tourism_and_exploration', language)}</h4>
              <ul className="grid grid-cols-7 gap-0.5 sm:gap-2 py-0.5 sm:py-2">
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">location_on</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">local_dining</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">directions_bus</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">directions_car</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">event</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">shopping_bag</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">map</span></li>
              </ul>
            </div>
            {/* Support */}
            <div className="bg-white/10 p-0.5 sm:p-2 rounded-lg backdrop-blur-sm w-4/5 mx-auto md:w-64 mb-0 min-h-[40px]">
              <h4 className="font-medium text-amber-400 border-b border-amber-400/30 pb-0.5 mb-1 text-xs sm:text-sm">{t('support_external_services', language)}</h4>
              <ul className="grid grid-cols-4 gap-0.5 sm:gap-2 py-0.5 sm:py-2">
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">translate</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">rate_review</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">report_problem</span></li>
                <li className="flex flex-col items-center justify-center"><span className="material-icons text-xl sm:text-4xl text-amber-400">luggage</span></li>
              </ul>
            </div>
          </div>
        </div>
        {/* Active orders status panels (up to 60 min countdown) */}
        {activeOrders && activeOrders.length > 0 && (
          <div className="flex flex-col items-center gap-y-4 mb-6 w-full px-2 sm:flex-row sm:flex-nowrap sm:gap-x-4 sm:overflow-x-auto sm:justify-start">
            {activeOrders.map((o: ActiveOrder) => {
              const deadline = new Date(o.requestedAt.getTime() + 60 * 60 * 1000);
              const diffSec = Math.max(Math.ceil((deadline.getTime() - now.getTime()) / 1000), 0);
              if (diffSec <= 0) return null;
              const mins = Math.floor(diffSec / 60).toString().padStart(2, '0');
              const secs = (diffSec % 60).toString().padStart(2, '0');
              return (
                <div key={o.reference} className="bg-white/80 backdrop-blur-sm p-2 sm:p-3 rounded-lg text-gray-800 shadow max-w-xs w-[220px] border border-white/40 flex-shrink-0">
                  <p className="text-xs sm:text-sm mb-0.5"><strong>{t('order_ref', language)}:</strong> {o.reference}</p>
                  <p className="text-xs sm:text-sm mb-0.5"><strong>{t('requested_at', language)}:</strong> {o.requestedAt.toLocaleString('en-US', {timeZone: 'Asia/Ho_Chi_Minh', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'})}</p>
                  <p className="text-xs sm:text-sm mb-0.5"><strong>{t('estimated_completion', language)}:</strong> {o.estimatedTime}</p>
                  <p className="text-xs sm:text-sm"><strong>{t('time_remaining', language)}:</strong> {`${mins}:${secs}`}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Interface1;
