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
          x: Math.random() * 300,
          y: Math.random() * 400,
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
            Interactive 3D Human Anatomy
          </h1>
          <p className="text-slate-400">
            Realistic human model with interactive responses and elemental effects
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
            <Card className="p-8 bg-slate-800/30 border-slate-700 min-h-[600px]">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Figure Container */}
                <div 
                  ref={figureRef}
                  className={`relative anatomy-figure cursor-pointer select-none ${
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
                  {/* Base Figure - More Realistic Human Shape */}
                  <div className="relative w-80 h-[500px] mx-auto">
                    {/* 3D Human Figure */}
                    <svg
                      viewBox="0 0 240 400"
                      className="w-full h-full"
                      style={{ filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))' }}
                    >
                      {/* Head */}
                      <ellipse cx="120" cy="35" rx="18" ry="22" fill="hsl(25 50% 75%)" stroke="hsl(25 40% 65%)" strokeWidth="1.5" />
                      
                      {/* Neck */}
                      <rect x="115" y="55" width="10" height="15" fill="hsl(25 50% 75%)" />
                      
                      {/* Torso */}
                      <path
                        d="M120 70 C105 70 95 75 90 85 L85 140 C85 150 90 160 95 170 L95 200 C95 210 100 220 105 230 L135 230 C140 220 145 210 145 200 L145 170 C150 160 155 150 155 140 L150 85 C145 75 135 70 120 70 Z"
                        fill="hsl(25 50% 75%)"
                        stroke="hsl(25 40% 65%)"
                        strokeWidth="1.5"
                      />
                      
                      {/* Breasts */}
                      <ellipse cx="105" cy="95" rx="12" ry="15" fill="hsl(25 55% 78%)" opacity="0.9" />
                      <ellipse cx="135" cy="95" rx="12" ry="15" fill="hsl(25 55% 78%)" opacity="0.9" />
                      
                      {/* Arms */}
                      <ellipse cx="75" cy="100" rx="8" ry="35" fill="hsl(25 50% 75%)" transform="rotate(-15 75 100)" />
                      <ellipse cx="165" cy="100" rx="8" ry="35" fill="hsl(25 50% 75%)" transform="rotate(15 165 100)" />
                      
                      {/* Forearms */}
                      <ellipse cx="65" cy="150" rx="6" ry="25" fill="hsl(25 50% 75%)" transform="rotate(-10 65 150)" />
                      <ellipse cx="175" cy="150" rx="6" ry="25" fill="hsl(25 50% 75%)" transform="rotate(10 175 150)" />
                      
                      {/* Hands */}
                      <ellipse cx="60" cy="180" rx="5" ry="8" fill="hsl(25 50% 75%)" />
                      <ellipse cx="180" cy="180" rx="5" ry="8" fill="hsl(25 50% 75%)" />
                      
                      {/* Hips */}
                      <ellipse cx="120" cy="240" rx="25" ry="15" fill="hsl(25 50% 75%)" />
                      
                      {/* Thighs */}
                      <ellipse cx="105" cy="280" rx="12" ry="30" fill="hsl(25 50% 75%)" />
                      <ellipse cx="135" cy="280" rx="12" ry="30" fill="hsl(25 50% 75%)" />
                      
                      {/* Calves */}
                      <ellipse cx="105" cy="330" rx="10" ry="25" fill="hsl(25 50% 75%)" />
                      <ellipse cx="135" cy="330" rx="10" ry="25" fill="hsl(25 50% 75%)" />
                      
                      {/* Feet */}
                      <ellipse cx="105" cy="370" rx="8" ry="12" fill="hsl(25 50% 75%)" />
                      <ellipse cx="135" cy="370" rx="8" ry="12" fill="hsl(25 50% 75%)" />
                      
                      {/* Facial Features */}
                      <circle cx="115" cy="32" r="2" fill="hsl(210 50% 30%)" /> {/* Left eye */}
                      <circle cx="125" cy="32" r="2" fill="hsl(210 50% 30%)" /> {/* Right eye */}
                      <ellipse cx="120" cy="38" rx="1" ry="2" fill="hsl(25 40% 65%)" /> {/* Nose */}
                      <path d="M115 42 Q120 45 125 42" stroke="hsl(340 50% 60%)" strokeWidth="1" fill="none" /> {/* Mouth */}
                      
                      {/* Hair */}
                      <path
                        d="M102 20 C108 15 132 15 138 20 C140 25 138 30 135 35 L105 35 C102 30 100 25 102 20 Z"
                        fill="hsl(30 40% 40%)"
                        opacity="0.8"
                      />
                    </svg>

                    {/* Clothing Layers */}
                    {clothingLayers.map((layer, index) => (
                      <div
                        key={layer.id}
                        className={`absolute inset-0 clothing-layer ${
                          layer.removing ? 'removing' : ''
                        }`}
                        style={{
                          opacity: layer.visible ? 0.8 - (index * 0.15) : 0,
                          zIndex: 10 + index
                        }}
                      >
                        <svg viewBox="0 0 240 400" className="w-full h-full">
                          <path
                            d={
                              layer.id === 'outer' 
                                ? "M120 65 C100 65 85 70 80 80 L75 135 C75 145 80 155 85 165 L85 195 C85 205 90 215 95 225 L145 225 C150 215 155 205 155 195 L155 165 C160 155 165 145 165 135 L160 80 C155 70 140 65 120 65 Z"
                                : layer.id === 'inner'
                                ? "M120 68 C107 68 98 73 93 83 L88 138 C88 148 93 158 98 168 L98 198 C98 208 103 218 108 228 L132 228 C137 218 142 208 142 198 L142 168 C147 158 152 148 152 138 L147 83 C142 73 133 68 120 68 Z"
                                : "M120 69 C112 69 106 74 103 84 L100 139 C100 149 105 159 110 169 L110 199 C110 209 115 219 120 229 L120 229 C125 219 130 209 130 199 L130 169 C135 159 140 149 140 139 L137 84 C134 74 128 69 120 69 Z"
                            }
                            fill={
                              layer.id === 'outer' 
                                ? "hsl(220 20% 25%)" 
                                : layer.id === 'inner'
                                ? "hsl(340 30% 45%)"
                                : "hsl(0 0% 95%)"
                            }
                            stroke="hsl(220 10% 15%)"
                            strokeWidth="1"
                          />
                        </svg>
                      </div>
                    ))}

                    {/* Touch Reactions */}
                    {touchReactions.map((reaction) => (
                      <div
                        key={reaction.id}
                        className="absolute pointer-events-none touch-reaction"
                        style={{
                          left: `${reaction.x}px`,
                          top: `${reaction.y}px`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 50
                        }}
                      >
                        <div className="text-2xl animate-bounce">
                          {getReactionEmoji(reaction.type)}
                        </div>
                      </div>
                    ))}

                    {/* Element Overlays */}
                    {elements.map((element) => (
                      element.active && (
                        <div
                          key={element.id}
                          className={`absolute inset-0 ${element.color} rounded-lg`}
                          style={{
                            opacity: intensity[0] / 100 * 0.6,
                            zIndex: 20
                          }}
                        />
                      )
                    ))}

                    {/* Particles */}
                    {elements.map((element) => (
                      element.active && element.particles.map((particle) => (
                        <div
                          key={`${element.id}-${particle.id}`}
                          className={`particle particle-${element.id}`}
                          style={{
                            left: `${particle.x}px`,
                            top: `${particle.y}px`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            zIndex: 30
                          }}
                        />
                      ))
                    ))}

                    {/* Drowning Water Rising Effect */}
                    {animations.drowning && (
                      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 25 }}>
                        <div className={`drowning-water absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/70 via-blue-400/50 to-transparent drowning-stage-${currentDrowningStage}`}>
                          <div className="water-surface absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-300/60 via-blue-200/80 to-blue-300/60"></div>
                          {/* Water bubbles */}
                          <div className="bubble bubble-1 absolute w-2 h-2 bg-blue-200/60 rounded-full"></div>
                          <div className="bubble bubble-2 absolute w-3 h-3 bg-blue-100/50 rounded-full"></div>
                          <div className="bubble bubble-3 absolute w-1.5 h-1.5 bg-blue-300/70 rounded-full"></div>
                          <div className="bubble bubble-4 absolute w-2.5 h-2.5 bg-blue-200/40 rounded-full"></div>
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
                        <strong>Interactive Features:</strong> Click anywhere on the figure for touch reactions. 
                        Different areas trigger different responses.
                      </p>
                      <p className="mb-2">
                        <strong>Auto-Drowning:</strong> Activating the water element will automatically trigger 
                        the drowning sequence after submersion.
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