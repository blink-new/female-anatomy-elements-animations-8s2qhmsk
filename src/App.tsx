import { useState, useEffect, useRef } from 'react'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Switch } from './components/ui/switch'
import { Slider } from './components/ui/slider'
import { Badge } from './components/ui/badge'
import { Progress } from './components/ui/progress'
import { Droplets, Flame, Mountain, Wind, Heart, Skull, Waves, RotateCcw, AlertTriangle } from 'lucide-react'

interface ClothingLayer {
  id: string
  name: string
  visible: boolean
  removing: boolean
}

interface ElementEffect {
  id: string
  name: string
  icon: React.ReactNode
  active: boolean
  color: string
  particles: Array<{ id: number; x: number; y: number; size: number }>
}

interface TouchReaction {
  id: string
  x: number
  y: number
  type: 'heart' | 'blush' | 'shock' | 'pleasure'
  timestamp: number
}

interface DrowningStage {
  stage: number
  name: string
  description: string
  duration: number
  effects: string[]
}

const drowningStages: DrowningStage[] = [
  {
    stage: 1,
    name: "Initial Submersion",
    description: "Water begins to rise, initial panic response",
    duration: 600000, // 10 minutes
    effects: ["water-rise-20", "mild-struggle"]
  },
  {
    stage: 2,
    name: "Breath Holding",
    description: "Attempting to hold breath, increased anxiety",
    duration: 720000, // 12 minutes
    effects: ["water-rise-40", "chest-tension", "eye-widening"]
  },
  {
    stage: 3,
    name: "Involuntary Breathing",
    description: "Body forces breathing, water enters lungs",
    duration: 600000, // 10 minutes
    effects: ["water-rise-60", "violent-struggle", "color-change"]
  },
  {
    stage: 4,
    name: "Hypoxia",
    description: "Oxygen deprivation, movements become weak",
    duration: 480000, // 8 minutes
    effects: ["water-rise-80", "weak-movements", "consciousness-fade"]
  },
  {
    stage: 5,
    name: "Unconsciousness",
    description: "Loss of consciousness, body goes limp",
    duration: 300000, // 5 minutes
    effects: ["water-rise-100", "complete-stillness", "death-state"]
  }
]

