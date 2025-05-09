import React, { useEffect, useState } from 'react';
import { useAssistant } from '../context/AssistantContext';
import { ServiceRequest } from '../types';
import { t } from '../i18n';

interface Interface3KoProps {
  isActive: boolean;
}

const Interface3Ko: React.FC<Interface3KoProps> = ({ isActive }) => {
  const {
    callSummary,
    orderSummary,
    setCurrentInterface,
    setOrderSummary,
    setOrder,
    serviceRequests,
    emailSentForCurrentSession,
    setEmailSentForCurrentSession,
    callDetails,
    callDuration,
    language,
  } = useAssistant();

  const [note, setNote] = useState('');

  // Handle input changes
  const handleInputChange = (field: string, value: string | number) => {
    if (!orderSummary) return;
    setOrderSummary({
      ...orderSummary,
      [field]: value,
    });
  };

  // Enhance order items with service request details (optional, similar to Interface3Fr)
  useEffect(() => {
    if (isActive && serviceRequests && serviceRequests.length > 0 && orderSummary) {
      const newItems = serviceRequests.map((request: ServiceRequest, index: number) => {
        let quantity = 1;
        let price = 10;
        if (request.serviceType === 'housekeeping') price = 8;
        if (request.serviceType === 'technical-support') price = 0;
        if (request.serviceType.includes('food') || request.serviceType === 'room-service') price = 15;
        if (request.serviceType === 'wake-up') price = 0;
        let description = '';
        const details = request.details;
        if (details.roomNumber && details.roomNumber !== 'unknown' && details.roomNumber !== 'Not specified')
          description += `${t('room_number', 'ko')}: ${details.roomNumber}\n`;
        if (details.date && details.date !== 'Not specified')
          description += `${t('time', 'ko')}: ${details.date}\n`;
        if (details.time && details.time !== 'Not specified')
          description += `${t('time', 'ko')}: ${details.time}\n`;
        if (details.people) {
          description += `인원수: ${details.people}\n`;
        }
        if (details.location && details.location !== 'Not specified')
          description += `장소: ${details.location}\n`;
        if (details.amount && details.amount !== 'Not specified')
          description += `금액: ${details.amount}\n`;
        description += `\n요청: ${request.requestText}`;
        if (details.otherDetails && details.otherDetails !== 'Not specified' && details.otherDetails !== 'None' && !details.otherDetails.includes('Not specified'))
          description += `\n\n추가 정보: ${details.otherDetails}`;
        return {
          id: (index + 1).toString(),
          name: request.requestText.length > 60 ? request.requestText.substring(0, 57) + '...' : request.requestText,
          description: description,
          quantity: quantity,
          price: price,
          serviceType: request.serviceType,
        };
      });
      const uniqueServiceTypes = Array.from(new Set(serviceRequests.map((r) => r.serviceType)));
      const serviceTypes = uniqueServiceTypes.join(',');
      let deliveryTime = orderSummary.deliveryTime;
      if (
        serviceRequests.some(
          (r) => r.details && r.details.time && typeof r.details.time === 'string' && r.details.time.toLowerCase().includes('immediate')
        )
      ) {
        deliveryTime = 'asap';
      }
      const roomNumberDetail = serviceRequests.find(
        (r) =>
          r.details &&
          r.details.roomNumber &&
          r.details.roomNumber !== 'unknown' &&
          r.details.roomNumber !== 'Not specified'
      )?.details?.roomNumber;
      setOrderSummary({
        ...orderSummary,
        items: newItems,
        totalAmount: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        orderType: serviceTypes,
        roomNumber: roomNumberDetail || orderSummary.roomNumber,
        deliveryTime: deliveryTime,
      });
    }
  }, [serviceRequests, isActive, orderSummary, setOrderSummary]);

  // Handle confirm order
  const handleConfirmOrder = async () => {
    if (!orderSummary) return;
    const orderReference = `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrder({
      reference: orderReference,
      estimatedTime: '15-20분',
      summary: orderSummary,
    });
    if (emailSentForCurrentSession) {
      setCurrentInterface('interface4');
      return;
    }
    try {
      const formattedDuration = callDuration
        ? `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`
        : '0:00';
      const generatedCallId = `call-${Date.now()}`;
      const currentCallId = callDetails?.id || generatedCallId;
      const emailPayload = {
        toEmail: 'tuans2@gmail.com',
        callDetails: {
          callId: currentCallId,
          roomNumber: orderSummary.roomNumber || '확인 필요',
          summary: callSummary ? callSummary.content : '요약 없음',
          timestamp: callSummary ? callSummary.timestamp : new Date(),
          duration: formattedDuration,
          serviceRequests: orderSummary.items.map((item) => item.name),
          orderReference: orderReference,
          note: note,
        },
      };
      setTimeout(async () => {
        try {
          const response = await fetch('/api/send-call-summary-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
            cache: 'no-cache',
            credentials: 'same-origin',
          });
          if (!response.ok) {
            throw new Error(`서버 응답 상태: ${response.status}`);
          }
          await response.json();
          setEmailSentForCurrentSession(true);
        } catch (innerError) {
          console.error('이메일 전송 오류:', innerError);
        }
      }, 500);
    } catch (error) {
      console.error('이메일 전송 오류:', error);
    }
    setCurrentInterface('interface4');
  };

  if (!orderSummary) return null;

  return (
    <div
      className={`absolute w-full min-h-screen h-full transition-opacity duration-500 ${
        isActive ? 'opacity-100 active' : 'opacity-0 pointer-events-none'
      } z-30 overflow-y-auto`}
      id="interface3ko"
      data-interface="interface3ko"
      data-active={isActive.toString()}
      style={{
        backgroundImage: 'linear-gradient(rgba(26, 35, 126, 0.8), rgba(63, 81, 181, 0.8))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'SF Pro Text, Roboto, Open Sans, Arial, sans-serif',
      }}
    >
      <div className="container mx-auto h-full flex flex-col p-2 sm:p-4 md:p-8">
        <div className="mx-auto w-full max-w-3xl bg-white/90 rounded-2xl shadow-xl p-3 sm:p-6 md:p-10 mb-4 sm:mb-6 flex-grow border border-white/40 backdrop-blur-md" style={{ minHeight: 420 }}>
          <div className="mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-200">
            <p className="font-poppins font-bold text-xl sm:text-2xl text-blue-900 tracking-wide">{t('order_summary', 'ko')}</p>
          </div>
          {/* AI 요약 */}
          <div id="summary-container" className="mb-3 sm:mb-4">
            {callSummary ? (
              <div className="p-3 sm:p-5 bg-white/80 rounded-xl shadow border border-white/30 mb-3 sm:mb-4 relative" style={{ backdropFilter: 'blur(2px)' }}>
                <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 text-blue-800">{t('summary', 'ko')}</h3>
                <div className="text-xs sm:text-base leading-relaxed text-gray-800 whitespace-pre-line" style={{ fontWeight: 400 }}>
                  {(() => {
                    const lines = (callSummary.content || '').split('\n');
                    return lines.map((line, idx) => {
                      let replaced = line
                        .replace(/^Room Number:/i, `${t('room_number', 'ko')}:`)
                        .replace(/^Guest's Name.*:/i, `${t('guest_name', 'ko')}:`)
                        .replace(/^REQUEST (\d+):/i, (m, n) => `요청 ${n} :`)
                        .replace(/^• Service Timing:/i, `• 서비스 시간 :`)
                        .replace(/^• Order Details:/i, `• 주문 세부사항 :`)
                        .replace(/^• Special Requirements:/i, `• 특별 요구사항 :`)
                        .replace(/^Next Step:/i, `다음 단계 :`)
                        .replace(/Not specified/gi, '미지정')
                        .replace(/Details:/gi, '세부사항 :')
                        .replace(/Assistance or reservation for golf activity requested/gi, '골프 활동 지원 또는 예약 요청됨');
                      return <div key={idx}>{replaced}</div>;
                    });
                  })()}
                </div>
                <div className="mt-2 sm:mt-3 flex justify-end">
                  <div className="text-xs text-gray-500">
                    {t('generated_at', 'ko')} {new Date(callSummary.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          {/* Notes, room number, actions */}
          <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6 w-full">
            <div className="flex items-center space-x-2">
              <label className="text-xs sm:text-base text-gray-600 font-medium">{t('room_number', 'ko')}</label>
              <input
                type="text"
                className="w-20 sm:w-32 p-2 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] bg-white/70 text-gray-900 font-semibold"
                value={orderSummary.roomNumber}
                onChange={(e) => handleInputChange('roomNumber', e.target.value)}
              />
            </div>
            <button
              className="h-full px-3 sm:px-4 bg-white/70 text-blue-900 rounded-full text-xs sm:text-base font-semibold border border-white/30 shadow flex items-center justify-center"
              onClick={() => setCurrentInterface('interface3')}
              style={{ fontFamily: 'inherit', letterSpacing: 0.2 }}
            >
              <span className="material-icons text-base mr-2">translate</span>
              {t('english', 'ko')}
            </button>
            <button
              id="confirmOrderButton"
              className="h-full px-4 sm:px-8 py-2 sm:py-4 bg-[#d4af37] hover:bg-[#ffd700] text-blue-900 font-bold rounded-full shadow-lg text-base sm:text-xl transition-colors border border-white/30 flex items-center justify-center"
              onClick={handleConfirmOrder}
              style={{ fontFamily: 'inherit', letterSpacing: 0.5 }}
            >
              <span className="material-icons mr-2 text-lg sm:text-2xl">check_circle</span>
              {t('send_to_reception', 'ko')}
            </button>
          </div>
          <textarea
            placeholder={t('enter_notes', 'ko')}
            className="w-full p-2 border border-white/30 rounded-xl text-xs sm:text-sm bg-white/60 focus:bg-white/90 focus:ring-2 focus:ring-[#d4af37] transition italic font-light text-gray-500"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            style={{ fontFamily: 'inherit' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Interface3Ko; 