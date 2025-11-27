import { useEffect, useState, useRef } from 'react';

/**
 * WebSocket hook for real-time updates
 * 
 * Usage:
 * const { data, isConnected, error } = useWebSocket('ws://localhost:8000/ws/live');
 */
export function useWebSocket(url) {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    let shouldReconnect = true;

    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            setData(parsed);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          setError('WebSocket connection error');
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);

          // Attempt to reconnect after 3 seconds
          if (shouldReconnect) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('Attempting to reconnect...');
              connect();
            }, 3000);
          }
        };
      } catch (err) {
        console.error('Failed to create WebSocket:', err);
        setError(err.message);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      shouldReconnect = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  const send = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  return { data, isConnected, error, send };
}
