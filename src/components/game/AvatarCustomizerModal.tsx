'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import { X, Sparkles, Check, User, Crown, Shirt, Footprints, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { createModularAvatar } from './ModularAvatar';
import type {
  AvatarCustomization,
  GenderType,
  AttireType,
  HeadwearType,
  FootwearType,
} from '@/types/game';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SKIN_TONES = [
  { id: '#3b2219', label: 'Warm Espresso' },
  { id: '#5a3825', label: 'Deep Bronze' },
  { id: '#7a4e32', label: 'Rich Mahogany' },
  { id: '#9c6644', label: 'Golden Caramel' },
  { id: '#b8825c', label: 'Light Honey' },
];

const ATTIRE_COLORS = [
  { id: '#0284c7', label: 'Sky Blue', hex: '#0284c7' },
  { id: '#f8fafc', label: 'Royal White', hex: '#f8fafc' },
  { id: '#064e3b', label: 'Forest Emerald', hex: '#064e3b' },
  { id: '#b45309', label: 'Desert Ochre', hex: '#b45309' },
  { id: '#991b1b', label: 'Crimson Clay', hex: '#991b1b' },
  { id: '#18181b', label: 'Midnight Black', hex: '#18181b' },
];

const HEADWEAR_COLORS = [
  { id: '#f1f5f9', label: 'Chalk White', hex: '#f1f5f9' },
  { id: '#d97706', label: 'Golden Amber', hex: '#d97706' },
  { id: '#1e3a8a', label: 'Velvet Navy', hex: '#1e3a8a' },
  { id: '#064e3b', label: 'Emerald Green', hex: '#064e3b' },
  { id: '#334155', label: 'Charcoal Slate', hex: '#334155' },
];

