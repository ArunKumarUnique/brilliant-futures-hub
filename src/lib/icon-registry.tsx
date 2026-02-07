import { ComponentType } from 'react';
import {
  LucideProps,
  Atom, Trophy, Lightbulb, FlaskConical, Brain, BookOpen, Target,
  PenTool, MessageCircle, Heart, GraduationCap, Award, Users,
  Calculator, Globe, Star, Rocket, Compass, Microscope, Palette,
  Music, Code, Zap,
} from 'lucide-react';

const iconMap: Record<string, ComponentType<LucideProps>> = {
  Atom, Trophy, Lightbulb, FlaskConical, Brain, BookOpen, Target,
  PenTool, MessageCircle, Heart, GraduationCap, Award, Users,
  Calculator, Globe, Star, Rocket, Compass, Microscope, Palette,
  Music, Code, Zap,
};

export const getIcon = (name: string): ComponentType<LucideProps> => {
  return iconMap[name] || BookOpen;
};
