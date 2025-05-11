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
  const assistant = useAssistant();
  const setCurrentInterface = assistant.setCurrentInterface;
  const setTranscripts = assistant.setTranscripts;
  const setModelOutput = assistant.setModelOutput;
  const setCallDetails = assistant.setCallDetails;
  const setCallDuration = assistant.setCallDuration;
  const setEmailSentForCurrentSession = assistant.setEmailSentForCurrentSession;
  const activeOrders = assistant.activeOrders;
  const language = assistant.language;
  const setLanguage = assistant.setLanguage;
  
  // Track current time for countdown calculations
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hàm dùng chung cho mọi ngôn ngữ
  const handleCall = async (lang: 'en' | 'fr' | 'zh' | 'ru' | 'ko') => {
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
    } else if (lang === 'ru') {
      publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY_RU;
      assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_RU;
    } else if (lang === 'ko') {
      publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY_KO;
      assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_KO;
    }
    const vapi = await initVapi(publicKey);
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
        backgroundImage: `linear-gradient(rgba(26, 35, 126, 0.7), rgba(79, 209, 197, 0.5)), url(${hotelImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(0.8px)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-blueDark/70 via-sea/40 to-sand/60 pointer-events-none" style={{zIndex:1}}></div>
      <div className="container mx-auto flex flex-col items-center justify-start text-white p-3 pt-6 sm:p-5 sm:pt-10 lg:pt-16 overflow-y-auto relative" style={{zIndex:2}}>
        {/* Logo với animation */}
        <div className="flex flex-col items-center mb-2 animate-fadein-scale" style={{animation:'fadein-scale 1.2s'}}>
          <img src="/assets/references/images/minhon-logo.jpg" alt="Minhon Logo" className="h-20 w-20 sm:h-28 sm:w-28 rounded-2xl shadow-xl bg-white/80 p-2 mb-2" style={{objectFit:'cover'}} />
        </div>
        {/* Language Switcher */}
        <div className="flex justify-end w-full max-w-2xl mb-2">
          <label className="mr-2 font-semibold font-sans">{t('language', language)}:</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as 'en' | 'fr' | 'zh' | 'ru' | 'ko')}
            className="rounded px-2 py-1 text-gray-900 font-sans"
          >
            <option value="en">{t('english', language)}</option>
            <option value="fr">{t('french', language)}</option>
            <option value="zh">中文</option>
            <option value="ru">Русский</option>
            <option value="ko">한국어</option>
          </select>
        </div>
        <h2 className="font-['Playfair_Display'] font-bold text-3xl sm:text-4xl lg:text-5xl text-sea mb-2 text-center drop-shadow-lg" style={{letterSpacing:'0.04em'}}>{t('hotel_name', language)}</h2>
        <p className="text-xs sm:text-lg lg:text-xl text-center max-w-full mb-4 truncate sm:whitespace-nowrap overflow-x-auto font-['Montserrat'] text-leaf" style={{fontWeight:600}}>{t('hotel_subtitle', language)}</p>
        <span className="block text-sand font-['Dancing_Script'] text-xl mb-2">Boutique Resort</span>
        
        {/* Main Call Button cải tiến */}
        <div className="relative mb-4 sm:mb-12 flex items-center justify-center">
          {/* Ripple Animation */}
          <span className="absolute inset-0 rounded-full border-4 border-sea animate-ripple pointer-events-none opacity-70"></span>
          <span className="absolute inset-0 rounded-full border-4 border-leaf animate-ripple2 pointer-events-none opacity-40"></span>
          {/* 3D Button */}
          <button
            id="vapiButton"
            className="group relative w-36 h-36 sm:w-40 sm:h-40 lg:w-56 lg:h-56 rounded-full bg-gradient-to-br from-sea via-blueLight to-sand text-blueDark font-poppins font-bold flex flex-col items-center justify-center shadow-2xl border-4 border-white/70 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sea overflow-hidden transition-all duration-300 active:scale-98"
            style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 2px 8px 0 #4FD1C5'}}
            onClick={() => handleCall(language)}
          >
            {/* Pulse effect */}
            <span className="absolute w-full h-full rounded-full bg-sea/30 animate-pulse pointer-events-none"></span>
            {/* Mic icon */}
            <span className="material-icons text-5xl sm:text-7xl lg:text-8xl mb-2 animate-mic-pulse group-hover:animate-mic-bounce text-white drop-shadow-lg">mic</span>
            <span className="text-base sm:text-lg lg:text-xl font-bold whitespace-normal px-2 text-center leading-tight text-blueDark drop-shadow">{t('press_to_call', language)}</span>
          </button>
        </div>
        {/* Services Section cải tiến */}
        <div className="text-center w-full max-w-5xl">
          <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-y-4 md:gap-6 text-left mx-auto w-full">
            {/* Room & Stay */}
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-sm w-4/5 mx-auto md:w-64 mb-0 min-h-[40px] shadow-lg group transition-all hover:scale-105 hover:shadow-2xl">
              <h4 className="font-medium text-sea border-b border-sea/30 pb-0.5 mb-1 text-xs sm:text-sm tracking-wide uppercase">{t('room_and_stay', language)}</h4>
              <ul className="grid grid-cols-5 gap-1 sm:gap-3 py-1 sm:py-2">
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-blueLight drop-shadow-md hover:text-sea transition-colors">login</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-blueLight drop-shadow-md hover:text-sea transition-colors">hourglass_empty</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-blueLight drop-shadow-md hover:text-sea transition-colors">info</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-blueLight drop-shadow-md hover:text-sea transition-colors">policy</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-blueLight drop-shadow-md hover:text-sea transition-colors">wifi</span></li>
              </ul>
            </div>
            {/* Room Services */}
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-sm w-4/5 mx-auto md:w-64 mb-0 min-h-[40px] shadow-lg group transition-all hover:scale-105 hover:shadow-2xl">
              <h4 className="font-medium text-sea border-b border-sea/30 pb-0.5 mb-1 text-xs sm:text-sm tracking-wide uppercase">{t('room_services', language)}</h4>
              <ul className="grid grid-cols-7 gap-1 sm:gap-3 py-1 sm:py-2">
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">restaurant</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">local_bar</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">cleaning_services</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">local_laundry_service</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">alarm</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">add_circle</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">build</span></li>
              </ul>
            </div>
            {/* Bookings & Facilities */}
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-sm w-4/5 mx-auto md:w-64 mb-0 min-h-[40px] shadow-lg group transition-all hover:scale-105 hover:shadow-2xl">
              <h4 className="font-medium text-sea border-b border-sea/30 pb-0.5 mb-1 text-xs sm:text-sm tracking-wide uppercase">{t('bookings_and_facilities', language)}</h4>
              <ul className="grid grid-cols-7 gap-1 sm:gap-3 py-1 sm:py-2">
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-sand drop-shadow-md hover:text-sea transition-colors">event_seat</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-sand drop-shadow-md hover:text-sea transition-colors">spa</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-sand drop-shadow-md hover:text-sea transition-colors">fitness_center</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-sand drop-shadow-md hover:text-sea transition-colors">pool</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-sand drop-shadow-md hover:text-sea transition-colors">directions_car</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-sand drop-shadow-md hover:text-sea transition-colors">medical_services</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-sand drop-shadow-md hover:text-sea transition-colors">support_agent</span></li>
              </ul>
            </div>
            {/* Tourism & Exploration */}
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-sm w-4/5 mx-auto md:w-64 mb-0 min-h-[40px] shadow-lg group transition-all hover:scale-105 hover:shadow-2xl">
              <h4 className="font-medium text-sea border-b border-sea/30 pb-0.5 mb-1 text-xs sm:text-sm tracking-wide uppercase">{t('tourism_and_exploration', language)}</h4>
              <ul className="grid grid-cols-7 gap-1 sm:gap-3 py-1 sm:py-2">
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">location_on</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">local_dining</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">directions_bus</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">directions_car</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">event</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">shopping_bag</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-leaf drop-shadow-md hover:text-sea transition-colors">map</span></li>
              </ul>
            </div>
            {/* Support */}
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-sm w-4/5 mx-auto md:w-64 mb-0 min-h-[40px] shadow-lg group transition-all hover:scale-105 hover:shadow-2xl">
              <h4 className="font-medium text-sea border-b border-sea/30 pb-0.5 mb-1 text-xs sm:text-sm tracking-wide uppercase">{t('support_external_services', language)}</h4>
              <ul className="grid grid-cols-4 gap-1 sm:gap-3 py-1 sm:py-2">
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-sand drop-shadow-md hover:text-sea transition-colors">translate</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-sand drop-shadow-md hover:text-sea transition-colors">rate_review</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-sand drop-shadow-md hover:text-sea transition-colors">report_problem</span></li>
                <li className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform"><span className="material-icons text-3xl sm:text-5xl text-sand drop-shadow-md hover:text-sea transition-colors">luggage</span></li>
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
