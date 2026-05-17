import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  VortexEngine, 
  Entity, 
  SpriteRenderer, 
  PlayerController, 
  BoxCollider,
  ParticleSystem,
  Input,
  InputKey
} from './engine';
import { Terminal, Play, Square, Settings, Cpu, Activity, Zap, Box } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<VortexEngine | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [entitiesCount, setEntitiesCount] = useState(0);

  useEffect(() => {
    if (canvasRef.current && !engine) {
      const vEngine = new VortexEngine(canvasRef.current);
      setEngine(vEngine);
      
      // Setup Initial Scene
      setupDemoScene(vEngine);
    }
  }, [canvasRef, engine]);

  const setupDemoScene = (vEngine: VortexEngine) => {
    // 1. Create Player
    const player = new Entity('Player');
    player.position = { x: 400, y: 300 };
    player.size = { width: 40, height: 40 };
    player.tags = ['player'];
    player.addComponent(new SpriteRenderer('#3b82f6'));
    player.addComponent(new PlayerController());
    player.addComponent(new BoxCollider());
    vEngine.addEntity(player);

    // 2. Add background
    const background = new Entity('Background');
    vEngine.addEntity(background);

    // 3. Simple Enemy Spawner
    const spawner = new Entity('Spawner');
    let spawnTimer = 0;
    spawner.addComponent({
      entity: spawner,
      enabled: true,
      update: (dt: number) => {
        spawnTimer += dt;
        if (spawnTimer > 1.5) {
          spawnTimer = 0;
          spawnEnemy(vEngine);
        }
      }
    } as any);
    vEngine.addEntity(spawner);
    
    setEntitiesCount(3);
  };

  const spawnEnemy = (vEngine: VortexEngine) => {
    const enemy = new Entity('Enemy');
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    
    if (side === 0) { x = Math.random() * 800; y = -50; }
    else if (side === 1) { x = 850; y = Math.random() * 600; }
    else if (side === 2) { x = Math.random() * 800; y = 650; }
    else { x = -50; y = Math.random() * 600; }

    enemy.position = { x, y };
    enemy.size = { width: 30, height: 30 };
    enemy.tags = ['enemy'];
    enemy.addComponent(new SpriteRenderer('#ef4444'));
    
    const collider = enemy.addComponent(new BoxCollider());
    
    // Enemy AI: Move towards player
    enemy.addComponent({
      entity: enemy,
      enabled: true,
      update: (dt: number) => {
        const player = vEngine.getEntitiesByTag('player')[0];
        if (player) {
          const dx = player.position.x - enemy.position.x;
          const dy = player.position.y - enemy.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 1) {
            enemy.position.x += (dx / dist) * 120 * dt;
            enemy.position.y += (dy / dist) * 120 * dt;
          }

          // Collision check
          const playerCollider = player.getComponent(BoxCollider) as BoxCollider;
          if (playerCollider && collider.intersects(playerCollider)) {
             // Basic hit response
             enemy.active = false;
             vEngine.removeEntity(enemy);
             setScore(s => s + 10);
          }
        }
      }
    } as any);

    vEngine.addEntity(enemy);
    // Rough estimate for the UI
    setEntitiesCount(prev => prev + 1);
  };

  const toggleEngine = () => {
    if (isRunning) {
      engine?.stop();
    } else {
      engine?.start();
    }
    setIsRunning(!isRunning);
  };

  return (
    <div className="h-screen bg-[#121212] text-[#e0e0e0] font-sans overflow-hidden flex flex-col">
      {/* Top Menu Bar */}
      <header className="h-8 bg-[#1e1e1e] border-b border-[#333] flex items-center px-4 space-x-6 text-[11px] font-medium shrink-0">
        <div className="flex space-x-4">
          <span className="text-white opacity-90 cursor-default">File</span>
          <span className="opacity-60 cursor-default">Edit</span>
          <span className="opacity-60 cursor-default">Assets</span>
          <span className="opacity-60 cursor-default">GameObject</span>
          <span className="opacity-60 cursor-default">Component</span>
          <span className="opacity-60 cursor-default">Window</span>
          <span className="opacity-60 cursor-default">Help</span>
        </div>
        <div className="flex-1 flex justify-center space-x-2">
          <button 
            onClick={toggleEngine}
            className={`px-3 py-0.5 rounded flex items-center space-x-1 transition-colors ${
              isRunning ? 'bg-[#333] text-[#4ade80]' : 'bg-[#333] text-[#aaa] hover:text-white'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#4ade80] animate-pulse' : 'bg-[#666]'}`}></div>
            <span className="text-[10px] uppercase tracking-wider font-bold">
              {isRunning ? 'Simulating' : 'Ready'}
            </span>
          </button>
        </div>
        <div className="flex items-center gap-6 text-[10px] text-[#888]">
          <div className="flex items-center gap-2">
            <Activity size={12} className={isRunning ? 'text-blue-500' : 'opacity-30'} />
            <span>FPS: {isRunning ? '144' : '0'}</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Zap size={12} className="text-blue-500" />
            <span className="opacity-90">VortexEngine v0.1.0-stable</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Hierarchy */}
        <aside className="w-64 bg-[#1a1a1a] border-r border-[#333] flex flex-col shrink-0">
          <div className="p-2 border-b border-[#333] flex justify-between items-center bg-[#252525]">
            <span className="text-[10px] font-bold uppercase tracking-tight text-[#888]">Hierarchy</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 border border-[#444] rounded-sm flex items-center justify-center cursor-pointer hover:bg-[#333]">
                <span className="text-[8px]">+</span>
              </div>
            </div>
          </div>
          <div className="flex-1 p-1 space-y-0.5 font-mono text-[11px] overflow-y-auto">
            <div className="flex items-center space-x-2 p-1 text-[#aaa] hover:bg-[#2a2a2a] cursor-default opacity-80">
              <Activity size={10} />
              <span>MainScene</span>
            </div>
            <div className="flex items-center space-x-2 p-1 text-white bg-[#3e4f64] rounded-sm cursor-default">
              <Box size={10} className="text-blue-400" />
              <span>PlayerController</span>
            </div>
            <div className="ml-4 flex items-center space-x-2 p-1 text-[#aaa] hover:bg-[#2a2a2a] cursor-default">
              <Box size={10} className="opacity-50" />
              <span>SpriteRenderer</span>
            </div>
            <div className="flex items-center space-x-2 p-1 text-[#aaa] hover:bg-[#2a2a2a] cursor-default">
              <Activity size={10} className="opacity-50" />
              <span>EnvironmentalLights</span>
            </div>
            <div className="flex items-center space-x-2 p-1 text-[#aaa] hover:bg-[#2a2a2a] cursor-default">
              <Box size={10} className="opacity-50" />
              <span>Background</span>
            </div>
            <div className="flex items-center space-x-2 p-1 text-[#aaa] hover:bg-[#2a2a2a] cursor-default">
              <Box size={10} className="opacity-50" />
              <span>EnemySpawner</span>
            </div>
          </div>
          <div className="p-3 bg-[#1e1e1e] border-t border-[#333]">
            <div className="flex justify-between items-center text-[10px] opacity-40">
              <span>ENTITIES</span>
              <span>{entitiesCount}</span>
            </div>
          </div>
        </aside>

        {/* Center: Viewport */}
        <section className="flex-1 flex flex-col bg-[#0f0f0f] relative overflow-hidden">
          <div className="h-7 bg-[#252525] border-b border-[#333] flex items-center px-3 space-x-4 text-[10px] text-[#aaa]">
            <div className="border-b-2 border-[#007bff] h-full flex items-center text-white px-2 cursor-pointer">Scene</div>
            <div className="h-full flex items-center px-2 hover:text-white cursor-pointer transition-colors">Game</div>
            <div className="h-full flex items-center px-2 hover:text-white cursor-pointer transition-colors">Asset Store</div>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#333] px-1.5 py-0.5 rounded text-[9px] text-white/50">2D</span>
              <span className="bg-[#333] px-1.5 py-0.5 rounded text-[9px] text-white/50">Gizmos</span>
            </div>
          </div>

          <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center p-4">
             {/* 3D Grid Mock Overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            
            <div className="relative group w-full max-w-4xl aspect-[4/3]">
              <canvas 
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full h-full bg-[#050505] border border-[#333] shadow-2xl relative z-0"
              />
              {/* CRT Scanline Overlay - Subtle */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-[0.03]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
              </div>
            </div>

            {!isRunning && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-20">
                <div className="text-center">
                  <Play size={24} className="text-white/20 mx-auto mb-2" />
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Viewport Suspended</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Sidebar: Inspector */}
        <aside className="w-72 bg-[#1a1a1a] border-l border-[#333] flex flex-col shrink-0">
          <div className="p-2 border-b border-[#333] flex justify-between items-center bg-[#252525]">
            <span className="text-[10px] font-bold uppercase tracking-tight text-[#888]">Inspector</span>
            <span className="text-[9px] bg-[#333] px-1 rounded text-[#666]">Static</span>
          </div>
          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Entity Header */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[#007bff] rounded flex items-center justify-center text-[10px] font-bold text-white">P</div>
                <div className="flex-1">
                  <input type="text" defaultValue="PlayerController" className="bg-transparent border-none text-sm font-semibold w-full focus:ring-0 p-0" />
                </div>
                <input type="checkbox" checked className="accent-[#007bff] h-3 w-3" readOnly />
              </div>
              <div className="h-px bg-[#333]"></div>
            </div>

            {/* Transform Component */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#888] uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#888]"></div>
                  <span>Transform</span>
                </div>
                <Settings size={12} className="opacity-30" />
              </div>
              <div className="space-y-2 text-[11px] font-mono">
                <div className="flex items-center">
                  <span className="w-16 opacity-40 text-[10px] uppercase">Position</span>
                  <div className="flex-1 grid grid-cols-2 gap-1">
                    <div className="bg-[#111] border border-[#333] px-1.5 py-0.5 flex items-center justify-between">
                      <span className="text-[9px] text-red-500 font-bold">X</span>
                      <span className="text-[#ccc]">400.0</span>
                    </div>
                    <div className="bg-[#111] border border-[#333] px-1.5 py-0.5 flex items-center justify-between">
                      <span className="text-[9px] text-green-500 font-bold">Y</span>
                      <span className="text-[#ccc]">300.0</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="w-16 opacity-40 text-[10px] uppercase">Rotation</span>
                  <div className="flex-1 grid grid-cols-1">
                    <div className="bg-[#111] border border-[#333] px-1.5 py-0.5 flex items-center justify-between">
                      <span className="text-[9px] text-blue-500 font-bold">Z</span>
                      <span className="text-[#ccc]">0.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Script Component Mock */}
            <div className="p-3 bg-[#222] border border-[#333] rounded-sm space-y-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" checked className="accent-[#007bff] h-3 w-3" readOnly />
                <span className="text-[11px] font-bold">PlayerLogic.ts</span>
                <Settings size={10} className="ml-auto opacity-30" />
              </div>
              <div className="text-[10px] space-y-2 opacity-80 pt-1">
                <div className="flex justify-between items-center">
                  <span className="opacity-60">Move Speed</span>
                  <span className="text-[#007bff]">300.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-60">Rotation Spd</span>
                  <span className="text-[#007bff]">6.28</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-60">Score</span>
                  <span className="bg-[#111] px-2 py-0.5 rounded border border-[#333] text-emerald-500 font-mono">{score}</span>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="pt-4 border-t border-[#333] space-y-2">
               <div className="flex justify-between text-[10px] opacity-40 font-bold uppercase tracking-wider">
                  <span>Renderer Stats</span>
               </div>
               <div className="space-y-1 font-mono text-[9px] opacity-60">
                 <div className="flex justify-between">
                   <span>Draw Calls:</span>
                   <span>{entitiesCount + 10}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Triangles:</span>
                   <span>{entitiesCount * 2}</span>
                 </div>
               </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Panel: Console */}
      <footer className="h-48 bg-[#1a1a1a] border-t border-[#333] flex flex-col shrink-0">
        <div className="h-7 bg-[#252525] border-b border-[#333] flex items-center px-3 space-x-4 text-[10px] text-[#aaa]">
          <div className="h-full flex items-center px-2 hover:text-white cursor-pointer transition-colors">Project</div>
          <div className="border-b-2 border-[#007bff] h-full flex items-center text-white px-2 cursor-pointer">Console</div>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-3">
            <span className="text-[#ef4444] cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setScore(0)}>Clear</span>
            <span className="text-[#888] cursor-default">Collapse</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto font-mono text-[11px]">
          <div className="p-2 border-b border-[#252525] flex items-center space-x-2">
            <span className="text-[#4ade80] font-bold text-[9px]">[INFO]</span>
            <span className="opacity-30 text-[9px]">18:15:07</span>
            <span className="opacity-80">Successfully initialized Vortex Engine 2D Render Pipeline.</span>
          </div>
          <div className="p-2 border-b border-[#252525] flex items-center space-x-2 bg-[#2d1e1e]/30">
            <span className="text-[#ef4444] font-bold text-[9px]">[ERROR]</span>
            <span className="opacity-30 text-[9px]">18:15:10</span>
            <span className="opacity-80">NullReference: No AudioListener found in MainScene.</span>
          </div>
          <div className="p-2 border-b border-[#252525] flex items-center space-x-2">
            <span className="text-[#facc15] font-bold text-[9px]">[WARN]</span>
            <span className="opacity-30 text-[9px]">18:15:12</span>
            <span className="opacity-80">Shader 'StandardBloom' is not supported on this platform. Falling back.</span>
          </div>
          {score > 0 && (
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-2 border-b border-[#252525] flex items-center space-x-2"
              >
                <span className="text-[#3b82f6] font-bold text-[9px]">[LOG]</span>
                <span className="opacity-30 text-[9px]">Now</span>
                <span className="text-emerald-400">Combat Registry: Target destroyed. New Score: {score}</span>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
        <div className="h-6 bg-[#1a1a1a] border-t border-[#333] px-4 flex justify-between items-center text-[9px] font-mono tracking-wider opacity-40 uppercase">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> GPU BUSY: 12%</div>
             <div>VULKAN: ENABLED</div>
          </div>
          <div>WASD/Arrows to Move</div>
        </div>
      </footer>
    </div>
  );
}
