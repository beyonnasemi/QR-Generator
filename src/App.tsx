/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { Sun, Moon } from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const shortenUrl = async () => {
    setError('');
    if (url.toLowerCase() === 'q') {
      setUrl('');
      setShortUrl('');
      setError('입력 정보가 초기화되었습니다.');
      return;
    }
    if (!url) {
      setError('URL을 입력해주세요.');
      return;
    }
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      setError('올바른 URL 형식이 아닙니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      setShortUrl(response.data);
    } catch (error) {
      console.error('Error shortening URL:', error);
      setError('인터넷 연결을 확인하거나 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const downloadQr = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcode.png';
      a.click();
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`p-8 rounded-lg shadow-md w-full max-w-md transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-center flex-grow">URL 단축 & QR 생성기</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL을 입력하세요"
          className={`w-full p-2 border rounded mb-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={shortenUrl}
          disabled={loading}
          className={`w-full p-2 rounded transition-colors ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white disabled:bg-gray-400`}
        >
          {loading ? '단축 중...' : 'URL 단축하기'}
        </button>
        {shortUrl && (
          <div className="mt-4">
            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>단축된 URL:</p>
            <a href={shortUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline break-all">
              {shortUrl}
            </a>
            <div className="mt-4 flex flex-col items-center" ref={qrRef}>
              <div className="bg-white p-2 rounded">
                <QRCodeCanvas value={shortUrl} size={200} />
              </div>
              <button
                onClick={downloadQr}
                className={`mt-4 p-2 rounded transition-colors ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
              >
                QR 코드 다운로드
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



