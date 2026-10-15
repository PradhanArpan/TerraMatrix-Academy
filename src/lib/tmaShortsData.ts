/**
 * TMA Shorts - High-Impact Concept Explainer Reels (20-30s technical visual explainers)
 * Features ready engineering categories, interactive web-animated concept player,
 * and standard AI Video Generation prompts for Runway Gen-3, Sora, and ElevenLabs.
 */

export interface TmaShortVideo {
  id: string;
  title: string;
  category: "Fluid Dynamics" | "Structural Mechanics" | "Geotechnical" | "Remote Sensing & GIS" | "AI & Computational" | "Hydrology & Water";
  discipline: string;
  conceptSummary: string;
  durationSeconds: number;
  creatorName: string;
  creatorRole: string;
  dateAdded: string;
  tags: string[];
  thumbnailUrl?: string;
  videoUrl?: string; // YouTube short / MP4 link if hosted
  interactiveSimType?: "bernoulli_venturi" | "euler_buckling" | "shear_stress" | "spectral_ndvi";
  // The exact AI Prompt used to generate this video (or template for admin/creators)
  aiProductionPrompt?: {
    model: string;
    visualPrompt: string;
    motionCameraPrompt: string;
    narratorScript: string;
    voiceTone: string;
    renderSpecs: string;
  };
}

export const TMA_SHORTS_CATEGORIES = [
  "All Categories",
  "Fluid Dynamics",
  "Structural Mechanics",
  "Geotechnical",
  "Remote Sensing & GIS",
  "AI & Computational",
  "Hydrology & Water"
] as const;

