// components/mobile/common/MobileCollapsible.js
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { mobileStyles } from './styles';  // 添加样式导入

export const MobileCollapsible = ({ 
  icon, 
  title, 
  color = "blue",
  children,
  className = "",
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const Icon = icon;

  return (
    <div className={`mb-2 ${className}`}>
      <div className={`${mobileStyles.collapsible.header} bg-${color}-50`}>
        <div className="flex items-center gap-2 flex-grow">
          {icon && (
            <Icon className={`${mobileStyles.icon.small} ${mobileStyles.icon[color]}`} />
          )}
          <span className={mobileStyles.cardTitle}>{title}</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`${mobileStyles.collapsible.button} hover:bg-${color}-100`}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      <div className={`${mobileStyles.collapsible.content} bg-${color}-50 rounded-b-lg
        ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        {isExpanded && <div className="p-2">{children}</div>}
      </div>
    </div>
  );
};