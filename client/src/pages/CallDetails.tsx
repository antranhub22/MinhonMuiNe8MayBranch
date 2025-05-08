import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Transcript, StaffRequest, StaffMessage, SocketMessage } from '@/types';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import Loading from '@/components/Loading';
import Error from '@/components/Error';
import Toast from '@/components/Toast';

const CallDetails: React.FC = () => {
  const { callId } = useParams();
  const [copying, setCopying] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch call summary with auto-refresh
  const { data: summary, isLoading: summaryLoading, isError: summaryError } = useQuery({
    queryKey: ['summary', callId],
    queryFn: async () => {
      const response = await fetch(`/api/summaries/${callId}`);
      if (!response.ok) return { message: 'Failed to fetch call summary' };
      return response.json();
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
  
  // Fetch call transcripts with auto-refresh
  const { data: transcripts, isLoading: transcriptsLoading, isError: transcriptsError } = useQuery({
    queryKey: ['transcripts', callId],
    queryFn: async () => {
      const response = await fetch(`/api/transcripts/${callId}`);
      if (!response.ok) return { message: 'Failed to fetch call transcripts' };
      return response.json();
    },
    refetchInterval: 30000,
  });
  
  // Fetch staff request history with auto-refresh
  const { data: staffRequest, refetch: refetchStaffRequest } = useQuery<StaffRequest>({
    queryKey: ['staffRequest', callId],
    queryFn: async () => {
      // Chỉ fetch nếu callId là số hợp lệ
      const id = Number(callId);
      if (!callId || isNaN(id)) return undefined;
      const res = await fetch(`/api/staff/requests/${id}`);
      if (!res.ok) return { message: 'Failed to fetch staff request' };
      return res.json();
    },
    refetchInterval: 30000,
    enabled: !!callId && !isNaN(Number(callId)),
  });
  
  // Format date for display
  const formatDate = (dateObj: Date | string | undefined) => {
    if (!dateObj) return 'Unknown';
    
    const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // Format duration for display
  const formatDuration = (duration: string | undefined) => {
    if (!duration) return '00:00';
    return duration;
  };
  
  // Handle copy to clipboard with toast notification
  const handleCopyTranscript = async () => {
    if (!transcripts?.length) return;
    
    try {
      setCopying(true);
      const transcriptText = transcripts.map((t: Transcript) => 
        `${t.role === 'assistant' ? 'Assistant' : 'Guest'}: ${t.content}`
      ).join('\n\n');
      
      await navigator.clipboard.writeText(transcriptText);
      toast.success('Transcript copied to clipboard!');
      
      setTimeout(() => {
        setCopying(false);
      }, 1500);
    } catch (error) {
      console.error('Could not copy text: ', error);
      toast.error('Failed to copy transcript');
      setCopying(false);
    }
  };
  
  useEffect(() => {
    // Connect to socket.io
    const socket = io(window.location.origin);
    socketRef.current = socket;

    // Chỉ emit join_room sau khi socket đã connect
    socket.on('connect', () => {
      if (callId) {
        socket.emit('join_room', callId);
      }
    });

    // Chỉ giữ lại logic nhận transcript/Vapi, loại bỏ lắng nghe staff_request_status_update và staff_request_message trên guest
    // (Nếu có logic transcript thì giữ lại ở đây)

    return () => {
      socket.disconnect();
    };
  }, [callId, queryClient]);
  
  const isLoading = summaryLoading || transcriptsLoading;
  const isError = summaryError || transcriptsError;
  
  return (
    <div className="container mx-auto max-w-full md:max-w-5xl p-2 sm:p-5">
      <Toast />
      
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Call Details</h1>
          <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
            <Link to="/call-history">
              <button className="w-full sm:w-auto px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center justify-center text-sm sm:text-base">
                <span className="material-icons align-middle mr-1 text-sm">history</span>
                Call History
              </button>
            </Link>
            <Link to="/">
              <button className="w-full sm:w-auto px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center justify-center text-sm sm:text-base">
                <span className="material-icons align-middle mr-1 text-sm">home</span>
                Home
              </button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {isLoading ? (
          <>
            {/* Skeleton for Call Information */}
            <div className="col-span-1 lg:col-span-3">
              <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/6"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg">
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                      <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Skeleton for Conversation History */}
            <div className="col-span-1 lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm h-full animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded w-full mb-3"></div>
                ))}
              </div>
            </div>
            {/* Skeleton for Call Summary */}
            <div className="col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm h-full animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          </>
        ) : isError ? (
          <div className="col-span-1 lg:col-span-3">
            <Error 
              message="Unable to load call details"
              subMessage="The call may not exist or has been deleted."
              actionText="Return to Call History"
              actionLink="/call-history"
            />
          </div>
        ) : (
          <>
            {/* Call Summary Section */}
            <div className="col-span-1 lg:col-span-3">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Call Information</h2>
                  <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-700 text-xs font-medium">
                    ID: {callId}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Time</p>
                    <p className="text-sm font-medium">{formatDate(summary?.timestamp)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Room</p>
                    <p className="text-sm font-medium">{summary?.roomNumber || 'Unknown'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="text-sm font-medium">{formatDuration(summary?.duration)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Messages</p>
                    <p className="text-sm font-medium">{transcripts?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Transcript Section */}
            <div className="col-span-1 lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Conversation History</h2>
                  <button 
                    onClick={handleCopyTranscript}
                    disabled={copying || !transcripts?.length}
                    className={`px-3 py-1 rounded-md text-sm flex items-center ${
                      copying 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="material-icons text-sm mr-1">
                      {copying ? 'check' : 'content_copy'}
                    </span>
                    {copying ? 'Copied' : 'Copy'}
                  </button>
                </div>
                
                {transcripts?.length ? (
                  <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                    {transcripts.map((transcript: Transcript) => (
                      <div 
                        key={transcript.id} 
                        className={`flex ${transcript.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div 
                          className={`max-w-[75%] p-3 rounded-lg relative ${
                            transcript.role === 'assistant' 
                              ? 'bg-blue-50 text-blue-900' 
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {transcript.role === 'assistant' ? 'Assistant' : 'Guest'} • {
                              formatDate(transcript.timestamp)
                            }
                          </div>
                          <p className="text-sm">{transcript.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <span className="material-icons text-gray-300 text-4xl mb-2">chat</span>
                    <p className="text-gray-500">No conversation data</p>
                    <p className="text-gray-400 text-sm">Conversation details may have been deleted or not recorded.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Summary Section */}
            <div className="col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm h-full">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Call Summary</h2>
                
                {summary?.content ? (
                  <div className="p-4 bg-blue-50 rounded-lg overflow-y-auto" style={{ maxHeight: '500px' }}>
                    <div className="text-sm text-blue-900 whitespace-pre-line">
                      {summary.content}
                    </div>
                    <div className="mt-3 text-right">
                      <span className="text-xs text-gray-500">
                        Generated at {formatDate(summary.timestamp)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <span className="material-icons text-gray-300 text-4xl mb-2">summarize</span>
                    <p className="text-gray-500">No summary available</p>
                    <p className="text-gray-400 text-sm">Call summary could not be generated.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      
      <div className="mt-6 text-center text-gray-500 text-xs sm:text-sm">
        <p>Call history is stored for the last 24 hours</p>
      </div>

      {/* Staff Request History Section */}
      {staffRequest?.messages && staffRequest.messages.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Request Status & Messages</h3>
          <div className="max-h-60 overflow-y-auto text-sm space-y-2">
            {staffRequest.messages.map((msg: StaffMessage, idx: number) => {
              // Phân loại icon và màu sắc
              let icon = 'info';
              let color = 'text-gray-700';
              let bg = '';
              let senderLabel = '';
              if (msg.sender === 'staff') {
                icon = 'person';
                color = 'text-blue-700';
                bg = 'bg-blue-50';
                senderLabel = 'Staff';
              } else if (msg.sender === 'system') {
                icon = 'sync_alt';
                color = 'text-gray-500';
                bg = 'bg-gray-50';
                senderLabel = 'System';
              }
              // Nếu là trạng thái (ví dụ: "Status changed to Doing")
              const isStatusMsg = /status/i.test(msg.content) || /changed to/i.test(msg.content);
              if (isStatusMsg) {
                icon = 'autorenew';
                color = 'text-green-700';
                bg = 'bg-green-50';
                senderLabel = 'Status';
              }
              return (
                <div key={msg.id || idx} className={`flex items-start gap-2 rounded p-2 ${bg}`}>
                  <span className={`material-icons text-base mt-0.5 ${color}`}>{icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`font-semibold text-xs ${color}`}>{senderLabel}</span>
                      <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <span className="text-gray-800 text-sm whitespace-pre-line">{msg.content}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallDetails;