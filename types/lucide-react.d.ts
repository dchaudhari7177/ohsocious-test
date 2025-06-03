declare module 'lucide-react' {
  import { FC, SVGProps } from 'react'
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number
    color?: string
    strokeWidth?: string | number
  }
  
  export type Icon = FC<IconProps>
  
  export const Loader2: Icon
  export const MessageSquare: Icon
  export const ThumbsUp: Icon
  export const Share2: Icon
  export const Users: Icon
  export const Sparkles: Icon
  export const ImagePlus: Icon
  export const Send: Icon
  export const MoreHorizontal: Icon
  export const Heart: Icon
} 