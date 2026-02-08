import { motion } from 'framer-motion';
import { Lock, Star } from 'lucide-react';
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
  variant?: 'default' | 'compact';
}

export default function ToolCard({ tool, variant = 'default' }: ToolCardProps) {
  const { isPro } = useAuth();
  const isLocked = tool.requires_subscription && !isPro;

  if (variant === 'compact') {
    return (
      <Link to={isLocked ? '/subscription' : tool.tool_url}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card rounded-2xl p-4 tool-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
              {tool.logo_url}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{tool.tool_name}</h3>
                {tool.requires_subscription && (
                  <span className="pro-badge">PRO</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{tool.tool_description}</p>
            </div>
            {isLocked && (
              <Lock className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={isLocked ? '/subscription' : tool.tool_url}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="glass-card rounded-2xl p-5 tool-card relative overflow-hidden"
      >
        {tool.requires_subscription && (
          <div className="absolute top-3 left-3">
            <span className="pro-badge">PRO</span>
          </div>
        )}
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-3">
            {tool.logo_url}
          </div>
          <h3 className="font-semibold text-foreground mb-1">{tool.tool_name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{tool.tool_description}</p>
          
          <div className="flex items-center gap-1 mt-3 text-warning">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{(tool.rating ?? 0).toFixed(1)}</span>
          </div>
        </div>

        {isLocked && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </motion.div>
    </Link>
  );
}
