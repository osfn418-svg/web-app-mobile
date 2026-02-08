import { motion } from 'framer-motion';
import { Lock, Star, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Legacy type to keep compatibility
export interface AITool {
  tool_id: number | string;
  tool_name: string;
  tool_description: string;
  tool_url: string;
  logo_url: string;
  requires_subscription: boolean;
  rating: number;
  category_id: number;
  added_by_admin: number;
  approved: boolean;
}

interface ToolCardProps {
  tool: AITool;
  variant?: 'default' | 'compact' | 'mini';
}

export default function ToolCard({ tool, variant = 'default' }: ToolCardProps) {
  const { isPro } = useAuth();
  const isLocked = tool.requires_subscription && !isPro;

  // Mini variant - smallest, 3 per row
  if (variant === 'mini') {
    return (
      <Link to={isLocked ? '/subscription' : tool.tool_url}>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="glass-card rounded-xl p-3 neon-border relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10" />
          
          {tool.requires_subscription && (
            <div className="absolute top-1 left-1 z-20">
              <span className="pro-badge text-[10px] px-1.5 py-0.5">PRO</span>
            </div>
          )}
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg mb-2 shadow-md">
              {tool.logo_url}
            </div>
            <h3 className="font-medium text-foreground text-xs line-clamp-1">{tool.tool_name}</h3>
          </div>

          {isLocked && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-30">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </motion.div>
      </Link>
    );
  }

  // Compact variant - horizontal layout
  if (variant === 'compact') {
    return (
      <Link to={isLocked ? '/subscription' : tool.tool_url}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card rounded-2xl p-4 neon-border relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-2xl">
              {tool.logo_url}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{tool.tool_name}</h3>
                {tool.requires_subscription && (
                  <span className="pro-badge text-xs">PRO</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{tool.tool_description}</p>
            </div>
            {isLocked ? (
              <Lock className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </motion.div>
      </Link>
    );
  }

  // Default variant - standard card
  return (
    <Link to={isLocked ? '/subscription' : tool.tool_url}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="glass-card rounded-2xl p-4 neon-border relative overflow-hidden group hover:shadow-lg transition-shadow"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/15 to-secondary/15" />
        
        {tool.requires_subscription && (
          <div className="absolute top-2 left-2 z-20">
            <span className="pro-badge text-xs">PRO</span>
          </div>
        )}
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl mb-3 shadow-lg">
            {tool.logo_url}
          </div>
          <h3 className="font-semibold text-foreground mb-1 text-sm">{tool.tool_name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{tool.tool_description}</p>
          
          <div className="flex items-center gap-1 mt-2 text-warning">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-medium">{(tool.rating ?? 0).toFixed(1)}</span>
          </div>
        </div>

        {isLocked && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-30">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </motion.div>
    </Link>
  );
}
