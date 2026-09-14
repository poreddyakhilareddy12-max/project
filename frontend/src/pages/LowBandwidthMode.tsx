import React, { useState } from 'react';
import { lowBandwidthApi } from '../services/api';
import { Radio, Send, Terminal, CheckCircle2, AlertCircle, HelpCircle, Zap } from 'lucide-react';

export const LowBandwidthMode: React.FC = () => {
  const [smsMessage, setSmsMessage] = useState('INCIDENT|NH2|LANDSLIDE|CRITICAL|25.512,94.148 Mudslide blocking both lanes');
  const [senderPhone, setSenderPhone] = useState('+91-94350-11223');
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<any[]>([]);

  const handleSendSms = async () => {
    if (!smsMessage.trim()) return;
    setLoading(true);
    try {
      const res = await lowBandwidthApi.parseSms(smsMessage, senderPhone);
      setLog((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          raw: smsMessage,
          response: res,
        },
        ...prev,
      ]);
    } catch (err: any) {
      setLog((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          raw: smsMessage,
          error: err?.response?.data?.detail || err.message,
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (msg: string) => {
    setSmsMessage(msg);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400" />
          <span>Low-Bandwidth & SMS / USSD Fallback Gateway</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Operates in zero-internet zones across hill terrain. Encodes and parses compact SMS payloads into full geo-tagged incidents.
        </p>
      </div>

      {/* Syntax Specification Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4" />
          <span>Compact Telemetry Protocol Specification</span>
        </h2>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400">
          INCIDENT | &lt;CORRIDOR&gt; | &lt;TYPE&gt; | &lt;SEVERITY&gt; | &lt;COORDS_OR_NOTES&gt;
        </div>

        <div className="text-xs text-slate-400 space-y-1">
          <div>&bull; <strong>Types:</strong> LANDSLIDE, FLOOD, ROAD_DAMAGE, BRIDGE_ISSUE, TRAFFIC, ACCIDENT</div>
          <div>&bull; <strong>Severities:</strong> LOW, MEDIUM, HIGH, CRITICAL</div>
          <div>&bull; <strong>Coordinates:</strong> Optional comma-separated latitude and longitude (e.g., 25.512, 94.148)</div>
        </div>

        {/* Quick Presets */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Simulator Presets:</span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <button
              onClick={() => setPreset('INCIDENT|NH2|LANDSLIDE|CRITICAL|25.512,94.148 Major rockfall at Mao gate')}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-300 transition-colors"
            >
              Landslide at Mao (NH-2)
            </button>
            <button
              onClick={() => setPreset('INCIDENT|NH29|ROAD_DAMAGE|HIGH|25.751,93.945 Pagla Pahar road sinkage')}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-300 transition-colors"
            >
              Road Damage at Pagla Pahar (NH-29)
            </button>
            <button
              onClick={() => setPreset('INCIDENT|NH6|FLOOD|HIGH|25.185,92.421 Jowai water accumulation')}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-300 transition-colors"
            >
              Flood in Jowai (NH-6)
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Terminal Input */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Interactive SMS Telemetry Console (Demo Gateway Adapter)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Raw SMS Message Payload
            </label>
            <input
              type="text"
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Sender Mobile No.
            </label>
            <input
              type="text"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-300 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSendSms}
          disabled={loading}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 px-5 rounded-lg text-xs transition-all shadow-md shadow-cyan-900/30 flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{loading ? 'Simulating Gateway Ingestion...' : 'Transmit Payload via SMS Gateway'}</span>
        </button>
      </div>

      {/* Terminal Response Log */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-800 flex items-center justify-between">
          <span>Gateway Transmission Activity Log</span>
          <span>{log.length} Records</span>
        </div>

        {log.length === 0 ? (
          <div className="py-6 text-center text-slate-600">
            No SMS messages ingested in this session yet. Fire a message above to simulate.
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {log.map((entry, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>[{entry.timestamp}] Raw: {entry.raw}</span>
                  {entry.response?.success ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> INGESTED
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> FAILED
                    </span>
                  )}
                </div>

                {entry.response && (
                  <div className="text-slate-300 text-xs mt-1">
                    {entry.response.message}
                    {entry.response.parsed_data && (
                      <div className="text-[11px] text-cyan-400 mt-0.5">
                        Corridor: {entry.response.parsed_data.corridor} | Type: {entry.response.parsed_data.incident_type} | Severity: {entry.response.parsed_data.severity}
                      </div>
                    )}
                  </div>
                )}
                {entry.error && <div className="text-rose-400">{entry.error}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