function App() {
  const figureRef = useRef<HTMLDivElement>(null)
  const [touchReactions, setTouchReactions] = useState<TouchReaction[]>([])
  const [isDead, setIsDead] = useState(false)
  const [currentDrowningStage, setCurrentDrowningStage] = useState(0)
  const [drowningProgress, setDrowningProgress] = useState(0)

  const [clothingLayers, setClothingLayers] = useState<ClothingLayer[]>([
    { id: 'outer', name: 'Outer Clothing', visible: true, removing: false },
    { id: 'inner', name: 'Inner Clothing', visible: true, removing: false },
    { id: 'base', name: 'Base Layer', visible: true, removing: false }
  ])

  const [elements, setElements] = useState<ElementEffect[]>([
    { 
      id: 'water', 
      name: 'Water', 
      icon: <Droplets className="w-4 h-4" />, 
      active: false, 
      color: 'element-water',
      particles: []
    },
    { 
      id: 'fire', 
      name: 'Fire', 
      icon: <Flame className="w-4 h-4" />, 
      active: false, 
      color: 'element-fire',
      particles: []
    },
    { 
      id: 'earth', 
      name: 'Earth', 
      icon: <Mountain className="w-4 h-4" />, 
      active: false, 
      color: 'element-earth',
      particles: []
    },
    { 
      id: 'air', 
      name: 'Air', 
      icon: <Wind className="w-4 h-4" />, 
      active: false, 
      color: 'element-air',
      particles: []
    }
  ])

  const [animations, setAnimations] = useState({
    pain: false,
    death: false,
    drowning: false
  })

  const [intensity, setIntensity] = useState([50])

  // Generate particles for active elements
  useEffect(() => {
    const interval = setInterval(() => {
      setElements(prev => prev.map(element => {
        if (!element.active) return element

        const newParticles = Array.from({ length: 3 }, (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 400,
          y: Math.random() * 500,
          size: Math.random() * 8 + 4
        }))

        return {
          ...element,
          particles: [...element.particles.slice(-20), ...newParticles]
        }
      }))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Clean up touch reactions
  useEffect(() => {
    const interval = setInterval(() => {
      setTouchReactions(prev => 
        prev.filter(reaction => Date.now() - reaction.timestamp < 2000)
      )
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const handleFigureClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDead) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Determine reaction type based on click location
    let reactionType: TouchReaction['type'] = 'heart'
    
    // Breast area (upper torso)
    if (y > rect.height * 0.25 && y < rect.height * 0.45 && 
        x > rect.width * 0.3 && x < rect.width * 0.7) {
      reactionType = Math.random() > 0.5 ? 'blush' : 'pleasure'
    }
    // Face area
    else if (y < rect.height * 0.25) {
      reactionType = 'shock'
    }
    // Other areas
    else {
      reactionType = Math.random() > 0.7 ? 'blush' : 'heart'
    }

    const newReaction: TouchReaction = {
      id: Date.now().toString(),
      x: x,
      y: y,
      type: reactionType,
      timestamp: Date.now()
    }

    setTouchReactions(prev => [...prev, newReaction])

    // Trigger brief animation
    if (figureRef.current) {
      figureRef.current.style.transform = 'scale(1.02)'
      setTimeout(() => {
        if (figureRef.current) {
          figureRef.current.style.transform = 'scale(1)'
        }
      }, 150)
    }
  }

  const startDrowningSequence = () => {
    setAnimations(prev => ({ ...prev, drowning: true }))
    setCurrentDrowningStage(0)
    setDrowningProgress(0)

    let totalTime = 0
    drowningStages.forEach((stage, index) => {
      setTimeout(() => {
        setCurrentDrowningStage(index + 1)
        setDrowningProgress(((index + 1) / drowningStages.length) * 100)
        
        if (index === drowningStages.length - 1) {
          setIsDead(true)
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, drowning: false }))
          }, 1000)
        }
      }, totalTime)
      totalTime += stage.duration
    })
  }

  const toggleClothing = (layerId: string) => {
    setClothingLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        if (layer.visible) {
          return { ...layer, removing: true }
        } else {
          return { ...layer, visible: true, removing: false }
        }
      }
      return layer
    }))

    setTimeout(() => {
      setClothingLayers(prev => prev.map(layer => {
        if (layer.id === layerId && layer.removing) {
          return { ...layer, visible: false, removing: false }
        }
        return layer
      }))
    }, 500)
  }

  const toggleElement = (elementId: string) => {
    setElements(prev => prev.map(element => 
      element.id === elementId 
        ? { ...element, active: !element.active, particles: [] }
        : element
    ))
    
    // Auto-start drowning sequence when water element is activated
    if (elementId === 'water') {
      const waterElement = elements.find(e => e.id === 'water')
      if (waterElement && !waterElement.active && !animations.drowning && !isDead) {
        // Start drowning sequence after a brief delay to simulate submersion
        setTimeout(() => {
          startDrowningSequence()
        }, 1500) // 1.5 second delay to show water rising first
      }
    }
  }

  const triggerAnimation = (type: 'pain' | 'death' | 'drowning') => {
    if (type === 'drowning') {
      startDrowningSequence()
    } else {
      setAnimations(prev => ({ ...prev, [type]: true }))
      
      if (type === 'death') {
        setIsDead(true)
      }
      
      setTimeout(() => {
        setAnimations(prev => ({ ...prev, [type]: false }))
      }, type === 'pain' ? 1000 : 3000)
    }
  }

  const respawn = () => {
    setIsDead(false)
    setCurrentDrowningStage(0)
    setDrowningProgress(0)
    setAnimations({ pain: false, death: false, drowning: false })
    setTouchReactions([])
  }

  const resetAll = () => {
    setClothingLayers(prev => prev.map(layer => ({ 
      ...layer, 
      visible: true, 
      removing: false 
    })))
    setElements(prev => prev.map(element => ({ 
      ...element, 
      active: false, 
      particles: [] 
    })))
    setAnimations({ pain: false, death: false, drowning: false })
    setTouchReactions([])
    setIsDead(false)
    setCurrentDrowningStage(0)
    setDrowningProgress(0)
  }

  const getReactionEmoji = (type: TouchReaction['type']) => {
    switch (type) {
      case 'heart': return '💖'
      case 'blush': return '😊'
      case 'shock': return '😲'
      case 'pleasure': return '😌'
      default: return '💖'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Ultra-Realistic 3D Human Anatomy
          </h1>
          <p className="text-slate-400">
            Photorealistic human model with advanced 3D effects and interactive responses
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Clothing Controls */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Clothing Layers</h3>
              <div className="space-y-3">
                {clothingLayers.map((layer) => (
                  <div key={layer.id} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{layer.name}</span>
                    <Switch
                      checked={layer.visible}
                      onCheckedChange={() => toggleClothing(layer.id)}
                      disabled={isDead}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Element Controls */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Elemental Effects</h3>
              <div className="space-y-3">
                {elements.map((element) => (
                  <div key={element.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {element.icon}
                      <span className="text-sm text-slate-300">{element.name}</span>
                    </div>
                    <Switch
                      checked={element.active}
                      onCheckedChange={() => toggleElement(element.id)}
                      disabled={isDead}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Animation Controls */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Animations</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => triggerAnimation('pain')}
                  disabled={animations.pain || isDead}
                  className="w-full"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Pain Effect
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => triggerAnimation('death')}
                  disabled={animations.death || isDead}
                  className="w-full"
                >
                  <Skull className="w-4 h-4 mr-2" />
                  Death Effect
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => triggerAnimation('drowning')}
                  disabled={animations.drowning || isDead || elements.find(e => e.id === 'water')?.active}
                  className="w-full"
                >
                  <Waves className="w-4 h-4 mr-2" />
                  {elements.find(e => e.id === 'water')?.active ? 'Auto-Drowning Active' : 'Drowning Sequence'}
                </Button>
              </div>
            </Card>

            {/* Drowning Progress */}
            {(animations.drowning || currentDrowningStage > 0) && (
              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Drowning Progress
                </h3>
                <div className="space-y-3">
                  <Progress value={drowningProgress} className="w-full" />
                  {currentDrowningStage > 0 && currentDrowningStage <= drowningStages.length && (
                    <div className="text-sm">
                      <div className="text-white font-medium">
                        Stage {currentDrowningStage}: {drowningStages[currentDrowningStage - 1]?.name}
                      </div>
                      <div className="text-slate-400 mt-1">
                        {drowningStages[currentDrowningStage - 1]?.description}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Respawn Button */}
            {isDead && (
              <Card className="p-6 bg-red-900/30 border-red-700">
                <h3 className="text-lg font-semibold text-red-300 mb-4">Subject Deceased</h3>
                <Button
                  onClick={respawn}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Respawn
                </Button>
              </Card>
            )}

            {/* Intensity Control */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Effect Intensity</h3>
              <div className="space-y-2">
                <Slider
                  value={intensity}
                  onValueChange={setIntensity}
                  max={100}
                  step={1}
                  className="w-full"
                  disabled={isDead}
                />
                <div className="text-center text-sm text-slate-400">
                  {intensity[0]}%
                </div>
              </div>
            </Card>

            {/* Reset Button */}
            <Button onClick={resetAll} variant="destructive" className="w-full">
              Reset All
            </Button>
          </div>

          {/* Main Visualization Area */}
          <div className="lg:col-span-3">
            <Card className="p-8 bg-slate-800/30 border-slate-700 min-h-[700px]">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Figure Container */}
                <div 
                  ref={figureRef}
                  className={`relative anatomy-figure-3d cursor-pointer select-none ${
                    animations.pain ? 'pain-animation' : ''
                  } ${animations.death ? 'death-animation' : ''} ${
                    animations.drowning ? `drowning-animation drowning-stage-${currentDrowningStage}` : ''
                  } ${isDead ? 'dead-state' : ''}`}
                  style={{ 
                    filter: `brightness(${0.8 + (intensity[0] / 100) * 0.4})`,
                    transition: 'transform 0.15s ease-out'
                  }}
                  onClick={handleFigureClick}
                >
                  {/* Ultra-Realistic 3D Human Figure */}
                  <div className="relative w-96 h-[600px] mx-auto">
                    <svg
                      viewBox="0 0 300 500"
                      className="w-full h-full realistic-figure"
                      style={{ 
                        filter: 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.6)) drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5))',
                        transform: 'perspective(1000px) rotateX(5deg)'
                      }}
                    >
                      {/* Advanced Lighting Gradients */}
                      <defs>
                        <radialGradient id="skinGradient" cx="0.3" cy="0.2" r="0.8">
                          <stop offset="0%" stopColor="hsl(25 60% 85%)" />
                          <stop offset="50%" stopColor="hsl(25 50% 75%)" />
                          <stop offset="100%" stopColor="hsl(25 40% 65%)" />
                        </radialGradient>
                        <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(25 30% 55%)" />
                          <stop offset="100%" stopColor="hsl(25 20% 45%)" />
                        </linearGradient>
                        <radialGradient id="breastGradient" cx="0.4" cy="0.3" r="0.7">
                          <stop offset="0%" stopColor="hsl(25 65% 82%)" />
                          <stop offset="70%" stopColor="hsl(25 55% 78%)" />
                          <stop offset="100%" stopColor="hsl(25 45% 70%)" />
                        </radialGradient>
                        <radialGradient id="faceGradient" cx="0.3" cy="0.2" r="0.9">
                          <stop offset="0%" stopColor="hsl(25 70% 88%)" />
                          <stop offset="60%" stopColor="hsl(25 60% 80%)" />
                          <stop offset="100%" stopColor="hsl(25 50% 72%)" />
                        </radialGradient>
                      </defs>

                      {/* Head with realistic proportions */}
                      <ellipse cx="150" cy="45" rx="24" ry="28" fill="url(#faceGradient)" stroke="hsl(25 35% 60%)" strokeWidth="1" />
                      
                      {/* Neck with proper anatomy */}
                      <path d="M150 70 C145 70 140 72 138 75 L138 85 C138 88 142 90 150 90 C158 90 162 88 162 85 L162 75 C160 72 155 70 150 70 Z" fill="url(#skinGradient)" />
                      
                      {/* Realistic torso with proper female anatomy */}
                      <path
                        d="M150 90 C130 90 115 95 108 105 C105 110 102 120 100 135 L98 180 C98 190 100 200 105 210 L105 250 C105 265 110 280 118 290 L182 290 C190 280 195 265 195 250 L195 210 C200 200 202 190 202 180 L200 135 C198 120 195 110 192 105 C185 95 170 90 150 90 Z"
                        fill="url(#skinGradient)"
                        stroke="url(#shadowGradient)"
                        strokeWidth="1.5"
                      />
                      
                      {/* Realistic breasts with proper shading */}
                      <ellipse cx="130" cy="125" rx="16" ry="20" fill="url(#breastGradient)" opacity="0.95" />
                      <ellipse cx="170" cy="125" rx="16" ry="20" fill="url(#breastGradient)" opacity="0.95" />
                      
                      {/* Nipples */}
                      <circle cx="130" cy="120" r="3" fill="hsl(340 40% 60%)" opacity="0.8" />
                      <circle cx="170" cy="120" r="3" fill="hsl(340 40% 60%)" opacity="0.8" />
                      
                      {/* Realistic arms with muscle definition */}
                      <ellipse cx="90" cy="130" rx="12" ry="45" fill="url(#skinGradient)" transform="rotate(-20 90 130)" />
                      <ellipse cx="210" cy="130" rx="12" ry="45" fill="url(#skinGradient)" transform="rotate(20 210 130)" />
                      
                      {/* Forearms with realistic tapering */}
                      <ellipse cx="75" cy="190" rx="9" ry="35" fill="url(#skinGradient)" transform="rotate(-15 75 190)" />
                      <ellipse cx="225" cy="190" rx="9" ry="35" fill="url(#skinGradient)" transform="rotate(15 225 190)" />
                      
                      {/* Detailed hands */}
                      <ellipse cx="68" cy="230" rx="7" ry="12" fill="url(#skinGradient)" transform="rotate(-10 68 230)" />
                      <ellipse cx="232" cy="230" rx="7" ry="12" fill="url(#skinGradient)" transform="rotate(10 232 230)" />
                      
                      {/* Realistic waist and hips */}
                      <ellipse cx="150" cy="300" rx="35" ry="20" fill="url(#skinGradient)" />
                      
                      {/* Thighs with proper female proportions */}
                      <ellipse cx="130" cy="350" rx="18" ry="40" fill="url(#skinGradient)" />
                      <ellipse cx="170" cy="350" rx="18" ry="40" fill="url(#skinGradient)" />
                      
                      {/* Calves with muscle definition */}
                      <ellipse cx="130" cy="420" rx="14" ry="35" fill="url(#skinGradient)" />
                      <ellipse cx="170" cy="420" rx="14" ry="35" fill="url(#skinGradient)" />
                      
                      {/* Feet with realistic proportions */}
                      <ellipse cx="130" cy="470" rx="12" ry="18" fill="url(#skinGradient)" />
                      <ellipse cx="170" cy="470" rx="12" ry="18" fill="url(#skinGradient)" />
                      
                      {/* Detailed facial features */}
                      <ellipse cx="142" cy="40" rx="3" ry="4" fill="hsl(210 60% 25%)" /> {/* Left eye */}
                      <ellipse cx="158" cy="40" rx="3" ry="4" fill="hsl(210 60% 25%)" /> {/* Right eye */}
                      <circle cx="142" cy="39" r="1.5" fill="hsl(210 80% 15%)" /> {/* Left pupil */}
                      <circle cx="158" cy="39" r="1.5" fill="hsl(210 80% 15%)" /> {/* Right pupil */}
                      <circle cx="143" cy="38" r="0.5" fill="white" /> {/* Left eye highlight */}
                      <circle cx="159" cy="38" r="0.5" fill="white" /> {/* Right eye highlight */}
                      
                      {/* Eyebrows */}
                      <path d="M138 35 Q142 33 146 35" stroke="hsl(30 40% 35%)" strokeWidth="1.5" fill="none" />
                      <path d="M154 35 Q158 33 162 35" stroke="hsl(30 40% 35%)" strokeWidth="1.5" fill="none" />
                      
                      {/* Nose with realistic shading */}
                      <path d="M150 45 C148 45 147 47 147 49 C147 51 148 52 150 52 C152 52 153 51 153 49 C153 47 152 45 150 45 Z" fill="hsl(25 45% 70%)" />
                      <ellipse cx="148" cy="50" rx="1" ry="1.5" fill="hsl(25 30% 55%)" /> {/* Left nostril */}
                      <ellipse cx="152" cy="50" rx="1" ry="1.5" fill="hsl(25 30% 55%)" /> {/* Right nostril */}
                      
                      {/* Realistic mouth */}
                      <path d="M145 55 Q150 58 155 55" stroke="hsl(340 60% 55%)" strokeWidth="2" fill="none" />
                      <path d="M147 56 Q150 57 153 56" stroke="hsl(340 80% 65%)" strokeWidth="1" fill="none" />
                      
                      {/* Realistic hair with volume and texture */}
                      <path
                        d="M126 25 C130 18 135 15 150 15 C165 15 170 18 174 25 C176 30 175 35 173 40 C170 45 165 48 160 50 L140 50 C135 48 130 45 127 40 C125 35 124 30 126 25 Z"
                        fill="hsl(30 50% 35%)"
                        opacity="0.9"
                      />
                      
                      {/* Hair highlights and texture */}
                      <path d="M135 20 Q145 18 155 20 Q165 22 170 28" stroke="hsl(30 60% 45%)" strokeWidth="1" fill="none" opacity="0.7" />
                      <path d="M140 25 Q150 23 160 25" stroke="hsl(30 70% 50%)" strokeWidth="0.5" fill="none" opacity="0.6" />
                      
                      {/* Body contours and muscle definition */}
                      <path d="M108 105 Q115 100 125 105" stroke="hsl(25 30% 60%)" strokeWidth="0.5" fill="none" opacity="0.6" />
                      <path d="M175 105 Q185 100 192 105" stroke="hsl(25 30% 60%)" strokeWidth="0.5" fill="none" opacity="0.6" />
                      
                      {/* Abdominal definition */}
                      <line x1="150" y1="160" x2="150" y2="220" stroke="hsl(25 25% 65%)" strokeWidth="0.5" opacity="0.4" />
                      <ellipse cx="150" cy="180" rx="8" ry="3" fill="none" stroke="hsl(25 25% 65%)" strokeWidth="0.3" opacity="0.3" />
                      <ellipse cx="150" cy="200" rx="6" ry="2" fill="none" stroke="hsl(25 25% 65%)" strokeWidth="0.3" opacity="0.3" />
                    </svg>

                    {/* Enhanced Clothing Layers with realistic textures */}
                    {clothingLayers.map((layer, index) => (
                      <div
                        key={layer.id}
                        className={`absolute inset-0 clothing-layer-3d ${
                          layer.removing ? 'removing' : ''
                        }`}
                        style={{
                          opacity: layer.visible ? 0.85 - (index * 0.1) : 0,
                          zIndex: 10 + index,
                          transform: 'perspective(1000px) rotateX(5deg)'
                        }}
                      >
                        <svg viewBox="0 0 300 500" className="w-full h-full">
                          <defs>
                            <linearGradient id={`clothingGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={
                                layer.id === 'outer' ? "hsl(220 30% 35%)" :
                                layer.id === 'inner' ? "hsl(340 40% 55%)" : "hsl(0 0% 98%)"
                              } />
                              <stop offset="100%" stopColor={
                                layer.id === 'outer' ? "hsl(220 20% 25%)" :
                                layer.id === 'inner' ? "hsl(340 30% 45%)" : "hsl(0 0% 88%)"
                              } />
                            </linearGradient>
                          </defs>
                          <path
                            d={
                              layer.id === 'outer' 
                                ? "M150 85 C125 85 105 90 98 100 C95 105 92 115 90 130 L88 175 C88 185 90 195 95 205 L95 245 C95 260 100 275 108 285 L192 285 C200 275 205 260 205 245 L205 205 C210 195 212 185 212 175 L210 130 C208 115 205 105 202 100 C195 90 175 85 150 85 Z"
                                : layer.id === 'inner'
                                ? "M150 88 C132 88 118 93 112 103 C109 108 106 118 104 133 L102 178 C102 188 104 198 109 208 L109 248 C109 263 114 278 122 288 L178 288 C186 278 191 263 191 248 L191 208 C196 198 198 188 198 178 L196 133 C194 118 191 108 188 103 C182 93 168 88 150 88 Z"
                                : "M150 90 C137 90 128 95 123 105 C120 110 117 120 115 135 L113 180 C113 190 115 200 120 210 L120 250 C120 265 125 280 133 290 L167 290 C175 280 180 265 180 250 L180 210 C185 200 187 190 187 180 L185 135 C183 120 180 110 177 105 C172 95 163 90 150 90 Z"
                            }
                            fill={`url(#clothingGradient${index})`}
                            stroke="hsl(220 10% 15%)"
                            strokeWidth="1"
                          />
                        </svg>
                      </div>
                    ))}

                    {/* Touch Reactions with enhanced 3D effects */}
                    {touchReactions.map((reaction) => (
                      <div
                        key={reaction.id}
                        className="absolute pointer-events-none touch-reaction-3d"
                        style={{
                          left: `${reaction.x}px`,
                          top: `${reaction.y}px`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 50
                        }}
                      >
                        <div className="text-3xl animate-bounce" style={{
                          filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))',
                          textShadow: '0 0 15px rgba(255, 255, 255, 0.6)'
                        }}>
                          {getReactionEmoji(reaction.type)}
                        </div>
                      </div>
                    ))}

                    {/* Enhanced Element Overlays with 3D effects */}
                    {elements.map((element) => (
                      element.active && (
                        <div
                          key={element.id}
                          className={`absolute inset-0 ${element.color} rounded-lg element-overlay-3d`}
                          style={{
                            opacity: intensity[0] / 100 * 0.7,
                            zIndex: 20,
                            transform: 'perspective(1000px) rotateX(5deg)',
                            filter: 'blur(1px)'
                          }}
                        />
                      )
                    ))}

                    {/* Enhanced Particles with 3D movement */}
                    {elements.map((element) => (
                      element.active && element.particles.map((particle) => (
                        <div
                          key={`${element.id}-${particle.id}`}
                          className={`particle-3d particle-${element.id}`}
                          style={{
                            left: `${particle.x}px`,
                            top: `${particle.y}px`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            zIndex: 30,
                            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))'
                          }}
                        />
                      ))
                    ))}

                    {/* Enhanced Drowning Water with realistic 3D effects */}
                    {animations.drowning && (
                      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 25 }}>
                        <div className={`drowning-water-3d absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/80 via-blue-400/60 to-transparent drowning-stage-${currentDrowningStage}`}
                             style={{
                               transform: 'perspective(1000px) rotateX(5deg)',
                               filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.6))'
                             }}>
                          <div className="water-surface-3d absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-300/70 via-blue-200/90 to-blue-300/70"></div>
                          {/* Enhanced water bubbles with 3D effects */}
                          <div className="bubble-3d bubble-1 absolute w-3 h-3 bg-blue-200/70 rounded-full" style={{filter: 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.8))'}}></div>
                          <div className="bubble-3d bubble-2 absolute w-4 h-4 bg-blue-100/60 rounded-full" style={{filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.7))'}}></div>
                          <div className="bubble-3d bubble-3 absolute w-2 h-2 bg-blue-300/80 rounded-full" style={{filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.9))'}}></div>
                          <div className="bubble-3d bubble-4 absolute w-3.5 h-3.5 bg-blue-200/50 rounded-full" style={{filter: 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.6))'}}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="absolute top-4 right-4 space-y-2">
                  {elements.filter(e => e.active).map((element) => (
                    <Badge key={element.id} variant="secondary" className="flex items-center gap-1">
                      {element.icon}
                      {element.name}
                    </Badge>
                  ))}
                  {animations.pain && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      Pain Active
                    </Badge>
                  )}
                  {animations.death && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Skull className="w-3 h-3" />
                      Death Effect
                    </Badge>
                  )}
                  {animations.drowning && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Waves className="w-3 h-3" />
                      Drowning Stage {currentDrowningStage}
                    </Badge>
                  )}
                  {isDead && (
                    <Badge variant="destructive" className="flex items-center gap-1 bg-red-700">
                      <Skull className="w-3 h-3" />
                      Deceased
                    </Badge>
                  )}
                </div>

                {/* Info Panel */}
                <div className="absolute bottom-4 left-4 right-4">
                  <Card className="p-4 bg-slate-900/80 border-slate-600">
                    <div className="text-sm text-slate-300">
                      <p className="mb-2">
                        <strong>Ultra-Realistic 3D Model:</strong> Photorealistic human anatomy with advanced lighting, 
                        muscle definition, and realistic proportions.
                      </p>
                      <p className="mb-2">
                        <strong>Interactive Features:</strong> Click anywhere on the figure for touch reactions. 
                        Different areas trigger different responses with enhanced 3D effects.
                      </p>
                      <p>
                        <strong>Current State:</strong> {' '}
                        {isDead ? 'Deceased' : 'Alive'} • {' '}
                        {clothingLayers.filter(l => l.visible).length} clothing layers • {' '}
                        {elements.filter(e => e.active).length} elements active
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App