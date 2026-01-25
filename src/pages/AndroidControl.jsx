import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Camera,
  MousePointer,
  Keyboard,
  Power,
  Home,
  ArrowLeft,
  RefreshCw,
  Battery,
  Wifi
} from 'lucide-react';

export default function AndroidControl() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceInfo(selectedDevice);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      const devicesResponse = await fetch('/api/android/devices');
      const devicesData = await devicesResponse.json();
      if (devicesData.success) {
        setDevices(devicesData.devices);
        if (devicesData.devices.length > 0 && !selectedDevice) {
          setSelectedDevice(devicesData.devices[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const fetchDeviceInfo = async (deviceId) => {
    try {
      const deviceInfoResponse = await fetch(`/api/android/info/${deviceId}`);
      const deviceInfoData = await deviceInfoResponse.json();
      if (deviceInfoData.success) {
        setDeviceInfo(deviceInfoData.device);
      }
    } catch (error) {
      console.error('Failed to fetch device info:', error);
    }
  };

  const takeScreenshot = async () => {
    if (!selectedDevice) return;

    setIsLoading(true);
    try {
      const screenshotResponse = await fetch('/api/android/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: selectedDevice })
      });

      const screenshotData = await screenshotResponse.json();
      if (screenshotData.success) {
        setScreenshot(screenshotData.screenshot);
      } else {
        alert('Failed to take screenshot: ' + screenshotData.error);
      }
    } catch (error) {
      console.error('Screenshot error:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const performAction = async (action, params = {}) => {
    if (!selectedDevice) return;

    setIsLoading(true);
    try {
      const actionResponse = await fetch(`/api/android/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: selectedDevice, ...params })
      });

      const actionData = await actionResponse.json();
      if (actionData.success) {
        console.log('Action performed:', action);
      } else {
        alert('Action failed: ' + actionData.error);
      }
    } catch (error) {
      console.error('Action error:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Android Control</h1>
              <p className="text-dark-400 text-sm">
                {devices.length} device{devices.length !== 1 ? 's' : ''} connected
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={fetchDevices}
            className="p-3 glass-effect rounded-lg hover:bg-white/10"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {devices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <Smartphone className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Devices Connected</h3>
          <p className="text-dark-400 mb-6">
            Connect an Android device via ADB to get started
          </p>
          <div className="glass-effect p-4 rounded-lg max-w-md mx-auto text-left">
            <p className="text-sm mb-2 font-semibold">Quick Setup:</p>
            <ol className="text-sm text-dark-400 space-y-1 list-decimal list-inside">
              <li>Enable Developer Options on your device</li>
              <li>Enable USB Debugging</li>
              <li>Connect via USB or WiFi (adb connect)</li>
              <li>Click refresh above to detect devices</li>
            </ol>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Screen */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device Selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <label className="block text-sm text-dark-400 mb-2">Select Device</label>
              <select
                value={selectedDevice || ''}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="input-field"
              >
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.id} - {device.status}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Screen View */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary-400" />
                  Device Screen
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={takeScreenshot}
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50"
                >
                  Take Screenshot
                </motion.button>
              </div>

              <div className="bg-dark-800 rounded-lg overflow-hidden relative" style={{ aspectRatio: '9/16' }}>
                {screenshot ? (
                  <img
                    src={`data:image/png;base64,${screenshot}`}
                    alt="Device screen"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Smartphone className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                      <p className="text-dark-500">Take a screenshot to view device</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Device Info */}
            {deviceInfo && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card"
              >
                <h2 className="text-xl font-bold mb-4">Device Info</h2>
                <div className="space-y-3">
                  <InfoCard
                    icon={Smartphone}
                    label="Model"
                    value={deviceInfo.model}
                  />
                  <InfoCard
                    icon={Wifi}
                    label="Android"
                    value={deviceInfo.android}
                  />
                  <InfoCard
                    icon={Battery}
                    label="Battery"
                    value={`${deviceInfo.battery}%`}
                  />
                </div>
              </motion.div>
            )}

            {/* Navigation Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-xl font-bold mb-4">Navigation</h2>
              <div className="grid grid-cols-3 gap-2">
                <ControlButton
                  icon={ArrowLeft}
                  label="Back"
                  onClick={() => performAction('key', { keyCode: 4 })}
                  disabled={isLoading}
                  span="col-span-1"
                />
                <ControlButton
                  icon={Home}
                  label="Home"
                  onClick={() => performAction('key', { keyCode: 3 })}
                  disabled={isLoading}
                  span="col-span-1"
                />
                <ControlButton
                  icon={Power}
                  label="Power"
                  onClick={() => performAction('key', { keyCode: 26 })}
                  disabled={isLoading}
                  span="col-span-1"
                />
              </div>
            </motion.div>

            {/* Custom Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <ActionButton
                  icon={MousePointer}
                  label="Tap Center"
                  onClick={() => performAction('tap', { x: 540, y: 960 })}
                  disabled={isLoading}
                />
                <ActionButton
                  icon={Keyboard}
                  label="Type Text"
                  onClick={() => {
                    const text = prompt('Enter text to type:');
                    if (text) performAction('type', { text });
                  }}
                  disabled={isLoading}
                />
                <ActionButton
                  icon={Camera}
                  label="Screenshot"
                  onClick={takeScreenshot}
                  disabled={isLoading}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="glass-effect p-3 rounded-lg flex items-center gap-3">
      <Icon className="w-5 h-5 text-primary-400" />
      <div>
        <p className="text-xs text-dark-400">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ControlButton({ icon: Icon, label, onClick, disabled, span = '' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`glass-effect p-4 rounded-lg hover:bg-white/10 transition-all flex flex-col items-center gap-2 disabled:opacity-50 ${span}`}
    >
      <Icon className="w-6 h-6 text-primary-400" />
      <span className="text-xs">{label}</span>
    </motion.button>
  );
}

function ActionButton({ icon: Icon, label, onClick, disabled }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full glass-effect p-3 rounded-lg hover:bg-white/10 transition-all flex items-center gap-3 disabled:opacity-50"
    >
      <Icon className="w-5 h-5 text-primary-400" />
      <span>{label}</span>
    </motion.button>
  );
}
