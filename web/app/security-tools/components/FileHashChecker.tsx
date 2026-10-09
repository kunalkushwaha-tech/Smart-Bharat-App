"use client";

import React, { useState } from 'react';

const FileHashChecker = () => {
  const [fileName, setFileName] = useState('');
  const [hash, setHash] = useState('');
  const [expectedHash, setExpectedHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setHash('');

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setHash(hashHex);
    } catch (err) {
      setHash('Error calculating hash');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
  };

  const isMatch = expectedHash.trim().toLowerCase() === hash.toLowerCase();
  const showMatchResult = expectedHash.trim().length > 0 && hash.length > 0;

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white">
      <input
        type="file"
        onChange={handleFileChange}
        className="w-full p-2 rounded bg-gray-800 border border-gray-600 mb-3 text-sm"
      />

      {loading && <p className="text-gray-400">Calculating hash...</p>}

      {hash && (
        <div className="mt-3">
          <p className="text-sm text-gray-400 mb-1">File: {fileName}</p>
          <p className="text-sm text-gray-400 mb-1">SHA-256:</p>
          <div className="flex items-center gap-2">
            <code className="bg-gray-800 p-2 rounded text-xs break-all flex-1">{hash}</code>
            <button
              onClick={handleCopy}
              className="bg-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="text-sm text-gray-400 block mb-1">Expected hash (optional, to verify):</label>
        <input
          type="text"
          value={expectedHash}
          onChange={(e) => setExpectedHash(e.target.value)}
          placeholder="Paste expected SHA-256 hash here"
          className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-sm"
        />
      </div>

      {showMatchResult && (
        <p className={`mt-2 font-semibold ${isMatch ? 'text-green-400' : 'text-red-400'}`}>
          {isMatch ? 'Verified — hashes match' : 'Mismatch — hashes do not match'}
        </p>
      )}
    </div>
  );
};

export default FileHashChecker;