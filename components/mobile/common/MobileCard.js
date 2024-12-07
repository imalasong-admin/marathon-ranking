import { mobileStyles } from './styles';  // 添加样式导入

export const MobileCard = ({ icon, title, color = "blue", children, className = "" }) => {
    const Icon = icon;
    return (
      <div className={`${mobileStyles.card} ${className}`}>
        <div className="flex items-start gap-2">
          {icon && (
            <Icon className={`${mobileStyles.icon.small} ${mobileStyles.icon[color]} mt-1`} />
          )}
          <div className="flex-grow">
            {title && <div className={mobileStyles.cardTitle}>{title}</div>}
            <div className={mobileStyles.cardContent}>{children}</div>
          </div>
        </div>
      </div>
    );
  };