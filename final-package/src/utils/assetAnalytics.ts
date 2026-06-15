import { Asset } from "../types.ts";

interface IsolationLeaf {
  size: number;
}

interface IsolationBranch {
  feature: number;
  split: number;
  left: IsolationNode;
  right: IsolationNode;
}

type IsolationNode = IsolationLeaf | IsolationBranch;

export interface AssetAnalytics {
  anomalyScore: number;
  anomalyLabel: "Inlier" | "Watch" | "Outlier" | "Critical Outlier";
  failureProbability: number;
  healthScore: number;
  rulHours: number;
  rulDays: number;
  avoidableLossUSD: number;
  interventionWindowHours: number;
  contributors: Array<{ label: string; score: number }>;
  dependencyExposure: number;
}

const EULER_GAMMA = 0.5772156649;

function harmonic(n: number) {
  return Math.log(n) + EULER_GAMMA;
}

function cFactor(n: number) {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  return 2 * harmonic(n - 1) - (2 * (n - 1)) / n;
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mean(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0) / Math.max(values.length, 1);
}

function std(values: number[]) {
  if (values.length <= 1) return 0;
  const avg = mean(values);
  const variance = values.reduce((acc, value) => acc + Math.pow(value - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function getCurrentVector(asset: Asset) {
  const flowRisk = asset.telemetry.flowRateLimit && asset.telemetry.flowRate
    ? clamp(asset.telemetry.flowRate / asset.telemetry.flowRateLimit, 0, 1.5)
    : 1;

  return [
    clamp(asset.telemetry.temperature / asset.telemetry.temperatureLimit, 0, 1.8),
    clamp(asset.telemetry.vibration / asset.telemetry.vibrationLimit, 0, 2.5),
    clamp(asset.telemetry.pressure / asset.telemetry.pressureLimit, 0, 1.8),
    flowRisk,
  ];
}

function getHistoricalVectors(asset: Asset) {
  const flowRisk = asset.telemetry.flowRateLimit && asset.telemetry.flowRate
    ? clamp(asset.telemetry.flowRate / asset.telemetry.flowRateLimit, 0, 1.5)
    : 1;

  return asset.telemetry.historicalData.map((point) => [
    clamp(point.temperature / asset.telemetry.temperatureLimit, 0, 1.8),
    clamp(point.vibration / asset.telemetry.vibrationLimit, 0, 2.5),
    clamp(point.pressure / asset.telemetry.pressureLimit, 0, 1.8),
    flowRisk,
  ]);
}

function buildIsolationTree(samples: number[][], depth: number, maxDepth: number, rng: () => number): IsolationNode {
  if (samples.length <= 1 || depth >= maxDepth) {
    return { size: samples.length };
  }

  const feature = Math.floor(rng() * samples[0].length);
  const values = samples.map((sample) => sample[feature]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return { size: samples.length };
  }

  const split = min + (max - min) * rng();
  const leftSamples = samples.filter((sample) => sample[feature] < split);
  const rightSamples = samples.filter((sample) => sample[feature] >= split);

  if (leftSamples.length === 0 || rightSamples.length === 0) {
    return { size: samples.length };
  }

  return {
    feature,
    split,
    left: buildIsolationTree(leftSamples, depth + 1, maxDepth, rng),
    right: buildIsolationTree(rightSamples, depth + 1, maxDepth, rng),
  };
}

function pathLength(sample: number[], node: IsolationNode, depth = 0): number {
  if ("size" in node) {
    return depth + cFactor(node.size);
  }

  if (sample[node.feature] < node.split) {
    return pathLength(sample, node.left, depth + 1);
  }

  return pathLength(sample, node.right, depth + 1);
}

function latestPeerVectors(assets: Asset[], activeAssetId: string) {
  return assets
    .filter((asset) => asset.id !== activeAssetId)
    .slice(0, 24)
    .map((asset) => getCurrentVector(asset));
}

function contributorBreakdown(asset: Asset) {
  const current = getCurrentVector(asset);
  const labels = ["Temperature", "Vibration", "Pressure", "Flow / Cooling"];
  return labels
    .map((label, index) => ({ label, score: clamp((current[index] - 0.85) / 0.75, 0, 1) }))
    .sort((a, b) => b.score - a.score);
}

export function computeAssetAnalytics(asset: Asset, assets: Asset[]): AssetAnalytics {
  const currentVector = getCurrentVector(asset);
  const history = getHistoricalVectors(asset);
  const peers = latestPeerVectors(assets, asset.id);
  const training = [...history, ...peers];
  const sampleSize = Math.max(8, Math.min(32, training.length || 8));
  const maxDepth = Math.ceil(Math.log2(sampleSize));
  const trees = 48;
  const seedBase = asset.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + sampleSize;

  const pathLengths: number[] = [];
  for (let treeIndex = 0; treeIndex < trees; treeIndex++) {
    const rng = seededRandom(seedBase + treeIndex * 97);
    const sampled = Array.from({ length: sampleSize }, () => training[Math.floor(rng() * training.length)] || currentVector);
    const tree = buildIsolationTree(sampled, 0, maxDepth, rng);
    pathLengths.push(pathLength(currentVector, tree));
  }

  const avgPath = mean(pathLengths);
  const normalized = cFactor(sampleSize) || 1;
  const rawIsolation = Math.pow(2, -avgPath / normalized);

  const contributors = contributorBreakdown(asset);
  const stressComposite = mean(currentVector.slice(0, 3));
  const contributorBoost = contributors[0]?.score || 0;
  const anomalyScore = clamp(rawIsolation * 0.7 + stressComposite * 0.2 + contributorBoost * 0.1, 0.05, 0.98);

  let anomalyLabel: AssetAnalytics["anomalyLabel"] = "Inlier";
  if (anomalyScore >= 0.72) anomalyLabel = "Critical Outlier";
  else if (anomalyScore >= 0.56) anomalyLabel = "Outlier";
  else if (anomalyScore >= 0.42) anomalyLabel = "Watch";

  const failureProbability = clamp(anomalyScore * 0.82 + stressComposite * 0.18, 0.05, 0.99);
  const healthScore = Math.round((1 - failureProbability) * 100);

  const criticalityBase = asset.processCriticality === "Critical" ? 420 : asset.processCriticality === "High" ? 520 : asset.processCriticality === "Medium" ? 720 : 900;
  const rulHours = Math.max(12, Math.round(criticalityBase / (0.65 + failureProbability * 2.2)));
  const rulDays = Math.max(1, Math.round(rulHours / 24));

  const interventionWindowHours = anomalyScore >= 0.72 ? 8 : anomalyScore >= 0.56 ? 24 : anomalyScore >= 0.42 ? 48 : 72;
  const avoidableLossUSD = Math.round(asset.delayCostPerHour * interventionWindowHours * (0.45 + failureProbability * 0.55));

  const areaExposure = assets.filter((peer) => peer.area === asset.area && peer.id !== asset.id).length;
  const dependencyExposure = clamp(Math.round(areaExposure * 0.8 + (asset.processCriticality === "Critical" ? 4 : asset.processCriticality === "High" ? 2 : 1)), 1, 10);

  return {
    anomalyScore: Number(anomalyScore.toFixed(2)),
    anomalyLabel,
    failureProbability: Number(failureProbability.toFixed(2)),
    healthScore,
    rulHours,
    rulDays,
    avoidableLossUSD,
    interventionWindowHours,
    contributors,
    dependencyExposure,
  };
}

export function rankAssetsByPriority(assets: Asset[]) {
  return assets
    .map((asset) => {
      const analytics = computeAssetAnalytics(asset, assets);
      const criticality = asset.processCriticality === "Critical" ? 1 : asset.processCriticality === "High" ? 0.82 : asset.processCriticality === "Medium" ? 0.62 : 0.45;
      const impact = clamp(asset.delayCostPerHour / 22000, 0.2, 1);
      const dependency = analytics.dependencyExposure / 10;
      const priority = Math.round((analytics.failureProbability * 0.35 + criticality * 0.25 + impact * 0.25 + dependency * 0.15) * 100);
      return { asset, analytics, priority };
    })
    .sort((a, b) => b.priority - a.priority);
}

export function telemetryBaselineSummary(asset: Asset) {
  const history = getHistoricalVectors(asset);
  const columns = [0, 1, 2, 3].map((index) => history.map((row) => row[index]));
  return {
    temperatureStd: Number(std(columns[0]).toFixed(3)),
    vibrationStd: Number(std(columns[1]).toFixed(3)),
    pressureStd: Number(std(columns[2]).toFixed(3)),
    flowStd: Number(std(columns[3]).toFixed(3)),
  };
}