const AvatarPreviewCanvas: React.FC<{ draft: AvatarCustomization }> = ({ draft }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c121e);

    const camera = new THREE.PerspectiveCamera(34, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 1.35, 3.8);
    camera.lookAt(0, 1.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xfffbeb, 1.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 2.4);
    dirLight.position.set(6, 12, 8);
    scene.add(dirLight);

    const avatar = createModularAvatar(draft);
    scene.add(avatar);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      avatar.rotation.y = time * 0.45; // Smooth slow showcase spin
      avatar.userData?.update?.(delta, time, false);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      mount.innerHTML = '';
    };
  }, [draft]);

  return (
    <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-emerald-500/30 bg-[#080d17] shadow-inner flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-white/50 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
        <RotateCw className="w-3 h-3 text-emerald-400 animate-spin" />
        <span>Live 3D Preview</span>
      </div>
    </div>
  );
};

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { avatar, setAvatarCustomization } = useGameStore();
  const { playClick, playCash } = useSoundFX();

  const [draft, setDraft] = useState<AvatarCustomization>(avatar);
  const [activeTab, setActiveTab] = useState<'body' | 'attire' | 'headwear' | 'shoes'>('attire');

  if (!isOpen) return null;

  const handleSave = () => {
    setAvatarCustomization(draft);
    playCash();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md font-sans">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-[#0c121e] border-2 border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#064E3B]/40 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Shirt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide text-white">
                WARDROBE & STYLES
              </h2>
              <p className="text-[11px] text-white/60">Customize Northern Nigerian Attire</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Human Character Preview Section */}
        <div className="p-4 bg-[#111827]/90 border-b border-white/5 space-y-2">
          <AvatarPreviewCanvas draft={draft} />
          <div className="flex items-center justify-between text-xs px-1">
            <div>
              <span className="block font-bold text-emerald-400 capitalize text-xs">
                {draft.attire.replace('_', ' ')}
              </span>
              <span className="block text-[10px] text-white/50 capitalize">
                Head: {draft.headwear.replace('_', ' ')} · Shoes: {draft.footwear.replace('_', ' ')}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Interactive View
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-white/10 text-xs font-bold bg-black/30">
          {[
            { id: 'attire', label: 'Attire', icon: Shirt },
            { id: 'headwear', label: 'Caps & Turbans', icon: Crown },
            { id: 'body', label: 'Complexion', icon: User },
            { id: 'shoes', label: 'Footwear', icon: Footprints },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: ATTIRE */}
          {activeTab === 'attire' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-2">
                  Select Traditional Attire
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'babban_riga', title: 'Babban Riga', desc: 'Majestic grand boubou with golden chest embroidery (+15 Mutunci)' },
                    { id: 'kaftan', title: 'Classic Kaftan', desc: 'Tailored smart linen with mandarin collar and piping' },
                    { id: 'jalabiya', title: 'Jalabiya', desc: 'Flowing, comfortable everyday robe' },
                    { id: 'tech_hoodie', title: 'FUD Tech Hoodie', desc: 'Modern campus student streetwear' },
                    { id: 'ankara_gown', title: 'Ankara Gown', desc: 'Tailored flared Nigerian traditional dress' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        playClick();
                        setDraft({ ...draft, attire: item.id as AttireType });
                      }}
                      className={`p-3 rounded-2xl border text-left transition ${
                        draft.attire === item.id
                          ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                          : 'bg-[#151e2e] border-white/10 text-white/70 hover:border-white/30'
                      }`}
                    >
                      <span className="block text-xs font-bold text-white">{item.title}</span>
                      <span className="block text-[10px] text-white/50 mt-1 leading-snug">
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-2">
                  Fabric Color Palette
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {ATTIRE_COLORS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        playClick();
                        setDraft({ ...draft, attireColor: col.hex });
                      }}
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition ${
                        draft.attireColor === col.hex
                          ? 'border-emerald-400 scale-110 shadow-lg'
                          : 'border-white/20 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.label}
                    >
                      {draft.attireColor === col.hex && (
                        <Check className="w-4 h-4 text-emerald-400 drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HEADWEAR */}
          {activeTab === 'headwear' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-2">
                  Traditional Caps, Turbans & Headcoverings
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'zanna_bukar', title: 'Zanna Bukar Cap', desc: 'Tall cylindrical embroidered cap worn by Northern elders and merchants' },
                    { id: 'damanga', title: 'Damanga Hula', desc: 'Folded geometric triangular Hausa cap' },
                    { id: 'rawani_turban', title: 'Rawani (Royal Turban)', desc: 'Pleated royal turban with cascading fabric tail for palace visits' },
                    { id: 'hijab_gyale', title: 'Gyale / Modest Hijab', desc: 'Graceful draped headscarf in matching pastel shades' },
                    { id: 'none', title: 'Natural Hair / Bare', desc: 'Neat close-cropped dark hair' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        playClick();
                        setDraft({ ...draft, headwear: item.id as HeadwearType });
                      }}
                      className={`p-3 rounded-2xl border text-left transition ${
                        draft.headwear === item.id
                          ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                          : 'bg-[#151e2e] border-white/10 text-white/70 hover:border-white/30'
                      }`}
                    >
                      <span className="block text-xs font-bold text-white">{item.title}</span>
                      <span className="block text-[10px] text-white/50 mt-1 leading-snug">
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {draft.headwear !== 'none' && (
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-2">
                    Headwear Color Accent
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {HEADWEAR_COLORS.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => {
                          playClick();
                          setDraft({ ...draft, headwearColor: col.hex });
                        }}
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition ${
                          draft.headwearColor === col.hex
                            ? 'border-emerald-400 scale-110 shadow-lg'
                            : 'border-white/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                      >
                        {draft.headwearColor === col.hex && (
                          <Check className="w-4 h-4 text-emerald-400 drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BODY COMPLEXION & GENDER */}
          {activeTab === 'body' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-2">
                  Gender Presentation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      playClick();
                      setDraft({ ...draft, gender: 'male' });
                    }}
                    className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                      draft.gender === 'male'
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-[#151e2e] border-white/10 text-white/70'
                    }`}
                  >
                    <span>👳🏽‍♂️</span>
                    <span>Male</span>
                  </button>
                  <button
                    onClick={() => {
                      playClick();
                      setDraft({ ...draft, gender: 'female' });
                    }}
                    className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                      draft.gender === 'female'
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-[#151e2e] border-white/10 text-white/70'
                    }`}
                  >
                    <span>🧕🏽</span>
                    <span>Female</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-2">
                  Skin Tone Complexion
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => {
                        playClick();
                        setDraft({ ...draft, skinTone: tone.id });
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 transition ${
                        draft.skinTone === tone.id
                          ? 'border-emerald-500 bg-emerald-950/40 text-white'
                          : 'border-white/10 bg-[#151e2e] text-white/70 hover:border-white/30'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-white/30 shadow-inner shrink-0"
                        style={{ backgroundColor: tone.id }}
                      />
                      <span className="text-xs font-bold">{tone.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FOOTWEAR */}
          {activeTab === 'shoes' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-white/80">
                Choose Footwear
              </label>
              {[
                {
                  id: 'kano_sandals',
                  title: 'Kano Hand-Stitched Leather Sandals (Takalmi)',
                  desc: 'Traditional artisan sandals suited for savannah roads and Jumma’at prayers.',
                  icon: '👡',
                },
                {
                  id: 'babouche',
                  title: 'Pointed Babouche Slippers',
                  desc: 'Comfortable slip-on leather footwear for indoor relaxation and town walks.',
                  icon: '👞',
                },
                {
                  id: 'sneakers',
                  title: 'Modern White Kicks',
                  desc: 'Clean university student trainers for rapid campus commutes.',
                  icon: '👟',
                },
              ].map((shoe) => (
                <button
                  key={shoe.id}
                  onClick={() => {
                    playClick();
                    setDraft({ ...draft, footwear: shoe.id as FootwearType });
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                    draft.footwear === shoe.id
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                      : 'bg-[#151e2e] border-white/10 text-white/70 hover:border-white/30'
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5">{shoe.icon}</span>
                  <div>
                    <span className="block text-xs font-bold text-white">{shoe.title}</span>
                    <span className="block text-[11px] text-white/50 mt-0.5">{shoe.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#064E3B] font-black text-xs shadow-lg transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply Style to 3D Avatar</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
