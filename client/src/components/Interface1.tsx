// Interface1 component - latest version v1.0.1 
import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import hotelImage from '../assets/hotel-exterior.jpeg';
import { t } from '../i18n';
import { ActiveOrder } from '@/types';
import { initVapi, getVapiInstance } from '@/lib/vapiClient';
import { FaGlobeAsia } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';

interface Interface1Props {
  isActive: boolean;
}

const Interface1: React.FC<Interface1Props> = ({ isActive }) => {
  const { setCurrentInterface, setTranscripts, setModelOutput, setCallDetails, setCallDuration, setEmailSentForCurrentSession, activeOrders, language, setLanguage } = useAssistant();
  
  // State để lưu trữ tooltip đang hiển thị
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
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

  // Hàm xử lý khi click vào icon
  const handleIconClick = (iconName: string) => {
    // Nếu đang hiển thị tooltip cho icon này rồi thì ẩn đi, ngược lại thì hiển thị
    setActiveTooltip(activeTooltip === iconName ? null : iconName);
    
    // Tự động ẩn tooltip sau 3 giây
    if (activeTooltip !== iconName) {
      setTimeout(() => {
        setActiveTooltip(currentTooltip => currentTooltip === iconName ? null : currentTooltip);
      }, 3000);
    }
  };

  // Component hiển thị icon với tooltip
  const IconWithTooltip = ({ iconName, className }: { iconName: string, className?: string }) => (
    <div className="relative flex flex-col items-center justify-center cursor-pointer">
      <span 
        className={`material-icons text-xl sm:text-4xl text-[#F9BF3B] ${className || ''}`} 
        style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))' }}
        onClick={() => handleIconClick(iconName)}
      >
        {iconName}
      </span>
      
      {activeTooltip === iconName && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[120px] sm:max-w-[180px] bg-white/90 text-gray-800 text-xs sm:text-sm font-medium py-1 px-2 rounded shadow-lg z-50 pointer-events-none text-center">
          {t(`icon_${iconName}`, language)}
          <div className="absolute w-2 h-2 bg-white/90 transform rotate-45 left-1/2 -translate-x-1/2 top-full -mt-1"></div>
        </div>
      )}
    </div>
  );

  return (
    <div 
      className={`absolute w-full min-h-screen h-full transition-opacity duration-500 ${
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } z-10 overflow-y-auto`} 
      id="interface1"
      style={{
        backgroundImage: `linear-gradient(rgba(26, 35, 126, 0.7), rgba(63, 81, 181, 0.7)), url(${hotelImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        perspective: '1000px'
      }}
    >
      <div className="container mx-auto flex flex-col items-center justify-start text-white p-3 pt-6 sm:p-5 sm:pt-10 lg:pt-16 overflow-y-visible pb-24 sm:pb-16" 
        style={{ transform: 'translateZ(20px)', minHeight: 'fit-content' }}
      >
        {/* Language Switcher nâng cao */}
        <div className="flex items-center justify-center sm:justify-end w-full max-w-2xl mb-4 sm:mb-2">
          <div className="flex items-center px-3 py-2 sm:py-1.5 gap-2 transition-all duration-300 mx-auto sm:mx-0" 
            style={{
              background: 'linear-gradient(135deg, #4e5ab7 0%, #3f51b5 100%)',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)', 
              borderRadius: '8px',
              minWidth: '150px',
              maxWidth: '95%',
              width: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
            <FaGlobeAsia className="text-[#F9BF3B] text-xl mr-1.5" 
              style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))' }}
            />
            <label className="mr-2 font-semibold font-sans text-white whitespace-nowrap text-sm sm:text-base">{t('language', language)}:</label>
            <div className="relative flex-1">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as 'en' | 'fr' | 'zh' | 'ru' | 'ko')}
                className="appearance-none w-full pl-6 sm:pl-8 pr-6 py-1 sm:py-1.5 font-sans bg-transparent focus:outline-none transition-all duration-200"
                style={{
                  fontWeight: 600,
                  color: '#fff',
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px'
                }}
              >
                <option value="en">🇬🇧 English</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="ru">🇷🇺 Русский</option>
                <option value="ko">🇰🇷 한국어</option>
              </select>
              <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#F9BF3B] pointer-events-none text-lg" />
            </div>
          </div>
        </div>
        <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-amber-400 mb-2 text-center"
          style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}>{t('hotel_name', language)}</h2>
        <p className="text-xs sm:text-lg lg:text-xl text-center max-w-full mb-4 truncate sm:whitespace-nowrap overflow-x-auto">{t('hotel_subtitle', language)}</p>
        
        {/* Main Call Button với hiệu ứng nâng cao */}
        <div className="relative mb-4 sm:mb-12 flex items-center justify-center">
          {/* Ripple Animation (luôn hiển thị, mạnh hơn khi hover) */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-[ripple_1.5s_linear_infinite] pointer-events-none transition-opacity duration-300 group-hover:opacity-80 opacity-60"></div>
          <div className="absolute inset-0 rounded-full border-4 border-amber-400/70 animate-[ripple_2s_linear_infinite] pointer-events-none transition-opacity duration-300 group-hover:opacity-60 opacity-40"></div>
          {/* Main Button */}
          <button 
            id={`vapiButton${language === 'en' ? 'En' : language === 'fr' ? 'Fr' : language === 'zh' ? 'Zh' : language === 'ru' ? 'Ru' : 'Ko'}`}
            className="group relative w-36 h-36 sm:w-40 sm:h-40 lg:w-56 lg:h-56 rounded-full font-poppins font-bold flex flex-col items-center justify-center overflow-hidden hover:translate-y-[-2px] hover:shadow-[0px_12px_20px_rgba(0,0,0,0.2)]"
            onClick={() => handleCall(language as any)}
            style={{
              background: language === 'en' 
                ? 'linear-gradient(180deg, rgba(78, 90, 183, 0.9) 0%, rgba(56, 65, 152, 0.9) 100%)' // Tiếng Anh - Xanh dương đậm
                : language === 'fr' 
                ? 'linear-gradient(180deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)' // Tiếng Pháp - Xanh da trời
                : language === 'zh' 
                ? 'linear-gradient(180deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%)' // Tiếng Trung - Đỏ
                : language === 'ru' 
                ? 'linear-gradient(180deg, rgba(79, 70, 229, 0.9) 0%, rgba(67, 56, 202, 0.9) 100%)' // Tiếng Nga - Tím
                : 'linear-gradient(180deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)', // Tiếng Hàn - Xanh lá
              boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.25), 0px 6px 12px rgba(0, 0, 0, 0.15), inset 0px 1px 0px rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0) translateZ(30px)',
            }}
          >
            <span className="material-icons text-4xl sm:text-6xl lg:text-7xl mb-2 text-[#F9BF3B] transition-all duration-300 group-hover:scale-110" 
              style={{ 
                filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))',
                color: language === 'en' 
                  ? '#F9BF3B' // Vàng cho tiếng Anh
                  : language === 'fr' 
                  ? '#FFFFFF' // Trắng cho tiếng Pháp
                  : language === 'zh' 
                  ? '#FFEB3B' // Vàng sáng cho tiếng Trung
                  : language === 'ru' 
                  ? '#F48FB1' // Hồng nhạt cho tiếng Nga
                  : '#4ADE80' // Xanh lá sáng cho tiếng Hàn
              }}
            >mic</span>
            {language === 'fr' ? (
              <span className="text-sm sm:text-lg lg:text-2xl font-bold text-white px-2 text-center"
                style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >{t('press_to_call', language)}</span>
            ) : language === 'ru' || language === 'ko' ? (
              <span className="text-sm sm:text-lg lg:text-xl font-bold text-white px-2 text-center"
                style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >{t('press_to_call', language)}</span>
            ) : (
              <span className="text-lg sm:text-2xl lg:text-3xl font-bold whitespace-nowrap text-white"
                style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >{t('press_to_call', language)}</span>
            )}
            <span className="absolute w-full h-full rounded-full pointer-events-none"></span>
          </button>
        </div>
        {/* Services Section - với hiệu ứng Glass Morphism và 3D */}
        <div className="text-center w-full max-w-5xl mb-16 sm:mb-10" style={{ perspective: '1000px' }}>
          <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-y-2 sm:gap-y-2 md:gap-3 text-left mx-auto w-full">
            {/* Room & Stay */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 mb-2 sm:mb-0 min-h-[36px] transition-all duration-250 hover:scale-103 hover:-translate-y-1"
              style={{
                background: 'rgba(63, 81, 181, 0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >{t('room_and_stay', language)}</h4>
              <ul className="grid grid-cols-5 gap-0 sm:gap-2 py-0.5 sm:py-2">
                <li><IconWithTooltip iconName="login" /></li>
                <li><IconWithTooltip iconName="hourglass_empty" /></li>
                <li><IconWithTooltip iconName="info" /></li>
                <li><IconWithTooltip iconName="policy" /></li>
                <li><IconWithTooltip iconName="wifi" /></li>
              </ul>
            </div>
            {/* Room Services - Áp dụng cùng phong cách cho các panel khác */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 mb-2 sm:mb-0 min-h-[36px] transition-all duration-250 hover:scale-103 hover:-translate-y-1"
              style={{
                background: 'rgba(63, 81, 181, 0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >{t('room_services', language)}</h4>
              <ul className="grid grid-cols-7 gap-0 sm:gap-2 py-0.5 sm:py-2">
                <li><IconWithTooltip iconName="restaurant" /></li>
                <li><IconWithTooltip iconName="local_bar" /></li>
                <li><IconWithTooltip iconName="cleaning_services" /></li>
                <li><IconWithTooltip iconName="local_laundry_service" /></li>
                <li><IconWithTooltip iconName="alarm" /></li>
                <li><IconWithTooltip iconName="add_circle" /></li>
                <li><IconWithTooltip iconName="build" /></li>
              </ul>
            </div>
            {/* Bookings & Facilities */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 mb-2 sm:mb-0 min-h-[36px] transition-all duration-250 hover:scale-103 hover:-translate-y-1"
              style={{
                background: 'rgba(63, 81, 181, 0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >{t('bookings_and_facilities', language)}</h4>
              <ul className="grid grid-cols-7 gap-0 sm:gap-2 py-0.5 sm:py-2">
                <li><IconWithTooltip iconName="event_seat" /></li>
                <li><IconWithTooltip iconName="spa" /></li>
                <li><IconWithTooltip iconName="fitness_center" /></li>
                <li><IconWithTooltip iconName="pool" /></li>
                <li><IconWithTooltip iconName="directions_car" /></li>
                <li><IconWithTooltip iconName="medical_services" /></li>
                <li><IconWithTooltip iconName="support_agent" /></li>
              </ul>
            </div>
            {/* Tourism & Exploration */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 mb-2 sm:mb-0 min-h-[36px] transition-all duration-250 hover:scale-103 hover:-translate-y-1"
              style={{
                background: 'rgba(63, 81, 181, 0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >{t('tourism_and_exploration', language)}</h4>
              <ul className="grid grid-cols-7 gap-0 sm:gap-2 py-0.5 sm:py-2">
                <li><IconWithTooltip iconName="location_on" /></li>
                <li><IconWithTooltip iconName="local_dining" /></li>
                <li><IconWithTooltip iconName="directions_bus" /></li>
                <li><IconWithTooltip iconName="directions_car" /></li>
                <li><IconWithTooltip iconName="event" /></li>
                <li><IconWithTooltip iconName="shopping_bag" /></li>
                <li><IconWithTooltip iconName="map" /></li>
              </ul>
            </div>
            {/* Support */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 mb-4 sm:mb-0 min-h-[36px] transition-all duration-250 hover:scale-103 hover:-translate-y-1"
              style={{
                background: 'rgba(63, 81, 181, 0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >{t('support_external_services', language)}</h4>
              <ul className="grid grid-cols-4 gap-0 sm:gap-2 py-0.5 sm:py-2">
                <li><IconWithTooltip iconName="translate" /></li>
                <li><IconWithTooltip iconName="rate_review" /></li>
                <li><IconWithTooltip iconName="report_problem" /></li>
                <li><IconWithTooltip iconName="luggage" /></li>
              </ul>
            </div>
          </div>
        </div>
        {/* Active orders status panels - thêm hiệu ứng 3D và đường viền sáng */}
        {activeOrders && activeOrders.length > 0 && (
          <div className="flex flex-col items-center gap-y-4 mb-16 pb-10 w-full px-2 sm:mb-6 sm:pb-0 sm:flex-row sm:flex-nowrap sm:gap-x-4 sm:overflow-x-auto sm:justify-start"
            style={{ perspective: '1000px' }}
          >
            {[...activeOrders].sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime()).map((o: ActiveOrder) => {
              const deadline = new Date(o.requestedAt.getTime() + 60 * 60 * 1000);
              const diffSec = Math.max(Math.ceil((deadline.getTime() - now.getTime()) / 1000), 0);
              if (diffSec <= 0) return null;
              const mins = Math.floor(diffSec / 60).toString().padStart(2, '0');
              const secs = (diffSec % 60).toString().padStart(2, '0');
              return (
                <div key={o.reference} 
                  className="p-2 sm:p-3 text-gray-800 max-w-xs w-[220px] flex-shrink-0 transition-all duration-250 hover:rotate-1"
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRight: '1px solid rgba(0, 0, 0, 0.2)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
                    transform: 'translateZ(20px)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Đồng hồ đếm ngược ở trên đầu */}
                  <div className="flex justify-center items-center mb-1.5">
                    <span className="font-bold text-lg text-blue-800 bg-blue-50 px-3 py-1 rounded-lg shadow-sm">{`${mins}:${secs}`}</span>
                  </div>
                  
                  <p className="text-xs sm:text-sm mb-0.5"><strong>{t('order_ref', language)}:</strong> {o.reference}</p>
                  <p className="text-xs sm:text-sm mb-0.5"><strong>{t('requested_at', language)}:</strong> {o.requestedAt.toLocaleString('en-US', {timeZone: 'Asia/Ho_Chi_Minh', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'})}</p>
                  <p className="text-xs sm:text-sm mb-0.5"><strong>{t('estimated_completion', language)}:</strong> {o.estimatedTime}</p>
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
