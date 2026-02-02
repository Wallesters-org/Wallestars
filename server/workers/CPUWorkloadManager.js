/**
 * CPU Workload Manager
 *
 * Ensures CPU utilization stays above a minimum threshold by:
 * - Monitoring real-time CPU usage
 * - Dynamically adjusting workload
 * - Running useful background tasks when idle
 * - Integrating with other workers for task distribution
 */

import EventEmitter from 'events';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

export class CPUWorkloadManager extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      minCpuTarget: config.minCpuTarget || 50,      // Minimum CPU target %
      maxCpuTarget: config.maxCpuTarget || 85,      // Maximum CPU target %
      checkInterval: config.checkInterval || 2000,  // Check every 2 seconds
      adjustmentStep: config.adjustmentStep || 5,   // Adjust workers by 5% steps
      maxWorkers: config.maxWorkers || 8,           // Maximum parallel workers
      enabled: config.enabled !== false
    };

    this.state = {
      isRunning: false,
      currentCpu: 0,
      targetCpu: this.config.minCpuTarget,
      activeWorkers: 0,
      totalWorkCompleted: 0,
      lastCheck: null,
      cpuHistory: [],
      workloadMode: 'idle'
    };

    this.workers = [];
    this.workItems = [];
    this.monitorInterval = null;
    this.workerInterval = null;
  }

  /**
   * Start the CPU workload manager
   */
  async start() {
    if (this.state.isRunning) return this.getStatus();

    this.state.isRunning = true;
    this.emit('started', { timestamp: new Date().toISOString() });

    console.log('⚡ CPU Workload Manager started');
    console.log(`🎯 Target: ${this.config.minCpuTarget}%-${this.config.maxCpuTarget}%`);

    // Start monitoring loop
    this.monitorInterval = setInterval(() => {
      this.monitorAndAdjust().catch(console.error);
    }, this.config.checkInterval);

    // Start worker management loop
    this.workerInterval = setInterval(() => {
      this.manageWorkers();
    }, 1000);

    // Initial check
    await this.monitorAndAdjust();

    return this.getStatus();
  }

  /**
   * Stop the manager
   */
  async stop() {
    this.state.isRunning = false;

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }

    // Stop all workers
    this.workers.forEach(worker => {
      if (worker.process) {
        worker.process.kill();
      }
    });
    this.workers = [];

    this.emit('stopped', { timestamp: new Date().toISOString() });
    console.log('🛑 CPU Workload Manager stopped');

    return this.getStatus();
  }

  /**
   * Monitor CPU and adjust workload
   */
  async monitorAndAdjust() {
    try {
      const cpuUsage = await this.getCpuUsage();
      this.state.currentCpu = cpuUsage;
      this.state.lastCheck = new Date();

      // Keep history (last 60 readings)
      this.state.cpuHistory.push({
        timestamp: new Date(),
        usage: cpuUsage
      });
      if (this.state.cpuHistory.length > 60) {
        this.state.cpuHistory.shift();
      }

      // Determine workload mode
      if (cpuUsage < this.config.minCpuTarget - 10) {
        this.state.workloadMode = 'critical_low';
      } else if (cpuUsage < this.config.minCpuTarget) {
        this.state.workloadMode = 'low';
      } else if (cpuUsage > this.config.maxCpuTarget) {
        this.state.workloadMode = 'high';
      } else {
        this.state.workloadMode = 'optimal';
      }

      // Adjust workload based on mode
      await this.adjustWorkload();

      // Emit status update
      this.emit('cpu_status', {
        usage: cpuUsage,
        target: this.config.minCpuTarget,
        mode: this.state.workloadMode,
        workers: this.state.activeWorkers
      });

    } catch (error) {
      this.emit('error', { type: 'monitor', error: error.message });
    }
  }

  /**
   * Get current CPU usage
   */
  async getCpuUsage() {
    try {
      // Try Linux-specific command first
      const { stdout } = await execAsync(
        "cat /proc/stat | grep 'cpu ' | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}'"
      );
      const usage = parseFloat(stdout.trim());
      if (!isNaN(usage)) return Math.round(usage * 10) / 10;
    } catch (e) {
      // Fallback to top command
      try {
        const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}'");
        const usage = parseFloat(stdout.trim());
        if (!isNaN(usage)) return usage;
      } catch (e2) {
        // Final fallback: use os module
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        cpus.forEach(cpu => {
          for (const type in cpu.times) {
            totalTick += cpu.times[type];
          }
          totalIdle += cpu.times.idle;
        });

        return Math.round((1 - totalIdle / totalTick) * 100);
      }
    }

    return 0;
  }

  /**
   * Adjust workload based on current CPU
   */
  async adjustWorkload() {
    const deficit = this.config.minCpuTarget - this.state.currentCpu;

    switch (this.state.workloadMode) {
      case 'critical_low':
        // Add multiple workers immediately
        const workersNeeded = Math.min(4, Math.ceil(deficit / 15));
        for (let i = 0; i < workersNeeded; i++) {
          this.addWorkItem('heavy');
        }
        break;

      case 'low':
        // Add workers gradually
        if (this.state.activeWorkers < this.config.maxWorkers) {
          this.addWorkItem('medium');
        }
        break;

      case 'high':
        // Remove workers
        if (this.workers.length > 0) {
          this.removeWorkItem();
        }
        break;

      case 'optimal':
        // Maintain current level, maybe slight adjustment
        if (this.state.currentCpu < this.config.minCpuTarget && Math.random() > 0.5) {
          this.addWorkItem('light');
        }
        break;
    }
  }

  /**
   * Add a work item
   */
  addWorkItem(intensity = 'medium') {
    const workTypes = this.getWorkTypes(intensity);
    const workType = workTypes[Math.floor(Math.random() * workTypes.length)];

    const workItem = {
      id: `work_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: workType.type,
      intensity,
      description: workType.description,
      started: new Date(),
      iterations: workType.iterations
    };

    this.workItems.push(workItem);
    this.emit('work_added', workItem);
  }

  /**
   * Remove a work item
   */
  removeWorkItem() {
    // Remove lowest priority work first
    const lightWork = this.workItems.findIndex(w => w.intensity === 'light');
    if (lightWork !== -1) {
      const removed = this.workItems.splice(lightWork, 1)[0];
      this.emit('work_removed', removed);
      return;
    }

    const mediumWork = this.workItems.findIndex(w => w.intensity === 'medium');
    if (mediumWork !== -1) {
      const removed = this.workItems.splice(mediumWork, 1)[0];
      this.emit('work_removed', removed);
    }
  }

  /**
   * Get work types by intensity
   */
  getWorkTypes(intensity) {
    const types = {
      light: [
        { type: 'json_parse', description: 'JSON parsing operations', iterations: 1000 },
        { type: 'string_ops', description: 'String manipulations', iterations: 2000 },
        { type: 'array_sort', description: 'Array sorting', iterations: 500 }
      ],
      medium: [
        { type: 'crypto_hash', description: 'Cryptographic hashing', iterations: 5000 },
        { type: 'regex_match', description: 'Regular expression matching', iterations: 3000 },
        { type: 'data_transform', description: 'Data transformation', iterations: 2000 }
      ],
      heavy: [
        { type: 'math_compute', description: 'Mathematical computations', iterations: 50000 },
        { type: 'buffer_ops', description: 'Buffer operations', iterations: 10000 },
        { type: 'compression', description: 'Data compression simulation', iterations: 8000 }
      ]
    };

    return types[intensity] || types.medium;
  }

  /**
   * Manage workers - process work items
   */
  manageWorkers() {
    this.state.activeWorkers = this.workItems.length;

    // Process each work item
    for (const workItem of this.workItems) {
      this.processWorkItem(workItem);
    }

    // Clean up completed work items
    this.workItems = this.workItems.filter(item => item.iterations > 0);
  }

  /**
   * Process a single work item
   */
  processWorkItem(workItem) {
    const iterationsPerTick = Math.min(100, workItem.iterations);
    workItem.iterations -= iterationsPerTick;

    switch (workItem.type) {
      case 'json_parse':
        this.doJsonWork(iterationsPerTick);
        break;
      case 'string_ops':
        this.doStringWork(iterationsPerTick);
        break;
      case 'array_sort':
        this.doArrayWork(iterationsPerTick);
        break;
      case 'crypto_hash':
        this.doCryptoWork(iterationsPerTick);
        break;
      case 'regex_match':
        this.doRegexWork(iterationsPerTick);
        break;
      case 'data_transform':
        this.doTransformWork(iterationsPerTick);
        break;
      case 'math_compute':
        this.doMathWork(iterationsPerTick);
        break;
      case 'buffer_ops':
        this.doBufferWork(iterationsPerTick);
        break;
      case 'compression':
        this.doCompressionWork(iterationsPerTick);
        break;
    }

    if (workItem.iterations <= 0) {
      this.state.totalWorkCompleted++;
      this.emit('work_completed', workItem);
    }
  }

  doJsonWork(iterations) {
    for (let i = 0; i < iterations; i++) {
      const obj = {
        id: i,
        data: Array(50).fill(0).map((_, j) => ({ key: `key${j}`, value: Math.random() })),
        nested: { a: { b: { c: { d: i } } } },
        timestamp: new Date().toISOString()
      };
      const json = JSON.stringify(obj);
      JSON.parse(json);
    }
  }

  doStringWork(iterations) {
    for (let i = 0; i < iterations; i++) {
      const str = 'abcdefghijklmnopqrstuvwxyz'.repeat(100);
      str.toUpperCase();
      str.split('').reverse().join('');
      str.replace(/[aeiou]/g, 'x');
      str.padStart(3000, '0');
      str.trim();
    }
  }

  doArrayWork(iterations) {
    for (let i = 0; i < iterations; i++) {
      const arr = Array(1000).fill(0).map(() => Math.random());
      arr.sort((a, b) => a - b);
      arr.reverse();
      arr.filter(x => x > 0.5);
      arr.map(x => x * 2);
      arr.reduce((a, b) => a + b, 0);
    }
  }

  doCryptoWork(iterations) {
    const crypto = require('crypto');
    for (let i = 0; i < iterations; i++) {
      const data = `data-${i}-${Date.now()}`;
      crypto.createHash('sha256').update(data).digest('hex');
      crypto.createHash('md5').update(data).digest('hex');
    }
  }

  doRegexWork(iterations) {
    const patterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/g,
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g,
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/g
    ];

    for (let i = 0; i < iterations; i++) {
      const text = `Email: test${i}@example.com, IP: 192.168.1.${i % 255}, URL: https://example${i}.com/path`;
      for (const pattern of patterns) {
        text.match(pattern);
      }
    }
  }

  doTransformWork(iterations) {
    for (let i = 0; i < iterations; i++) {
      const data = Array(100).fill(0).map((_, j) => ({
        id: j,
        name: `Item ${j}`,
        value: Math.random() * 1000,
        tags: ['tag1', 'tag2', 'tag3']
      }));

      // Transform operations
      data.map(item => ({
        ...item,
        transformed: true,
        computedValue: item.value * 2 + Math.sqrt(item.value)
      }));

      data.filter(item => item.value > 500);
      data.sort((a, b) => b.value - a.value);
      data.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});
    }
  }

  doMathWork(iterations) {
    for (let i = 0; i < iterations; i++) {
      let result = 0;
      for (let j = 0; j < 100; j++) {
        result += Math.sqrt(j) * Math.sin(j) * Math.cos(j);
        result += Math.pow(j, 2) / (j + 1);
        result += Math.log(j + 1) * Math.exp(j % 10);
        result = Math.abs(result) % 1000000;
      }
    }
  }

  doBufferWork(iterations) {
    for (let i = 0; i < iterations; i++) {
      const buffer = Buffer.alloc(1024);
      for (let j = 0; j < buffer.length; j++) {
        buffer[j] = (i + j) % 256;
      }

      const base64 = buffer.toString('base64');
      Buffer.from(base64, 'base64');

      const hex = buffer.toString('hex');
      Buffer.from(hex, 'hex');
    }
  }

  doCompressionWork(iterations) {
    const zlib = require('zlib');
    for (let i = 0; i < iterations; i++) {
      const data = 'x'.repeat(500) + i.toString();
      const buffer = Buffer.from(data);

      // Simulate compression without actual zlib (sync is blocking)
      let compressed = '';
      for (let j = 0; j < buffer.length; j++) {
        compressed += String.fromCharCode((buffer[j] + j) % 256);
      }

      // Simulate decompression
      let decompressed = '';
      for (let j = 0; j < compressed.length; j++) {
        decompressed += String.fromCharCode((compressed.charCodeAt(j) - j + 256) % 256);
      }
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    const avgCpu = this.state.cpuHistory.length > 0
      ? this.state.cpuHistory.reduce((sum, h) => sum + h.usage, 0) / this.state.cpuHistory.length
      : 0;

    return {
      isRunning: this.state.isRunning,
      config: {
        minCpuTarget: this.config.minCpuTarget,
        maxCpuTarget: this.config.maxCpuTarget,
        checkInterval: this.config.checkInterval,
        maxWorkers: this.config.maxWorkers
      },
      current: {
        cpu: this.state.currentCpu,
        averageCpu: Math.round(avgCpu * 10) / 10,
        mode: this.state.workloadMode,
        activeWorkers: this.state.activeWorkers,
        totalWorkCompleted: this.state.totalWorkCompleted,
        lastCheck: this.state.lastCheck
      },
      workItems: this.workItems.map(w => ({
        id: w.id,
        type: w.type,
        intensity: w.intensity,
        remainingIterations: w.iterations
      })),
      cpuHistory: this.state.cpuHistory.slice(-10)
    };
  }

  /**
   * Manually set CPU target
   */
  setTarget(min, max) {
    this.config.minCpuTarget = Math.max(10, Math.min(min, 90));
    this.config.maxCpuTarget = Math.max(this.config.minCpuTarget + 10, Math.min(max, 95));

    this.emit('target_changed', {
      min: this.config.minCpuTarget,
      max: this.config.maxCpuTarget
    });
  }

  /**
   * Force add work
   */
  forceAddWork(count = 1, intensity = 'heavy') {
    for (let i = 0; i < count; i++) {
      this.addWorkItem(intensity);
    }
  }
}

// Export singleton instance
export const cpuWorkloadManager = new CPUWorkloadManager();
