import type React from 'react';
import {Absorber} from './Absorber';
import {Clocks} from './Clocks';
import {Damping} from './Damping';
import {Energy} from './Energy';
import {Hook} from './Hook';
import {Infrared} from './Infrared';
import {Isotope} from './Isotope';
import {Molecule} from './Molecule';
import {Outro} from './Outro';
import {Pendulum} from './Pendulum';
import {Period} from './Period';
import {Quantum} from './Quantum';
import {Recap} from './Recap';
import {Resonance} from './Resonance';
import {Restoring} from './Restoring';
import {Roadmap} from './Roadmap';
import {SHM} from './SHM';
import {Title} from './Title';
import {Tower} from './Tower';

// Pemetaan id adegan di naskah → komponen visual.
export const SCENES: Record<string, React.FC> = {
  hook: Hook,
  title: Title,
  roadmap: Roadmap,
  restoring: Restoring,
  shm: SHM,
  period: Period,
  energy: Energy,
  pendulum: Pendulum,
  damping: Damping,
  resonance: Resonance,
  molecule: Molecule,
  infrared: Infrared,
  isotope: Isotope,
  quantum: Quantum,
  clocks: Clocks,
  absorber: Absorber,
  tower: Tower,
  recap: Recap,
  outro: Outro,
};