export const INITIAL_TMA_SHORTS: TmaShortVideo[] = [
  {
    id: "short-bernoulli-01",
    title: "Bernoulli's Principle & The Venturi Cavitation Effect",
    category: "Fluid Dynamics",
    discipline: "Civil, Mechanical & Aerospace",
    conceptSummary: "Why narrowing a pipe increases fluid velocity and creates a sudden pressure drop. Real-time conservation of energy in incompressible flow.",
    durationSeconds: 28,
    creatorName: "TerraMatrix AI Engineering Lab",
    creatorRole: "Computational Fluid Dynamics Group",
    dateAdded: "2026-10-15",
    tags: ["Fluid Mechanics", "Bernoulli", "Venturi", "Pressure Drop", "Navier-Stokes"],
    interactiveSimType: "bernoulli_venturi",
    aiProductionPrompt: {
      model: "Runway Gen-3 Alpha / OpenAI Sora / Luma Dream Machine",
      visualPrompt: "Ultra-realistic 4K engineering macro visualization of transparent glass Venturi tube with neon blue streamlines flowing from wide inlet (diameter 50mm) to narrow throat (diameter 20mm). Fluorescent microscopic tracer particles accelerate violently at the throat. High-contrast pressure manometer columns showing tall liquid column at inlet and dramatically lower liquid column at throat. Cinematic laboratory lighting, clean dark slate background, volumetric caustics, Octane 3D render.",
      motionCameraPrompt: "Smooth slow-motion lateral tracking shot following the fluid particles as they constrict and accelerate through the Venturi nozzle. Camera rotates 15 degrees showing pressure gauge needle dropping in synchronization with speed increase.",
      narratorScript: "When fluid enters a constriction, mass conservation forces it to accelerate. By Bernoulli's equation, as kinetic energy surges, static pressure drops precipitously. If throat pressure falls below vapor pressure, cavitation bubbles form and implode violently.",
      voiceTone: "Authoritative, crisp technical narrator (ElevenLabs: 'Adam' or 'Antoni', speed 1.05x)",
      renderSpecs: "9:16 Vertical Reel (1080x1920), 60 FPS, ProRes 422 HQ"
    }
  },
  {
    id: "short-euler-02",
    title: "Euler's Critical Buckling: The Elastic Instability Phenomenon",
    category: "Structural Mechanics",
    discipline: "Civil & Structural Engineering",
    conceptSummary: "How slender compression columns fail suddenly through lateral deflection rather than material yielding, governed by effective length factor K.",
    durationSeconds: 25,
    creatorName: "TerraMatrix Structural Lab",
    creatorRole: "Finite Element Analysis Unit",
    dateAdded: "2026-10-14",
    tags: ["Structural Mechanics", "Euler Buckling", "Stability", "IS 800", "FEA"],
    interactiveSimType: "euler_buckling",
    aiProductionPrompt: {
      model: "Runway Gen-3 Alpha / Midjourney v6 + Kling AI",
      visualPrompt: "Cinematic close-up of a high-strength structural steel I-beam column under axial compression in a hydraulic testing rig. As axial load reaches critical limit P_cr, stress heatmap shifts from blue to vibrant neon red. The column buckles laterally in a graceful sinusoidal half-wave mode. Laser displacement sensors projecting cyan grid across the curved flange.",
      motionCameraPrompt: "Slow zoom-in on the midspan deflection point with high-speed 120fps slow-motion capture as the bifurcation point is reached and lateral snap happens.",
      narratorScript: "Slender columns don't crush — they buckle. Governed by Euler's formula P_cr = π²EI / (KL)², buckling occurs at loads far below the steel yield strength when effective length factor dominates.",
      voiceTone: "Deep, calm academic engineer (ElevenLabs: 'George', clear articulation)",
      renderSpecs: "9:16 Vertical Reel (1080x1920), 60 FPS"
    }
  },
  {
    id: "short-ndvi-03",
    title: "NDVI Spectral Signatures: Deciphering Earth From Space",
    category: "Remote Sensing & GIS",
    discipline: "Geomatics & Satellite Imagery",
    conceptSummary: "How multispectral sensors exploit the red absorption and near-infrared reflectance difference of chlorophyll to measure vegetative health.",
    durationSeconds: 26,
    creatorName: "TerraMatrix Geospatial Lab",
    creatorRole: "Earth Observation & GIS Division",
    dateAdded: "2026-10-12",
    tags: ["Remote Sensing", "NDVI", "Sentinel-2", "Landsat", "Spectral Reflectance"],
    interactiveSimType: "spectral_ndvi",
    aiProductionPrompt: {
      model: "Sora / Runway Gen-3 Alpha",
      visualPrompt: "3D digital twin of Earth orbiting satellite (Sentinel-2) firing twin spectral detection beams (Red 665nm and NIR 842nm) onto agricultural river delta. Seamless camera transition diving from space into a single plant leaf showing chlorophyll cellular structure reflecting 85% NIR while absorbing 95% red light, splitting into a False Color Composite (FCC) heatmap.",
      motionCameraPrompt: "Continuous orbital zoom from 786km low-earth orbit down to mesophyll leaf tissue in 4 seconds with hyper-smooth camera tilt.",
      narratorScript: "Healthy vegetation absorbs visible red light for photosynthesis but aggressively scatters Near-Infrared radiation. The normalized difference (NIR - Red)/(NIR + Red) provides instant drought and biomass analytics.",
      voiceTone: "Dynamic scientific explainer (ElevenLabs: 'Rachel')",
      renderSpecs: "9:16 Vertical Reel (1080x1920), 60 FPS"
    }
  },
  {
    id: "short-shear-04",
    title: "Mohr's Stress Circle & Principal Shear Planes",
    category: "Geotechnical",
    discipline: "Geotechnical & Rock Mechanics",
    conceptSummary: "Geometric transformation of 2D stress tensors into principal normal and maximum shear stresses without tensor differential calculus.",
    durationSeconds: 29,
    creatorName: "TerraMatrix Geotech Team",
    creatorRole: "Soil Mechanics Division",
    dateAdded: "2026-10-10",
    tags: ["Mohr Circle", "Shear Failure", "Triaxial Test", "Soil Mechanics"],
    interactiveSimType: "shear_stress",
    aiProductionPrompt: {
      model: "Runway Gen-3 Alpha / Kling AI",
      visualPrompt: "3D glowing holographic coordinate space showing an elemental cube of soil inside a triaxial testing chamber. As confining pressure σ3 and deviator stress Δσ increase, a glowing circular Mohr diagram dynamically constructs itself in front of the sample. When the circle touches the Coulomb shear envelope (c + σ tan φ), shear slip planes ignite with luminous fracture lines at angle 45 + φ/2.",
      motionCameraPrompt: "Orbital 45-degree rotation around the triaxial cell with depth-of-field shifting between the physical shear crack and the tangent point on the failure envelope.",
      narratorScript: "Rotate any stressed soil element by 2θ, and its normal and shear stresses trace a perfect circle. When this circle breaches the Mohr-Coulomb failure envelope, shear failure triggers along the failure plane.",
      voiceTone: "Crisp technical presenter (ElevenLabs: 'Adam')",
      renderSpecs: "9:16 Vertical Reel (1080x1920), 60 FPS"
    }
  },
  {
    id: "short-pinn-05",
    title: "PINNs: Physics-Informed Neural Networks Explained",
    category: "AI & Computational",
    discipline: "Applied Data Science & Machine Learning",
    conceptSummary: "Embedding Navier-Stokes and wave differential equations directly into the loss function of deep neural networks to guarantee physical consistency.",
    durationSeconds: 27,
    creatorName: "TerraMatrix AI Lab",
    creatorRole: "Scientific Machine Learning (SciML)",
    dateAdded: "2026-10-08",
    tags: ["PINN", "Deep Learning", "SciML", "PDE", "Automatic Differentiation"],
    aiProductionPrompt: {
      model: "Runway Gen-3 Alpha / OpenAI Sora",
      visualPrompt: "Futuristic dark glass workspace showing a neural network architecture with multi-layer perceptron nodes glowing cyan. Training data points feed through forward pass. At the loss node, automatic differentiation computes spatial and temporal derivatives (∂u/∂t + u ∂u/∂x = ν ∂²u/∂x²). As the PDE residual is penalized, irregular noise smooths into perfect laminar fluid flow streamlines.",
      motionCameraPrompt: "Dolly-in through the dense neural network layers showing automatic differentiation gradients lighting up along the synaptic weights.",
      narratorScript: "Traditional AI ignores physics laws. Physics-Informed Neural Networks penalize violations of conservation equations directly in backpropagation, allowing accurate turbulence prediction with zero labeled data.",
      voiceTone: "Modern AI researcher tone (ElevenLabs: 'Charlie')",
      renderSpecs: "9:16 Vertical Reel (1080x1920), 60 FPS"
    }
  }
];

const STORAGE_KEY = "tma_shorts_library_v1";

export function getTmaShorts(): TmaShortVideo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TMA_SHORTS));
      return INITIAL_TMA_SHORTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read TMA Shorts from storage:", e);
    return INITIAL_TMA_SHORTS;
  }
}

export function saveTmaShort(short: TmaShortVideo): void {
  try {
    const list = getTmaShorts();
    const updated = [short, ...list.filter(s => s.id !== short.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save TMA Short:", e);
  }
}

export function deleteTmaShort(id: string): void {
  try {
    const list = getTmaShorts();
    const filtered = list.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete TMA Short:", e);
  }
}
